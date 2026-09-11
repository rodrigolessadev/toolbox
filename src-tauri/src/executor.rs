use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;

use crate::commands_store::{CommandEntry, CommandStore, CommandType};
use crate::db::DatabaseManager;
use crate::history::{HistoryEntry, HistoryStore};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunResult {
    pub ok: bool,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub version: String,
    pub path: String,
    pub language: String,
    pub entry: String,
    pub icon: Option<String>,
}

#[tauri::command]
pub fn run_command(
    name: String,
    run_as_admin: Option<bool>,
    args: Option<String>,
    app: AppHandle,
    db: State<'_, DatabaseManager>,
    store: State<'_, CommandStore>,
    history: State<'_, HistoryStore>,
) -> Result<RunResult, String> {
    let entry = {
        let guard = store.data.lock().map_err(|e| e.to_string())?;
        guard.commands.get(&name).cloned()
    };

    let (entry_kind, result) = match entry {
        Some(mut e) => {
            if let Some(admin_flag) = run_as_admin {
                e.run_as_admin = Some(admin_flag);
            }
            if let Some(extra_args) = &args {
                let current_args = e.args.unwrap_or_default();
                let combined = if current_args.trim().is_empty() {
                    extra_args.clone()
                } else {
                    format!("{} {}", current_args.trim(), extra_args.trim())
                };
                e.args = Some(combined);
            }
            let res = match &e.kind {
                CommandType::Link => run_link(&app, &e),
                CommandType::Application => run_application(&e),
                CommandType::Plugin => run_plugin(&app, &name, &e),
                CommandType::Script => run_script(&app, &name, &e),
                CommandType::Clipboard => run_clipboard(&name, &e),
            };
            (e.kind, res)
        }
        None => {
            // Tenta resolver como comando dinâmico do sistema
            let resolved = crate::system_commands::resolve_system_command(&name);
            match resolved {
                Some((path_buf, parsed_args)) => {
                    let path_str = path_buf.to_string_lossy().to_string();
                    let ext = path_buf
                        .extension()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_lowercase();

                    let combined_args = match (parsed_args, args) {
                        (Some(a1), Some(a2)) => Some(format!("{} {}", a1.trim(), a2.trim())),
                        (Some(a1), None) => Some(a1),
                        (None, Some(a2)) => Some(a2),
                        (None, None) => None,
                    };

                    let is_admin = run_as_admin.unwrap_or_else(|| {
                        crate::system_commands::is_known_elevated_utility(&name)
                    });

                    let res = run_raw_executable(&path_str, &ext, combined_args.as_deref(), is_admin);
                    (CommandType::Application, res)
                }
                None => {
                    return Ok(RunResult {
                        ok: false,
                        message: Some(format!("Comando \"{}\" não encontrado.", name)),
                    });
                }
            }
        }
    };

    let success = result.as_ref().map(|r| r.ok).unwrap_or(false);
    if success {
        let _ = crate::history::record_history_entry(&db, &name, &entry_kind, success, None);
        record_history(&history, &name, &entry_kind, success);
    }
    result
}

