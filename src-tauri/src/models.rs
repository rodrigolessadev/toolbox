use serde::{Deserialize, Serialize};

/// Tipo de comando armazenado em commands.json.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CommandType {
    Plugin,
    Link,
    Application,
}

impl CommandType {
    pub fn as_str(&self) -> &'static str {
        match self {
            CommandType::Plugin => "plugin",
            CommandType::Link => "link",
            CommandType::Application => "application",
        }
    }
}

/// Representação completa de um comando.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandEntry {
    #[serde(rename = "type")]
    pub kind: CommandType,

    #[serde(default)]
    pub name: String,

    /// path (para plugin/application) ou url (para link)
    #[serde(default)]
    pub path: Option<String>,

    #[serde(default)]
    pub url: Option<String>,

    #[serde(default)]
    pub favorite: bool,

    #[serde(default)]
    pub icon: Option<String>,
}

impl CommandEntry {
    pub fn display_label(&self) -> String {
        if !self.name.is_empty() {
            self.name.clone()
        } else {
            match self.kind {
                CommandType::Link => self.url.clone().unwrap_or_default(),
                CommandType::Application | CommandType::Plugin => {
                    self.path.clone().unwrap_or_default()
                }
            }
        }
    }
}

/// Entrada lida de commands.json (chave é o nome do comando).
pub type CommandsFile = std::collections::BTreeMap<String, CommandEntry>;

/// Plugin descoberto em disco.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub entrypoint: String,
    pub language: String,
    pub path: String,
}

/// Conteúdo bruto de plugin.json.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PluginManifest {
    #[serde(default = "default_plugin_name")]
    pub name: String,

    #[serde(default = "default_plugin_version")]
    pub version: String,

    #[serde(default)]
    pub description: String,

    #[serde(default)]
    pub author: String,

    #[serde(default = "default_plugin_entrypoint")]
    pub entrypoint: String,

    #[serde(default = "default_plugin_language")]
    pub language: String,
}

fn default_plugin_name() -> String {
    "unnamed".to_string()
}

fn default_plugin_version() -> String {
    "0.1.0".to_string()
}

fn default_plugin_entrypoint() -> String {
    "main.py".to_string()
}

fn default_plugin_language() -> String {
    "python".to_string()
}

/// Item do histórico.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub command: String,
    pub kind: CommandType,
    pub timestamp: i64,
}

/// Payload de criação de comando (recebido do frontend).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCommandPayload {
    pub name: String,
    pub kind: CommandType,

    /// Apenas para link
    #[serde(default)]
    pub url: Option<String>,

    /// Apenas para plugin/application
    #[serde(default)]
    pub path: Option<String>,

    #[serde(default)]
    pub favorite: bool,

    #[serde(default)]
    pub icon: Option<String>,
}

/// Payload de atualização de favorito.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToggleFavoritePayload {
    pub name: String,
    pub favorite: bool,
}
