use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use crate::db::DatabaseManager;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SystemCommandItem {
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub is_elevated_required: bool,
}

/// Separa linha de comando em (nome_do_executável, argumentos_opcionais)
pub fn split_command_line(input: &str) -> (String, Option<String>) {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return (String::new(), None);
    }

    if trimmed.starts_with('"') {
        if let Some(end_quote) = trimmed[1..].find('"') {
            let cmd = trimmed[1..=end_quote].to_string();
            let remainder = trimmed[end_quote + 2..].trim();
            let args = if remainder.is_empty() {
                None
            } else {
                Some(remainder.to_string())
            };
            return (cmd, args);
        }
    }

    let mut parts = trimmed.splitn(2, char::is_whitespace);
    let cmd = parts.next().unwrap_or("").to_string();
    let args = parts
        .next()
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string());
    (cmd, args)
}

/// Identifica se um utilitário do sistema tradicionalmente requer privilégios elevados
pub fn is_known_elevated_utility(name: &str) -> bool {
    let lower = name.to_lowercase();
    let base = lower.trim_end_matches(".exe").trim_end_matches(".msc");
    matches!(
        base,
        "regedit"
            | "regedt32"
            | "devmgmt"
            | "compmgmt"
            | "diskmgmt"
            | "secpol"
            | "gpedit"
            | "eventvwr"
            | "cleanmgr"
            | "dfrgui"
            | "services"
            | "resmon"
            | "perfmon"
            | "taskmgr"
            | "netsh"
            | "sfc"
            | "chkdsk"
            | "diskpart"
            | "powershell_ise"
    )
}

/// Descreve de forma amigável o tipo do utilitário do Windows
pub fn describe_system_command(name: &str, ext: &str) -> String {
    let lower = name.to_lowercase();
    let base = lower.trim_end_matches(".exe").trim_end_matches(".msc").trim_end_matches(".cpl");

    match ext {
        "msc" => format!("Console de Gerenciamento do Windows ({})", base),
        "cpl" => format!("Item do Painel de Controle ({})", base),
        "cmd" | "bat" => format!("Script de Comando do Sistema ({})", base),
        "ps1" => format!("Script PowerShell do Sistema ({})", base),
        _ => match base {
            "wt" => "Windows Terminal".to_string(),
            "cmd" => "Prompt de Comando".to_string(),
            "powershell" | "pwsh" => "PowerShell".to_string(),
            "calc" => "Calculadora do Windows".to_string(),
            "notepad" => "Bloco de Notas".to_string(),
            "mspaint" => "Paint".to_string(),
            "explorer" => "Explorador de Arquivos".to_string(),
            "regedit" => "Editor do Registro".to_string(),
            "taskmgr" => "Gerenciador de Tarefas".to_string(),
            "control" => "Painel de Controle".to_string(),
            "mstsc" => "Conexão de Área de Trabalho Remota".to_string(),
            "dxdiag" => "Ferramenta de Diagnóstico do DirectX".to_string(),
            "msconfig" => "Configuração do Sistema".to_string(),
            "services" => "Serviços do Windows".to_string(),
            "devmgmt" => "Gerenciador de Dispositivos".to_string(),
            "diskmgmt" => "Gerenciamento de Disco".to_string(),
            "eventvwr" => "Visualizador de Eventos".to_string(),
            "perfmon" => "Monitor de Desempenho".to_string(),
            "resmon" => "Monitor de Recursos".to_string(),
            _ => "Utilitário do Sistema".to_string(),
        },
    }
}

/// Lista de utilitários essenciais nativos do Windows
pub fn get_builtin_system_commands() -> Vec<SystemCommandItem> {
    let essentials = [
        ("wt", "wt.exe", "Windows Terminal", false),
        ("cmd", "cmd.exe", "Prompt de Comando", false),
        ("powershell", "powershell.exe", "Windows PowerShell", false),
        ("pwsh", "pwsh.exe", "PowerShell Core", false),
        ("calc", "calc.exe", "Calculadora do Windows", false),
        ("notepad", "notepad.exe", "Bloco de Notas", false),
        ("mspaint", "mspaint.exe", "Paint", false),
        ("explorer", "explorer.exe", "Explorador de Arquivos", false),
        ("control", "control.exe", "Painel de Controle", false),
        ("mstsc", "mstsc.exe", "Conexão de Área de Trabalho Remota", false),
        ("dxdiag", "dxdiag.exe", "Diagnóstico do DirectX", false),
        ("msconfig", "msconfig.exe", "Configuração do Sistema", true),
        ("taskmgr", "taskmgr.exe", "Gerenciador de Tarefas", true),
        ("regedit", "regedit.exe", "Editor do Registro", true),
        ("services.msc", "services.msc", "Serviços do Windows", true),
        ("devmgmt.msc", "devmgmt.msc", "Gerenciador de Dispositivos", true),
        ("diskmgmt.msc", "diskmgmt.msc", "Gerenciamento de Disco", true),
        ("eventvwr.msc", "eventvwr.msc", "Visualizador de Eventos", true),
        ("compmgmt.msc", "compmgmt.msc", "Gerenciamento do Computador", true),
        ("perfmon.msc", "perfmon.msc", "Monitor de Desempenho", true),
        ("resmon.exe", "resmon.exe", "Monitor de Recursos", true),
        ("cleanmgr.exe", "cleanmgr.exe", "Limpeza de Disco", true),
    ];

    essentials
        .iter()
        .map(|(name, path, desc, elevated)| SystemCommandItem {
            name: name.to_string(),
            path: path.to_string(),
            description: Some(desc.to_string()),
            is_elevated_required: *elevated,
        })
        .collect()
}

