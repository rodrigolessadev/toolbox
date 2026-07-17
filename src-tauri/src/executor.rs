use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;

use crate::commands_store::{CommandEntry, CommandStore, CommandType};
use crate::history::{HistoryEntry, HistoryStore};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunResult {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub version: String,
    pub path: String,
    pub language: String,
    pub entry: String,
}

#[tauri::command]
pub fn run_command(
    name: String,
    app: AppHandle,
    store: State<'_, CommandStore>,
    history: State<'_, HistoryStore>,
) -> Result<RunResult, String> {
    let entry = {
        let guard = store.data.lock().map_err(|e| e.to_string())?;
        guard.commands.get(&name).cloned()
    };

    let entry = match entry {
        Some(e) => e,
        None => {
            // Não grava histórico — tipo é desconhecido
            return Ok(RunResult {
                ok: false,
                message: Some(format!("Comando \"{}\" não encontrado.", name)),
            });
        }
    };

    let result = match &entry.kind {
        CommandType::Link => run_link(&app, &entry),
        CommandType::Application => run_application(&entry),
        CommandType::Plugin => run_plugin(&app, &name, &entry),
    };

    let success = result.is_ok();
    record_history(&history, &name, &entry.kind, success);
    result
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
    Command::new(&path)
        .spawn()
        .map_err(|e| format!("Falha ao iniciar aplicativo: {}", e))?;
    Ok(RunResult {
        ok: true,
        message: Some(format!("Aplicativo iniciado: {}", path)),
    })
}

fn run_plugin(app: &AppHandle, name: &str, entry: &CommandEntry) -> Result<RunResult, String> {
    let plugins_dir = crate::paths::plugins_dir(app);
    let plugin_path = entry
        .path
        .clone()
        .unwrap_or_else(|| plugins_dir.join(name).to_string_lossy().to_string());

    let plugin_path = PathBuf::from(&plugin_path);
    let plugin_json = plugin_path.join("plugin.json");

    if !plugin_json.exists() {
        return Err(format!(
            "plugin.json não encontrado em {}",
            plugin_path.display()
        ));
    }

    let manifest_raw = std::fs::read_to_string(&plugin_json).map_err(|e| e.to_string())?;
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
            let mut c = Command::new("python");
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

    cmd.arg("--name").arg(name);
    cmd.arg("--commands-file").arg(&commands_file);
    cmd.arg("--data-dir").arg(&data_dir);
    cmd.current_dir(&plugin_path); // ← cwd do plugin

    cmd.spawn()
        .map_err(|e| format!("Falha ao iniciar plugin {}: {}", name, e))?;

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
        timestamp: crate::commands_store_now(),
        success,
    };
    if let Ok(mut guard) = history.data.lock() {
        guard.entries.push(entry);
    }
    let _ = history.save();
}
