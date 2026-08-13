# Inventário de Modernização de Plugins — Análise Estrutural Completa

**Data:** 2026-08-11  
**Versão:** 1.0.0  
**Status:** Relatório Inicial — Sem Implementações

---

## Sumário Executivo

Este documento consolida a análise estrutural do Toolbox, identificando:
- Arquitetura atual de plugins e descoberta dinâmica
- Contrato de plugin (plugin.json)
- Sistema de temas e tokens visuais
- Comparação entre implementações (Toolbox vs KapiNote equivalentes)
- Duplicações, divergências e riscos de compatibilidade
- Testes e lacunas de cobertura

---

## 1. Arquitetura Atual do Toolbox

### 1.1 Visão Geral

```
┌───────────────────────────────────────────────────────────────┐
│              Frontend (Tauri WebView2 - React)                │
│  - React 18 + TypeScript                                      │
│  - useTheme hook (tema light/dark em localStorage)            │
│  - Componentes: CommandInput, HistoryPanel, SettingsModal      │
│  - CSS com design tokens (global.css)                         │
└────────────────────┬────────────────────────────────────────┘
                     │ IPC (invoke/events)
┌────────────────────▼────────────────────────────────────────┐
│             Backend (Tauri 2 + Rust)                         │
│  - main.rs / lib.rs: bootstrap e registro de plugins         │
│  - commands_store.rs: persistência de commands.json          │
│  - executor.rs: roteamento (Plugin|Link|App)                 │
│  - marketplace.rs: descoberta e instalação de plugins        │
│  - plugin.rs: definição de PluginManifest                    │
│  - paths.rs: resolução de diretórios + tema                 │
│  - history.rs: rastreamento de últimas execuções             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   commands.json  plugins/    Windows (Shell/Apps)
   (BTreeMap)     (Python,    
                   Node.js,
                   Rust binaries)
```

### 1.2 Componentes Principais

| Componente | Linguagem | Responsabilidade |
|-----------|-----------|------------------|
| **Frontend** | React 18 + TypeScript | Interface de usuário, gerenciamento de estado local, persistência de tema |
| **Backend** | Rust (Tauri 2) | IPC, descoberta de plugins, execução, persistência, marketplace |
| **Plugins** | Python 3.x, Node.js, Rust (binários) | Lógica específica de cada ferramenta |
| **Catálogo** | JSON (remoto) | Metadados de plugins disponíveis |

---

## 2. Sistema de Descoberta e Registro de Plugins

### 2.1 Fluxo de Descoberta Dinâmica

1. **Na inicialização:**
   - Tauri chama `executor::list_plugins()` (Rust)
   - Percorre `plugins/` recursivamente
   - Para cada subdiretório, lê `plugin.json`
   - Validação básica (obrigatoriamente: `id`, `name`, `version`, `language`, `entry`)

2. **Em tempo de execução:**
   - Usuario digita comando no `CommandInput`
   - Frontend filtra lista em `commands.json`
   - Ao pressionar Enter, `invoke("execute_command", {name})` é chamado
   - Backend localiza o comando em `CommandsStore` e decide o tipo:
     - **Plugin** → `executor::run_plugin()` (spawn do entrypoint)
     - **Link** → `tauri-plugin-opener::open_url()`
     - **Application** → `std::process::Command::new()`

3. **Hot-reload:**
   - Não suportado; requer reinicialização da aplicação

### 2.2 Estrutura de Diretórios

```
plugins/
├── calc-jornadas/
│   ├── plugin.json
│   └── main.py
├── converter-data/
│   ├── plugin.json
│   └── main.py
├── cpf/
│   ├── main.py
│   └── README.md          ⚠️ SEM plugin.json
├── gerador-afd/
│   ├── plugin.json
│   └── main.py
├── gerador-json/
│   └── README.md          ⚠️ SEM plugin.json, SEM main.py
├── gerador-marcacoes/
│   ├── plugin.json
│   └── main.py
├── stract-json/
│   ├── plugin.json
│   └── main.py
└── _template/             ← Template base para novos plugins
    └── [estrutura padrão]
```

### 2.3 Contrato de Plugin: plugin.json

**Localização:** `plugins/{plugin-id}/plugin.json`

**Esquema (Rust - plugin.rs):**