/// Lê aplicativos registrados na chave App Paths do Registro do Windows
#[cfg(windows)]
pub fn scan_registry_app_paths() -> Vec<SystemCommandItem> {
    use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};
    use winreg::RegKey;

    let mut items = Vec::new();
    let hives = [
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths"),
        (HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths"),
    ];

    for (hive, subkey) in hives {
        let root = RegKey::predef(hive);
        let app_paths_key = match root.open_subkey(subkey) {
            Ok(k) => k,
            Err(_) => continue,
        };

        for key_name in app_paths_key.enum_keys().flatten() {
            let key = match app_paths_key.open_subkey(&key_name) {
                Ok(k) => k,
                Err(_) => continue,
            };

            let default_val: String = match key.get_value("") {
                Ok(v) => v,
                Err(_) => continue,
            };

            let raw_path = default_val.trim().trim_matches('"');
            if raw_path.is_empty() {
                continue;
            }

            let path_obj = Path::new(raw_path);
            let name = key_name
                .trim_end_matches(".exe")
                .trim_end_matches(".EXE")
                .to_string();

            if name.is_empty() {
                continue;
            }

            let is_elevated = is_known_elevated_utility(&name);
            let desc = format!("Aplicativo do Sistema ({})", name);

            items.push(SystemCommandItem {
                name,
                path: path_obj.to_string_lossy().to_string(),
                description: Some(desc),
                is_elevated_required: is_elevated,
            });
        }
    }

    items
}

#[cfg(not(windows))]
pub fn scan_registry_app_paths() -> Vec<SystemCommandItem> {
    Vec::new()
}

