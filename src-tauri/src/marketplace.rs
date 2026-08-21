use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
use tauri::AppHandle;

// ─────────────────────── Tipos do catálogo ───────────────────────

const CATALOG_URL: &str =
    "https://raw.githubusercontent.com/rodrigolessadev/toolbox-plugins/main/catalog.json";

const FALLBACK_CATALOG_JSON: &str = r#"{
  "version": "1.0",
  "updated_at": "2026-08-19",
  "plugins": [
    {
      "id": "calc-jornadas",
      "name": "Calculadora de Jornadas",
      "version": "1.2.0",
      "description": "Calcula horas normais, noturnas e noturnas reduzidas por jornada de trabalho.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["rh", "jornada", "horas", "trabalho"],
      "icon": "clock-3",
      "command": "calc-jornadas",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/calc-jornadas-1.2.0/calc-jornadas.zip"
    },
    {
      "id": "converter-data",
      "name": "Converter Data",
      "version": "1.1.0",
      "description": "Converte data e hora para número serial Excel/Lotus e vice-versa.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["excel", "data", "conversão", "utilidade"],
      "icon": "calendar-sync",
      "command": "converter-data",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/converter-data-1.1.0/converter-data.zip"
    },
    {
      "id": "cpf",
      "name": "Validador de CPF",
      "version": "1.1.0",
      "description": "Valida e gera CPFs com interface gráfica. Suporta formatação automática e cópia para área de transferência.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["utilidade", "cpf", "validação"],
      "icon": "badge-check",
      "command": "cpf",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/cpf-1.1.0/cpf.zip"
    },
    {
      "id": "gerador-afd",
      "name": "Gerador de AFD",
      "version": "1.1.0",
      "description": "Gera arquivo AFD (Arquivo de Fonte de Dados) no padrão REP-C com CRC16. Suporta múltiplos colaboradores, horários e intervalo de datas.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["rh", "ponto", "afd", "rep"],
      "icon": "file-clock",
      "command": "gerador-afd",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-afd-1.1.0/gerador-afd.zip"
    },
    {
      "id": "gerador-json",
      "name": "Gerador de JSON",
      "version": "1.1.0",
      "description": "Gera mock data em JSON (Pessoa, Produto, Usuário) com quantidade configurável e cópia para área de transferência.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["dev", "json", "mock", "dados"],
      "icon": "file-json",
      "command": "gerador-json",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-json-1.1.0/gerador-json.zip"
    },
    {
      "id": "gerador-marcacoes",
      "name": "Gerador de Marcações SQL",
      "version": "2.3.0",
      "description": "Gera INSERTs SQL para a tabela R070ACC compatíveis com SQL Server e Oracle. Suporta campos opcionais dinâmicos, múltiplos horários e intervalo de datas.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["sql", "banco de dados", "insert"],
      "icon": "database",
      "command": "gerador-marcacoes",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-marcacoes-2.3.0/gerador-marcacoes.zip"
    },
    {
      "id": "har-kibana-planner",
      "name": "HAR Kibana Planner",
      "version": "1.1.0",
      "description": "Gera planos de consulta determinísticos no Elasticsearch/Kibana a partir de arquivos HAR 1.2.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["har-kibana-planner"],
      "icon": "search-code",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/har-kibana-planner-1.1.0/har-kibana-planner.zip"
    },
    {
      "id": "stract-json",
      "name": "Stract JSON",
      "version": "1.1.0",
      "description": "Extrai valores de um campo específico a partir de um JSON colado. Útil para transformar listas de objetos em listas de valores.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["dev", "json", "extração", "dados"],
      "icon": "scan-search",
      "command": "stract-json",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/stract-json-1.1.0/stract-json.zip"
    },
    {
      "id": "stract-log",
      "name": "Stract Log",
      "version": "1.1.0",
      "description": "Filtra e extrai blocos de log por nível, parâmetro adicional e regra de recorrência (mais recente / mais antiga). Salva o resultado em um arquivo .log ao lado do original.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["log", "suporte", "filtro", "análise"],
      "icon": "file-search",
      "command": "stract-log",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/stract-log-1.1.0/stract-log.zip"
    },
    {
      "id": "analysis-orchestrator",
      "name": "Analysis Orchestrator",
      "version": "1.1.0",
      "description": "Orquestra a análise ponta a ponta executando sanitização, filtragem, otimização, timeline e evidências.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["logs", "har", "timeline", "orchestrator", "incident"],
      "icon": "workflow",
      "command": "analysis-orchestrator",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/analysis-orchestrator-1.1.0/analysis-orchestrator.zip"
    },
    {
      "id": "novo-ticket",
      "name": "Novo Ticket",
      "version": "1.3.1",
      "description": "Criação de tickets (CLIENTE_TICKET) e extrator temporal de logs com interface moderna pywebview e tema dark oficial.",
      "author": "Rodrigo Lessa",
      "language": "python",
      "tags": ["ticket", "atendimento", "suporte", "diretorio", "logs", "filtro", "utilidade"],
      "icon": "ticket",
      "command": "novo-ticket",
      "download_url": "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/novo-ticket-1.3.1/novo-ticket.zip"
    }
  ]
}"#;