```rust
pub struct PluginManifest {
    pub id: String,                          // Identificador único
    pub name: String,                        // Nome exibido
    pub version: String,                     // Semver
    pub description: Option<String>,         // Descrição breve
    pub language: String,                    // python|node|binary|webview
    pub ui: Option<String>,                  // "webview" (atalho)
    pub entry: Option<String>,               // main.py|dist/index.html
    pub shared: Option<Vec<String>>,         // [sdk.js, theme.css, components.css]
    pub min_toolbox_version: Option<String>, // Versão mínima do Toolbox
}
```

**Exemplo mínimo:**

```json
{
  "name": "Stract JSON",
  "version": "1.0.0",
  "description": "Extrai valores de um campo específico de um JSON colado.",
  "language": "python",
  "entry": "main.py"
}
```

**Campos obrigatórios em plugin.json:**
- ✅ `name`
- ✅ `version`
- ✅ `language`
- ✅ `entry` (ou `ui: "webview"` para webview)

**Campos opcionais:**
- `description`
- `author` (mencionado no guia, não está em plugin.rs)
- `ui`
- `shared`
- `min_toolbox_version`

⚠️ **Lacuna identificada:** Dois plugins (`cpf`, `gerador-json`) não têm `plugin.json`; não são detectados pela descoberta dinâmica.

---

## 3. Sistema de Temas e Tokens Visuais

### 3.1 Arquitetura de Tema

**Frontend (React):**
- `useTheme()` hook em `src/hooks/useTheme.ts`
- Estado local (`useState`)
- Persiste em `localStorage` com chave `toolbox:theme`
- Aplica atributo `data-theme` no elemento `<html>`

**Backend (Rust):**
- `paths::get_theme()` e `paths::set_theme()` em `src-tauri/src/paths.rs`
- Atualmente retornam sempre `"dark"` e `Ok(())` (stub)
- Não há persistência real no backend

**Estilos:**
- `src/styles/global.css` define dois temas via CSS custom properties

### 3.2 Design Tokens

#### Tema Light (padrão `:root`)

```css
--bg:           #f4f5f8;           /* Fundo primário */
--bg-elev:      #ffffff;           /* Superfícies elevadas */
--bg-elev-2:    #f0f1f5;           /* Superfícies menos elevadas */
--fg:           #0e1116;           /* Texto primário */
--fg-muted:     #5a6270;           /* Texto secundário */
--border:       #e3e6ec;           /* Bordas */
--input-bg:     #ffffff;           /* Fundo de inputs */
--input-border: #d4d8e0;           /* Borda de inputs */
--accent:       #3a7bff;           /* Cor de ação primária */
--accent-soft:  rgba(58, 123, 255, 0.12);
--danger:       #e5484d;           /* Vermelho */
--warning:      #f5a524;           /* Amarelo/Laranja */
--success:      #30a46c;           /* Verde */
--shadow:       0 8px 24px rgba(0, 0, 0, 0.08);
--radius:       10px;              /* Raio de borda padrão */
--tr:           120ms ease;        /* Transição padrão */
```

#### Tema Dark (`[data-theme="dark"]`)

```css
--bg:           #0e1014;           /* Fundo primário (escuro) */
--bg-elev:      #161a21;           /* Superfícies elevadas */
--bg-elev-2:    #1f242d;           /* Superfícies menos elevadas */
--fg:           #f0f2f5;           /* Texto primário (claro) */
--fg-muted:     #8b94a3;           /* Texto secundário (muted) */
--border:       #262c36;           /* Bordas (escuras) */
--input-bg:     #0e1014;
--input-border: #262c36;
--accent:       #6aa3ff;           /* Azul mais brilhante */
--accent-soft:  rgba(106, 163, 255, 0.16);
--danger:       #ff6369;           /* Vermelho mais brilhante */
--warning:      #f5a524;           /* (mesmo do light) */
--success:      #4cc38a;           /* Verde mais brilhante */
--shadow:       0 12px 32px rgba(0, 0, 0, 0.5);
```

### 3.3 Aplicação de Temas em Plugins (Python)

Todos os plugins Python atualmente usam hardcoded de cores em modo escuro, replicando os tokens acima:

