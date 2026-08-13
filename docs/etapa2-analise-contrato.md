# Etapa 2: Contrato Evolutivo de Plugins — Análise Técnica

## 1. Achados da Análise Graphify

### 1.1 Pontos de Leitura de plugin.json

**Arquivo: `src-tauri/src/executor.rs`** (2 locais)

```rust
// Linha 142-158: run_plugin() - Execução
let manifest_raw = std::fs::read_to_string(&plugin_json)?;
let manifest: HashMap<String, String> = serde_json::from_str(&manifest_raw)?;
// Extrai: entry (obrigatório), language (fallback: "python")

// Linha 259-263: list_plugins() - Descoberta
let manifest: HashMap<String, String> = serde_json::from_str(&raw)?;
// Extrai: name, version, language
```

**Arquivo: `src-tauri/src/marketplace.rs`** (3 locais)

```rust
// Linha 282-286: list_installed_plugins() - Listagem
let manifest: HashMap<String, serde_json::Value> = serde_json::from_str(&raw)?;
// Extrai: name, version, description, language, entry

// Linha 348: installed_map() - Mapa de versões
// Idem acima

// Linha 229-240: install_plugin() - Instalação
// Cria plugin.json se necessário (fallback)
```

### 1.2 Estruturas Existentes

| Struct | Localização | Uso | Problema |
|--------|-------------|-----|----------|
| `PluginManifest` | plugin.rs | Definição de tipo | **NÃO ESTÁ SENDO USADA** — executor e marketplace usam `HashMap` |
| `InstalledPlugin` | marketplace.rs | Retorno da API | Falta campo `id` (derivado do diretório) |
| `CatalogPlugin` | marketplace.rs | Catálogo remoto | Schema diferente do local |

---

## 2. Contrato Atual (De Facto)

### 2.1 Formato Observado em plugin.json

**Campos obrigatórios (implícito):**
- `name` — Exigido implicitamente (fallback: nome do diretório)
- `language` — Com fallback para "python"
- `entry` — Exigido para executar (linha 158 do executor.rs)

**Campos opcionais:**
- `version` — Fallback para "0.0.0"
- `description` — Fallback para ""

**Campos não suportados atualmente:**
- `id` — Não existem em plugin.json (derivado do diretório)
- `ui`
- `shared`
- `min_toolbox_version` — Só em catálogo remoto

### 2.2 Validações Atuais

❌ **Mínimas:**
- Arquivo existe? (executor.rs:144, marketplace.rs:283)
- JSON válido? (serde_json::from_str)
- Campos requeridos presentes? (Mínima — `entry` verificado)

⚠️ **Ausentes:**
- Entrypoint realmente existe? (executor.rs:159 verifica, mas marketplace não)
- Language é válido? (Sem validação explícita)
- Versão é semver? (Sem validação)
- ID é único? (Sem verificação)

---

## 3. Schema Versionado Proposto

### 3.1 Definição: plugin-contract.md (Nova)

```markdown
# Plugin Contract v1

## Schema JSON

### Obrigatório
- `name` (string): Identificador único e nome exibido
- `version` (string): Semver (1.0.0, 1.0.0-beta, etc.)
- `language` (string): python|node|rust|exe|webview
- `entry` (string): Caminho relativo ao entrypoint (main.py, index.js, etc.)

### Opcional
- `description` (string): Descrição breve (até 200 caracteres)
- `author` (string): Autor ou organização
- `ui` (string): "webview" (atalho para language=="webview")
- `shared` (array<string>): [sdk.js, theme.css] (para webview)
- `min_toolbox_version` (string): Semver mínima (ex: 1.5.0)
- `capabilities` (array<string>): [clipboard, filesystem, network] (futuro)
- `permissions` (object): {scope: [paths]} (futuro)
- `os` (array<string>): [windows, macos, linux] (futuro)

### Não Usado em plugin.json Local
- `id` — Derivado do nome do diretório (nunca em arquivo)
- `icon` — Só no catálogo remoto
- `tags` — Só no catálogo remoto
- `download_url` — Só no catálogo remoto

## Exemplos

### Mínimo (Plugin Python)
```json
{
  "name": "meu-plugin",
  "version": "1.0.0",
  "language": "python",
  "entry": "main.py"
}
```

### Completo (Plugin Webview)
```json
{
  "name": "meu-dashboard",
  "version": "2.1.0",
  "description": "Dashboard interativo",
  "author": "Acme Corp",
  "language": "webview",
  "entry": "dist/index.html",
  "shared": ["sdk.js", "theme.css"],
  "min_toolbox_version": "1.5.0",
  "capabilities": ["clipboard"],
  "os": ["windows", "macos", "linux"]
}
```
```

### 3.2 Implementação: plugin.rs (Atualizado)

