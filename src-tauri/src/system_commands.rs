use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::RwLock;
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SystemCommandItem {
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub is_elevated_required: bool,
}

pub struct SystemCommandCache {
    items: RwLock<Vec<SystemCommandItem>>,
    last_scan: RwLock<Option<Instant>>,
}

impl Default for SystemCommandCache {
    fn default() -> Self {
        Self::new()
    }
}

impl SystemCommandCache {
    pub fn new() -> Self {
        Self {
            items: RwLock::new(Vec::new()),
            last_scan: RwLock::new(None),
        }
    }

    pub fn get_items(&self) -> Vec<SystemCommandItem> {
        let should_scan = {
            let last = self.last_scan.read().unwrap();
            match *last {
                None => true,
                Some(inst) => inst.elapsed().as_secs() > 120, // 2 minutos de cache
            }
        };

        if should_scan {
            let scanned = scan_system_commands();
            if let Ok(mut items_lock) = self.items.write() {
                *items_lock = scanned.clone();
            }
            if let Ok(mut last_lock) = self.last_scan.write() {
                *last_lock = Some(Instant::now());
            }
            scanned
        } else {
            self.items.read().map(|g| g.clone()).unwrap_or_default()
        }
    }
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
            _ => "Utilitário do Sistema".to_string(),
        },
    }
}

/// Diretórios padrão de busca de comandos no Windows
pub fn get_search_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    // 1. Variável de ambiente PATH
    if let Some(path_var) = std::env::var_os("PATH") {
        for p in std::env::split_paths(&path_var) {
            if p.is_dir() && !dirs.contains(&p) {
                dirs.push(p);
            }
        }
    }

    // 2. WindowsApps (App Execution Aliases, ex: wt.exe, winget.exe)
    if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        let win_apps = PathBuf::from(local_app_data)
            .join("Microsoft")
            .join("WindowsApps");
        if win_apps.is_dir() && !dirs.contains(&win_apps) {
            dirs.push(win_apps);
        }
    }

    // 3. Pastas essenciais do Windows
    if let Some(win_dir) = std::env::var_os("SystemRoot") {
        let win_path = PathBuf::from(win_dir);
        let sys32 = win_path.join("System32");
        let sys_wbem = sys32.join("wbem");
        let sys_wow = win_path.join("SysWOW64");

        for p in [sys32, win_path, sys_wbem, sys_wow] {
            if p.is_dir() && !dirs.contains(&p) {
                dirs.push(p);
            }
        }
    }

    dirs
}

/// Extensões executáveis suportadas pelo sistema
pub fn get_supported_extensions() -> HashSet<String> {
    let mut exts = HashSet::new();

    if let Some(pathext) = std::env::var_os("PATHEXT") {
        for ext in pathext.to_string_lossy().split(';') {
            let clean = ext.trim().trim_start_matches('.').to_lowercase();
            if !clean.is_empty() {
                exts.insert(clean);
            }
        }
    }

    // Adiciona extensões complementares essenciais
    for ext in ["exe", "cmd", "bat", "msc", "cpl", "ps1"] {
        exts.insert(ext.to_string());
    }

    exts
}

/// Executa varredura de comandos do sistema operacional
pub fn scan_system_commands() -> Vec<SystemCommandItem> {
    let dirs = get_search_directories();
    let supported_exts = get_supported_extensions();
    let mut command_map: BTreeMap<String, SystemCommandItem> = BTreeMap::new();

    for dir in dirs {
        let entries = match std::fs::read_dir(&dir) {
            Ok(e) => e,
            Err(_) => continue,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let ext = match path.extension().and_then(|s| s.to_str()) {
                Some(e) => e.to_lowercase(),
                None => continue,
            };

            if !supported_exts.contains(&ext) {
                continue;
            }

            let file_stem = match path.file_stem().and_then(|s| s.to_str()) {
                Some(s) => s.to_string(),
                None => continue,
            };

            let file_name = match path.file_name().and_then(|s| s.to_str()) {
                Some(s) => s.to_string(),
                None => continue,
            };

            let is_elevated = is_known_elevated_utility(&file_stem);
            let desc = describe_system_command(&file_stem, &ext);
            let path_str = path.to_string_lossy().to_string();

            // Indexa pelo nome base (ex: 'wt', 'calc', 'notepad')
            let key_stem = file_stem.to_lowercase();
            if !command_map.contains_key(&key_stem) {
                command_map.insert(
                    key_stem.clone(),
                    SystemCommandItem {
                        name: file_stem.clone(),
                        path: path_str.clone(),
                        description: Some(desc.clone()),
                        is_elevated_required: is_elevated,
                    },
                );
            }

            // Para consoles .msc ou painéis .cpl, indexa também com a extensão (ex: 'services.msc')
            if ext == "msc" || ext == "cpl" {
                let key_full = file_name.to_lowercase();
                if !command_map.contains_key(&key_full) {
                    command_map.insert(
                        key_full,
                        SystemCommandItem {
                            name: file_name,
                            path: path_str,
                            description: Some(desc),
                            is_elevated_required: is_elevated,
                        },
                    );
                }
            }
        }
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

    let dirs = get_search_directories();
    let supported_exts = get_supported_extensions();

    // Caso o usuário já tenha fornecido a extensão (ex: 'services.msc' ou 'wt.exe')
    if p.extension().is_some() {
        for dir in &dirs {
            let candidate = dir.join(&cmd_name);
            if candidate.is_file() {
                return Some((candidate, args));
            }
        }
    }

    // Procura adicionando as extensões suportadas
    for dir in &dirs {
        for ext in &supported_exts {
            let candidate = dir.join(format!("{}.{}", cmd_name, ext));
            if candidate.is_file() {
                return Some((candidate, args));
            }
        }
    }

    None
}

#[tauri::command]
pub fn list_system_commands(
    cache: tauri::State<'_, SystemCommandCache>,
) -> Vec<SystemCommandItem> {
    cache.get_items()
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
    fn test_cache_initialization_and_get() {
        let cache = SystemCommandCache::new();
        let items = cache.get_items();
        // Em ambiente Windows deve encontrar executáveis no PATH/System32
        if cfg!(target_os = "windows") {
            assert!(!items.is_empty());
        }
    }
}