/// Varre atalhos do Menu Iniciar (.lnk)
pub fn scan_start_menu_shortcuts() -> Vec<SystemCommandItem> {
    let mut items = Vec::new();
    let mut dirs = Vec::new();

    if let Some(app_data) = std::env::var_os("APPDATA") {
        dirs.push(PathBuf::from(app_data).join(r"Microsoft\Windows\Start Menu\Programs"));
    }

    if let Some(prog_data) = std::env::var_os("ProgramData") {
        dirs.push(PathBuf::from(prog_data).join(r"Microsoft\Windows\Start Menu\Programs"));
    }

    for base_dir in dirs {
        if !base_dir.is_dir() {
            continue;
        }

        let mut stack = vec![base_dir];
        while let Some(current_dir) = stack.pop() {
            let entries = match std::fs::read_dir(&current_dir) {
                Ok(e) => e,
                Err(_) => continue,
            };

            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    stack.push(path);
                } else if path.is_file() {
                    if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                        if ext.eq_ignore_ascii_case("lnk") {
                            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                                let stem_clean = stem.trim().to_string();
                                if !stem_clean.is_empty() && !stem_clean.starts_with("Uninstall") {
                                    items.push(SystemCommandItem {
                                        name: stem_clean.clone(),
                                        path: path.to_string_lossy().to_string(),
                                        description: Some(format!("Atalho do Menu Iniciar ({})", stem_clean)),
                                        is_elevated_required: false,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    items
}

/// Varre diretórios de execução do WindowsApps (aliases leves)
pub fn scan_windows_apps_aliases() -> Vec<SystemCommandItem> {
    let mut items = Vec::new();
    if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        let win_apps = PathBuf::from(local_app_data)
            .join("Microsoft")
            .join("WindowsApps");

        if win_apps.is_dir() {
            if let Ok(entries) = std::fs::read_dir(win_apps) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_file() {
                        if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                            if ext.eq_ignore_ascii_case("exe") {
                                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                                    let stem_clean = stem.to_string();
                                    items.push(SystemCommandItem {
                                        name: stem_clean.clone(),
                                        path: path.to_string_lossy().to_string(),
                                        description: Some(format!("Aplicativo Windows ({})", stem_clean)),
                                        is_elevated_required: false,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    items
}

/// Executa a varredura nativa e otimizada combinando todas as fontes ultrarrápidas
pub fn scan_optimized_system_commands() -> Vec<SystemCommandItem> {
    let mut command_map: BTreeMap<String, SystemCommandItem> = BTreeMap::new();

    // 1. Utilitários Essenciais Built-in (Maior confiabilidade)
    for item in get_builtin_system_commands() {
        command_map.insert(item.name.to_lowercase(), item);
    }

    // 2. Registro do Windows (App Paths)
    for item in scan_registry_app_paths() {
        let key = item.name.to_lowercase();
        command_map.entry(key).or_insert(item);
    }

    // 3. WindowsApps Execution Aliases (wt, winget, python, etc.)
    for item in scan_windows_apps_aliases() {
        let key = item.name.to_lowercase();
        command_map.entry(key).or_insert(item);
    }

    // 4. Atalhos do Menu Iniciar
    for item in scan_start_menu_shortcuts() {
        let key = item.name.to_lowercase();
        command_map.entry(key).or_insert(item);
    }

    command_map.into_values().collect()
}

/// Tenta resolver dinamicamente um comando informado pelo usuário
pub fn resolve_system_command(query: &str) -> Option<(PathBuf, Option<String>)> {
    let (cmd_name, args) = split_command_line(query);
    if cmd_name.is_empty() {
        return None;
    }

    let p = Path::new(&cmd_name);
    if p.is_absolute() && p.exists() {
        return Some((p.to_path_buf(), args));
    }

    // Procura no PATH se disponível
    if let Some(path_var) = std::env::var_os("PATH") {
        for dir in std::env::split_paths(&path_var) {
            let candidate = dir.join(&cmd_name);
            if candidate.is_file() {
                return Some((candidate, args));
            }
            let candidate_exe = dir.join(format!("{}.exe", cmd_name));
            if candidate_exe.is_file() {
                return Some((candidate_exe, args));
            }
        }
    }

    None
}

/// Consulta os comandos do sistema a partir do banco de dados SQLite central
#[tauri::command]
pub fn list_system_commands(
    db: State<'_, DatabaseManager>,
) -> Result<Vec<SystemCommandItem>, String> {
    let list = db.get_cached_system_commands()?;
    if list.is_empty() {
        // Se o banco estiver vazio na primeira chamada, executa o scan e persiste
        let scanned = scan_optimized_system_commands();
        let _ = db.save_system_commands(&scanned);
        Ok(scanned)
    } else {
        Ok(list)
    }
}

/// Dispara a reindexação em background dos comandos do sistema e atualiza o SQLite
#[tauri::command]
pub async fn refresh_system_commands(
    db: State<'_, DatabaseManager>,
) -> Result<usize, String> {
    let db_clone = (*db).clone();
    tauri::async_runtime::spawn_blocking(move || {
        let items = scan_optimized_system_commands();
        db_clone.save_system_commands(&items)?;
        Ok(items.len())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_command_line_simple() {
        let (cmd, args) = split_command_line("ping 8.8.8.8");
        assert_eq!(cmd, "ping");
        assert_eq!(args, Some("8.8.8.8".to_string()));
    }

    #[test]
    fn test_split_command_line_no_args() {
        let (cmd, args) = split_command_line("   wt   ");
        assert_eq!(cmd, "wt");
        assert_eq!(args, None);
    }

    #[test]
    fn test_split_command_line_with_quotes() {
        let (cmd, args) = split_command_line(r#""C:\Program Files\App\test.exe" --debug -v"#);
        assert_eq!(cmd, r#"C:\Program Files\App\test.exe"#);
        assert_eq!(args, Some("--debug -v".to_string()));
    }

    #[test]
    fn test_is_known_elevated_utility() {
        assert!(is_known_elevated_utility("regedit"));
        assert!(is_known_elevated_utility("regedit.exe"));
        assert!(is_known_elevated_utility("services.msc"));
        assert!(is_known_elevated_utility("devmgmt.msc"));
        assert!(!is_known_elevated_utility("notepad"));
        assert!(!is_known_elevated_utility("calc"));
    }

    #[test]
    fn test_describe_system_command() {
        assert_eq!(describe_system_command("wt", "exe"), "Windows Terminal");
        assert_eq!(describe_system_command("notepad", "exe"), "Bloco de Notas");
        assert_eq!(
            describe_system_command("services", "msc"),
            "Console de Gerenciamento do Windows (services)"
        );
    }

    #[test]
    fn test_builtin_system_commands() {
        let builtins = get_builtin_system_commands();
        assert!(!builtins.is_empty());
        assert!(builtins.iter().any(|item| item.name == "notepad"));
        assert!(builtins.iter().any(|item| item.name == "calc"));
        assert!(builtins.iter().any(|item| item.name == "wt"));
        assert!(builtins.iter().any(|item| item.name == "regedit" && item.is_elevated_required));
    }

    #[test]
    fn test_scan_optimized_system_commands() {
        let items = scan_optimized_system_commands();
        assert!(!items.is_empty());
        assert!(items.iter().any(|item| item.name.to_lowercase() == "notepad"));
    }
}
