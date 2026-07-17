use crate::error::{AppError, AppResult};
use crate::models::{PluginInfo, PluginManifest};
use crate::paths::plugins_dir;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Clone)]
pub struct PluginManager {
    root: std::path::PathBuf,
}

impl PluginManager {
    pub fn new() -> Self {
        Self {
            root: plugins_dir(),
        }
    }

    /// Descoberta dinâmica de plugins: percorre plugins/ e lê plugin.json de cada subdiretório.
    pub fn discover_all(&self) -> Vec<PluginInfo> {
        let mut result = Vec::new();
        if !self.root.exists() {
            return result;
        }

        for entry in WalkDir::new(&self.root)
            .max_depth(2)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if !entry.file_type().is_dir() {
                continue;
            }
            // Ignora a pasta _template.
            let dir_name = entry.file_name().to_string_lossy().to_string();
            if dir_name.starts_with('_') || dir_name.starts_with('.') {
                continue;
            }
            let manifest_path = entry.path().join("plugin.json");
            if !manifest_path.exists() {
                continue;
            }
            if let Ok(info) = self.read_plugin(&entry.path()) {
                result.push(info);
            }
        }

        result.sort_by(|a, b| a.name.cmp(&b.name));
        result
    }

    pub fn read_plugin(&self, plugin_path: &Path) -> AppResult<PluginInfo> {
        let manifest_path = plugin_path.join("plugin.json");
        let raw = std::fs::read_to_string(&manifest_path).map_err(|e| {
            AppError::PluginInvalid(
                plugin_path.display().to_string(),
                format!("Não foi possível ler plugin.json: {e}"),
            )
        })?;
        let manifest: PluginManifest = serde_json::from_str(&raw).map_err(|e| {
            AppError::PluginInvalid(
                plugin_path.display().to_string(),
                format!("plugin.json inválido: {e}"),
            )
        })?;

        let name = if manifest.name.is_empty() {
            plugin_path
                .file_name()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| "unnamed".to_string())
        } else {
            manifest.name.clone()
        };

        Ok(PluginInfo {
            name,
            version: manifest.version,
            description: manifest.description,
            author: manifest.author,
            entrypoint: manifest.entrypoint,
            language: manifest.language,
            path: plugin_path.display().to_string(),
        })
    }

    /// Resolve o caminho absoluto de um plugin a partir de um caminho (relativo) vindo de commands.json.
    pub fn resolve(&self, raw_path: &str) -> std::path::PathBuf {
        let p = std::path::Path::new(raw_path);
        if p.is_absolute() {
            p.to_path_buf()
        } else {
            self.root.join("..").join(p)
        }
    }

    /// Executa um plugin (como processo independente).
    pub fn execute(&self, plugin_path: &Path) -> AppResult<u32> {
        let info = self.read_plugin(plugin_path)?;
        let entrypoint = plugin_path.join(&info.entrypoint);

        if !entrypoint.exists() {
            return Err(AppError::PluginNotFound(
                info.name.clone(),
                entrypoint.display().to_string(),
            ));
        }

        let (cmd, args) = match info.language.as_str() {
            "python" | "py" => {
                let python = which_python();
                let mut a = vec![entrypoint.display().to_string()];
                a.extend(info_extra_args());
                (python, a)
            }
            "node" | "javascript" | "js" => ("node".to_string(), vec![entrypoint.display().to_string()]),
            "rust" => {
                // Em Rust, o plugin precisa estar pré-compilado em target/.
                let exe_name = info.name.clone();
                let mut a = vec![];
                a.extend(info_extra_args());
                (exe_name, a)
            }
            "exe" | "binary" => {
                // Executa diretamente.
                let exe = entrypoint.display().to_string();
                (exe, vec![])
            }
            other => {
                return Err(AppError::PluginInvalid(
                    info.name.clone(),
                    format!("Linguagem não suportada: {other}"),
                ));
            }
        };

        // Garante que o diretório de trabalho seja o do plugin (para arquivos relativos).
        let result = std::process::Command::new(&cmd)
            .args(&args)
            .current_dir(plugin_path)
            .spawn();

        match result {
            Ok(child) => Ok(child.id()),
            Err(e) => Err(AppError::PluginExecution(
                info.name.clone(),
                format!("{e}"),
            )),
        }
    }
}

fn info_extra_args() -> Vec<String> {
    Vec::new()
}

/// Tenta encontrar o interpretador Python disponível.
fn which_python() -> String {
    for cand in ["python", "python3", "py"] {
        if std::process::Command::new(cand)
            .arg("--version")
            .output()
            .is_ok()
        {
            return cand.to_string();
        }
    }
    "python".to_string()
}
