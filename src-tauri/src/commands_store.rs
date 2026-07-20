use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

// ───────────────────────── Tipos ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CommandType {
    Link,
    Plugin,
    Application,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandEntry {
    #[serde(rename = "type")]
    pub kind: CommandType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    pub favorite: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
}

pub type CommandsMap = BTreeMap<String, CommandEntry>;

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct CommandsFile {
    #[serde(default)]
    pub commands: CommandsMap,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCommandPayload {
    pub name: String,
    #[serde(rename = "type")]
    pub kind: CommandType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToggleFavoritePayload {
    pub name: String,
    pub favorite: bool,
}

// ───────────────────────── Store ──────────────────────────

pub struct CommandStore {
    pub file_path: PathBuf,
    pub data: Mutex<CommandsFile>,
}

impl CommandStore {
    pub fn new(file_path: PathBuf) -> Self {
        let data = load_from_disk(&file_path).unwrap_or_default();
        Self {
            file_path,
            data: Mutex::new(data),
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let guard = self.data.lock().map_err(|e| e.to_string())?;
        let json = serde_json::to_string_pretty(&*guard).map_err(|e| e.to_string())?;
        if let Some(parent) = self.file_path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&self.file_path, json).map_err(|e| e.to_string())?;
        Ok(())
    }
}

fn load_from_disk(path: &PathBuf) -> Option<CommandsFile> {
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

// ─────────────────── Comandos Tauri ───────────────────────

#[tauri::command]
pub fn list_commands(store: State<'_, CommandStore>) -> Result<CommandsMap, String> {
    let guard = store.data.lock().map_err(|e| e.to_string())?;
    Ok(guard.commands.clone())
}

#[tauri::command]
pub fn get_commands_file(store: State<'_, CommandStore>) -> Result<CommandsFile, String> {
    let guard = store.data.lock().map_err(|e| e.to_string())?;
    Ok(guard.clone())
}

#[tauri::command]
pub fn create_command(
    payload: CreateCommandPayload,
    store: State<'_, CommandStore>,
) -> Result<CommandsFile, String> {
    let mut guard = store.data.lock().map_err(|e| e.to_string())?;

    let entry = CommandEntry {
        kind: payload.kind,
        path: payload.path,
        url: payload.url,
        icon: payload.icon,
        favorite: false,
        created_at: Some(now()),
    };
    guard.commands.insert(payload.name, entry);
    drop(guard);

    store.save()?;
    get_commands_file(store)
}

#[tauri::command]
pub fn delete_command(
    name: String,
    store: State<'_, CommandStore>,
) -> Result<CommandsFile, String> {
    let mut guard = store.data.lock().map_err(|e| e.to_string())?;
    guard.commands.remove(&name);
    drop(guard);

    store.save()?;
    get_commands_file(store)
}

#[tauri::command]
pub fn toggle_favorite(
    payload: ToggleFavoritePayload,
    store: State<'_, CommandStore>,
) -> Result<CommandsFile, String> {
    let mut guard = store.data.lock().map_err(|e| e.to_string())?;
    if let Some(entry) = guard.commands.get_mut(&payload.name) {
        entry.favorite = payload.favorite;
    }
    drop(guard);

    store.save()?;
    get_commands_file(store)
}

#[tauri::command]
pub fn import_commands(
    json: String,
    store: State<'_, CommandStore>,
) -> Result<CommandsFile, String> {
    let parsed: CommandsFile = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    {
        let mut guard = store.data.lock().map_err(|e| e.to_string())?;
        guard.commands = parsed.commands;
    }
    store.save()?;
    get_commands_file(store)
}

#[tauri::command]
pub fn export_commands(store: State<'_, CommandStore>) -> Result<String, String> {
    let guard = store.data.lock().map_err(|e| e.to_string())?;
    serde_json::to_string_pretty(&*guard).map_err(|e| e.to_string())
}

// ──────────────────── Utilitários ─────────────────────────

pub fn now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{}", secs)
}