#[cfg(target_os = "windows")]
pub fn set_clipboard_text(text: &str) -> Result<(), String> {
    use windows::Win32::Foundation::{HANDLE, HWND};
    use windows::Win32::System::DataExchange::{CloseClipboard, EmptyClipboard, OpenClipboard, SetClipboardData};
    use windows::Win32::System::Memory::{GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE};

    let utf16: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
    let byte_len = utf16.len() * std::mem::size_of::<u16>();

    unsafe {
        OpenClipboard(HWND(std::ptr::null_mut())).map_err(|e| format!("Não foi possível abrir a Área de Transferência: {}", e))?;
        let _ = EmptyClipboard();

        let h_global = GlobalAlloc(GMEM_MOVEABLE, byte_len).map_err(|e| format!("Falha ao alocar memória: {}", e))?;
        let ptr = GlobalLock(h_global);
        if ptr.is_null() {
            let _ = CloseClipboard();
            return Err("Falha ao bloquear memória para a Área de Transferência".into());
        }

        std::ptr::copy_nonoverlapping(utf16.as_ptr() as *const u8, ptr as *mut u8, byte_len);
        let _ = GlobalUnlock(h_global);

        // CF_UNICODETEXT = 13
        let res = SetClipboardData(13, HANDLE(h_global.0));
        let _ = CloseClipboard();

        res.map_err(|e| format!("Falha ao definir dados na Área de Transferência: {}", e))?;
    }
    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn set_clipboard_text(_text: &str) -> Result<(), String> {
    Ok(())
}

fn run_clipboard(name: &str, entry: &CommandEntry) -> Result<RunResult, String> {
    let content = entry
        .text_content
        .as_deref()
        .ok_or("Comando sem conteúdo de texto definido")?;

    if content.trim().is_empty() {
        return Err("O conteúdo para a Área de Transferência está vazio".to_string());
    }

    set_clipboard_text(content)?;

    Ok(RunResult {
        ok: true,
        message: Some(format!("\"{}\" copiado para a Área de Transferência!", name)),
    })
}

/// Remove variáveis de ambiente que o empacotamento AppImage injeta no processo pai
/// (como PYTHONHOME e PYTHONPATH apontando para /tmp/.mount_toolbXXXXXX),
/// prevenindo erros de carregamento e crash na execução de ferramentas externas.
pub fn sanitize_appimage_env(cmd: &mut Command) {
    #[cfg(target_os = "linux")]
    {
        cmd.env_remove("PYTHONHOME");
        cmd.env_remove("PYTHONPATH");
    }
}

fn run_script(_app: &AppHandle, name: &str, entry: &CommandEntry) -> Result<RunResult, String> {
    let script_content = entry
        .script_content
        .as_deref()
        .ok_or("Script sem conteúdo")?;

    if script_content.trim().is_empty() {
        return Err("O conteúdo do script está vazio".to_string());
    }

    let script_type = entry
        .script_type
        .as_deref()
        .unwrap_or("powershell")
        .to_lowercase();

    let ext = match script_type.as_str() {
        "batch" | "bat" | "cmd" => "bat",
        _ => "ps1",
    };

    // Diretório temporário para scripts do Toolbox (%TEMP%/toolbox/scripts)
    let scripts_dir = std::env::temp_dir().join("toolbox").join("scripts");
    std::fs::create_dir_all(&scripts_dir)
        .map_err(|e| format!("Falha ao criar diretório temporário de scripts: {}", e))?;

    // Nome de arquivo seguro baseado no nome do comando
    let safe_name: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let file_name = format!("{}.{}", safe_name, ext);
    let file_path = scripts_dir.join(&file_name);

    std::fs::write(&file_path, script_content)
        .map_err(|e| format!("Falha ao salvar script temporário: {}", e))?;

    let path_str = file_path
        .to_str()
        .ok_or("Caminho do script inválido")?
        .to_string();

    let run_as_admin = entry.run_as_admin.unwrap_or(false);

    if run_as_admin {
        #[cfg(target_os = "windows")]
        {
            return run_application_as_admin(&path_str, ext, entry.args.as_deref());
        }
    }

    let mut cmd = match ext {
        "ps1" => {
            let mut c = Command::new("powershell.exe");
            c.args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", &path_str]);
            c
        }
        "bat" => {
            let mut c = Command::new("cmd.exe");
            c.args(["/c", &path_str]);
            c
        }
        _ => Command::new(&path_str),
    };

    sanitize_appimage_env(&mut cmd);

    if let Some(raw_args) = &entry.args {
        let trimmed = raw_args.trim();
        if !trimmed.is_empty() {
            for arg in split_args(trimmed) {
                cmd.arg(arg);
            }
        }
    }

    cmd.spawn()
        .map_err(|e| format!("Falha ao executar script: {}", e))?;

    let type_label = if ext == "ps1" { "PowerShell" } else { "Batch" };

    Ok(RunResult {
        ok: true,
        message: Some(format!("Script {} ({}) executado com sucesso", name, type_label)),
    })
}

fn run_link(app: &AppHandle, entry: &CommandEntry) -> Result<RunResult, String> {
    let url = entry.url.clone().ok_or("Link sem URL")?;
    app.opener()
        .open_url(url.clone(), None::<&str>)
        .map_err(|e| e.to_string())?;
    Ok(RunResult {
        ok: true,
        message: Some(format!("Link aberto: {}", url)),
    })
}

fn run_application(entry: &CommandEntry) -> Result<RunResult, String> {
    let path = entry.path.clone().ok_or("Aplicativo sem caminho")?;
    let run_as_admin = entry.run_as_admin.unwrap_or(false);
    let ext = std::path::Path::new(&path)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();

    run_raw_executable(&path, &ext, entry.args.as_deref(), run_as_admin)
}

pub fn run_windows_command_in_wsl(
    path: &str,
    ext: &str,
    raw_args: Option<&str>,
) -> Result<RunResult, String> {
    // 1. Execucao direta de binarios Windows (.exe) montados via /mnt/...
    if let Some(wsl_path) = crate::wsl::windows_to_wsl_path(path) {
        if wsl_path.exists() && (ext == "exe" || path.ends_with(".exe")) {
            let mut c = std::process::Command::new(&wsl_path);
            if let Some(parent) = wsl_path.parent() {
                c.current_dir(parent);
            }
            c.stdin(std::process::Stdio::null());

            if let Some(args) = raw_args {
                let trimmed = args.trim();
                if !trimmed.is_empty() {
                    for arg in split_args(trimmed) {
                        c.arg(arg);
                    }
                }
            }

            c.spawn()
                .map_err(|e| format!("Falha ao iniciar executavel Windows \"{}\" via WSL: {}", path, e))?;

            return Ok(RunResult {
                ok: true,
                message: Some(format!("Aplicativo Windows iniciado via WSL: {}", path)),
            });
        }
    }

    // 2. Scripts PowerShell (.ps1)
    if ext == "ps1" {
        let mut c = std::process::Command::new("powershell.exe");
        c.current_dir("/mnt/c");
        c.stdin(std::process::Stdio::null());
        c.args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path]);

        if let Some(args) = raw_args {
            let trimmed = args.trim();
            if !trimmed.is_empty() {
                for arg in split_args(trimmed) {
                    c.arg(arg);
                }
            }
        }

        c.spawn()
            .map_err(|e| format!("Falha ao executar script PowerShell Windows \"{}\" via WSL: {}", path, e))?;

        return Ok(RunResult {
            ok: true,
            message: Some(format!("Script PowerShell Windows iniciado via WSL: {}", path)),
        });
    }

    // 3. Scripts em lote (.bat ou .cmd)
    if matches!(ext, "bat" | "cmd") {
        let mut c = std::process::Command::new("cmd.exe");
        c.current_dir("/mnt/c");
        c.stdin(std::process::Stdio::null());
        c.args(["/c", path]);

        if let Some(args) = raw_args {
            let trimmed = args.trim();
            if !trimmed.is_empty() {
                for arg in split_args(trimmed) {
                    let sanitized = crate::wsl::sanitize_cmd_arg(&arg);
                    c.arg(sanitized);
                }
            }
        }

        c.spawn()
            .map_err(|e| format!("Falha ao executar script Batch Windows \"{}\" via WSL: {}", path, e))?;

        return Ok(RunResult {
            ok: true,
            message: Some(format!("Script Batch Windows iniciado via WSL: {}", path)),
        });
    }

    // 4. Executaveis em PATH (ex: wt, calc, notepad), consoles (.msc, .cpl) ou caminhos de rede UNC (\\server\share\app.exe)
    let win_target = if path.ends_with(".exe")
        || (path.len() >= 3 && path.as_bytes()[1] == b':')
        || path.starts_with(r"\\")
        || path.starts_with("//")
        || matches!(ext, "msc" | "cpl")
    {
        path.to_string()
    } else {
        format!("{}.exe", path)
    };

    let mut c = std::process::Command::new("cmd.exe");
    c.current_dir("/mnt/c");
    c.stdin(std::process::Stdio::null());
    c.args(["/c", "start", "", &win_target]);

    if let Some(args) = raw_args {
        let trimmed = args.trim();
        if !trimmed.is_empty() {
            for arg in split_args(trimmed) {
                let sanitized = crate::wsl::sanitize_cmd_arg(&arg);
                c.arg(sanitized);
            }
        }
    }

    c.spawn()
        .map_err(|e| format!("Falha ao invocar comando Windows \"{}\" via WSL Interop: {}", path, e))?;

    Ok(RunResult {
        ok: true,
        message: Some(format!("Comando Windows disparado via WSL: {}", path)),
    })
}


