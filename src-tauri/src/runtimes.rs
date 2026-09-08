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

fn find_python_in_dir(dir: &Path) -> Option<PathBuf> {
    // Windows embedded / standalone: python.exe ou python/python.exe
    let win_candidates = [
        dir.join("python.exe"),
        dir.join("python").join("python.exe"),
    ];
    for c in &win_candidates {
        if c.exists() {
            return Some(c.clone());
        }
    }

    // Linux standalone: bin/python3, bin/python, python3, python
    let linux_candidates = [
        dir.join("bin").join("python3"),
        dir.join("bin").join("python"),
        dir.join("python").join("bin").join("python3"),
        dir.join("python").join("bin").join("python"),
        dir.join("python3"),
        dir.join("python"),
    ];
    for c in &linux_candidates {
        if c.exists() {
            return Some(c.clone());
        }
    }

    None
}

/// Busca interpretador Python em um ambiente virtual local (.venv ou venv)
pub fn find_python_in_venv(dir: &Path) -> Option<PathBuf> {
    let venv_candidates = [
        dir.join(".venv"),
        dir.join("venv"),
        dir.to_path_buf(),
    ];

    for venv_dir in &venv_candidates {
        // Windows venv: Scripts/python.exe ou python.exe
        let win_candidates = [
            venv_dir.join("Scripts").join("python.exe"),
            venv_dir.join("python.exe"),
        ];
        for c in &win_candidates {
            if c.exists() {
                return Some(c.clone());
            }
        }

        // Linux/Unix venv: bin/python3, bin/python, python3, python
        let linux_candidates = [
            venv_dir.join("bin").join("python3"),
            venv_dir.join("bin").join("python"),
            venv_dir.join("python3"),
            venv_dir.join("python"),
        ];
        for c in &linux_candidates {
            if c.exists() {
                return Some(c.clone());
            }
        }
    }

    None
}

/// Resolve o executável Python apropriado para um plugin:
/// 1. Prioriza ambiente virtual local do plugin (.venv/venv)
/// 2. Se app presente, verifica se há ambiente virtual em app_data_dir/runtime/venv
/// 3. Runtime embutido ou fallback no PATH do sistema
pub fn get_plugin_python_executable(
    plugin_dir: &Path,
    app: Option<&tauri::AppHandle>,
) -> (PathBuf, bool, Option<String>) {
    if let Some(venv_python) = find_python_in_venv(plugin_dir) {
        let ver = get_version_from_bin(&venv_python);
        return (venv_python, false, ver);
    }

    if let Some(app_handle) = app {
        let app_data_venv = crate::paths::data_dir(app_handle).join("runtime").join("venv");
        if let Some(venv_python) = find_python_in_venv(&app_data_venv) {
            let ver = get_version_from_bin(&venv_python);
            return (venv_python, false, ver);
        }
    }

    get_python_executable(app)
}

pub fn get_python_executable(app: Option<&tauri::AppHandle>) -> (PathBuf, bool, Option<String>) {
    // 1. Verificar diretórios de runtime embutido se AppHandle estiver presente
    if let Some(app_handle) = app {
        // A. Diretório de recursos do bundle do Tauri (instalador NSIS / MSI / Deb / AppImage)
        if let Ok(res_dir) = app_handle.path().resource_dir() {
            if let Some(bin) = find_python_in_dir(&res_dir.join("runtime")) {
                let ver = get_version_from_bin(&bin);
                return (bin, true, ver);
            }
            if let Some(bin) = find_python_in_dir(&res_dir.join("resources").join("runtime")) {
                let ver = get_version_from_bin(&bin);
                return (bin, true, ver);
            }
        }

        // B. Diretório de dados do app (ex: ~/.local/share/com.toolbox.desktop/runtime ou AppData/com.toolbox.desktop/runtime)
        let app_data_runtime = crate::paths::data_dir(app_handle).join("runtime");
        if let Some(bin) = find_python_in_dir(&app_data_runtime) {
            let ver = get_version_from_bin(&bin);
            return (bin, true, ver);
        }
    }

    // 2. Diretório local relativo de desenvolvimento (ex: ./resources/runtime/python)
    let local_dev_candidate = PathBuf::from("resources").join("runtime");
    if let Some(bin) = find_python_in_dir(&local_dev_candidate) {
        let ver = get_version_from_bin(&bin);
        return (bin, true, ver);
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

    #[test]
    fn test_find_python_in_dir_candidates() {
        let temp_dir = std::env::temp_dir().join("toolbox_test_python_candidates");
        let _ = std::fs::remove_dir_all(&temp_dir);

        // Cenário 1: Linux bin/python3
        let bin_dir = temp_dir.join("bin");
        std::fs::create_dir_all(&bin_dir).unwrap();
        let py_bin = bin_dir.join("python3");
        std::fs::write(&py_bin, "").unwrap();

        let found = find_python_in_dir(&temp_dir);
        assert_eq!(found, Some(py_bin));

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_find_python_in_venv() {
        let temp_dir = std::env::temp_dir().join("toolbox_test_venv_candidates");
        let _ = std::fs::remove_dir_all(&temp_dir);

        #[cfg(windows)]
        {
            let venv_scripts_dir = temp_dir.join(".venv").join("Scripts");
            std::fs::create_dir_all(&venv_scripts_dir).unwrap();
            let py_bin = venv_scripts_dir.join("python.exe");
            std::fs::write(&py_bin, "").unwrap();

            let found = find_python_in_venv(&temp_dir);
            assert_eq!(found, Some(py_bin));
        }

        #[cfg(not(windows))]
        {
            let venv_bin_dir = temp_dir.join(".venv").join("bin");
            std::fs::create_dir_all(&venv_bin_dir).unwrap();
            let py_bin = venv_bin_dir.join("python");
            std::fs::write(&py_bin, "").unwrap();

            let found = find_python_in_venv(&temp_dir);
            assert_eq!(found, Some(py_bin));
        }

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
