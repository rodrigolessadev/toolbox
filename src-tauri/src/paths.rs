use std::path::PathBuf;
use tauri::{AppHandle, Manager, Window};
use tauri_plugin_opener::OpenerExt;

pub fn data_dir(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
}

pub fn plugins_dir(app: &AppHandle) -> PathBuf {
    data_dir(app).join("plugins")
}

pub fn logs_dir(app: &AppHandle) -> PathBuf {
    data_dir(app).join("logs")
}

pub fn icons_dir(app: &AppHandle) -> PathBuf {
    data_dir(app).join("icons")
}

pub fn now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("{}", secs)
}

#[tauri::command]
pub fn get_icons_dir(app: AppHandle) -> Result<String, String> {
    Ok(icons_dir(&app).to_string_lossy().to_string())
}

/// Resolve o diretório seguro de backup do usuário (fora do AppData)
pub fn backup_dir() -> PathBuf {
    // 1. OneDrive (sincronização automática para a nuvem pessoal do usuário)
    if let Ok(onedrive) = std::env::var("OneDrive") {
        let path = PathBuf::from(onedrive).join("Toolbox").join("Backups");
        if std::fs::create_dir_all(&path).is_ok() {
            return path;
        }
    }

    // 2. Pasta Documentos do Windows
    if let Ok(profile) = std::env::var("USERPROFILE") {
        let path = PathBuf::from(profile).join("Documents").join("Toolbox Backups");
        if std::fs::create_dir_all(&path).is_ok() {
            return path;
        }
    }

    // 3. Fallback no diretório raiz do usuário
    let home = std::env::var("USERPROFILE").unwrap_or_else(|_| ".".into());
    let path = PathBuf::from(home).join(".toolbox_backup");
    let _ = std::fs::create_dir_all(&path);
    path
}

pub fn get_destination_type(path: &std::path::Path) -> String {
    let s = path.to_string_lossy().to_lowercase();
    if s.contains("onedrive") {
        "OneDrive".to_string()
    } else if s.contains("google drive") || s.contains("gdrive") {
        "Google Drive".to_string()
    } else if s.contains("documents") || s.contains("documentos") {
        "Documents".to_string()
    } else {
        "Local".to_string()
    }
}

#[tauri::command]
pub fn get_backup_dir() -> Result<String, String> {
    Ok(backup_dir().to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_data_dir(app: AppHandle) -> Result<String, String> {
    Ok(data_dir(&app).to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_plugins_dir(app: AppHandle) -> Result<String, String> {
    Ok(plugins_dir(&app).to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_logs_dir(app: AppHandle) -> Result<String, String> {
    Ok(logs_dir(&app).to_string_lossy().to_string())
}

#[tauri::command]
pub fn open_path(path: String, app: AppHandle) -> Result<(), String> {
    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn hide_window(window: Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn show_window(window: Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_theme(app: AppHandle) -> Result<String, String> {
    let theme_file = data_dir(&app).join("theme.txt");
    if let Ok(content) = std::fs::read_to_string(theme_file) {
        let trimmed = content.trim().to_string();
        if trimmed == "light" || trimmed == "dark" || trimmed == "system" {
            return Ok(trimmed);
        }
    }
    Ok("dark".to_string())
}

#[tauri::command]
pub fn set_theme(theme: String, app: AppHandle) -> Result<(), String> {
    let dir = data_dir(&app);
    std::fs::create_dir_all(&dir).ok();
    let theme_file = dir.join("theme.txt");
    let _ = std::fs::write(theme_file, theme);
    Ok(())
}