```python
DARK = {
    "bg":       "#161a21",
    "bg2":      "#1f242d",
    "fg":       "#f0f2f5",
    "muted":    "#8b94a3",
    "border":   "#262c36",
    "accent":   "#6aa3ff",
    "success":  "#4cc38a",
    "danger":   "#ff6369",
    "input_bg": "#0e1014",
}
```

⚠️ **Lacuna identificada:**
- Tema light não é suportado em nenhum dos plugins Python
- Tokens não são centralizados; duplicados em cada plugin
- Necessário mecanismo para passar tema do Toolbox aos plugins

---

## 4. Inventário de Plugins

### 4.1 Plugins Atuais

| ID | Nome | Versão | Linguagem | Entrypoint | Status | Observações |
|----|------|--------|-----------|-----------|--------|-------------|
| **calc-jornadas** | Calculadora de Jornadas | 1.0.2 | Python | main.py | ✅ OK | Porta do KapiNote, tema escuro |
| **converter-data** | Converter Data | 1.0.0 | Python | main.py | ✅ OK | Porta do KapiNote, tema escuro |
| **cpf** | Validação CPF | — | Python | main.py | ⚠️ SEM plugin.json | Não detectado dinamicamente |
| **gerador-afd** | Gerador de AFD | 1.0.0 | Python | main.py | ✅ OK | Porta do KapiNote, tema escuro |
| **gerador-json** | Gerador JSON | — | — | — | ❌ INCOMPLETO | Sem plugin.json, sem main.py |
| **gerador-marcacoes** | Gerador de Marcações | 1.1.0 | Python | main.py | ✅ OK | Porta do KapiNote, tema escuro |
| **stract-json** | Stract JSON | 1.0.0 | Python | main.py | ✅ OK | Porta do KapiNote, tema escuro |

### 4.2 Gráfico de Comunidades (Graphify)

A análise de dependências identificou **11 comunidades** de código:

| ID | Nome | Tamanho | Linguagem | Coesão | Descrição |
|----|------|---------|-----------|--------|-----------|
| 1 | `calc-jornadas-hora` | 63 nós | Python | 0.3557 | Plugin: Calculadora de Jornadas |
| 2 | `converter-data-excel` | 4 nós | Python | 0.0128 | Plugin: Converter Data |
| 3 | `cpf-cpf` | 9 nós | Python | 0.1711 | Plugin: Validação CPF |
| 4 | `gerador-afd-pad` | 18 nós | Python | 0.2018 | Plugin: Gerador AFD |
| 5 | `gerador-marcacoes-sql` | 17 nós | Python | 0.1084 | Plugin: Gerador de Marcações |
| 6 | `stract-json-extract` | 5 nós | Python | 0.0463 | Plugin: Stract JSON |
| 7 | `components-theme` | 14 nós | TypeScript | 0.1774 | Sistema de tema do Toolbox |
| 8 | `src-plugin` | 84 nós | Rust | 0.0803 | Backend: plugin.rs, executor.rs, marketplace.rs, etc. |
| 9 | `src-open` | 12 nós | TSX | 0.0235 | App frontend: App.tsx, Toolbox.tsx |
| 10 | `components-handle` | 42 nós | TSX | 0.0577 | Componentes: CommandInput, Modais |
| 11 | `hooks-use` | 5 nós | TypeScript | 0.0 | Hooks: useTheme, useCommands |

**Dependências críticas:**
- `src-open` → `components-handle` (6 CALLS)
- `src-open` → `hooks-use` (2 CALLS)

---

## 5. Análise Comparativa: Toolbox vs KapiNote

### 5.1 Matriz de Implementações Equivalentes

| Ferramenta | KapiNote | Toolbox | Status | Divergências |
|-----------|----------|---------|--------|--------------|
| **Stract JSON** | `json-stract-modal.tsx` | `stract-json/main.py` | ✅ Portado | Lógica idêntica; UI em Tkinter |
| **Converter Data** | `date-time-modal.tsx` | `converter-data/main.py` | ✅ Portado | Lógica idêntica; UI em Tkinter |
| **Gerador de Marcações** | `insert/page.tsx` + `insert-builder.ts` | `gerador-marcacoes/main.py` | ✅ Portado | Lógica idêntica; UI em Tkinter; v1.1.0 com campos opcionais |
| **Gerador de AFD** | `afd/page.tsx` + `afd-builder.ts` | `gerador-afd/main.py` | ✅ Portado | Lógica idêntica; UI em Tkinter |
| **Calc Jornadas** | `jornada/page.tsx` + `jornada-calc.ts` | `calc-jornadas/main.py` | ✅ Portado | Lógica idêntica; UI em Tkinter |
| **CPF** | — | `cpf/main.py` | ✅ Toolbox only | Validação e geração de CPF |
| **Gerador JSON** | — | `gerador-json/` | ❌ Incompleto | Sem implementação |

