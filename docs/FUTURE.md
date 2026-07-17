# Roadmap de evolução

Sugestões de melhorias, organizadas por área.

## Plugins

- **Hot-reload de plugins** — detectar mudanças em `plugins/` via `notify` e re-descobrir.
- **Comunicação bidirecional** — stdin/stdout JSON-RPC para plugins poderem devolver resultados estruturados à toolbox.
- **Argumentos no cadastro** — campo `args` em `commands.json` passado ao plugin.
- **Variáveis de ambiente** — `env` por comando.
- **Permissionamento** — `permissions.json` por plugin para limitar o que ele pode fazer.
- **Marketplace** — instalar plugins de um repositório remoto via `toolbox-cli install <url>`.
- **Plugins WASM** — rodar plugins sandboxed usando `wasmtime` no backend.
- **Versões semânticas** — checar atualizações e mostrar "plugin desatualizado".

## UI/UX

- **Fuzzy search** — busca tolerante a erros de digitação.
- **Ações secundárias** — clique direito no comando para ações (editar, duplicar, remover).
- **Arrastar e soltar** — reordenar comandos; criar grupo/pasta.
- **Preview** — preview do link antes de abrir.
- **Notificações nativas** do Windows quando plugin termina.
- **Modo barra de tarefas** — fixar e mostrar apenas a barra de busca.
- **Configuração de atalho** — UI para trocar o `Ctrl+Space`.

## Plataforma

- **Linux e macOS** — `tauri.conf.json` já tem `appimage` e `dmg`. Falta testar e ajustar caminhos.
- **Auto-update** — `tauri-plugin-updater` apontando para um servidor estático (GitHub Releases, S3, etc.).
- **Instalador MSI com plugins pré-empacotados** — incluir `plugins/cpf` e `plugins/gerador-json` no bundle.
- **Tráfego HTTP** — `tauri-plugin-http` para plugins web.
- **System tray** — ícone na bandeja do Windows com menu de contexto.
- **Suporte a Windows 7/8** — `webview2-com` shim (não trivial).

## Produtividade

- **Snippets** — autocomplete que substitui texto por snippet ao pressionar Tab.
- **Aliases** — `g` = `google`, `gh` = `github`. Já funciona naturalmente.
- **Workflows** — encadear múltiplos comandos: `git pull && npm test`.
- **Tarefas agendadas** — executar comandos em horários definidos.
- **Macros** — gravar e reproduzir sequências.

## Persistência e dados

- **Sincronização na nuvem** — salvar `commands.json` em S3, Dropbox, etc.
- **Múltiplos perfis** — `commands.work.json` e `commands.home.json`.
- **Banco SQLite** — para histórico longo e busca.
- **Criptografia** — armazenar credenciais de plugins que precisam.

## Observabilidade

- **Métricas de uso** — `cmd -> contagem` no log.
- **Tracing estruturado** — `tracing` + `tracing-subscriber` para spans.
- **Crash reporting** — `sentry` com `sentry-tauri`.

## Segurança

- **Sandbox de plugins** — rodar plugins em `Job Objects` (Windows) com privilégios mínimos.
- **Confirmação de execução** — para comandos de aplicação com privilégios elevados, pedir confirmação.
- **Assinatura de plugins** — verificar hash SHA256 dos plugins carregados.

## Developer Experience

- **CLI** — `toolbox-cli add <name> --type=link --url=...` para adicionar comandos via terminal.
- **Devcontainer** — setup completo em `.devcontainer/`.
- **Hot-reload do frontend** — já funciona em `tauri:dev`.
- **Testes** — adicionar `vitest` (frontend) e `cargo test` (backend).
- **CI/CD** — GitHub Actions buildando MSI/AppImage/DMG em matriz.

## Ideias selvagens

- **Toolbox com IA** — interpretar linguagem natural: "abrir meu projeto Python favorito" → abrir VSCode em `~/code/awesome`.
- **Telemetria opcional** — compartilhar comandos mais usados anonimamente para sugerir novos.
- **Tema customizado** — usuário aponta para um CSS.
- **Plugin como API REST** — expor comandos via HTTP para integração com outros apps.
- **Gravador de voz** — comando por voz.
