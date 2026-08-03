use serde::Deserialize;
use std::path::PathBuf;

#[derive(Debug, Clone, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub language: String,            // "python" | "node" | "binary" | "webview"
    pub ui: Option<String>,          // "webview" (atalho para language=="webview")
    pub entry: Option<String>,       // "main.py" | "dist/index.html"
    pub shared: Option<Vec<String>>, // ["sdk.js","theme.css","components.css"]
    pub min_toolbox_version: Option<String>,
}

impl PluginManifest {
    pub fn is_webview(&self) -> bool {
        matches!(self.language.as_str(), "webview") || self.ui.as_deref() == Some("webview")
    }
    pub fn webview_entry(&self) -> Option<PathBuf> {
        if !self.is_webview() {
            return None;
        }
        self.entry.as_ref().map(|e| PathBuf::from(e))
    }
}