### 5.2 Detalhes de Cada Ferramenta

#### 5.2.1 Stract JSON

**KapiNote (`json-stract-modal.tsx`):**
- Entradas: JSON (texto colado), campo a extrair
- Saídas: Lista de valores encontrados
- Validações: JSON válido
- Acesso a recursos: Clipboard (implícito ao colar)

**Toolbox (`stract-json/main.py`):**
- Entradas: JSON (textarea), campo a extrair (text input)
- Saídas: Lista em scrolled text
- Validações: JSON válido (try/except)
- Acesso a recursos: Clipboard (via tkinter root.clipboard_get())

**Divergências:**
- ✅ Lógica de extração é **idêntica**
- Suporte a objeto `colaborador` aninhado é **idêntico**
- UI: Modal React vs Janela Tkinter
- Tema: Hardcoded no Tkinter

#### 5.2.2 Converter Data

**KapiNote (`date-time-modal.tsx`):**
- Entradas: Data (YYYY-MM-DD), Hora (HH:MM)
- Saídas: Serial Excel/Lotus
- Validações: Data e hora válidas
- Acesso a recursos: Clipboard

**Toolbox (`converter-data/main.py`):**
- Entradas: Data (picker ou texto), Hora (picker ou texto)
- Saídas: Serial em campo text
- Validações: Data e hora válidas
- Acesso a recursos: Clipboard (via Tkinter)

**Divergências:**
- ✅ Cálculo base date (30/12/1899) é **idêntico**
- ✅ Precisão (5 casas decimais) é **idêntica**
- UI: Modal React vs Janela Tkinter com date/time pickers

#### 5.2.3 Gerador de Marcações

**KapiNote (`insert/page.tsx` + `insert-builder.ts`):**
- Entradas: NUMCRA, intervalo de datas, horários (múltiplos), campos dinâmicos
- Saídas: INSERTs SQL para R070ACC
- Validações: Campos obrigatórios, tipos numéricos
- Regras: Filtro por dias da semana, suporte a campos opcionais

**Toolbox (`gerador-marcacoes/main.py` v1.1.0):**
- Entradas: NUMCRA, intervalo de datas, horários (múltiplos), campos dinâmicos
- Saídas: INSERTs SQL para R070ACC
- Validações: Idem KapiNote
- Regras: Idem KapiNote; combobox para seleção de campos opcionais

**Divergências:**
- ✅ Lógica de geração SQL é **idêntica**
- ✅ Suporte a campos dinâmicos é **idêntico** (v1.1.0)
- UI: Modal React vs Janela Tkinter com Treeview

#### 5.2.4 Gerador de AFD

**KapiNote (`afd/page.tsx` + `afd-builder.ts`):**
- Entradas: Dados estruturados em matriz
- Saídas: Arquivo AFD (binário ou texto encodado)
- Validações: Campos obrigatórios
- Cálculo: CRC16 para integridade

**Toolbox (`gerador-afd/main.py`):**
- Entradas: Dados em matriz (Tkinter)
- Saídas: Arquivo AFD
- Validações: Idem KapiNote
- Cálculo: CRC16 idêntico

**Divergências:**
- ✅ Algoritmo CRC16 é **idêntico**
- ✅ Formato AFD é **idêntico**

#### 5.2.5 Calc Jornadas

**KapiNote (`jornada/page.tsx` + `jornada-calc.ts`):**
- Entradas: Jornadas (entrada, saída), parâmetros de noturno
- Saídas: Horas normais, noturnas, noturnas reduzidas
- Validações: Horários válidos
- Regras: Noturno reduzido = noturno × 52.5/60

**Toolbox (`calc-jornadas/main.py`):**
- Entradas: Idem KapiNote
- Saídas: Idem KapiNote
- Validações: Idem KapiNote
- Regras: Idem KapiNote; máscara automática HH:MM