pub fn run_raw_executable(
    path: &str,
    ext: &str,
    raw_args: Option<&str>,
    run_as_admin: bool,
) -> Result<RunResult, String> {
    if crate::wsl::is_wsl() && crate::wsl::is_windows_command(path, ext) {
        return run_windows_command_in_wsl(path, ext, raw_args);
    }
    if run_as_admin {
        #[cfg(target_os = "windows")]
        {
            return run_application_as_admin(path, ext, raw_args);
        }
        #[cfg(not(target_os = "windows"))]
        {
            return Ok(RunResult {
                ok: false,
                message: Some("Execução como Administrador não suportada nesta plataforma.".to_string()),
            });
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Se for console MMC (.msc) ou painel de controle (.cpl), executa via ShellExecuteW com verbo "open"
        if ext == "msc" || ext == "cpl" {
            use std::ffi::OsStr;
            use std::os::windows::ffi::OsStrExt;
            use windows::core::PCWSTR;
            use windows::Win32::Foundation::HWND;
            use windows::Win32::UI::Shell::ShellExecuteW;
            use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

            let op: Vec<u16> = OsStr::new("open").encode_wide().chain(std::iter::once(0)).collect();
            let file_wide: Vec<u16> = OsStr::new(path).encode_wide().chain(std::iter::once(0)).collect();
            let args_wide: Option<Vec<u16>> = raw_args.and_then(|a| {
                let trimmed = a.trim();
                if trimmed.is_empty() {
                    None
                } else {
                    Some(OsStr::new(trimmed).encode_wide().chain(std::iter::once(0)).collect())
                }
            });

            let res = unsafe {
                ShellExecuteW(
                    HWND(std::ptr::null_mut()),
                    PCWSTR(op.as_ptr()),
                    PCWSTR(file_wide.as_ptr()),
                    args_wide.as_ref().map_or(PCWSTR::null(), |a| PCWSTR(a.as_ptr())),
                    PCWSTR::null(),
                    SW_SHOWNORMAL,
                )
            };

            let code = res.0 as usize;
            if code > 32 {
                let desc = if ext == "msc" {
                    "Console do Windows iniciado"
                } else {
                    "Item do Painel de Controle iniciado"
                };
                return Ok(RunResult {
                    ok: true,
                    message: Some(format!("{}: {}", desc, path)),
                });
            }
        }
    }

    let mut cmd = match ext {
        "ps1" => {
            let mut c = Command::new("powershell.exe");
            c.args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path]);
            c
        }
        "bat" | "cmd" => {
            let mut c = Command::new("cmd.exe");
            c.args(["/c", path]);
            c
        }
        _ => Command::new(path),
    };

    sanitize_appimage_env(&mut cmd);

    // Argumentos extras, se houver (igual ao campo "Destino" do atalho do Windows)
    if let Some(raw_args) = raw_args {
        let trimmed = raw_args.trim();
        if !trimmed.is_empty() {
            for arg in split_args(trimmed) {
                cmd.arg(arg);
            }
        }
    }

    cmd.spawn()
        .map_err(|e| format!("Falha ao iniciar aplicativo/script \"{}\": {}", path, e))?;

    let desc = match ext {
        "ps1" => "Script PowerShell iniciado",
        "bat" | "cmd" => "Script em lote iniciado",
        "msc" => "Console do Windows iniciado",
        "cpl" => "Item do Painel de Controle iniciado",
        _ => "Aplicativo iniciado",
    };

    Ok(RunResult {
        ok: true,
        message: Some(format!("{}: {}", desc, path)),
    })
}

