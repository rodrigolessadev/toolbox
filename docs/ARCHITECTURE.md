# Arquitetura — Toolbox 2.0

## Visão Geral

O Toolbox é construído com arquitetura híbrida de alto desempenho utilizando **Tauri 2** (Rust no backend) e **React 18 + TypeScript** (frontend renderizado via WebView2 no Windows).

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (WebView2)                       │
│                                                              │
│  React 18 + TypeScript + Tailwind                            │
│  ├── App.tsx          ── Estado global, busca e atalhos      │
│  ├── components/      ── CommandInput, Modais, Marketplace,  │
│  │                       SettingsModal, ToastContainer       │
│  ├── hooks/           ── useCommands, useTheme, useToasts    │
│  └── lib/api.ts       ── IPC wrappers para invoke()          │
│                                                              │
└────────────────────────────┬─────────────────────────────────┘
                             │ IPC (Tauri invoke / events)
┌────────────────────────────▼─────────────────────────────────┐
│                    Backend Rust (Tauri)                      │
│                                                              │
│  lib.rs            ── Bootstrap & registro de comandos IPC   │
│  ├── commands_store── persistência JSON e gerenciamento      │
│  ├── system_commands─ indexação do PATH e execução UAC       │
│  ├── storage       ── cache e banco local em SQLite          │
│  ├── marketplace   ── download, SHA-256 e extração de plugins│
│  ├── executor      ── roteador de execução (Plugin/Link/App) │
│  ├── history       ── histórico de execuções                 │
│  └── paths         ── resolução de diretórios de dados/logs  │
│                                                              │
└────────────────────────────┬─────────────────────────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        ▼                    ▼                     ▼
  SQLite & JSON          plugins/              Windows OS
  (Cache & Configs)      (Extensões)           (PATH, UAC, Shell)
```

---

## Módulos do Backend (Rust)

1. **`commands_store.rs`**:
   - Mantém comandos e plugins cadastrados em memória com proteção de concorrência (`parking_lot::RwLock`).
   - Persistência com escrita atômica (`.tmp` + `rename`).

2. **`system_commands.rs`**:
   - Indexa executáveis presentes nas variáveis de ambiente do sistema (`PATH`), utilitários administrativos do Windows e ferramentas do sistema.
   - Suporte à execução padrão ou com privilégios elevados de Administrador (via Windows `runas` / UAC).

3. **`storage.rs` (SQLite)**:
   - Gerencia o banco local SQLite (`rusqlite`) para cache de inicialização rápida de comandos indexados e preferências do usuário.
   - Reduz o tempo de boot ao evitar reindexação completa de disco no startup.

4. **`marketplace.rs`**:
   - Conecta ao catálogo oficial de plugins remotos (`rodrigolessadev/toolbox-plugins`).
   - Realiza download, validação de integridade via checksum SHA-256 e extração segura (com proteção contra ataques de Zip Slip).

5. **`executor.rs`**:
   - Roteia a execução de comandos conforme o tipo (`Plugin`, `SystemCommand`, `Application`, `Link`).

---

## Fluxo de Execução de Comandos

1. O usuário abre a busca (`Ctrl + K`) e digita o termo desejado.
2. O frontend unifica e filtra plugins locais, modais integradas, comandos do sistema e atalhos.
3. Ao acionar o comando (ou pressionar `Ctrl + Shift + Enter` para Admin):
   - O frontend chama `api.executeCommand` ou `api.executeSystemCommand`.
   - O Rust valida e dispara o processo de forma assíncrona.
   - O histórico de execução é registrado.
   - O frontend recebe a confirmação e exibe toast de status.

---

## Segurança e Acessibilidade

- **Isolamento de Processos**: Plugins rodam em subprocessos independentes.
- **Validação de Arquivos**: O marketplace rejeita arquivos maliciosos ou entradas fora do diretório seguro.
- **Temas & WCAG**: Suporte a Claro, Escuro e Alto Contraste com conformidade de contraste visual.

---

## Próximos Passos & Roadmap

Consulte [`FUTURE.md`](./FUTURE.md) para o roadmap detalhado de evolução.

