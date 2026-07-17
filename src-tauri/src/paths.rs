use std::path::PathBuf;
use tauri::Manager;

/// Resolve o diretório de trabalho da aplicação.
/// Em dev: a raiz do projeto.
/// Em produção (instalado): pasta do executável.
pub fn workdir() -> PathBuf {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            // Em produção, ao lado do .exe.
            // Em dev (cargo run), o .exe fica em src-tauri/target/{debug,release},
            // então subimos até achar commands.json.
            let candidate = parent.to_path_buf();
            if candidate.join("commands.json").exists() {
                return candidate;
            }
            for ancestor in candidate.ancestors() {
                if ancestor.join("commands.json").exists() {
                    return ancestor.to_path_buf();
                }
            }
            return parent.to_path_buf();
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

/// Pasta onde ficam os plugins.
pub fn plugins_dir() -> PathBuf {
    workdir().join("plugins")
}

/// Pasta de logs.
pub fn logs_dir() -> PathBuf {
    workdir().join("logs")
}

/// Arquivo de comandos.
pub fn commands_file() -> PathBuf {
    workdir().join("commands.json")
}

/// Arquivo de histórico.
pub fn history_file() -> PathBuf {
    workdir().join("logs").join("history.json")
}

/// Garante que as pastas essenciais existam.
pub fn ensure_dirs() -> std::io::Result<()> {
    std::fs::create_dir_all(plugins_dir())?;
    std::fs::create_dir_all(logs_dir())?;
    Ok(())
}

/// Tenta usar o diretório onde o .exe está.
/// Se o app foi iniciado pelo tauri dev, busca o `tauri.conf.json` subindo na hierarquia.
pub fn resolve_from_app<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Option<PathBuf> {
    if let Ok(resource) = app.path().resource_dir() {
        if resource.join("commands.json").exists() {
            return Some(resource);
        }
    }
    None
}