#[cfg(target_os = "windows")]
fn run_application_as_admin(path: &str, ext: &str, raw_args: Option<&str>) -> Result<RunResult, String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Shell::ShellExecuteW;
    use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

    let op: Vec<u16> = OsStr::new("runas").encode_wide().chain(std::iter::once(0)).collect();

    let (file_str, formatted_args) = match ext {
        "ps1" => {
            let mut a = format!("-NoProfile -ExecutionPolicy Bypass -File \"{}\"", path);
            if let Some(extra) = raw_args {
                let trimmed = extra.trim();
                if !trimmed.is_empty() {
                    a.push(' ');
                    a.push_str(trimmed);
                }
            }
            ("powershell.exe".to_string(), Some(a))
        }
        "bat" | "cmd" => {
            let mut a = format!("/c \"{}\"", path);
            if let Some(extra) = raw_args {
                let trimmed = extra.trim();
                if !trimmed.is_empty() {
                    a.push(' ');
                    a.push_str(trimmed);
                }
            }
            ("cmd.exe".to_string(), Some(a))
        }
        _ => {
            let a = raw_args.and_then(|extra| {
                let trimmed = extra.trim();
                if trimmed.is_empty() {
                    None
                } else {
                    Some(trimmed.to_string())
                }
            });
            (path.to_string(), a)
        }
    };

    let file_wide: Vec<u16> = OsStr::new(&file_str).encode_wide().chain(std::iter::once(0)).collect();
    let args_wide: Option<Vec<u16>> = formatted_args.map(|a| {
        OsStr::new(&a).encode_wide().chain(std::iter::once(0)).collect()
    });

    let res = unsafe {
        ShellExecuteW(
            HWND(std::ptr::null_mut()),
            PCWSTR(op.as_ptr()),
            PCWSTR(file_wide.as_ptr()),
            args_wide.as_ref().map_or(PCWSTR::null(), |a| PCWSTR(a.as_ptr())),
            PCWSTR::null(),
            SW_SHOWNORMAL,
        )
    };

    let code = res.0 as usize;
    if code > 32 {
        let desc = match ext {
            "ps1" => "Script PowerShell iniciado como Administrador",
            "bat" | "cmd" => "Script em lote iniciado como Administrador",
            "msc" => "Console do Windows iniciado como Administrador",
            "cpl" => "Painel de Controle iniciado como Administrador",
            _ => "Aplicativo iniciado como Administrador",
        };
        Ok(RunResult {
            ok: true,
            message: Some(format!("{}: {}", desc, path)),
        })
    } else if code == 5 || code == 0 || code == 1223 {
        // Usuário cancelou ou recusou a elevação do prompt UAC
        Ok(RunResult {
            ok: false,
            message: Some("Execução como Administrador cancelada pelo usuário.".to_string()),
        })
    } else {
        Err(format!("Falha ao iniciar como Administrador (código Win32: {})", code))
    }
}

