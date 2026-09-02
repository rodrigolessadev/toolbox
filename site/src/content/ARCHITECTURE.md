---
title: "Como o Toolbox funciona"
description: "Entenda a arquitetura moderna do Toolbox, persistência central e execução de plugins."
---

O **Toolbox** é uma plataforma de produtividade e lançador inteligente (*launcher*) projetado especificamente para Windows com arquitetura moderna baseada em **Tauri v2**, **Rust** de alta performance, frontend em **React + TypeScript** e um ecossistema modular de plugins em **Python + pywebview**.

---

## 🏛️ As Três Camadas Arquiteturais

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| **Core & Shell Nativo** | Rust + Tauri v2 | Gerencia janelas transparentes, atalhos globais (`Ctrl+Space`), IPC seguro, ciclo de vida do processo e motor de banco de dados SQLite. |
| **Interface do Usuário** | React + TypeScript + Vite | Barra de busca instantânea com fuzzy-search, navegação por abas, modal de Marketplace e alternância de temas Material Design 3. |
| **Ecossistema de Plugins** | Python + pywebview | Aplicações e utilitários especializados com bridge assíncrona (`pywebview.api`) rodando em processos isolados e seguros. |

---

## 🗄️ Estrutura de Diretórios no Sistema Operacional

Quando instalado, o Toolbox centraliza todos os seus arquivos, logs e banco de dados no caminho padrão:

```text
%APPDATA%\com.toolbox.desktop\
├── toolbox.db              ← Banco de dados central SQLite com FTS5 (comandos, histórico, segredos)
├── logs\                   ← Logs de diagnóstico rotativos (toolbox.log, safe.log, etc.)
└── plugins\                ← Plugins instalados localmente a partir do Marketplace
    ├── safe\
    ├── markdown-viewer\
    ├── novo-ticket\
    └── logon-aws\
```

---

## ⚡ Fluxo de Execução de um Comando

Quando você abre o Toolbox (`Ctrl + Space`), digita um termo e pressiona `Enter`:

1. **Busca e Ranqueamento:** O motor de busca em Rust consulta o índice FTS5 no SQLite e filtra comandos por nome, alias e tags.
2. **Identificação do Tipo:** O executor identifica se o alvo é um **Link Web**, **Aplicativo Local** ou **Plugin**.
3. **Despacho Assíncrono:**
   - **Link:** Aberto no navegador padrão através da API do SO.
   - **Aplicativo:** Executado via processo filho nativo (`std::process::Command`).
   - **Plugin:** O runtime Python inicia o `main.py` do plugin com sua interface gráfica dedicada.
4. **Registro no Histórico:** A execução é persistida no `toolbox.db` para compor as estatísticas de uso e atalhos recentes.

---

## 🏬 Descoberta e Ciclo de Vida de Plugins

O Toolbox integra um **Marketplace nativo**:
- Ao abrir a aba Marketplace, o app consulta o `catalog.json` oficial hospedado no GitHub Releases.
- A instalação ou atualização realiza o download do `.zip`, valida a integridade do pacote e o descompacta diretamente em `%APPDATA%\com.toolbox.desktop\plugins\`.
- O novo plugin fica disponível imediatamente na barra de comandos, sem necessidade de reiniciar a aplicação.

---

## 🚀 Próximos Passos

- [Como cadastrar comandos e usar o Marketplace](/docs/commands)
- [Guia de Desenvolvimento de Plugins](/docs/plugins)
- [Roadmap do Projeto](/docs/roadmap)
