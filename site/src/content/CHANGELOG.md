# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [1.0.0] - 2026-07-16

### Adicionado

- Backend Tauri 2 + Rust com 17 comandos IPC
- Frontend React + TypeScript com:
  - Campo de busca com autocomplete e atalhos (↑/↓/Enter/Esc)
  - Abas: Todos, Favoritos, Plugins, Links, Apps, Histórico
  - Modal de cadastro de comandos (3 abas: Plugin, Link, Aplicativo)
  - Modal de configurações (importar/exportar JSON, abrir pastas)
  - Tema claro e escuro com persistência em `localStorage`
  - Toasts para feedback
- Persistência atômica em `commands.json` e `logs/history.json`
- Sistema de plugins com descoberta dinâmica via `walkdir`
- Plugins de exemplo:
  - `cpf` — validador e gerador de CPF (Tkinter)
  - `gerador-json` — gerador de dados mock (Tkinter)
  - `_template` — ponto de partida para novos plugins
- Suporte multi-linguagem para plugins: Python, Node, Rust, binário
- Atalhos globais (`Ctrl+Space` para abrir/fechar)
- Auto-hide ao perder foco
- Logs em `logs/toolbox.log` com `env_logger` + sink customizado
- Importação e exportação de `commands.json`
- Sistema de favoritos
- Sistema de histórico (últimos 100 comandos)
- Documentação: `README.md`, `docs/ARCHITECTURE.md`, `docs/PLUGIN_GUIDE.md`, `docs/FUTURE.md`

### Segurança

- Plugins rodam em processos isolados (não derrubam a toolbox)
- Validação de `path`/`url` no cadastro de comandos
- Mensagens de erro amigáveis via `AppError`
