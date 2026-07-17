use serde::{Serialize, Serializer};
use thiserror::Error;

/// Erros padronizados da aplicação.
/// Cada erro vira uma string amigável ao chegar no frontend.
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Comando '{0}' não encontrado.")]
    CommandNotFound(String),

    #[error("Plugin '{0}' não encontrado em '{1}'.")]
    PluginNotFound(String, String),

    #[error("Plugin '{0}' está malformado: {1}")]
    PluginInvalid(String, String),

    #[error("Plugin '{0}' falhou ao executar: {1}")]
    PluginExecution(String, String),

    #[error("Falha ao abrir link '{0}': {1}")]
    LinkOpenFailed(String, String),

    #[error("Executável não encontrado: {0}")]
    ApplicationNotFound(String),

    #[error("Falha ao executar aplicação '{0}': {1}")]
    ApplicationExecution(String, String),

    #[error("Comando '{0}' já existe.")]
    CommandAlreadyExists(String),

    #[error("Erro de I/O: {0}")]
    Io(String),

    #[error("Erro de serialização JSON: {0}")]
    Json(String),

    #[error("Erro genérico: {0}")]
    Generic(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Json(e.to_string())
    }
}

/// Serializa para string para que o frontend receba uma mensagem amigável.
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
