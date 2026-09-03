use std::path::{Path, PathBuf};

/// Identifica se o processo esta em execucao dentro de um ambiente WSL
pub fn is_wsl() -> bool {
    #[cfg(target_os = "linux")]
    {
        if Path::new("/proc/sys/fs/binfmt_misc/WSLInterop").exists() {
            return true;
        }
        if let Ok(version) = std::fs::read_to_string("/proc/version") {
            let lower = version.to_lowercase();
            if lower.contains("microsoft") || lower.contains("wsl") {
                return true;
            }
        }
        false
    }
    #[cfg(not(target_os = "linux"))]
    {
        false
    }
}

/// Identifica se um comando ou extensao corresponde a um executavel ou ferramenta do Windows
pub fn is_windows_command(path: &str, ext: &str) -> bool {
    let ext_lower = ext.to_lowercase();
    if matches!(
        ext_lower.as_str(),
        "exe" | "bat" | "cmd" | "msc" | "cpl" | "ps1"
    ) {
        return true;
    }

    let bytes = path.as_bytes();
    if bytes.len() >= 3 && bytes[0].is_ascii_alphabetic() && bytes[1] == b':' && (bytes[2] == b'\\' || bytes[2] == b'/') {
        return true;
    }

    let p = Path::new(path);
    let base_name = p
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(path)
        .to_lowercase();

    matches!(
        base_name.as_str(),
        "wt" | "cmd"
            | "powershell"
            | "pwsh"
            | "notepad"
            | "calc"
            | "mspaint"
            | "explorer"
            | "regedit"
            | "taskmgr"
            | "control"
            | "mstsc"
            | "dxdiag"
            | "msconfig"
            | "services"
            | "devmgmt"
            | "diskmgmt"
            | "eventvwr"
            | "perfmon"
            | "resmon"
            | "cleanmgr"
    )
}

/// Converte caminho do Windows (ex: C:\Users\...) para montagem no WSL (/mnt/c/Users/...)
pub fn windows_to_wsl_path(path: &str) -> Option<PathBuf> {
    let bytes = path.as_bytes();
    if bytes.len() >= 2 && bytes[0].is_ascii_alphabetic() && bytes[1] == b':' {
        let drive = (bytes[0] as char).to_ascii_lowercase();
        let rest = if path.len() > 2 { &path[2..] } else { "" };
        let normalized = rest.replace('\\', "/");
        let wsl_str = format!("/mnt/{}/{}", drive, normalized.trim_start_matches('/'));
        return Some(PathBuf::from(wsl_str));
    }
    None
}

/// Converte caminho do WSL (/mnt/c/...) para formato de caminho do Windows (C:\...)
pub fn wsl_to_windows_path(path: &str) -> Option<String> {
    if path.starts_with("/mnt/") && path.len() >= 7 {
        let bytes = path.as_bytes();
        let drive = bytes[5] as char;
        if drive.is_ascii_alphabetic() && (bytes[6] == b'/' || path.len() == 7) {
            let drive_upper = drive.to_ascii_uppercase();
            let rest = if path.len() > 7 { &path[7..] } else { "" };
            let win_rest = rest.replace('/', "\\");
            return Some(format!("{}:\\{}", drive_upper, win_rest));
        }
    }
    None
}


/// Porta padrão para a ponte IPC de foco entre host Windows e Toolbox WSL2
pub const WSL_FOCUS_BRIDGE_PORT: u16 = 49152;

/// Inicia o daemon local TCP para receber sinais de ativação e foco do Windows host
pub fn start_wsl_focus_listener(app_handle: tauri::AppHandle) {
    if !is_wsl() {
        return;
    }

    std::thread::Builder::new()
        .name("wsl-focus-bridge".into())
        .spawn(move || {
            use std::io::{BufRead, BufReader};
            use std::net::TcpListener;
            use tauri::Manager;

            let addr = format!("127.0.0.1:{}", WSL_FOCUS_BRIDGE_PORT);
            let listener = match TcpListener::bind(&addr) {
                Ok(l) => {
                    log::info!("WSL Focus Bridge ativo em {}", addr);
                    l
                }
                Err(e) => {
                    log::warn!("Nao foi possivel iniciar WSL Focus Bridge na porta {}: {}", WSL_FOCUS_BRIDGE_PORT, e);
                    return;
                }
            };

            for stream in listener.incoming().flatten() {
                let mut reader = BufReader::new(stream);
                let mut line = String::new();
                if reader.read_line(&mut line).is_ok() {
                    let cmd = line.trim();
                    if cmd == "show_and_focus" || cmd == "focus" || cmd == "activate" {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
            }
        })
        .ok();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_windows_command() {
        assert!(is_windows_command("notepad", ""));
        assert!(is_windows_command("notepad.exe", "exe"));
        assert!(is_windows_command("wt", ""));
        assert!(is_windows_command("cmd", ""));
        assert!(is_windows_command("powershell", ""));
        assert!(is_windows_command("script.bat", "bat"));
        assert!(is_windows_command("script.cmd", "cmd"));
        assert!(is_windows_command("script.ps1", "ps1"));
        assert!(is_windows_command(r"C:\Program Files\App\app.exe", "exe"));
        assert!(is_windows_command(r"C:\Windows\explorer.exe", "exe"));
        assert!(is_windows_command("services.msc", "msc"));

        assert!(!is_windows_command("ls", ""));
        assert!(!is_windows_command("grep", ""));
        assert!(!is_windows_command("/usr/bin/python3", ""));
    }

    #[test]
    fn test_path_conversions() {
        let win = r"C:\Users\rodrigo\file.txt";
        let wsl = windows_to_wsl_path(win).unwrap();
        assert_eq!(wsl, PathBuf::from("/mnt/c/Users/rodrigo/file.txt"));

        let converted_back = wsl_to_windows_path(wsl.to_str().unwrap()).unwrap();
        assert_eq!(converted_back, win);
    }
}
