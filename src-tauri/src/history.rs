use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::commands_store::{CommandType, CommandsFile};

// ───────────────────────── Tipos ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub command: String,
    #[serde(rename = "command_type")]
    pub command_type: CommandType,
    pub timestamp: String,
    pub success: bool,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct HistoryFile {
    #[serde(default)]
    pub entries: Vec<HistoryEntry>,
}

// ───────────────────────── Store ─────────────────────────

pub struct HistoryStore {
    pub file_path: PathBuf,
    pub data: Mutex<HistoryFile>,
}

impl HistoryStore {
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

fn load_from_disk(path: &PathBuf) -> Option<HistoryFile> {
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

// ─────────────────── Comandos Tauri ───────────────────────

#[tauri::command]
pub fn list_history(history: State<'_, HistoryStore>) -> Result<Vec<HistoryEntry>, String> {
    let guard = history.data.lock().map_err(|e| e.to_string())?;
    Ok(guard.entries.clone())
}

#[tauri::command]
pub fn clear_history(history: State<'_, HistoryStore>) -> Result<(), String> {
    {
        let mut guard = history.data.lock().map_err(|e| e.to_string())?;
        guard.entries.clear();
    }
    history.save()
}