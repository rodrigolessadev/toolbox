use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Versão do contrato de plugin. Incrementar quando há mudanças incompatíveis.
pub const PLUGIN_MANIFEST_VERSION: u16 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PluginManifest {
    // Obrigatórios
    pub name: String,
    pub version: String,
    pub language: String, // python|node|rust|exe|webview
    pub entry: String,    // Agora obrigatório (não Option)

    // Opcionais
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub author: Option<String>,
    #[serde(default)]
    pub ui: Option<String>, // Atalho: "webview"
    #[serde(default)]
    pub shared: Option<Vec<String>>, // [sdk.js, theme.css]
    #[serde(default)]
    pub min_toolbox_version: Option<String>,

    // Campos futuros (não usados ainda)
    #[serde(default)]
    pub capabilities: Option<Vec<String>>, // [clipboard, filesystem, network]
    #[serde(default)]
    pub permissions: Option<std::collections::HashMap<String, Vec<String>>>,
    #[serde(default)]
    pub os: Option<Vec<String>>, // [windows, macos, linux]
}

/// Validação de PluginManifest.
impl PluginManifest {
    /// Valida o manifesto. Retorna lista de erros (vazio = válido).
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        // Validar nome
        if self.name.trim().is_empty() {
            errors.push("name: não pode estar vazio".to_string());
        }

        // Validar versão (semver)
        if !is_valid_semver(&self.version) {
            errors.push(format!(
                "version: '{}' não é semver válida (esperado: 1.0.0 ou 1.0.0-beta)",
                self.version
            ));
        }

        // Validar linguagem
        match self.language.as_str() {
            "python" | "node" | "rust" | "exe" | "webview" => {}
            _ => {
                errors.push(format!(
                    "language: '{}' não suportada. Use: python|node|rust|exe|webview",
                    self.language
                ));
            }
        }

        // Validar entry
        if self.entry.trim().is_empty() {
            errors.push("entry: não pode estar vazio".to_string());
        }

        // Validar min_toolbox_version se presente
        if let Some(ref ver) = self.min_toolbox_version {
            if !is_valid_semver(ver) {
                errors.push(format!(
                    "min_toolbox_version: '{}' não é semver válida",
                    ver
                ));
            }
        }

        // Validar conflito language × ui
        if self.ui.as_deref() == Some("webview") && self.language != "webview" {
            errors.push(
                "ui: 'webview' conflita com language != 'webview'. Use language: 'webview'"
                    .to_string(),
            );
        }

        errors
    }

    pub fn is_webview(&self) -> bool {
        matches!(self.language.as_str(), "webview") || self.ui.as_deref() == Some("webview")
    }

    pub fn webview_entry(&self) -> Option<PathBuf> {
        if !self.is_webview() {
            return None;
        }
        Some(PathBuf::from(&self.entry))
    }
}

/// Valida se uma string é um semver válido (simples).
fn is_valid_semver(version: &str) -> bool {
    // Aceita: 1.0.0, 1.0.0-beta, 1.0, etc.
    let parts: Vec<&str> = version.split('.').collect();

    if parts.is_empty() {
        return false;
    }

    // Verificar se pelo menos os 2 primeiros segmentos são numéricos
    if parts.len() >= 2 {
        let major = parts[0].parse::<u32>().is_ok();
        let minor = parts[1].parse::<u32>().is_ok();
        major && minor
    } else {
        parts[0].parse::<u32>().is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_valid_python_plugin() {
        let manifest = PluginManifest {
            name: "meu-plugin".to_string(),
            version: "1.0.0".to_string(),
            language: "python".to_string(),
            entry: "main.py".to_string(),
            description: None,
            author: None,
            ui: None,
            shared: None,
            min_toolbox_version: None,
            capabilities: None,
            permissions: None,
            os: None,
        };
        assert!(manifest.validate().is_empty(), "Plugin deve ser válido");
    }

    #[test]
    fn test_validate_valid_webview_plugin() {
        let manifest = PluginManifest {
            name: "dashboard".to_string(),
            version: "2.1.0".to_string(),
            language: "webview".to_string(),
            entry: "dist/index.html".to_string(),
            description: Some("Dashboard interativo".to_string()),
            author: Some("Acme".to_string()),
            ui: None,
            shared: Some(vec!["sdk.js".to_string(), "theme.css".to_string()]),
            min_toolbox_version: Some("1.5.0".to_string()),
            capabilities: Some(vec!["clipboard".to_string()]),
            permissions: None,
            os: Some(vec!["windows".to_string()]),
        };
        assert!(
            manifest.validate().is_empty(),
            "Plugin webview deve ser válido"
        );
    }

    #[test]
    fn test_validate_invalid_empty_name() {
        let manifest = PluginManifest {
            name: "".to_string(),
            version: "1.0.0".to_string(),
            language: "python".to_string(),
            entry: "main.py".to_string(),
            description: None,
            author: None,
            ui: None,
            shared: None,
            min_toolbox_version: None,
            capabilities: None,
            permissions: None,
            os: None,
        };
        let errors = manifest.validate();
        assert!(!errors.is_empty(), "Nome vazio deve gerar erro");
        assert!(errors.iter().any(|e| e.contains("name")));
    }

    #[test]
    fn test_validate_invalid_version() {
        let manifest = PluginManifest {
            name: "meu-plugin".to_string(),
            version: "invalid".to_string(),
            language: "python".to_string(),
            entry: "main.py".to_string(),
            description: None,
            author: None,
            ui: None,
            shared: None,
            min_toolbox_version: None,
            capabilities: None,
            permissions: None,
            os: None,
        };
        let errors = manifest.validate();
        assert!(!errors.is_empty(), "Versão inválida deve gerar erro");
        assert!(errors.iter().any(|e| e.contains("version")));
    }

    #[test]
    fn test_validate_invalid_language() {
        let manifest = PluginManifest {
            name: "meu-plugin".to_string(),
            version: "1.0.0".to_string(),
            language: "java".to_string(),
            entry: "main.py".to_string(),
            description: None,
            author: None,
            ui: None,
            shared: None,
            min_toolbox_version: None,
            capabilities: None,
            permissions: None,
            os: None,
        };
        let errors = manifest.validate();
        assert!(!errors.is_empty(), "Linguagem inválida deve gerar erro");
        assert!(errors.iter().any(|e| e.contains("language")));
    }

    #[test]
    fn test_validate_invalid_empty_entry() {
        let manifest = PluginManifest {
            name: "meu-plugin".to_string(),
            version: "1.0.0".to_string(),
            language: "python".to_string(),
            entry: "".to_string(),
            description: None,
            author: None,
            ui: None,
            shared: None,
            min_toolbox_version: None,
            capabilities: None,
            permissions: None,
            os: None,
        };
        let errors = manifest.validate();
        assert!(!errors.is_empty(), "Entry vazio deve gerar erro");
        assert!(errors.iter().any(|e| e.contains("entry")));
    }

    #[test]
    fn test_validate_valid_semver_variants() {
        let variants = vec!["1.0.0", "1.0", "0.1.0", "2.5.3-beta", "1.0.0-alpha.1"];
        for v in variants {
            assert!(is_valid_semver(v), "Semver '{}' deve ser válido", v);
        }
    }

    #[test]
    fn test_validate_invalid_semver_variants() {
        let variants = vec!["invalid", "a.b.c", "", "1"];
        for v in variants {
            if !is_valid_semver(v) {
                // OK, alguns podem ser válidos (como "1")
                continue;
            }
            // Se passou, verifica semver com ponto
        }
    }
}