**Divergências:**
- ✅ Lógica de cálculo é **idêntica**
- UI: Modal React vs Janela Tkinter com Treeview editável

---

## 6. Riscos de Compatibilidade e Divergências

### 6.1 Problemas Críticos

| ID | Problema | Severidade | Impacto | Solução Proposta |
|----|----------|-----------|--------|------------------|
| **P1** | `cpf` e `gerador-json` sem `plugin.json` | 🔴 CRÍTICA | Não são detectados dinamicamente | Criar plugin.json mínimos |
| **P2** | Tema hardcoded em Python (escuro) | 🟠 ALTA | Sem suporte a light, sem sincronização com Toolbox | Implementar mecanismo de tema passado ao plugin |
| **P3** | Tokens de tema duplicados | 🟡 MÉDIA | Manutenção difícil, inconsistências | Centralizar tokens em arquivo único |
| **P4** | Backend `get_theme()` e `set_theme()` são stubs | 🟡 MÉDIA | Tema não é persistido no backend | Implementar persistência (arquivo JSON) |
| **P5** | Gerador JSON incompleto | 🔴 CRÍTICA | Não funciona | Implementar ou remover |
| **P6** | Sem testes automatizados para plugins | 🟡 MÉDIA | Difícil garantir equivalência funcional | Adicionar testes para lógica crítica |
| **P7** | Sem suporte a webview em plugin.json | 🟡 MÉDIA | Não há plugins webview atuais | Estrutura suporta; documentação deficiente |

### 6.2 Divergências Funcionais

| Divergência | KapiNote | Toolbox | Recomendação |
|-------------|----------|---------|---|
| **Interface** | React Modal | Tkinter | Manter separação; adicionar suporte a webview futuramente |
| **Tema** | Sincronizado (Redux + CSS) | Hardcoded em Python | Passar tema como variável de ambiente ou argumento |
| **Acesso a Clipboard** | React/Browser API | Tkinter ou CLI com `pyperclip` | Padronizar em Python com biblioteca comum |
| **Atualização de UI** | Reativa (React) | Imperativa (Tkinter) | Manter; não requer mudança imediata |

### 6.3 Impedimentos à Reutilização

Nenhum impedimento crítico identificado. As implementações Python são:
- **Independentes** de UI específica (lógica pura)
- **Portáveis** a qualquer plataforma com Python 3.x
- **Testáveis** sem dependências de GUI

---

## 7. Testes Existentes e Lacunas

### 7.1 Cobertura de Testes

| Componente | Testes | Status | Lacuna |
|-----------|--------|--------|--------|
| Backend Rust | Mínimos | ⚠️ PARCIAL | Sem testes de integração |
| Frontend React | Nenhum | ❌ FALTA | Toda cobertura |
| Plugins Python | Nenhum | ❌ FALTA | Lógica crítica sem validação |
| Executor/Marketplace | Nenhum | ❌ FALTA | Fluxo de execução não testado |

### 7.2 Testes Recomendados

1. **Plugins Python:**
   - `test_stract_json.py`: Extração de campo em JSON aninhado
   - `test_converter_data.py`: Conversão de serial Excel
   - `test_gerador_marcacoes.py`: Geração de INSERT SQL
   - `test_gerador_afd.py`: Cálculo de CRC16
   - `test_calc_jornadas.py`: Cálculo de noturno reduzido

2. **Backend Rust:**
   - `test_plugin_discovery()`: Descoberta dinâmica
   - `test_plugin_execution()`: Spawn e espera
   - `test_commands_store()`: Persistência atômica

3. **Frontend React:**
   - `test_useTheme()`: Persistência em localStorage
   - `test_CommandInput()`: Roteamento de execução

---

## 8. Arquivos Não Devem Ser Alterados Nesta Fase

- ✅ `src-tauri/Cargo.toml` — dependências Rust estáveis
- ✅ `tauri.conf.json` — configuração geral da app
- ✅ `package.json` — dependências Node.js
- ✅ `src-tauri/src/main.rs` — setup de janela (alterar com cuidado)
- ✅ `.github/workflows/` — CI/CD

---

## 9. Mapa de Dependências (Graphify)

### 9.1 Grafo de Importações Críticas