```rust
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Versão do contrato de plugin. Incrementar quando há mudanças incompatíveis.
pub const PLUGIN_MANIFEST_VERSION: u16 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]  // Ajuda a detectar typos
pub struct PluginManifest {
    // Obrigatórios
    pub name: String,
    pub version: String,
    pub language: String,            // python|node|rust|exe|webview
    pub entry: String,               // Agora obrigatório (não Option)
    
    // Opcionais
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub author: Option<String>,
    #[serde(default)]
    pub ui: Option<String>,          // Atalho: "webview"
    #[serde(default)]
    pub shared: Option<Vec<String>>, // [sdk.js, theme.css]
    #[serde(default)]
    pub min_toolbox_version: Option<String>,
    
    // Futuros (não usados)
    #[serde(default)]
    pub capabilities: Option<Vec<String>>, // [clipboard, filesystem, network]
    #[serde(default)]
    pub permissions: Option<std::collections::HashMap<String, Vec<String>>>,
    #[serde(default)]
    pub os: Option<Vec<String>>,     // [windows, macos, linux]
}

/// Validação de PluginManifest.
impl PluginManifest {
    /// Valida o manifesto completo. Retorna erros acionáveis.
    pub fn validate(&self, plugin_id: &str) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();
        
        // Validar nome
        if self.name.trim().is_empty() {
            errors.push("name: não pode estar vazio".to_string());
        }
        
        // Validar versão (semver básico)
        if !is_valid_semver(&self.version) {
            errors.push(format!(
                "version: '{}' não é válida (esperado: 1.0.0)",
                self.version
            ));
        }
        
        // Validar linguagem
        match self.language.as_str() {
            "python" | "node" | "rust" | "exe" | "webview" => {},
            _ => {
                errors.push(format!(
                    "language: '{}' não é suportada. Use: python|node|rust|exe|webview",
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
                    "min_toolbox_version: '{}' não é válida",
                    ver
                ));
            }
        }
        
        // Validar conflito language x ui
        if self.is_webview() && self.language != "webview" {
            errors.push(
                "ui: 'webview' conflita com language != 'webview'".to_string()
            );
        }
        
        if !errors.is_empty() {
            return Err(errors);
        }
        
        Ok(())
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

/// Valida se uma string é um semver válido (básico).
fn is_valid_semver(version: &str) -> bool {
    let parts: Vec<&str> = version.split('.').collect();
    if parts.len() < 2 {
        return false;
    }
    
    // Validar major.minor.patch (opcionalmente com -alpha, -beta, etc.)
    parts.iter().take(3).all(|p| {
        p.split(|c: char| !c.is_numeric() && c != '-')
            .any(|segment| !segment.is_empty())
    })
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
        assert!(manifest.validate("meu-plugin").is_ok());
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
        assert!(manifest.validate("meu-plugin").is_err());
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
        assert!(manifest.validate("meu-plugin").is_err());
    }
}
```

---

## 4. Estratégia de Migração (Retrocompatível)

### 4.1 Fases

**Fase 1 (v1.0): Estrutura**
- ✅ Estender PluginManifest com novos campos opcionais
- ✅ Manter HashMap como fallback em executor.rs
- ✅ Plugins legados continuam funcionando

**Fase 2 (v1.5): Validação**
- Usar PluginManifest::validate() em list_plugins() e install_plugin()
- Alertar sobre problemas, mas não bloquear
- Adicionar logs

**Fase 3 (v2.0): Enforcement**
- Requerer todos os campos obrigatórios
- Bloquear plugins sem manifesto válido
- Migração obrigatória para plugins legados

### 4.2 Compatibilidade Assegurada

- ✅ `cpf/` (sem plugin.json) — continua funcionando se registrado em commands.json
- ✅ `gerador-json/` (incompleto) — será tratado na Etapa 6
- ✅ Plugins com campos antigos (sem `ui`, `shared`, etc.) — aceitáveis

---

## 5. Testes Propostos

### 5.1 Casos de Teste

1. **Plugin válido (Python, mínimo)**
   - Nome, version, language, entry presentes
   - Resultado: ✅ Aceito

2. **Plugin válido (Webview, completo)**
   - Todos os campos presentes
   - Resultado: ✅ Aceito

3. **Plugin legado (sem description)**
   - Apenas obrigatórios
   - Resultado: ✅ Aceito

4. **Plugin inválido (versão ruim)**
   - `version: "bad"`
   - Resultado: ❌ Erro acionável

5. **Plugin inválido (language desconhecida)**
   - `language: "java"`
   - Resultado: ❌ Erro acionável

6. **Plugin inválido (entry vazio)**
   - `entry: ""`
   - Resultado: ❌ Erro acionável

7. **Plugin incompleto (sem entry)**
   - JSON não contém `entry`
   - Resultado: ❌ Erro acionável (se usado PluginManifest)

8. **Compatibilidade: Hash<String, String>**
   - Código legado que usa HashMap ainda funciona
   - Resultado: ✅ Aceito

---

## 6. Impacto em Componentes

| Componente | Mudança | Risco | Mitigação |
|-----------|---------|-------|-----------|
| `plugin.rs` | Nova validação | 🟡 Médio | Manter HashMap como fallback |
| `executor.rs` | Usar PluginManifest + HashMap | 🟡 Médio | Testar em desenvolvimento |
| `marketplace.rs` | Usar PluginManifest + HashMap | 🟡 Médio | Logs de warning para campos inválidos |
| `docs/PLUGIN_GUIDE.md` | Atualizar exemplos | 🟢 Baixo | Apenas documentação |
| Catálogo remoto | Sem mudança | 🟢 Nulo | CatalogPlugin mantém compatibilidade |

---

## 7. Próximos Passos

1. ✅ Análise técnica concluída
2. ➡️ Implementar PluginManifest::validate()
3. ➡️ Atualizar executor.rs para usar PluginManifest
4. ➡️ Adicionar testes de validação
5. ➡️ Documentar contrato em plugin-contract.md
6. ➡️ Atualizar PLUGIN_GUIDE.md

---

**Status:** ✅ Pronto para Implementação
