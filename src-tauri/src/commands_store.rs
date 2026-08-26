use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use crate::paths;

// ───────────────────────── Tipos ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupStatus {
    pub enabled: bool,
    pub backup_path: String,
    pub destination_type: String,
    pub last_backup_time: Option<String>,
    pub file_size_bytes: Option<u64>,
    pub backup_exists: bool,
    pub backup_commands_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CommandType {
    Link,
    Plugin,
    Application,
    Script,
    Clipboard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandEntry {
    #[serde(rename = "type")]
    pub kind: CommandType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    /// Argumentos extras para aplicativos (ex: "--verbose --config=foo.cfg")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<String>,
    /// Executar como administrador no Windows (elevação UAC)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_as_admin: Option<bool>,
    /// Tipo de script (ex: "powershell" | "batch")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub script_type: Option<String>,
    /// Conteúdo do script inline
    #[serde(skip_serializing_if = "Option::is_none")]
    pub script_content: Option<String>,
    /// Conteúdo de texto para Área de Transferência (Clipboard / Snippets)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text_content: Option<String>,
    /// Descrição ou observação opcional do comando
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
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
    /// Argumentos extras para aplicativos
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_as_admin: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub script_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub script_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    pub icon: Option<String>,
    pub favorite: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCommandPayload {
    #[serde(rename = "old_name")]
    pub old_name: String,
    pub name: String,
    #[serde(rename = "type")]
    pub kind: CommandType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub run_as_admin: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub script_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub script_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    pub icon: Option<String>,
    pub favorite: bool,
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
        fs::write(&self.file_path, &json).map_err(|e| e.to_string())?;

        // Shadow backup resiliente contínuo no diretório seguro
        let bdir = paths::backup_dir();
        if fs::create_dir_all(&bdir).is_ok() {
            let backup_file = bdir.join("toolbox-commands-backup.json");
            let _ = fs::write(backup_file, json);
        }

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
        args: payload.args,
        run_as_admin: payload.run_as_admin,
        script_type: payload.script_type,
        script_content: payload.script_content,
        text_content: payload.text_content,
        description: payload.description,
        url: payload.url,
        icon: payload.icon,
        favorite: payload.favorite,
        created_at: Some(now()),
    };
    guard.commands.insert(payload.name, entry);
    drop(guard);

    store.save()?;
    get_commands_file(store)
}

#[tauri::command]
pub fn update_command(
    payload: UpdateCommandPayload,
    store: State<'_, CommandStore>,
) -> Result<CommandsFile, String> {
    let mut guard = store.data.lock().map_err(|e| e.to_string())?;

    if payload.old_name != payload.name {
        guard.commands.remove(&payload.old_name);
    }

    let entry = CommandEntry {
        kind: payload.kind,
        path: payload.path,
        args: payload.args,
        run_as_admin: payload.run_as_admin,
        script_type: payload.script_type,
        script_content: payload.script_content,
        text_content: payload.text_content,
        description: payload.description,
        url: payload.url,
        icon: payload.icon,
        favorite: payload.favorite,
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

#[tauri::command]
pub fn get_backup_status() -> Result<BackupStatus, String> {
    let bdir = paths::backup_dir();
    let backup_file = bdir.join("toolbox-commands-backup.json");
    let dest_type = paths::get_destination_type(&bdir);

    if backup_file.exists() {
        let meta = fs::metadata(&backup_file).ok();
        let size = meta.as_ref().map(|m| m.len());
        let last_time = meta
            .and_then(|m| m.modified().ok())
            .map(|t| {
                let dur = t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default();
                dur.as_secs().to_string()
            });

        let count = fs::read_to_string(&backup_file)
            .ok()
            .and_then(|s| serde_json::from_str::<CommandsFile>(&s).ok())
            .map(|cf| cf.commands.len())
            .unwrap_or(0);

        Ok(BackupStatus {
            enabled: true,
            backup_path: backup_file.to_string_lossy().to_string(),
            destination_type: dest_type,
            last_backup_time: last_time,
            file_size_bytes: size,
            backup_exists: true,
            backup_commands_count: count,
        })
    } else {
        Ok(BackupStatus {
            enabled: true,
            backup_path: backup_file.to_string_lossy().to_string(),
            destination_type: dest_type,
            last_backup_time: None,
            file_size_bytes: None,
            backup_exists: false,
            backup_commands_count: 0,
        })
    }
}

#[tauri::command]
pub fn trigger_manual_backup(store: State<'_, CommandStore>) -> Result<BackupStatus, String> {
    store.save()?;
    get_backup_status()
}

#[tauri::command]
pub fn restore_from_auto_backup(store: State<'_, CommandStore>) -> Result<CommandsFile, String> {
    let bdir = paths::backup_dir();
    let backup_file = bdir.join("toolbox-commands-backup.json");
    if !backup_file.exists() {
        return Err("Nenhum arquivo de backup encontrado no diretório seguro.".to_string());
    }

    let content = fs::read_to_string(&backup_file)
        .map_err(|e| format!("Falha ao ler arquivo de backup: {e}"))?;
    let parsed: CommandsFile = serde_json::from_str(&content)
        .map_err(|e| format!("Arquivo de backup inválido: {e}"))?;

    {
        let mut guard = store.data.lock().map_err(|e| e.to_string())?;
        guard.commands = parsed.commands;
    }
    store.save()?;
    get_commands_file(store)
}

#[tauri::command]
pub fn check_auto_backup_available(store: State<'_, CommandStore>) -> Result<Option<BackupStatus>, String> {
    let guard = store.data.lock().map_err(|e| e.to_string())?;
    if !guard.commands.is_empty() {
        return Ok(None);
    }
    drop(guard);

    let status = get_backup_status()?;
    if status.backup_exists && status.backup_commands_count > 0 {
        Ok(Some(status))
    } else {
        Ok(None)
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_script_command_serialization() {
        let entry = CommandEntry {
            kind: CommandType::Script,
            path: None,
            args: Some("-Param 123".into()),
            run_as_admin: Some(true),
            script_type: Some("powershell".into()),
            script_content: Some("Write-Host 'Hello Toolbox'".into()),
            text_content: None,
            description: None,
            url: None,
            favorite: true,
            icon: None,
            created_at: Some("123456789".into()),
        };

        let json = serde_json::to_string(&entry).unwrap();
        assert!(json.contains(r#""type":"script""#));
        assert!(json.contains(r#""script_type":"powershell""#));
        assert!(json.contains(r#""script_content":"Write-Host 'Hello Toolbox'""#));
        assert!(json.contains(r#""run_as_admin":true"#));

        let deserialized: CommandEntry = serde_json::from_str(&json).unwrap();
        assert!(matches!(deserialized.kind, CommandType::Script));
        assert_eq!(deserialized.script_type.as_deref(), Some("powershell"));
        assert_eq!(deserialized.script_content.as_deref(), Some("Write-Host 'Hello Toolbox'"));
        assert_eq!(deserialized.run_as_admin, Some(true));
    }

    #[test]
    fn test_clipboard_command_serialization() {
        let entry = CommandEntry {
            kind: CommandType::Clipboard,
            path: None,
            args: None,
            run_as_admin: None,
            script_type: None,
            script_content: None,
            text_content: Some("O graphify dos arquivos fica em C:\\tools\\scripts\\GIT\\graphify".into()),
            description: Some("Caminho do repositório Graphify".into()),
            url: None,
            favorite: true,
            icon: None,
            created_at: Some("123456789".into()),
        };

        let json = serde_json::to_string(&entry).unwrap();
        assert!(json.contains(r#""type":"clipboard""#));
        assert!(json.contains("graphify"));
        assert!(json.contains("Caminho do reposit\\u00f3rio Graphify") || json.contains("Caminho do repositório Graphify") || json.contains("description"));

        let deserialized: CommandEntry = serde_json::from_str(&json).unwrap();
        assert!(matches!(deserialized.kind, CommandType::Clipboard));
        assert_eq!(deserialized.text_content.as_deref(), Some("O graphify dos arquivos fica em C:\\tools\\scripts\\GIT\\graphify"));
        assert_eq!(deserialized.description.as_deref(), Some("Caminho do repositório Graphify"));
    }

    #[test]
    fn test_backup_save_and_restore() {
        let temp_dir = std::env::temp_dir().join(format!("toolbox_test_{}", now()));
        let _ = fs::create_dir_all(&temp_dir);
        let store_file = temp_dir.join("commands.json");

        let store = CommandStore::new(store_file.clone());
        {
            let mut guard = store.data.lock().unwrap();
            guard.commands.insert(
                "my-cmd".into(),
                CommandEntry {
                    kind: CommandType::Link,
                    path: None,
                    args: None,
                    run_as_admin: None,
                    script_type: None,
                    script_content: None,
                    text_content: None,
                    description: Some("Teste".into()),
                    url: Some("https://example.com".into()),
                    favorite: false,
                    icon: None,
                    created_at: Some("123".into()),
                },
            );
        }
        assert!(store.save().is_ok());
        assert!(store_file.exists());

        let bdir = paths::backup_dir();
        let backup_file = bdir.join("toolbox-commands-backup.json");
        assert!(backup_file.exists(), "Backup shadow deve ter sido gerado");

        let status = get_backup_status().unwrap();
        assert!(status.enabled);
        assert!(status.backup_exists);
        assert!(status.backup_commands_count >= 1);

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
