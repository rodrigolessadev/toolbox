# Plugin Contract v1

## Visão Geral

O contrato de plugin define a interface padrão entre o Toolbox e seus plugins. Este documento especifica:

- Formato de metadados (`plugin.json`)
- Campos obrigatórios e opcionais
- Validações e mensagens de erro
- Exemplos de uso
- Roadmap para evoluções futuras

---

## Schema JSON

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `name` | string | Identificador único e nome exibido (1-50 caracteres) | `"meu-plugin"` |
| `version` | string | Versão semântica (Semver) | `"1.0.0"` |
| `language` | string | Linguagem de implementação | `"python"` |
| `entry` | string | Caminho relativo ao entrypoint | `"main.py"` |

### Campos Opcionais

| Campo | Tipo | Descrição | Exemplo | Default |
|-------|------|-----------|---------|---------|
| `description` | string | Descrição breve (até 200 caracteres) | `"Valida CPF"` | `""` |
| `author` | string | Autor ou organização | `"Acme Corp"` | (nenhum) |
| `ui` | string | Tipo de interface (atalho) | `"webview"` | (nenhum) |
| `shared` | array | Arquivos compartilhados para webview | `["sdk.js", "theme.css"]` | (nenhum) |
| `min_toolbox_version` | string | Versão mínima do Toolbox (Semver) | `"1.5.0"` | (nenhum) |
| `capabilities` | array | Capacidades requeridas (futuro) | `["clipboard"]` | (nenhum) |
| `permissions` | object | Permissões de acesso (futuro) | `{"files": ["/temp"]}` | (nenhum) |
| `os` | array | Sistemas operacionais suportados (futuro) | `["windows", "macos"]` | (nenhum) |

### Campos Não Permitidos em `plugin.json` Local

- `id` — Derivado automaticamente do nome do diretório
- `icon` — Apenas no catálogo remoto
- `tags` — Apenas no catálogo remoto
- `download_url` — Apenas no catálogo remoto
- `command` — Apenas no catálogo remoto

---

## Validações

### Obrigatórios

- ✅ `name`: não pode estar vazio, máximo 50 caracteres
- ✅ `version`: deve ser semver válido (ex: 1.0.0, 1.0, 1.0.0-beta)
- ✅ `language`: deve ser um de: `python`, `node`, `rust`, `exe`, `webview`
- ✅ `entry`: não pode estar vazio, deve ser caminho relativo válido

### Opcionais

- ✅ `min_toolbox_version`: se presente, deve ser semver válido
- ✅ `ui`: se `"webview"`, conflita com `language != "webview"` (erro se ambos)
- ✅ `shared`: apenas para plugins webview
- ✅ `capabilities`: futuro; valores aceitos: `clipboard`, `filesystem`, `network`

### Comportamento em Caso de Erro

Quando um campo é inválido, o Toolbox:

1. **Log:** Registra o erro detalhado em `logs/toolbox.log`
2. **UI:** Exibe mensagem acionável ao usuário
3. **Execução:** Continua (plugins existentes) ou bloqueia (novos)

Exemplo de mensagem:

```
Erro ao carregar plugin 'meu-plugin':
  - version: '1.a.0' não é semver válida (esperado: 1.0.0)
  - language: 'java' não suportada. Use: python|node|rust|exe|webview
```

---

## Exemplos

### Exemplo Mínimo (Python CLI)

**Arquivo:** `plugins/validador-cpf/plugin.json`

```json
{
  "name": "validador-cpf",
  "version": "1.0.0",
  "language": "python",
  "entry": "main.py"
}
```

**Entrypoint:** `plugins/validador-cpf/main.py`

```python
#!/usr/bin/env python3
import sys

if __name__ == "__main__":
    cpf = sys.argv[1] if len(sys.argv) > 1 else ""
    print(f"CPF: {cpf} - Válido" if len(cpf) == 11 else f"CPF: {cpf} - Inválido")
```

### Exemplo Completo (Python com UI)

**Arquivo:** `plugins/meu-app/plugin.json`

```json
{
  "name": "meu-app",
  "version": "2.1.0",
  "description": "Aplicação de análise de dados com interface gráfica",
  "author": "Acme Corporation",
  "language": "python",
  "entry": "main.py",
  "min_toolbox_version": "1.5.0",
  "capabilities": ["clipboard"],
  "os": ["windows", "macos", "linux"]
}
```

### Exemplo: Plugin Webview

**Arquivo:** `plugins/dashboard/plugin.json`

```json
{
  "name": "dashboard",
  "version": "3.0.0",
  "description": "Dashboard interativo",
  "author": "DevTeam",
  "language": "webview",
  "entry": "dist/index.html",
  "shared": ["sdk.js", "theme.css", "components.css"],
  "min_toolbox_version": "2.0.0",
  "capabilities": ["clipboard", "filesystem"],
  "os": ["windows", "macos", "linux"]
}
```

**Estrutura de diretório:**

```
plugins/dashboard/
├── plugin.json
├── src/
│   └── index.tsx
├── dist/
│   ├── index.html
│   ├── sdk.js
│   ├── theme.css
│   └── components.css
└── package.json
```