/// Divide uma string de argumentos respeitando aspas simples e duplas,
/// semelhante ao comportamento do campo "Destino" de um atalho Windows.
fn split_args(s: &str) -> Vec<String> {
    let mut args = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    let mut quote_char = '"';

    for ch in s.chars() {
        match ch {
            '"' | '\'' if !in_quotes => {
                in_quotes = true;
                quote_char = ch;
            }
            c if in_quotes && c == quote_char => {
                in_quotes = false;
            }
            ' ' | '\t' if !in_quotes => {
                if !current.is_empty() {
                    args.push(current.clone());
                    current.clear();
                }
            }
            _ => current.push(ch),
        }
    }
    if !current.is_empty() {
        args.push(current);
    }
    args
}

fn run_plugin(app: &AppHandle, name: &str, entry: &CommandEntry) -> Result<RunResult, String> {
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

    // Se o manifesto especifica protocol_version, executa via protocolo v1.0
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(&manifest_raw) {
        if v.get("protocol_version").is_some() {
            return crate::protocol::run_protocol_plugin(app, name, entry);
        }
    }

    let manifest: HashMap<String, String> =
        serde_json::from_str(&manifest_raw).map_err(|e| e.to_string())?;

    let entry_file = manifest
        .get("entry")
        .cloned()
        .ok_or("plugin.json sem campo 'entry'")?;
    let language = manifest
        .get("language")
        .cloned()
        .unwrap_or_else(|| "python".to_string());

    let entry_path = plugin_path.join(&entry_file);
    if !entry_path.exists() {
        return Err(format!(
            "Arquivo de entrada não encontrado: {}",
            entry_path.display()
        ));
    }

    let data_dir = crate::paths::data_dir(app);
    let commands_file = data_dir.join("commands.json");

    let mut cmd = match language.as_str() {
        "python" => {
            let (python_bin, is_embedded, _) = crate::runtimes::get_plugin_python_executable(&plugin_path, Some(app));
            let mut c = Command::new(&python_bin);
            crate::runtimes::configure_python_command_env(&mut c, &python_bin, is_embedded);
            c.arg(&entry_path);
            c
        }
        "node" | "javascript" => {
            let mut c = Command::new("node");
            c.arg(&entry_path);
            c
        }
        "go" | "rust" | "binary" => {
            // binário pré-compilado
            Command::new(&entry_path)
        }
        _ => {
            return Err(format!(
                "Linguagem '{}' não suportada. Use: python, node, go, rust, binary.",
                language
            ));
        }
    };

    let theme = crate::paths::get_theme(app.clone()).unwrap_or_else(|_| "dark".to_string());
    cmd.env("TOOLBOX_THEME", &theme);
    cmd.arg("--name").arg(name);
    cmd.arg("--commands-file").arg(&commands_file);
    cmd.arg("--data-dir").arg(&data_dir);
    cmd.arg("--theme").arg(&theme);
    cmd.current_dir(&plugin_path); // ← cwd do plugin

    // Captura stdout e stderr em vez de herdar o console do processo pai
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    // No Windows, impede a abertura de uma janela de terminal separada
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let plugin_name = name.to_string();
    let lang_str = language.clone();
    let mut child = cmd.spawn().map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            match lang_str.as_str() {
                "python" => format!(
                    "Falha ao iniciar plugin '{}': Interpretador Python não encontrado no sistema. Por favor, instale o Python em https://python.org ou execute 'winget install Python.Python.3.12'.",
                    name
                ),
                "node" | "javascript" => format!(
                    "Falha ao iniciar plugin '{}': Runtime Node.js não encontrado no sistema. Por favor, instale o Node.js em https://nodejs.org.",
                    name
                ),
                _ => format!("Falha ao iniciar plugin {}: {}", name, e),
            }
        } else {
            format!("Falha ao iniciar plugin {}: {}", name, e)
        }
    })?;

    // Drena stdout e stderr em threads separadas, gravando no log do toolbox
    if let Some(stdout) = child.stdout.take() {
        let tag = format!("plugin::{}", plugin_name);
        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines().flatten() {
                crate::logger::write_line(log::Level::Info, &tag, &line);
            }
        });
    }

    let initial_stderr_buffer = std::sync::Arc::new(std::sync::Mutex::new(Vec::<String>::new()));
    let buffer_clone = initial_stderr_buffer.clone();

    if let Some(stderr) = child.stderr.take() {
        let tag = format!("plugin::{}", plugin_name);
        std::thread::spawn(move || {
            for line in BufReader::new(stderr).lines().flatten() {
                if let Ok(mut buf) = buffer_clone.lock() {
                    if buf.len() < 30 {
                        buf.push(line.clone());
                    }
                }
                crate::logger::write_line(log::Level::Warn, &tag, &line);
            }
        });
    }

    // Health-check pós-spawn: aguarda brevemente para verificar se o processo encerrou precocemente (ex: ModuleNotFoundError, SyntaxError)
    std::thread::sleep(std::time::Duration::from_millis(350));
    match child.try_wait() {
        Ok(Some(status)) if !status.success() => {
            let captured_err = initial_stderr_buffer
                .lock()
                .map(|b| b.join("\n"))
                .unwrap_or_default();
            let err_trimmed = captured_err.trim();
            let detail = if !err_trimmed.is_empty() {
                if err_trimmed.contains("No module named 'webview'") {
                    format!(
                        "{}\n\nDica: A biblioteca 'pywebview' não foi encontrada no interpretador Python ativo. No Linux, instale-a via 'pip install pywebview' ou configure um ambiente virtual (.venv) no diretório do plugin.",
                        err_trimmed
                    )
                } else {
                    err_trimmed.to_string()
                }
            } else {
                format!(
                    "O processo encerrou imediatamente com código de erro {}.",
                    status.code().unwrap_or(-1)
                )
            };

            return Err(format!("Falha ao iniciar plugin '{}':\n{}", name, detail));
        }
        _ => {}
    }

    Ok(RunResult {
        ok: true,
        message: Some(format!("Plugin executado: {}", name)),
    })
}