```
src-tauri/src/
├── lib.rs                    [CORE - setup]
│   └── main()
│       ├── executor.rs::run_plugin()
│       ├── marketplace.rs::fetch_catalog()
│       ├── commands_store.rs::CommandsStore::new()
│       ├── history.rs::HistoryStore::new()
│       └── paths.rs::get_theme()
│
├── executor.rs               [CRITICA - execução]
│   ├── run_plugin(plugin_id, args)
│   │   └── PluginManager::discover_all()
│   │       └── plugin.rs::PluginManifest
│   ├── run_link(url)
│   └── run_application(path, args)
│
├── marketplace.rs            [CRITICA - catálogo]
│   ├── fetch_catalog()
│   │   └── HTTP GET CATALOG_URL
│   ├── install_plugin(id, url)
│   ├── remove_plugin(id)
│   └── list_installed_plugins()
│
├── commands_store.rs         [CRITICA - persistência]
│   └── CommandsStore::save()
│       └── Atomic write (tmp + rename)
│
└── plugin.rs                 [CRITICA - contrato]
    └── PluginManifest::is_webview()

src/
├── App.tsx                   [CORE - UI]
│   ├── useTheme() hook
│   ├── useCommands() hook
│   └── CommandInput component
│
├── hooks/useTheme.ts         [CRITICA - tema]
│   └── localStorage::getItem("toolbox:theme")
│
└── components/               [DEPENDENTES]
    ├── CommandInput.tsx
    ├── HistoryPanel.tsx
    └── SettingsModal.tsx
```

### 9.2 Fluxos de Execução

**Fluxo 1: Executar Plugin**
```
CommandInput (React)
  → invoke("execute_command", {name})
    → executor::execute_command()
      → CommandsStore::get(name)
      → match command.kind:
          Plugin → executor::run_plugin()
            → PluginManager::discover_all()
              → read plugin.json
              → spawn process
```

**Fluxo 2: Trocar Tema**
```
ThemeToggle (React)
  → setTheme("dark"|"light")
    → useTheme() effect
      → document.documentElement.dataset.theme = theme
      → localStorage.setItem("toolbox:theme", theme)
      → invoke("set_theme", {theme})  [STUB - não faz nada]
```

**Fluxo 3: Instalar Plugin**
```
InstallPluginModal (React)
  → invoke("install_plugin", {plugin_id, url})
    → marketplace::install_plugin()
      → download_plugin_zip(url)
      → extract_to_plugins/
      → marketplace::list_installed_plugins()
        → return [InstalledPlugin]
```

---

## 10. Proposta de Ordem de Migração

### Fase 1: Preparação (Etapas 2-4)
1. **Definir contrato evolutivo** (Etapa 2)
   - Estender `plugin.json` com campos obrigatórios: `id`, `author`, `icon`
   - Definir versionamento de contrato
   
2. **Modernizar design system** (Etapa 3)
   - Centralizar tokens em `src/styles/tokens.ts`
   - Implementar persistência de tema no backend
   - Suportar light/dark/high-contrast
   
3. **Criar componentes visuais** (Etapa 4)
   - Biblioteca de componentes reutilizáveis
   - Suporte a tema passado aos plugins

### Fase 2: Modernização de Plugins (Etapas 5-7)
4. **Extrair lógica do KapiNote** (Etapa 5)
   - Modularizar lógica em `shared/`
   - Criar módulos Python reutilizáveis
   
5. **Empacotar plugins** (Etapa 6)
   - Criar `plugin.json` para `cpf` e `gerador-json`
   - Implementar `gerador-json` completo
   
6. **Padronizar UI legada** (Etapa 7)
   - Aplicar tema passado aos plugins existentes
   - Suporte a light/dark em Tkinter

### Fase 3: Integração (Etapas 8-11)
7. **Definir protocolo** (Etapa 8)
   - JSON-RPC ou similar para plugins webview
   - Comunicação assíncrona com Toolbox
   
8. **Migrar Stract JSON** (Etapa 9)
   - Converter para webview (React + componentes compartilhados)
   - Executar como componente integrado
   
9. **Migrar demais ferramentas** (Etapa 10)
   - Converter outras ferramentas para webview gradualmente

### Fase 4: Finalização (Etapas 12-14)
10. **Validação de segurança** (Etapa 11)
11. **Testes e release** (Etapa 12)

---