### Exemplo: Plugin Node.js

**Arquivo:** `plugins/gerador-relatorio/plugin.json`

```json
{
  "name": "gerador-relatorio",
  "version": "1.5.0",
  "description": "Gera relatórios em PDF e Excel",
  "language": "node",
  "entry": "index.js",
  "min_toolbox_version": "1.8.0"
}
```

---

## Compatibilidade Retroativa

### Plugins Antigos (v1.0)

Plugins existentes sem alguns campos opcionais continuarão funcionando:

```json
{
  "name": "plugin-antigo",
  "version": "1.0.0",
  "language": "python",
  "entry": "main.py"
  // description, author, etc. são opcionais
}
```

### Migração Gradual

1. **v1.0 (atual):** Novos campos são opcionais; plugins antigos aceitos
2. **v1.5:** Warnings em logs para plugins sem campos recomendados
3. **v2.0:** Todos os campos obrigatórios; migração forçada

---

## Linguagens Suportadas

| Linguagem | Entrypoint | Pré-requisitos | Observações |
|-----------|-----------|--------|-------------|
| `python` | `main.py` | Python 3.8+ | Mais comum; ótimo para CLI + UI (Tkinter) |
| `node` | `index.js` | Node.js 14+ | Para plugins que precisam de npm |
| `rust` | `plugin.exe` (Windows) | Binário compilado | Performance; distribuição de binário pré-compilado |
| `exe` | `plugin.exe` | Executável Windows | Qualquer linguagem; binário externo |
| `webview` | `dist/index.html` | HTML + CSS + JS | Interface integrada ao Toolbox (futuro) |

---

## Capacidades (Futuro - v2.0)

Capacidades declaradas permitem que o Toolbox controle acesso a recursos:

```json
{
  "capabilities": ["clipboard", "filesystem", "network"]
}
```

**Valores possíveis:**

| Capacidade | Descrição | Implementação |
|-----------|-----------|----------------|
| `clipboard` | Acesso ao clipboard | Permitido com confirmação do usuário |
| `filesystem` | Acesso ao sistema de arquivos | Sandbox de diretórios |
| `network` | Acesso a rede / internet | Proxy e validação de SSL |
| (futuro) | | |

---

## Permissões (Futuro - v2.0)

Permissões detalhadas permitem acesso seletivo a recursos:

```json
{
  "permissions": {
    "files": ["/tmp", "/home/user/Documents"],
    "network": ["https://api.example.com"]
  }
}
```

---

## Versionamento do Contrato

### Versão Atual

- **Versão:** 1
- **Data:** 2026-08-11
- **Status:** ✅ Estável

### Histórico

| Versão | Data | Mudanças |
|--------|------|----------|
| 1 | 2026-08-11 | Versão inicial com suporte a Python, Node, Rust, exe e webview (futuro) |
| (futuro) 2 | TBD | Capacidades e permissões obrigatórias |

---

## Referência: Tipos Rust

```rust
pub struct PluginManifest {
    // Obrigatórios
    pub name: String,
    pub version: String,
    pub language: String,  // python|node|rust|exe|webview
    pub entry: String,
    
    // Opcionais
    pub description: Option<String>,
    pub author: Option<String>,
    pub ui: Option<String>,
    pub shared: Option<Vec<String>>,
    pub min_toolbox_version: Option<String>,
    pub capabilities: Option<Vec<String>>,
    pub permissions: Option<HashMap<String, Vec<String>>>,
    pub os: Option<Vec<String>>,
}

impl PluginManifest {
    pub fn validate(&self) -> Vec<String> { /* ... */ }
    pub fn is_webview(&self) -> bool { /* ... */ }
    pub fn webview_entry(&self) -> Option<PathBuf> { /* ... */ }
}
```

---

## FAQ

### P: Posso usar `id` em `plugin.json`?
**R:** Não. O `id` é derivado automaticamente do nome do diretório. O campo em `plugin.json` é ignorado.

### P: Qual é a diferença entre `name` e `ui`?
**R:** 
- `name`: Nome do plugin (obrigatório)
- `ui`: Tipo de interface (opcional). Se `"webview"`, indica que o plugin tem interface integrada.

### P: Como faço um plugin webview?
**R:** 
```json
{
  "name": "meu-dashboard",
  "language": "webview",
  "entry": "dist/index.html",
  "shared": ["sdk.js", "theme.css"]
}
```

### P: Preciso de `min_toolbox_version`?
**R:** Opcional. Use se seu plugin requer recursos de uma versão específica do Toolbox.

### P: Como suportar múltiplos SO?
**R:** Use o campo `os`:
```json
{
  "os": ["windows", "macos", "linux"]
}
```

---

## Próximos Passos

1. ✅ Contrato publicado
2. ➡️ Atualizar todos os `plugin.json` existentes
3. ➡️ Adicionar campos opcionais recomendados (author, description, os)
4. ➡️ Implementar validação de capacidades (v1.5)
5. ➡️ Enforce obrigatório (v2.0)

---

**Documento:** Plugin Contract v1  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Uso  
**Última Atualização:** 2026-08-11
