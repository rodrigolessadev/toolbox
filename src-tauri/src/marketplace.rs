use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::Cursor;
use tauri::AppHandle;

// ─────────────────────── Tipos do catálogo ────────────────────────

const CATALOG_URL: &str =
    "https://raw.githubusercontent.com/rodrigolessadev/toolbox-plugins/main/catalog.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CatalogPlugin {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub language: String,
    pub tags: Vec<String>,
    pub icon: String,
    pub command: String,
    pub download_url: String,
    #[serde(default)]
    pub min_toolbox_version: String,
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

// ─────────────────────── Comandos Tauri ───────────────────────────

/// Busca o catálogo remoto e compara com os plugins instalados localmente.
#[tauri::command]
pub async fn fetch_catalog(app: AppHandle) -> Result<Vec<MarketplaceEntry>, String> {
    let body = match reqwest::get(CATALOG_URL).await {
        Ok(response) => match response.text().await {
            Ok(text) => text,
            Err(e) => {
                log::error!("Falha ao ler resposta do catálogo: {e}");
                return Err(format!("Falha ao ler resposta: {e}"));
            }
        },
        Err(e) => {
            log::error!("Falha ao buscar catálogo: {e}");
            return Err(format!("Falha ao buscar catálogo: {e}"));
        }
    };

    let catalog: Catalog = match serde_json::from_str(&body) {
        Ok(catalog) => catalog,
        Err(e) => {
            log::error!("Catálogo inválido: {e}");
            return Err(format!("Catálogo inválido: {e}"));
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
/// Extrai o ZIP em %APPDATA%\Toolbox\plugins\<id>\
#[tauri::command]
pub async fn install_plugin(
    app: AppHandle,
    plugin_id: String,
    download_url: String,
) -> Result<String, String> {
    let plugins_dir = crate::paths::plugins_dir(&app);
    let dest = plugins_dir.join(&plugin_id);

    let response = match reqwest::get(&download_url).await {
        Ok(response) => response,
        Err(e) => {
            log::error!(
                "Falha ao baixar plugin '{}': {e} (URL: {download_url})",
                plugin_id
            );
            return Err(format!("Falha ao baixar plugin: {e}"));
        }
    };

    if !response.status().is_success() {
        let status = response.status();
        let message = format!(
            "Falha ao baixar plugin '{}': HTTP {status} ao acessar {download_url}",
            plugin_id
        );
        log::error!("{message}");
        return Err(message);
    }

    let bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(e) => {
            log::error!("Falha ao ler bytes do plugin '{}': {e}", plugin_id);
            return Err(format!("Falha ao ler bytes: {e}"));
        }
    };

    if bytes.len() < 4 || bytes[..4] != [b'P', b'K', 0x03, 0x04] {
        let message = format!(
            "Falha ao instalar '{}': a URL de download não retornou um ZIP válido. URL: {download_url}",
            plugin_id
        );
        log::error!("{message}");
        return Err(message);
    }

    // Garante que o diretório de destino existe (recria se necessário)
    if dest.exists() {
        fs::remove_dir_all(&dest).map_err(|e| {
            log::error!(
                "Falha ao remover versão anterior do plugin '{}': {e}",
                plugin_id
            );
            format!("Falha ao remover versão anterior: {e}")
        })?;
    }
    fs::create_dir_all(&dest).map_err(|e| {
        log::error!("Falha ao criar pasta do plugin '{}': {e}", plugin_id);
        format!("Falha ao criar pasta: {e}")
    })?;

    // Extrai o ZIP
    let cursor = Cursor::new(bytes);
    let mut archive = match zip::ZipArchive::new(cursor) {
        Ok(archive) => archive,
        Err(e) => {
            log::error!(
                "ZIP inválido para plugin '{}': {e}. URL: {download_url}",
                plugin_id
            );
            return Err(format!(
                "ZIP inválido para '{}': {e}. Verifique se o arquivo de download é um ZIP válido.",
                plugin_id
            ));
        }
    };

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Erro ao ler entrada do ZIP: {e}"))?;

        let out_path = match file.enclosed_name() {
            Some(p) => dest.join(p),
            None => continue,
        };

        if file.is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| format!("Falha ao criar subpasta: {e}"))?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent).map_err(|e| format!("Falha ao criar pasta pai: {e}"))?;
            }
            let mut out_file =
                fs::File::create(&out_path).map_err(|e| format!("Falha ao criar arquivo: {e}"))?;
            std::io::copy(&mut file, &mut out_file)
                .map_err(|e| format!("Falha ao extrair arquivo: {e}"))?;
        }
    }

    log::info!("Plugin '{}' instalado em {}", plugin_id, dest.display());
    Ok(format!("Plugin '{}' instalado com sucesso.", plugin_id))
}

/// Remove um plugin instalado (apaga a pasta em plugins/<id>).
#[tauri::command]
pub fn remove_plugin(app: AppHandle, plugin_id: String) -> Result<String, String> {
    let plugins_dir = crate::paths::plugins_dir(&app);
    let dest = plugins_dir.join(&plugin_id);

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
        });
    }

    Ok(result)
}

// ─────────────────────── Helpers ──────────────────────────────────

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
