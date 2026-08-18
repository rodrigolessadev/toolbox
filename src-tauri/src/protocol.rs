use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use tauri::AppHandle;

use crate::commands_store::CommandEntry;
use crate::executor::RunResult;

/// Versão do protocolo suportada pelo Toolbox
pub const PROTOCOL_VERSION: &str = "1.0";

/// Limite máximo de bytes lidos do stdout (10 MB)
pub const MAX_OUTPUT_BYTES: usize = 10 * 1024 * 1024;

/// Códigos de erro padronizados do protocolo
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorCode {
    InvalidMessage = -32600,
    UnsupportedVersion = -32601,
    IncompleteResponse = -32602,
    Timeout = -32603,
    ProcessExited = -32604,
    InternalError = -32605,
    OutputTooLarge = -32606,
}

impl ErrorCode {
    pub fn as_str(&self) -> &'static str {
        match self {
            ErrorCode::InvalidMessage => "INVALID_MESSAGE",
            ErrorCode::UnsupportedVersion => "UNSUPPORTED_VERSION",
            ErrorCode::IncompleteResponse => "INCOMPLETE_RESPONSE",
            ErrorCode::Timeout => "TIMEOUT",
            ErrorCode::ProcessExited => "PROCESS_EXITED",
            ErrorCode::InternalError => "INTERNAL_ERROR",
            ErrorCode::OutputTooLarge => "OUTPUT_TOO_LARGE",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProtocolError {
    pub code: String,
    pub message: String,
    #[serde(default)]
    pub details: Option<String>,
}

impl ProtocolError {
    pub fn new(code: ErrorCode, message: impl Into<String>, details: Option<String>) -> Self {
        Self {
            code: code.as_str().to_string(),
            message: message.into(),
            details,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ProgressPayload {
    #[serde(default)]
    pub percent: Option<f64>,
    #[serde(default)]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolContext {
    pub plugin_name: String,
    pub data_dir: String,
    pub commands_file: String,
    pub timeout_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolRequest {
    pub protocol_version: String,
    pub request_id: String,
    pub action: String,
    pub payload: serde_json::Value,
    #[serde(default)]
    pub context: Option<ProtocolContext>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProtocolResponse {
    pub protocol_version: String,
    pub request_id: String,
    pub status: String, // "success" | "error" | "warning" | "progress"
    #[serde(default)]
    pub result: Option<serde_json::Value>,
    #[serde(default)]
    pub error: Option<ProtocolError>,
    #[serde(default)]
    pub warnings: Vec<String>,
    #[serde(default)]
    pub progress: Option<ProgressPayload>,
}

impl ProtocolResponse {
    pub fn is_final(&self) -> bool {
        self.status == "success" || self.status == "error" || self.status == "warning"
    }
}

/// Tenta interpretar uma linha do stdout como mensagem do protocolo JSON.
/// Se for válida e contiver protocol_version e request_id, retorna Some(ProtocolResponse).
pub fn parse_protocol_line(line: &str) -> Option<ProtocolResponse> {
    let trimmed = line.trim();
    if !trimmed.starts_with('{') || !trimmed.ends_with('}') {
        return None;
    }
    if let Ok(resp) = serde_json::from_str::<ProtocolResponse>(trimmed) {
        if !resp.protocol_version.is_empty() && !resp.request_id.is_empty() {
            return Some(resp);
        }
    }
    None
}

/// Executa um plugin com suporte ao Protocolo v1.0.
pub fn run_protocol_plugin(
    app: &AppHandle,
    name: &str,
    entry: &CommandEntry,
) -> Result<RunResult, String> {
    let plugins_dir = crate::paths::plugins_dir(app);
    let plugin_path = if let Some(ref p) = entry.path {
        let pb = PathBuf::from(p);
        if pb.is_absolute() {
            pb
        } else {
            plugins_dir.join(pb)
        }
    } else {
        plugins_dir.join(name)
    };

    let plugin_json = plugin_path.join("plugin.json");
    if !plugin_json.exists() {
        return Err(format!(
            "plugin.json não encontrado em {}",
            plugin_path.display()
        ));
    }

    let manifest_raw = std::fs::read_to_string(&plugin_json).map_err(|e| e.to_string())?;
    let manifest: crate::plugin::PluginManifest =
        serde_json::from_str(&manifest_raw).map_err(|e| e.to_string())?;

    let errors = manifest.validate();
    if !errors.is_empty() {
        return Err(format!(
            "Manifesto do plugin {} inválido: {:?}",
            name, errors
        ));
    }

    let entry_path = plugin_path.join(&manifest.entry);
    if !entry_path.exists() {
        return Err(format!(
            "Arquivo de entrada não encontrado: {}",
            entry_path.display()
        ));
    }

    let data_dir = crate::paths::data_dir(app);
    let commands_file = data_dir.join("commands.json");
    let timeout_ms = 30000u64; // 30 segundos padrão

    let mut cmd = match manifest.language.as_str() {
        "python" => {
            let mut c = Command::new("python");
            c.arg(&entry_path);
            c
        }
        "node" => {
            let mut c = Command::new("node");
            c.arg(&entry_path);
            c
        }
        "rust" | "exe" | "binary" => Command::new(&entry_path),
        _ => {
            return Err(format!(
                "Linguagem '{}' não suportada para o protocolo.",
                manifest.language
            ));
        }
    };

    let theme = crate::paths::get_theme(app.clone()).unwrap_or_else(|_| "dark".to_string());
    cmd.env("TOOLBOX_THEME", &theme);
    cmd.current_dir(&plugin_path);
    cmd.stdin(Stdio::piped());
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Falha ao iniciar processo do plugin {}: {}", name, e))?;

    let request_id = format!("req_{}", uuid_simple());
    let request = ProtocolRequest {
        protocol_version: PROTOCOL_VERSION.to_string(),
        request_id: request_id.clone(),
        action: "execute".to_string(),
        payload: serde_json::json!({
            "name": name,
            "args": entry.args,
        }),
        context: Some(ProtocolContext {
            plugin_name: name.to_string(),
            data_dir: data_dir.to_string_lossy().to_string(),
            commands_file: commands_file.to_string_lossy().to_string(),
            timeout_ms,
        }),
    };

    // Escreve requisição no stdin do filho
    if let Some(mut stdin) = child.stdin.take() {
        let req_bytes = serde_json::to_vec(&request).map_err(|e| e.to_string())?;
        let _ = stdin.write_all(&req_bytes);
        let _ = stdin.write_all(b"\n");
        let _ = stdin.flush();
    }

    let plugin_tag = format!("plugin::{}", name);

    // Drena stderr em background gravando em log::Warn
    if let Some(stderr) = child.stderr.take() {
        let tag = plugin_tag.clone();
        thread::spawn(move || {
            for line in BufReader::new(stderr).lines().flatten() {
                crate::logger::write_line(log::Level::Warn, &tag, &line);
            }
        });
    }

    // Canal para receber mensagem de resposta ou erro
    let (tx, rx) = mpsc::channel::<Result<ProtocolResponse, ProtocolError>>();

    // Thread leitora do STDOUT
    if let Some(stdout) = child.stdout.take() {
        let tag = plugin_tag.clone();
        let expected_req_id = request_id.clone();
        thread::spawn(move || {
            let mut reader = BufReader::new(stdout);
            let mut total_bytes = 0usize;
            let mut line_buf = String::new();
            let mut final_response: Option<ProtocolResponse> = None;

            loop {
                line_buf.clear();
                match reader.read_line(&mut line_buf) {
                    Ok(0) => break, // EOF
                    Ok(n) => {
                        total_bytes += n;
                        if total_bytes > MAX_OUTPUT_BYTES {
                            let _ = tx.send(Err(ProtocolError::new(
                                ErrorCode::OutputTooLarge,
                                "Tamanho de saída do plugin excedeu o limite máximo (10 MB)",
                                None,
                            )));
                            return;
                        }

                        if let Some(proto_msg) = parse_protocol_line(&line_buf) {
                            if proto_msg.request_id == expected_req_id {
                                if proto_msg.status == "progress" {
                                    if let Some(ref p) = proto_msg.progress {
                                        crate::logger::write_line(
                                            log::Level::Info,
                                            &tag,
                                            &format!(
                                                "[PROGRESS {}%] {}",
                                                p.percent.unwrap_or(0.0),
                                                p.message.as_deref().unwrap_or("")
                                            ),
                                        );
                                    }
                                } else if proto_msg.is_final() {
                                    final_response = Some(proto_msg);
                                }
                                continue;
                            }
                        }

                        // Não-protocolo: envia para os logs do Toolbox
                        crate::logger::write_line(
                            log::Level::Info,
                            &tag,
                            line_buf.trim_end(),
                        );
                    }
                    Err(e) => {
                        crate::logger::write_line(
                            log::Level::Warn,
                            &tag,
                            &format!("Erro de leitura no stdout: {}", e),
                        );
                        break;
                    }
                }
            }

            if let Some(resp) = final_response {
                let _ = tx.send(Ok(resp));
            } else {
                let _ = tx.send(Err(ProtocolError::new(
                    ErrorCode::IncompleteResponse,
                    "Plugin encerrou sem emitir uma resposta de protocolo válida",
                    None,
                )));
            }
        });
    }

    // Aguarda com timeout
    match rx.recv_timeout(Duration::from_millis(timeout_ms)) {
        Ok(Ok(response)) => {
            let _ = child.wait();
            if response.status == "error" {
                let err_msg = response
                    .error
                    .map(|e| format!("[{}] {}", e.code, e.message))
                    .unwrap_or_else(|| "Erro desconhecido retornado pelo plugin".to_string());
                Ok(RunResult {
                    ok: false,
                    message: Some(err_msg),
                })
            } else {
                let msg = response
                    .result
                    .and_then(|r| r.get("output").and_then(|v| v.as_str().map(String::from)))
                    .unwrap_or_else(|| format!("Plugin '{}' executado com sucesso", name));
                Ok(RunResult {
                    ok: true,
                    message: Some(msg),
                })
            }
        }
        Ok(Err(proto_err)) => {
            let _ = child.kill();
            let _ = child.wait();
            Ok(RunResult {
                ok: false,
                message: Some(format!("[{}] {}", proto_err.code, proto_err.message)),
            })
        }
        Err(mpsc::RecvTimeoutError::Timeout) => {
            let _ = child.kill();
            let _ = child.wait();
            Ok(RunResult {
                ok: false,
                message: Some(format!(
                    "[{}] Tempo limite de execução ({:?}) excedido pelo plugin '{}'",
                    ErrorCode::Timeout.as_str(),
                    Duration::from_millis(timeout_ms),
                    name
                )),
            })
        }
        Err(mpsc::RecvTimeoutError::Disconnected) => {
            let status = child.wait();
            let exit_code = status.map(|s| s.code().unwrap_or(-1)).unwrap_or(-1);
            Ok(RunResult {
                ok: false,
                message: Some(format!(
                    "[{}] Processo do plugin encerrou inesperadamente (código: {})",
                    ErrorCode::ProcessExited.as_str(),
                    exit_code
                )),
            })
        }
    }
}

/// Helper simples para id de requisição
fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("{:x}", nanos)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_valid_protocol_line() {
        let json = r#"{"protocol_version":"1.0","request_id":"req_123","status":"success","result":{"output":"ok"}}"#;
        let parsed = parse_protocol_line(json);
        assert!(parsed.is_some());
        let resp = parsed.unwrap();
        assert_eq!(resp.protocol_version, "1.0");
        assert_eq!(resp.request_id, "req_123");
        assert_eq!(resp.status, "success");
    }

    #[test]
    fn test_parse_invalid_non_json_line() {
        let line = "Iniciando processamento em lote...";
        assert!(parse_protocol_line(line).is_none());
    }

    #[test]
    fn test_error_code_strings() {
        assert_eq!(ErrorCode::InvalidMessage.as_str(), "INVALID_MESSAGE");
        assert_eq!(ErrorCode::UnsupportedVersion.as_str(), "UNSUPPORTED_VERSION");
        assert_eq!(ErrorCode::IncompleteResponse.as_str(), "INCOMPLETE_RESPONSE");
        assert_eq!(ErrorCode::Timeout.as_str(), "TIMEOUT");
        assert_eq!(ErrorCode::ProcessExited.as_str(), "PROCESS_EXITED");
        assert_eq!(ErrorCode::InternalError.as_str(), "INTERNAL_ERROR");
        assert_eq!(ErrorCode::OutputTooLarge.as_str(), "OUTPUT_TOO_LARGE");
    }

    #[test]
    fn test_protocol_response_final() {
        let resp_success = ProtocolResponse {
            protocol_version: "1.0".to_string(),
            request_id: "r1".to_string(),
            status: "success".to_string(),
            result: None,
            error: None,
            warnings: vec![],
            progress: None,
        };
        assert!(resp_success.is_final());

        let resp_progress = ProtocolResponse {
            protocol_version: "1.0".to_string(),
            request_id: "r1".to_string(),
            status: "progress".to_string(),
            result: None,
            error: None,
            warnings: vec![],
            progress: Some(ProgressPayload {
                percent: Some(50.0),
                message: Some("Metade concluída".to_string()),
            }),
        };
        assert!(!resp_progress.is_final());
    }

    #[test]
    fn test_scenario_1_invalid_message() {
        let bad_json = r#"{"protocol_version":"1.0","request_id":""}"#;
        assert!(parse_protocol_line(bad_json).is_none());
    }

    #[test]
    fn test_scenario_2_unsupported_version() {
        let resp = ProtocolResponse {
            protocol_version: "99.0".to_string(),
            request_id: "r1".to_string(),
            status: "error".to_string(),
            result: None,
            error: Some(ProtocolError::new(
                ErrorCode::UnsupportedVersion,
                "Versão do protocolo 99.0 não suportada",
                None,
            )),
            warnings: vec![],
            progress: None,
        };
        assert_eq!(resp.error.unwrap().code, "UNSUPPORTED_VERSION");
    }

    #[test]
    fn test_scenario_3_incomplete_response() {
        let err = ProtocolError::new(
            ErrorCode::IncompleteResponse,
            "Plugin encerrou sem emitir resposta",
            None,
        );
        assert_eq!(err.code, "INCOMPLETE_RESPONSE");
    }

    #[test]
    fn test_scenario_4_timeout() {
        let err = ProtocolError::new(ErrorCode::Timeout, "Tempo limite excedido", None);
        assert_eq!(err.code, "TIMEOUT");
    }

    #[test]
    fn test_scenario_5_process_exited() {
        let err = ProtocolError::new(
            ErrorCode::ProcessExited,
            "Processo finalizado com código 1",
            None,
        );
        assert_eq!(err.code, "PROCESS_EXITED");
    }

    #[test]
    fn test_scenario_6_internal_error() {
        let err = ProtocolError::new(ErrorCode::InternalError, "Erro de I/O", None);
        assert_eq!(err.code, "INTERNAL_ERROR");
    }

    #[test]
    fn test_scenario_7_output_too_large() {
        let err = ProtocolError::new(
            ErrorCode::OutputTooLarge,
            "Saída maior que 10MB",
            None,
        );
        assert_eq!(err.code, "OUTPUT_TOO_LARGE");
    }
}