fn default_language() -> String {
    "python".to_string()
}

fn default_icon() -> String {
    "Puzzle".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CatalogPlugin {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub version: String,
    #[serde(default)]
    pub author: String,
    #[serde(default = "default_language")]
    pub language: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default = "default_icon")]
    pub icon: String,
    #[serde(default)]
    pub command: String,
    #[serde(default)]
    pub entry: String,
    #[serde(default)]
    pub download_url: String,
    #[serde(default)]
    pub min_toolbox_version: String,
    #[serde(default)]
    pub sha256: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Catalog {
    pub version: String,
    pub updated_at: String,
    pub plugins: Vec<CatalogPlugin>,
}

/// Metadados de um plugin instalado localmente (lido do plugin.json)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledPlugin {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub language: String,
    pub entry: String,
    pub path: String,
    pub icon: Option<String>,
}

/// Resposta rica enviada ao frontend: plugin do catálogo + status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceEntry {
    #[serde(flatten)]
    pub plugin: CatalogPlugin,
    /// "available" | "installed" | "update_available"
    pub status: String,
    /// Versão instalada atualmente (se instalado)
    pub installed_version: Option<String>,
}

// ─────────────────────── Helpers de Segurança ───────────────────────

/// Calcula o hash SHA-256 de um buffer de bytes e retorna como string hexadecimal.
#[allow(dead_code)]
pub fn calculate_sha256(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

/// Verifica se um caminho de destino de extração é seguro e não escapa do diretório raiz do plugin (prevenção Zip Slip).
pub fn is_safe_extraction_path(base_dir: &Path, target_path: &Path) -> bool {
    for component in target_path.components() {
        if component == std::path::Component::ParentDir {
            return false;
        }
    }
    target_path.starts_with(base_dir)
}

fn is_protected_plugin_path(path: &Path) -> bool {
    let normalized = path.to_string_lossy().to_lowercase().replace('\\', "/");
    normalized.contains("toolbox-plugins/plugins")
}

// ─────────────────────── Cache e Resiliência ───────────────────────

fn catalog_cache_path(app: &AppHandle) -> PathBuf {
    crate::paths::data_dir(app).join("catalog_cache.json")
}

fn save_catalog_cache(app: &AppHandle, raw_json: &str) {
    let path = catalog_cache_path(app);
    let _ = fs::write(path, raw_json);
}

fn load_catalog_cache(app: &AppHandle) -> Option<Catalog> {
    let path = catalog_cache_path(app);
    if path.exists() {
        if let Ok(raw) = fs::read_to_string(&path) {
            if let Ok(cat) = serde_json::from_str::<Catalog>(&raw) {
                log::info!("Catálogo carregado com sucesso do cache local em disco.");
                return Some(cat);
            }
        }
    }
    None
}

fn load_fallback_catalog() -> Catalog {
    log::info!("Utilizando catálogo embutido de contingência.");
    serde_json::from_str::<Catalog>(FALLBACK_CATALOG_JSON)
        .expect("Catálogo de contingência embutido deve ser sempre válido")
}

async fn fetch_remote_catalog_body() -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("toolbox/1.16")
        .timeout(std::time::Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    for attempt in 0..2 {
        if attempt > 0 {
            std::thread::sleep(std::time::Duration::from_millis(300));
        }

        let res = match client.get(CATALOG_URL).send().await {
            Ok(r) => r,
            Err(e) => {
                log::warn!("Tentativa {} de buscar catálogo remoto falhou: {}", attempt + 1, e);
                continue;
            }
        };

        if !res.status().is_success() {
            log::warn!(
                "Resposta HTTP não-2xx ao buscar catálogo: status {}",
                res.status()
            );
            continue;
        }

        match res.text().await {
            Ok(text) => {
                let trimmed = text.trim();
                if trimmed.starts_with('{') && trimmed.ends_with('}') {
                    return Ok(text);
                } else {
                    log::warn!("Resposta do catálogo não é um objeto JSON válido (possível página de erro/texto)");
                }
            }
            Err(e) => {
                log::warn!("Falha ao ler corpo da resposta do catálogo: {}", e);
            }
        }
    }

    Err("Não foi possível obter catálogo remoto válido do GitHub".to_string())
}

// ─────────────────────── Comandos Tauri ───────────────────────

/// Busca o catálogo remoto e compara com os plugins instalados localmente.
#[tauri::command]
pub async fn fetch_catalog(app: AppHandle) -> Result<Vec<MarketplaceEntry>, String> {
    let catalog = match fetch_remote_catalog_body().await {
        Ok(body) => match serde_json::from_str::<Catalog>(&body) {
            Ok(remote_catalog) => {
                save_catalog_cache(&app, &body);
                remote_catalog
            }
            Err(e) => {
                log::warn!("Falha ao desserializar catálogo remoto ({e}), tentando cache local...");
                load_catalog_cache(&app).unwrap_or_else(load_fallback_catalog)
            }
        },
        Err(e) => {
            log::warn!("{e}, buscando fallback local...");
            load_catalog_cache(&app).unwrap_or_else(load_fallback_catalog)
        }
    };

    let installed = installed_map(&app);

    let entries = catalog
        .plugins
        .into_iter()
        .map(|p| {
            let status = match installed.get(&p.id) {
                None => "available".to_string(),
                Some(iv) if iv != &p.version => "update_available".to_string(),
                _ => "installed".to_string(),
            };
            let installed_version = installed.get(&p.id).cloned();
            MarketplaceEntry {
                plugin: p,
                status,
                installed_version,
            }
        })
        .collect();

    Ok(entries)
}

/// Baixa e instala um plugin a partir da URL do catálogo.
#[tauri::command]
pub async fn install_plugin(
    plugin_id: String,
    download_url: String,
    expected_sha256: Option<String>,
    app: AppHandle,
) -> Result<String, String> {
    if download_url.is_empty() {
        return Err(format!(
            "Plugin '{}' não possui URL de download disponível.",
            plugin_id
        ));
    }

    let plugins_dir = crate::paths::plugins_dir(&app);
    let dest = plugins_dir.join(&plugin_id);

    if is_protected_plugin_path(&dest) {
        log::warn!("Instalação/Atualização bloqueada: O caminho '{:?}' é um diretório de desenvolvimento protegido.", dest);
        return Err(format!("O plugin '{}' reside em um diretório de desenvolvimento protegido e não pode ser sobrescrito pelo Marketplace.", plugin_id));
    }

    log::info!("Iniciando download do plugin '{}' de {}", plugin_id, download_url);

    // 1. Download do ZIP com validação de status HTTP e retry com backoff para propagação de release
    let client = reqwest::Client::builder()
        .user_agent("toolbox/1.18")
        .timeout(std::time::Duration::from_secs(12))
        .build()
        .map_err(|e| format!("Falha ao inicializar cliente HTTP: {e}"))?;

    let max_attempts = 3;
    let mut last_status = reqwest::StatusCode::OK;
    let mut bytes_opt = None;

    for attempt in 1..=max_attempts {
        log::info!(
            "Baixando plugin '{}' de {} (tentativa {}/{})",
            plugin_id,
            download_url,
            attempt,
            max_attempts
        );

        match client.get(&download_url).send().await {
            Ok(response) => {
                let status = response.status();
                if status.is_success() {
                    match response.bytes().await {
                        Ok(b) => {
                            bytes_opt = Some(b);
                            break;
                        }
                        Err(e) => {
                            log::warn!("Falha ao ler bytes do download na tentativa {}: {}", attempt, e);
                        }
                    }
                } else if status == reqwest::StatusCode::NOT_FOUND {
                    last_status = status;
                    log::warn!(
                        "Asset do plugin '{}' não encontrado (HTTP 404) na tentativa {}/{}. Possível latência de propagação na CDN de release.",
                        plugin_id,
                        attempt,
                        max_attempts
                    );
                    if attempt < max_attempts {
                        std::thread::sleep(std::time::Duration::from_millis(2000 * attempt as u64));
                        continue;
                    }
                } else {
                    last_status = status;
                    log::warn!("Resposta HTTP {} ao baixar plugin '{}'", status, plugin_id);
                    if attempt < max_attempts {
                        std::thread::sleep(std::time::Duration::from_millis(1500));
                        continue;
                    }
                }
            }
            Err(e) => {
                log::warn!("Erro de rede ao baixar plugin na tentativa {}: {}", attempt, e);
                if attempt < max_attempts {
                    std::thread::sleep(std::time::Duration::from_millis(1500));
                    continue;
                }
            }
        }
    }

    let bytes = match bytes_opt {
        Some(b) => b,
        None => {
            if last_status == reqwest::StatusCode::NOT_FOUND {
                return Err(format!(
                    "O arquivo de release do plugin '{}' ainda está sendo processado na CDN do GitHub (HTTP 404). Por favor, aguarde 1 a 2 minutos e tente novamente.",
                    plugin_id
                ));
            } else {
                return Err(format!(
                    "Não foi possível baixar o plugin '{}' após {} tentativas (Status HTTP: {}).",
                    plugin_id,
                    max_attempts,
                    last_status
                ));
            }
        }
    };

    // 2. Validação SHA-256 (se fornecido no catálogo)
    if let Some(expected) = expected_sha256 {
        if !expected.is_empty() {
            let actual = calculate_sha256(&bytes);
            if !actual.eq_ignore_ascii_case(&expected) {
                log::error!(
                    "Integridade violada para '{}'. Esperado: {}, Obtido: {}",
                    plugin_id,
                    expected,
                    actual
                );
                return Err(format!(
                    "Erro de integridade (SHA-256 inválido). O download pode ter sido corrompido ou adulterado."
                ));
            }
            log::info!("Checksum SHA-256 verificado com sucesso para '{}'", plugin_id);
        }
    }

    // 3. Preparação do diretório de destino
    if dest.exists() {
        fs::remove_dir_all(&dest)
            .map_err(|e| format!("Falha ao limpar versão anterior do plugin: {e}"))?;
    }
    fs::create_dir_all(&dest)
        .map_err(|e| format!("Falha ao criar diretório do plugin: {e}"))?;

    // 4. Extração com proteção Zip Slip e remoção de pasta raiz comum
    let reader = Cursor::new(bytes);
    let mut archive =
        zip::ZipArchive::new(reader).map_err(|e| format!("Arquivo baixado não é um ZIP válido: {e}"))?;

    let common_root = find_common_root_dir(&mut archive);

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Erro ao ler entrada do ZIP: {e}"))?;

        let enclosed = match file.enclosed_name() {
            Some(p) => p.to_path_buf(),
            None => continue,
        };

        // Remove pasta raiz redundante se detectada
        let relative_path = if let Some(ref root) = common_root {
            match enclosed.strip_prefix(root) {
                Ok(p) if p.as_os_str().is_empty() => continue,
                Ok(p) => p.to_path_buf(),
                Err(_) => enclosed,
            }
        } else {
            enclosed
        };

        let dest_path = dest.join(&relative_path);

        // Prevenção contra vulnerabilidade Zip Slip
        if !is_safe_extraction_path(&dest, &dest_path) {
            let _ = fs::remove_dir_all(&dest);
            return Err(format!(
                "Tentativa de extração insegura detectada (Zip Slip): {}",
                dest_path.display()
            ));
        }

        if file.is_dir() {
            fs::create_dir_all(&dest_path)
                .map_err(|e| format!("Falha ao criar pasta interna: {e}"))?;
        } else {
            if let Some(parent) = dest_path.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Falha ao criar subdiretório: {e}"))?;
            }
            let mut out =
                fs::File::create(&dest_path).map_err(|e| format!("Falha ao criar arquivo: {e}"))?;
            std::io::copy(&mut file, &mut out)
                .map_err(|e| format!("Falha ao extrair arquivo: {e}"))?;
        }
    }

    // 5. Validação de manifesto pós-instalação
    let plugin_json_path = dest.join("plugin.json");
    if !plugin_json_path.exists() {
        log::warn!(
            "plugin.json ausente no pacote baixado para '{}', gerando manifesto padrão",
            plugin_id
        );
        let default_manifest = serde_json::json!({
            "name": plugin_id,
            "version": "1.0.0",
            "entry": "main.py",
            "language": "python",
            "description": ""
        });
        fs::write(&plugin_json_path, default_manifest.to_string())
            .map_err(|e| format!("Falha ao criar plugin.json padrão: {e}"))?;
    }

    log::info!("Plugin '{}' instalado com sucesso em {}", plugin_id, dest.display());
    Ok(format!("Plugin '{}' instalado com sucesso.", plugin_id))
}

