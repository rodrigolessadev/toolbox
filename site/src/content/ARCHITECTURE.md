# Arquitetura

## Visão geral

```
┌──────────────────────────────────────────────────────────────┐
│                       Frontend (WebView2)                    │
│                                                              │
│  React + TypeScript                                          │
│  ├── App.tsx          ── Estado global + atalhos            │
│  ├── components/      ── CommandInput, Modais, Toasts        │
│  ├── hooks/           ── useCommands, useTheme, useToasts    │
│  └── lib/api.ts       ── Wrappers para invoke()              │
│                                                              │
└────────────────────────────┬─────────────────────────────────┘
                             │ IPC (invoke / events)
┌────────────────────────────▼─────────────────────────────────┐
│                    Backend Rust (Tauri)                      │
│                                                              │
│  main.rs / lib.rs  ── bootstrap + registro de plugins        │
│  ├── commands_store ── persistência atômica de commands.json │
│  ├── plugins        ── descoberta dinâmica + spawn de plugins│
│  ├── executor       ── roteamento (Plugin | Link | App)      │
│  ├── history        ── últimos 100 comandos                  │
│  ├── logger         ── logs em arquivo                       │
│  ├── models         ── tipos compartilhados                  │
│  ├── paths          ── resolução de diretórios               │
│  └── error          ── AppError com mensagens amigáveis      │
│                                                              │
└────────────────────────────┬─────────────────────────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        ▼                    ▼                     ▼
  commands.json          plugins/              Windows
  (BTreeMap JSON)        ├── cpf/              ├── Shell
                         ├── gerador-json/     ├── Browser
                         └── _template/        └── File System
```

## Fluxo de execução de um comando

1. Usuário digita no `CommandInput` e pressiona Enter.
2. `App.tsx` filtra a lista de comandos por nome/url/path e seleciona o ativo.
3. Frontend chama `api.executeCommand(name)`.
4. `execute_command` no Rust:
   - Recupera `CommandEntry` do `CommandsStore`.
   - Encaminha para o `CommandExecutor` apropriado.
   - `Plugin` → `PluginManager::execute` (spawn).
   - `Link` → `tauri-plugin-opener::open_url`.
   - `Application` → `std::process::Command::new(path).spawn()`.
5. Sucesso → registra em `HistoryStore`.
6. Frontend recebe a mensagem e exibe um toast.

## Persistência

- `commands.json` é lido uma vez no startup e mantido em memória (`parking_lot::RwLock`).
- Cada modificação é serializada e gravada via **escrita atômica** (`.tmp` + `rename`).
- O mesmo padrão é usado em `history.json`.

## Threads / Concorrência

- Tauri spawna cada comando IPC em uma task Tokio.
- O acesso ao `CommandsStore` é feito com `RwLock` para múltiplos leitores.
- O `PluginManager` é imutável e clonado por valor (internamente tudo é `Arc`).

## Plugins

- **Descoberta dinâmica**: `PluginManager::discover_all()` percorre `plugins/` e lê `plugin.json` de cada subdiretório. Hot-reload basta reiniciar o app.
- **Execução isolada**: cada plugin é um processo independente; falhas não derrubam a toolbox.
- **Multi-linguagem**: `python` (com fallback `py`), `node`, `rust` (binário pré-compilado), `exe` (binário Windows).
- **Comunicação**: via argumentos de linha de comando (simples) — expansível futuramente para stdin/stdout JSON-RPC.

## Atalhos globais

- `tauri-plugin-global-shortcut` registra `Ctrl+Space` no setup.
- O handler alterna `show`/`hide` da janela `main`.
- Para trocar o atalho, edite `src-tauri/src/lib.rs` na função `run()`.

## Tema

- CSS custom properties em `global.css`.
- `useTheme` hook persiste a escolha em `localStorage` e aplica `data-theme` em `<html>`.
- O tema do sistema é detectado em primeira execução.

## Próximos passos

Veja [FUTURE.md](FUTURE.md) para um roadmap completo.
