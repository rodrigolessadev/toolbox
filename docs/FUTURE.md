# Roadmap de Evolução — Toolbox

Visão de melhorias, itens implementados e próximos passos para o ecossistema.

---

## 🧩 Plugins & Marketplace

- [x] **Marketplace Oficial** — Instalação, atualização e remoção com 1 clique a partir do catálogo remoto (`toolbox-plugins`). *(Entregue)*
- [x] **Verificação de Integridade** — Validação SHA-256 e proteção Zip Slip na extração. *(Entregue)*
- [x] **Comunicação IPC** — Suporte a STDIN/STDOUT JSON e interfaces Pywebview com tema sincronizado. *(Entregue)*
- [ ] **Hot-reload de plugins** — Detectar mudanças em `plugins/` via file watcher sem reiniciar a aplicação.
- [ ] **Permissionamento granular** — `permissions.json` por plugin para controle de acesso ao sistema de arquivos/rede.
- [ ] **Plugins WASM** — Execução de plugins sandboxed com `wasmtime` no backend.

---

## ⚡ Comandos & Sistema

- [x] **Indexação Dinâmica do PATH** — Busca instantânea de executáveis do sistema operacional. *(Entregue)*
- [x] **Elevação de Privilégios (Admin / UAC)** — Execução com direitos administrativos via atalho dedicado. *(Entregue)*
- [x] **Persistência & Cache SQLite** — Inicialização ultrarrápida do cache de comandos e preferências em banco local. *(Entregue)*
- [ ] **Fuzzy search avançada** — Algoritmo tolerante a pequenos erros de digitação e typos.
- [ ] **Workflows encadeados** — Encadeamento de múltiplos comandos sequenciais.
- [ ] **Snippets & Aliases expandíveis** — Autocomplete de macros e expansão de texto.

---

## 🎨 UI/UX & Plataforma

- [x] **Design System Acessível (Material 3)** — Temas Claro, Escuro e Alto Contraste com WCAG AA. *(Entregue)*
- [x] **Configurações & Backup** — Backup do banco SQLite e chaves mestras. *(Entregue)*
- [ ] **System Tray** — Ícone na bandeja do sistema com menu de contexto e inicialização oculta.
- [ ] **Auto-update** — `tauri-plugin-updater` para atualizações automáticas silenciosas via GitHub Releases.
- [ ] **Suporte Multiplataforma (Linux & macOS)** — Pacotes AppImage e DMG testados e homologados.

---

## 🤖 Inteligência & Automação

- [ ] **Toolbox com IA** — Interpretação de linguagem natural para busca inteligente de ferramentas e automações.
- [ ] **API Local REST / WebSockets** — Integração com agentes externos e IDEs para automação de tarefas.