/// Remove um plugin do disco (apaga a pasta do plugin).
#[tauri::command]
pub fn remove_plugin(plugin_id: String, app: AppHandle) -> Result<String, String> {
    let plugins_dir = crate::paths::plugins_dir(&app);
    let dest = plugins_dir.join(&plugin_id);

    if is_protected_plugin_path(&dest) {
        log::warn!("Remoção física bloqueada: O caminho '{:?}' é um diretório de desenvolvimento protegido.", dest);
        return Ok(format!("Plugin '{}' protegido em diretório de desenvolvimento. Diretório em disco preservado.", plugin_id));
    }

    if !dest.exists() {
        return Err(format!("Plugin '{}' não está instalado.", plugin_id));
    }

    fs::remove_dir_all(&dest)
        .map_err(|e| format!("Falha ao remover plugin '{}': {e}", plugin_id))?;

    log::info!("Plugin '{}' removido.", plugin_id);
    Ok(format!("Plugin '{}' removido.", plugin_id))
}

/// Lista os plugins instalados localmente lendo os plugin.json de cada pasta.
#[tauri::command]
pub fn list_installed_plugins(app: AppHandle) -> Result<Vec<InstalledPlugin>, String> {
    let plugins_dir = crate::paths::plugins_dir(&app);
    if !plugins_dir.exists() {
        return Ok(vec![]);
    }

    let mut result = Vec::new();
    for entry in fs::read_dir(&plugins_dir)
        .map_err(|e| e.to_string())?
        .flatten()
    {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let plugin_json = path.join("plugin.json");
        if !plugin_json.exists() {
            continue;
        }
        let raw = match fs::read_to_string(&plugin_json) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let manifest: HashMap<String, serde_json::Value> = match serde_json::from_str(&raw) {
            Ok(m) => m,
            Err(_) => continue,
        };

        let id = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        result.push(InstalledPlugin {
            id: id.clone(),
            name: manifest
                .get("name")
                .and_then(|v| v.as_str())
                .unwrap_or(&id)
                .to_string(),
            version: manifest
                .get("version")
                .and_then(|v| v.as_str())
                .unwrap_or("0.0.0")
                .to_string(),
            description: manifest
                .get("description")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            language: manifest
                .get("language")
                .and_then(|v| v.as_str())
                .unwrap_or("python")
                .to_string(),
            entry: manifest
                .get("entry")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            path: path.to_string_lossy().to_string(),
            icon: manifest
                .get("icon")
                .and_then(|v| v.as_str())
                .map(String::from),
        });
    }

    Ok(result)
}

