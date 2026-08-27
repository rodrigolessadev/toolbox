use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

use crate::commands_store::CommandType;
use crate::db::DatabaseManager;
use rusqlite::params;

/// Número máximo de entradas mantidas no cache em memória
pub const MAX_HISTORY: usize = 100;
/// Número padrão de entradas no histórico retornado pelo SQLite
pub const DEFAULT_HISTORY_LIMIT: usize = 500;

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

pub fn record_history_entry(
    db: &DatabaseManager,
    command_name: &str,
    kind: &CommandType,
    success: bool,
    duration_ms: Option<i64>,
) -> Result<(), String> {
    let conn = db.get_connection()?;
    let kind_str = match kind {
        CommandType::Link => "link",
        CommandType::Plugin => "plugin",
        CommandType::Application => "application",
        CommandType::Script => "script",
        CommandType::Clipboard => "clipboard",
    };

    conn.execute(
        "INSERT INTO history (command_name, command_type, timestamp, success, duration_ms)
         VALUES (?, ?, datetime('now'), ?, ?)",
        params![command_name, kind_str, success as i32, duration_ms],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

// ─────────────────── Comandos Tauri ───────────────────────

#[tauri::command]
pub fn list_history(
    db: State<'_, DatabaseManager>,
    history: State<'_, HistoryStore>,
) -> Result<Vec<HistoryEntry>, String> {
    if let Ok(conn) = db.get_connection() {
        if let Ok(mut stmt) = conn.prepare("
            SELECT command_name, command_type, timestamp, success
            FROM history
            ORDER BY id DESC
            LIMIT ?
        ") {
            if let Ok(rows) = stmt.query_map([DEFAULT_HISTORY_LIMIT as i64], |row| {
                let command: String = row.get(0)?;
                let kind_str: String = row.get(1)?;
                let kind = match kind_str.as_str() {
                    "plugin" => CommandType::Plugin,
                    "application" => CommandType::Application,
                    "script" => CommandType::Script,
                    "clipboard" => CommandType::Clipboard,
                    _ => CommandType::Link,
                };
                let timestamp: String = row.get(2)?;
                let success_i: i32 = row.get(3)?;

                Ok(HistoryEntry {
                    command,
                    command_type: kind,
                    timestamp,
                    success: success_i != 0,
                })
            }) {
                let mut entries = Vec::new();
                for r in rows.flatten() {
                    entries.push(r);
                }
                return Ok(entries);
            }
        }
    }

    // Fallback para arquivo local se banco inacessível
    let guard = history.data.lock().map_err(|e| e.to_string())?;
    Ok(guard.entries.clone())
}

#[tauri::command]
pub fn clear_history(
    db: State<'_, DatabaseManager>,
    history: State<'_, HistoryStore>,
) -> Result<(), String> {
    if let Ok(conn) = db.get_connection() {
        let _ = conn.execute("DELETE FROM history", []);
    }

    {
        let mut guard = history.data.lock().map_err(|e| e.to_string())?;
        guard.entries.clear();
    }
    history.save()
}
