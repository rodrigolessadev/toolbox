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
