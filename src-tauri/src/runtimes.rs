use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RuntimeInfo {
    pub name: String,
    pub available: bool,
    pub version: Option<String>,
    pub is_embedded: bool,
    pub path: Option<String>,
}

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn check_runtime(app: Option<&tauri::AppHandle>, name: &str) -> RuntimeInfo {
    let name_lower = name.to_lowercase();
    match name_lower.as_str() {
        "python" => check_python_runtime(app),
        "node" | "nodejs" => check_command_runtime("node", &["--version"]),
        _ => check_command_runtime(&name_lower, &["--version"]),
    }
}

pub fn get_python_executable(app: Option<&tauri::AppHandle>) -> (PathBuf, bool, Option<String>) {
    // 1. Verificar diretórios de runtime embutido se AppHandle estiver presente
    if let Some(app_handle) = app {
        // A. Diretório de recursos do bundle do Tauri (instalador NSIS / MSI)
        if let Ok(res_dir) = app_handle.path().resource_dir() {
            let candidate1 = res_dir.join("runtime").join("python").join("python.exe");
            if candidate1.exists() {
                let ver = get_version_from_bin(&candidate1);
                return (candidate1, true, ver);
            }
            let candidate2 = res_dir.join("resources").join("runtime").join("python").join("python.exe");
            if candidate2.exists() {
                let ver = get_version_from_bin(&candidate2);
                return (candidate2, true, ver);
            }
        }

        // B. Diretório de dados do app (ex: AppData/com.toolbox.desktop/runtime/python)
        let app_data_runtime = crate::paths::data_dir(app_handle)
            .join("runtime")
            .join("python")
            .join("python.exe");
        if app_data_runtime.exists() {
            let ver = get_version_from_bin(&app_data_runtime);
            return (app_data_runtime, true, ver);
        }
    }

    // 2. Diretório local relativo de desenvolvimento (ex: ./resources/runtime/python/python.exe)
    let local_dev_candidate = PathBuf::from("resources")
        .join("runtime")
        .join("python")
        .join("python.exe");
    if local_dev_candidate.exists() {
        let ver = get_version_from_bin(&local_dev_candidate);
        return (local_dev_candidate, true, ver);
    }

    // 3. Fallback: buscar executáveis no PATH global do sistema
    for candidate in &["python", "python3", "py"] {
        let mut cmd = Command::new(candidate);
        if *candidate == "py" {
            cmd.arg("-0");
        } else {
            cmd.arg("--version");
        }

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        if let Ok(output) = cmd.output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                let raw_ver = if !stdout.is_empty() { stdout } else { stderr };
                let ver = if !raw_ver.is_empty() {
                    Some(format!("{} (Sistema)", raw_ver))
                } else {
                    Some("Python (Sistema)".to_string())
                };

                return (PathBuf::from(*candidate), false, ver);
            }
        }
    }

    (PathBuf::from("python"), false, None)
}

fn get_version_from_bin(bin_path: &Path) -> Option<String> {
    let mut cmd = Command::new(bin_path);
    cmd.arg("--version");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    if let Ok(output) = cmd.output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            let raw_ver = if !stdout.is_empty() { stdout } else { stderr };
            if !raw_ver.is_empty() {
                return Some(format!("{} (Embutido)", raw_ver));
            }
        }
    }
    Some("Python (Embutido)".to_string())
}

fn check_python_runtime(app: Option<&tauri::AppHandle>) -> RuntimeInfo {
    let (bin_path, is_embedded, version) = get_python_executable(app);
    let available = version.is_some() || bin_path.exists();

    RuntimeInfo {
        name: "python".to_string(),
        available,
        version,
        is_embedded,
        path: if available {
            Some(bin_path.to_string_lossy().to_string())
        } else {
            None
        },
    }
}

fn check_command_runtime(bin: &str, args: &[&str]) -> RuntimeInfo {
    let mut cmd = Command::new(bin);
    cmd.args(args);

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    if let Ok(output) = cmd.output() {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            let raw_ver = if !stdout.is_empty() { stdout } else { stderr };
            return RuntimeInfo {
                name: bin.to_string(),
                available: true,
                version: if !raw_ver.is_empty() {
                    Some(format!("{} (Sistema)", raw_ver))
                } else {
                    None
                },
                is_embedded: false,
                path: Some(bin.to_string()),
            };
        }
    }

    RuntimeInfo {
        name: bin.to_string(),
        available: false,
        version: None,
        is_embedded: false,
        path: None,
    }
}

#[tauri::command]
pub fn check_runtime_status(app: tauri::AppHandle, runtime: String) -> Result<RuntimeInfo, String> {
    Ok(check_runtime(Some(&app), &runtime))
}

#[tauri::command]
pub fn check_all_runtimes(app: tauri::AppHandle) -> Result<Vec<RuntimeInfo>, String> {
    Ok(vec![
        check_runtime(Some(&app), "python"),
        check_runtime(Some(&app), "node"),
    ])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_runtime_unknown() {
        let res = check_runtime(None, "non_existent_runtime_xyz_123");
        assert_eq!(res.available, false);
        assert_eq!(res.version, None);
        assert_eq!(res.is_embedded, false);
    }

    #[test]
    fn test_get_python_executable_fallback_or_embedded() {
        let (path, is_embedded, ver) = get_python_executable(None);
        assert!(!path.to_string_lossy().is_empty());
        if ver.is_some() {
            let info = check_runtime(None, "python");
            assert_eq!(info.name, "python");
            assert_eq!(info.available, true);
            assert_eq!(info.is_embedded, is_embedded);
        }
    }
}
