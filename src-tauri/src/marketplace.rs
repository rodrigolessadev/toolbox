use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
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

// ─────────────────────── Helpers de Segurança ───────────────────────────

/// Calcula o hash SHA-256 de um buffer de bytes e retorna como string hexadecimal.
#[allow(dead_code)]
pub fn calculate_sha256(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

/// Verifica se um caminho de destino de extração é seguro e não escapa do diretório raiz do plugin (prevenção Zip Slip).
pub fn is_safe_extraction_path(base_dir: &Path, target_path: &Path) -> bool {
    // Verifica se contém partes suspeitas '..' que sobem de nível
    for component in target_path.components() {
        if component == std::path::Component::ParentDir {
            return false;
        }
    }
    target_path.starts_with(base_dir)
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
/// Realiza validação SHA-256 (se presente), proteção Zip Slip e validação do PluginManifest.
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

    // Extrai o ZIP com proteção contra Zip Slip
    let cursor = Cursor::new(bytes);
    let mut archive = match zip::ZipArchive::new(cursor) {
        Ok(archive) => archive,
        Err(e) => {
            log::error!(
                "ZIP inválido para plugin '{}': {e}. URL: {download_url}",
                plugin_id
            );
            let _ = fs::remove_dir_all(&dest);
            return Err(format!(
                "ZIP inválido para '{}': {e}. Verifique se o arquivo de download é um ZIP válido.",
                plugin_id
            ));
        }
    };

    let root_prefix = find_common_root_dir(&mut archive);

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Erro ao ler entrada do ZIP: {e}"))?;

        let enclosed = match file.enclosed_name() {
            Some(p) => p.to_path_buf(),
            None => continue,
        };

        let rel_path = match &root_prefix {
            Some(prefix) => match enclosed.strip_prefix(prefix) {
                Ok(p) => p.to_path_buf(),
                Err(_) => enclosed,
            },
            None => enclosed,
        };

        if rel_path.as_os_str().is_empty() {
            continue;
        }

        let out_path = dest.join(&rel_path);

        // Validação de Segurança Zip Slip
        if !is_safe_extraction_path(&dest, &out_path) {
            let _ = fs::remove_dir_all(&dest);
            let msg = format!(
                "Aviso de segurança: tentativa de navegação de caminho (Zip Slip) detectada em '{:?}'",
                rel_path
            );
            log::error!("{msg}");
            return Err(msg);
        }

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

    // Garante que plugin.json exista na pasta do plugin
    let plugin_json_path = dest.join("plugin.json");
    if !plugin_json_path.exists() {
        let fallback_manifest = serde_json::json!({
            "id": plugin_id,
            "name": plugin_id,
            "version": "1.0.0",
            "description": "",
            "language": "python",
            "entry": "main.py"
        });
        if let Ok(content) = serde_json::to_string_pretty(&fallback_manifest) {
            let _ = fs::write(&plugin_json_path, content);
        }
    }

    // Validação pós-instalação do PluginManifest
    if let Ok(manifest_content) = fs::read_to_string(&plugin_json_path) {
        if let Ok(manifest) = serde_json::from_str::<crate::plugin::PluginManifest>(&manifest_content) {
            let validation_errors = manifest.validate();
            if !validation_errors.is_empty() {
                let _ = fs::remove_dir_all(&dest);
                let msg = format!(
                    "Plugin '{}' possui manifesto inválido: {:?}",
                    plugin_id, validation_errors
                );
                log::error!("{msg}");
                return Err(msg);
            }

            let entrypoint = dest.join(&manifest.entry);
            if !entrypoint.exists() {
                let _ = fs::remove_dir_all(&dest);
                let msg = format!(
                    "Arquivo de entrada '{}' declarado em plugin.json não existe no pacote baixado.",
                    manifest.entry
                );
                log::error!("{msg}");
                return Err(msg);
            }
        }
    }

    log::info!("Plugin '{}' instalado e validado em {}", plugin_id, dest.display());
    Ok(format!("Plugin '{}' instalado com sucesso.", plugin_id))
}

/// Verifica se o caminho pertence a um diretório de desenvolvimento protegido
/// (ex: C:\tools\toolbox-plugins\plugins\...) que NUNCA deve ter arquivos apagados do disco.
pub fn is_protected_plugin_path(path: &Path) -> bool {
    let path_str = path.to_string_lossy().to_lowercase();
    path_str.contains("toolbox-plugins\\plugins") || path_str.contains("toolbox-plugins/plugins")
}

/// Remove um plugin instalado (apaga a pasta em plugins/<id>).
/// Plugins localizados em diretórios de desenvolvimento protegidos (ex: toolbox-plugins/plugins)
/// nunca têm seus arquivos apagados do disco.
#[tauri::command]
pub fn remove_plugin(app: AppHandle, plugin_id: String) -> Result<String, String> {
    let plugins_dir = crate::paths::plugins_dir(&app);
    let dest = if Path::new(&plugin_id).is_absolute() {
        PathBuf::from(&plugin_id)
    } else {
        plugins_dir.join(&plugin_id)
    };

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

/// Detecta se todas as entradas do ZIP compartilham uma única pasta raiz (ex: "calc-jornadas/").
/// Se sim, retorna essa pasta para remover o aninhamento desnecessário na extração.
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
    fn test_calculate_sha256() {
        let data = b"toolbox-plugin-test";
        let hash = calculate_sha256(data);
        assert_eq!(hash.len(), 64); // Hexadecimal de 256 bits tem 64 chars
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