#[tauri::command]
pub fn list_plugins(app: AppHandle) -> Result<Vec<PluginInfo>, String> {
    let plugins_dir = crate::paths::plugins_dir(&app);
    if !plugins_dir.exists() {
        return Ok(vec![]);
    }

    let mut plugins = Vec::new();
    let entries = std::fs::read_dir(&plugins_dir).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let plugin_json = path.join("plugin.json");
        if !plugin_json.exists() {
            continue;
        }
        let raw = match std::fs::read_to_string(&plugin_json) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let manifest: HashMap<String, String> = match serde_json::from_str(&raw) {
            Ok(m) => m,
            Err(_) => continue,
        };

        plugins.push(PluginInfo {
            name: manifest.get("name").cloned().unwrap_or_else(|| {
                path.file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string()
            }),
            version: manifest
                .get("version")
                .cloned()
                .unwrap_or_else(|| "0.0.0".to_string()),
            path: path.to_string_lossy().to_string(),
            language: manifest
                .get("language")
                .cloned()
                .unwrap_or_else(|| "python".to_string()),
            entry: manifest.get("entry").cloned().unwrap_or_default(),
            icon: manifest.get("icon").cloned(),
        });
    }

    Ok(plugins)
}

#[tauri::command]
pub fn open_plugin_folder(path: String, app: AppHandle) -> Result<(), String> {
    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|e| e.to_string())
}