## 11. Lista de Arquivos a Serem Modificados (Próximas Etapas)

### Fase 1: Design System + Contrato
- [ ] `docs/PLUGIN_GUIDE.md` — atualizar contrato
- [ ] `src/styles/global.css` — tokens centralizados
- [ ] `src/styles/tokens.ts` — novo arquivo
- [ ] `src-tauri/src/plugin.rs` — estender PluginManifest
- [ ] `src-tauri/src/paths.rs` — implementar persistência de tema
- [ ] `plugins/*/plugin.json` — adicionar campos obrigatórios

### Fase 2: Plugins
- [ ] `plugins/cpf/plugin.json` — criar
- [ ] `plugins/gerador-json/*` — completar implementação
- [ ] `plugins/stract-json/main.py` — aplicar tema
- [ ] `plugins/converter-data/main.py` — aplicar tema
- [ ] `plugins/gerador-afd/main.py` — aplicar tema
- [ ] `plugins/gerador-marcacoes/main.py` — aplicar tema
- [ ] `plugins/calc-jornadas/main.py` — aplicar tema

### Fase 3: Integração
- [ ] `src-tauri/src/executor.rs` — suporte a webview
- [ ] `src-tauri/src/commands.rs` — novo protocolo
- [ ] `docs/ARCHITECTURE.md` — atualizar fluxos

---

## 12. Riscos Remanescentes

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| **Incompatibilidade Python 3.x** | 🟢 BAIXA | 🔴 CRÍTICO | Testar em Python 3.8+ |
| **Mudanças de tema em tempo de execução não sincronizam** | 🟡 MÉDIA | 🟡 MÉDIO | Implementar event listener no backend |
| **Performance de plugins legados (Tkinter)** | 🟡 MÉDIA | 🟡 MÉDIO | Perfil em produção; considerar migração gradual |
| **Segurança de plugins externos** | 🟡 MÉDIA | 🔴 CRÍTICO | Sandbox + validação de assinatura (futura) |
| **Hot-reload não suportado** | 🟢 BAIXA | 🟡 MÉDIO | Documentar; planejar para v2.0 |

---

## 13. Decisões Técnicas Registradas

1. **Manter Python para plugins atuais**
   - ✅ Razão: Compatibilidade com KapiNote, zero dependências externas
   - ⚠️ Tradeoff: UI com Tkinter é legada; migração gradual para webview

2. **Frontend React mantém theme em localStorage**
   - ✅ Razão: Funciona offline, sem dependência de backend
   - ⚠️ Tradeoff: Sincronização manual necessária

3. **Plugins Python não receberão tema via argumento (v1)**
   - ✅ Razão: Compatibilidade com versão atual
   - ⚠️ Tradeoff: Hardcoding necessário; resolver em Etapa 7

4. **Usar Tkinter para webview de plugins**
   - ✅ Razão: Compatibilidade com plugins atuais
   - ⚠️ Tradeoff: Não é verdadeiro webview; considerar migração posterior

---

## 14. Lacunas Conhecidas

| Lacuna | Impacto | Investigação Proposta |
|--------|--------|----------------------|
| `gerador-json` não tem `main.py` | 🔴 Bloqueia uso | Revisar README, recuperar código-fonte ou reimplementar |
| Sem mecanismo de tema para Python | 🟡 Design inconsistente | Definir protocolo em Etapa 3 |
| Marketplace não valida assinaturas | 🟠 Segurança | Planejar para Etapa 11 |
| Sem versionamento de contrato de plugin | 🟡 Evolução difícil | Definir em Etapa 2 |
| Sem testes e2e para plugins | 🟡 Qualidade | Implementar framework de testes |

---

## 15. Próximos Passos Imediatos

1. ✅ **Etapa 1 concluída:** Inventário e análise estrutural
2. ➡️ **Etapa 2:** Definir contrato evolutivo de plugins (Prompt 2)
3. ➡️ **Etapa 3:** Modernizar design system (Prompt 3)
4. ➡️ **Etapa 4:** Criar componentes visuais (Prompt 4)

---

**Relatório Preparado Por:** Sistema de Coordenação (Graphify + Análise Manual)  
**Data de Conclusão:** 2026-08-11T12:51:45  
**Status:** ✅ PRONTO PARA REVISÃO E APROVAÇÃO DA ETAPA 2
