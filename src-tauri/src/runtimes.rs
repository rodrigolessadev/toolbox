use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RuntimeInfo {
    pub name: String,
    pub available: bool,
    pub version: Option<String>,
}

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn check_runtime(name: &str) -> RuntimeInfo {
    let name_lower = name.to_lowercase();
    match name_lower.as_str() {
        "python" => check_python_runtime(),
        "node" | "nodejs" => check_command_runtime("node", &["--version"]),
        _ => check_command_runtime(&name_lower, &["--version"]),
    }
}

fn check_python_runtime() -> RuntimeInfo {
    // Tenta "python --version", depois "python3 --version", depois "py -0"
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
                    Some(raw_ver)
                } else {
                    Some("Disponível".to_string())
                };

                return RuntimeInfo {
                    name: "python".to_string(),
                    available: true,
                    version: ver,
                };
            }
        }
    }

    RuntimeInfo {
        name: "python".to_string(),
        available: false,
        version: None,
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
                version: if !raw_ver.is_empty() { Some(raw_ver) } else { None },
            };
        }
    }

    RuntimeInfo {
        name: bin.to_string(),
        available: false,
        version: None,
    }
}

#[tauri::command]
pub fn check_runtime_status(runtime: String) -> Result<RuntimeInfo, String> {
    Ok(check_runtime(&runtime))
}

#[tauri::command]
pub fn check_all_runtimes() -> Result<Vec<RuntimeInfo>, String> {
    Ok(vec![
        check_runtime("python"),
        check_runtime("node"),
    ])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_runtime_unknown() {
        let res = check_runtime("non_existent_runtime_xyz_123");
        assert_eq!(res.available, false);
        assert_eq!(res.version, None);
    }

    #[test]
    fn test_check_runtime_python_returns_struct() {
        let res = check_runtime("python");
        assert_eq!(res.name, "python");
        if res.available {
            assert!(res.version.is_some());
        }
    }
}