fn record_history(
    history: &State<'_, HistoryStore>,
    name: &str,
    kind: &CommandType,
    success: bool,
) {
    let entry = HistoryEntry {
        command: name.to_string(),
        command_type: kind.clone(),
        timestamp: crate::commands_store::now(),
        success,
    };
    if let Ok(mut guard) = history.data.lock() {
        guard.entries.push(entry);
        // Mantém apenas as últimas MAX_HISTORY entradas
        if guard.entries.len() > crate::history::MAX_HISTORY {
            let excess = guard.entries.len() - crate::history::MAX_HISTORY;
            guard.entries.drain(..excess);
        }
    }
    let _ = history.save();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_args_simple() {
        let args = split_args("--flag value -v");
        assert_eq!(args, vec!["--flag", "value", "-v"]);
    }

    #[test]
    fn test_split_args_with_quotes() {
        let args = split_args(r#"-SystemModule:VETORH.RUBI -seniordir:"C:\Senior\SeniorGPO108ORA\" -aqtest"#);
        assert_eq!(
            args,
            vec![
                "-SystemModule:VETORH.RUBI",
                r#"-seniordir:C:\Senior\SeniorGPO108ORA\"#,
                "-aqtest"
            ]
        );
    }

    #[test]
    fn test_split_args_empty_or_whitespace() {
        assert!(split_args("").is_empty());
        assert!(split_args("    ").is_empty());
    }

    #[test]
    #[cfg(target_os = "linux")]
    fn test_sanitize_appimage_env_removes_vars() {
        let mut cmd = Command::new("dummy");
        sanitize_appimage_env(&mut cmd);

        let envs: Vec<(&std::ffi::OsStr, Option<&std::ffi::OsStr>)> = cmd.get_envs().collect();
        let pythonhome_entry = envs.iter().find(|(k, _)| *k == "PYTHONHOME");
        let pythonpath_entry = envs.iter().find(|(k, _)| *k == "PYTHONPATH");

        assert!(pythonhome_entry.is_some());
        assert_eq!(pythonhome_entry.unwrap().1, None);

        assert!(pythonpath_entry.is_some());
        assert_eq!(pythonpath_entry.unwrap().1, None);
    }
}