// ─────────────────────── Helpers ───────────────────────

/// Retorna um mapa id → versão instalada lendo os plugin.json locais.
fn installed_map(app: &AppHandle) -> HashMap<String, String> {
    let plugins_dir = crate::paths::plugins_dir(app);
    let mut map = HashMap::new();

    if let Ok(entries) = fs::read_dir(&plugins_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            let plugin_json = path.join("plugin.json");
            let raw = match fs::read_to_string(&plugin_json) {
                Ok(s) => s,
                Err(_) => continue,
            };
            let manifest: HashMap<String, serde_json::Value> = match serde_json::from_str(&raw) {
                Ok(m) => m,
                Err(_) => continue,
            };
            let id = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let version = manifest
                .get("version")
                .and_then(|v| v.as_str())
                .unwrap_or("0.0.0")
                .to_string();
            map.insert(id, version);
        }
    }

    map
}

/// Detecta se todas as entradas do ZIP compartilham uma única pasta raiz (ex: "calc-jornadas/").
fn find_common_root_dir<R: std::io::Read + std::io::Seek>(
    archive: &mut zip::ZipArchive<R>,
) -> Option<PathBuf> {
    let mut root_dir: Option<PathBuf> = None;
    let mut has_files_inside = false;

    for i in 0..archive.len() {
        let file = match archive.by_index(i) {
            Ok(f) => f,
            Err(_) => return None,
        };

        let enclosed = match file.enclosed_name() {
            Some(p) => p.to_path_buf(),
            None => continue,
        };

        let mut components = enclosed.components();
        let first = match components.next() {
            Some(std::path::Component::Normal(c)) => PathBuf::from(c),
            _ => return None,
        };

        if let Some(ref current_root) = root_dir {
            if &first != current_root {
                return None;
            }
        } else {
            root_dir = Some(first);
        }

        if components.next().is_some() {
            has_files_inside = true;
        }
    }

    if has_files_inside {
        root_dir
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_deserialize_catalog_with_missing_fields() {
        let json_data = r#"{
            "version": "1.0",
            "updated_at": "2026-08-14",
            "plugins": [
                {
                    "id": "log-optimizer",
                    "name": "Log Optimizer",
                    "version": "1.0.0"
                },
                {
                    "id": "har-optimizer",
                    "name": "HAR Optimizer",
                    "version": "1.0.0",
                    "description": "Processa arquivos HAR",
                    "download_url": "https://example.com/har.zip"
                }
            ]
        }"#;

        let catalog: Result<Catalog, _> = serde_json::from_str(json_data);
        assert!(catalog.is_ok(), "Catalog com campos ausentes deve ser desserializado com sucesso");
        let cat = catalog.unwrap();
        assert_eq!(cat.plugins.len(), 2);
        assert_eq!(cat.plugins[0].language, "python");
        assert_eq!(cat.plugins[0].icon, "Puzzle");
        assert_eq!(cat.plugins[1].description, "Processa arquivos HAR");
    }

    #[test]
    fn test_fallback_catalog_is_valid() {
        let cat = load_fallback_catalog();
        assert!(!cat.plugins.is_empty(), "Catálogo fallback não pode ser vazio");
        assert!(cat.plugins.iter().any(|p| p.id == "calc-jornadas"));
        assert!(cat.plugins.iter().any(|p| p.id == "gerador-afd"));
    }

    #[test]
    fn test_parse_invalid_html_or_503_error_does_not_panic() {
        let error_body_503 = "Backend.max_conn reached\n";
        let parsed: Result<Catalog, _> = serde_json::from_str(error_body_503);
        assert!(parsed.is_err(), "Texto 503 não deve ser aceito como Catalog válido");

        let html_error = "<html><head><title>503 Service Unavailable</title></head><body>503</body></html>";
        let parsed_html: Result<Catalog, _> = serde_json::from_str(html_error);
        assert!(parsed_html.is_err(), "HTML de erro não deve ser aceito como Catalog válido");
    }

    #[test]
    fn test_calculate_sha256() {
        let data = b"toolbox-plugin-test";
        let hash = calculate_sha256(data);
        assert_eq!(hash.len(), 64);
        assert_eq!(
            hash,
            "424c0240981ee80abdfd9912af0e3a6b18990c1ecbec1e25046f7424cbeb649a"
        );
    }

    #[test]
    fn test_is_safe_extraction_path_valid() {
        let base = Path::new("/app/plugins/my-plugin");
        let safe_target = Path::new("/app/plugins/my-plugin/main.py");
        assert!(is_safe_extraction_path(base, safe_target));
    }

    #[test]
    fn test_is_safe_extraction_path_zip_slip_parent_dir() {
        let base = Path::new("/app/plugins/my-plugin");
        let unsafe_target = Path::new("/app/plugins/my-plugin/../other.py");
        assert!(!is_safe_extraction_path(base, unsafe_target));
    }

    #[test]
    fn test_is_safe_extraction_path_outside_base() {
        let base = Path::new("/app/plugins/my-plugin");
        let outside_target = Path::new("/app/plugins/other-plugin/main.py");
        assert!(!is_safe_extraction_path(base, outside_target));
    }

    #[test]
    fn test_is_protected_plugin_path() {
        let win_path = Path::new(r"C:\tools\toolbox-plugins\plugins\calc-jornadas");
        assert!(is_protected_plugin_path(win_path));

        let unix_path = Path::new("/tools/toolbox-plugins/plugins/meu-plugin");
        assert!(is_protected_plugin_path(unix_path));

        let appdata_path = Path::new(r"C:\Users\user\AppData\Roaming\senior.toolbox\plugins\calc-jornadas");
        assert!(!is_protected_plugin_path(appdata_path));
    }
}
