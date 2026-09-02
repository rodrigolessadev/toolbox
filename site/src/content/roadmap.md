---
title: "Roadmap do Toolbox"
description: "Funcionalidades entregues recentemente e próximos passos do ecossistema Toolbox."
---

Esta página reúne o histórico de **funcionalidades entregues recentemente** e os **próximos passos planejados** para a evolução contínua do Toolbox.

---

## ✅ Funcionalidades Entregues Recentemente

### 1. Ecossistema & Marketplace
- **Marketplace de Plugins Integrado:** Download, instalação, atualização e desinstalação de plugins oficiais em 1 clique via catálogo remoto (`catalog.json`).
- **Hub de Release Automatizado (`toolbox-release`):** Quality gates, verificação de integridade e publicação automatizada no GitHub Releases.
- **Padrão Oficial Material Design 3:** Unificação visual de todos os plugins com `pywebview` e tokens compartilhados (`toolbox-tokens`).

### 2. Segurança & Armazenamento
- **Cofre Seguro (Safe) & Hub KeePassXC:** Criptografia ponta a ponta (Argon2id + AES-256-GCM), autenticação biométrica via Windows Hello com proteção reforçada de hardware (`DPP1:`) e sincronização em tempo real com KeePassXC Desktop.
- **Banco de Dados Central SQLite com FTS5:** Migração completa da persistência para `%APPDATA%\com.toolbox.desktop\toolbox.db` com busca textual ultrarrápida e histórico estruturado.
- **Exportação Criptografada (SafePack):** Backup seguro de dados com derivação de chave de alta entropia.

### 3. Integração de Sistema & Produtividade
- **Logon AWS SSO & Túneis SSM:** Fluxo One-Click Connect com status dinâmico na barra de tarefas e na bandeja do Windows (*System Tray*).
- **Visualizador de Markdown (GFM):** Editor com múltiplas abas, retenção de sessão (*Hot Exit*), live watch e renderização aprimorada de código aninhado.
- **Novo Ticket & Extrator de Logs:** Criação padronizada de chamados e recorte temporal inteligente de logs massivos.

---

## 🎯 Próximos Passos & Em Desenvolvimento

### Conforto & Customização
- **Atalhos Globais Customizáveis:** Permitir ao usuário redefinir a combinação de teclas principal além do padrão `Ctrl + Space`.
- **Agrupamento de Comandos:** Organizar atalhos em grupos/pastas (ex.: Trabalho, QA, Pessoal, Infraestrutura).
- **Modo Barra Compacta:** Opção de fixar uma barra de busca minimalista na tela.

### Automações & Produtividade
- **Workflows Encadeados:** Executar sequências de comandos encadeados (ex.: conectar túnel AWS -> abrir DBeaver -> abrir chamados).
- **Snippets de Texto:** Expansão rápida de textos e templates na área de transferência.
- **Agendamento de Tarefas Locais:** Execução periódica de rotinas de limpeza ou sincronização.

### Nuvem & Distribuição
- **Sincronização Híbrida em Nuvem:** Backup cifrado opcional para Google Cloud Storage ou OneDrive.
- **Empacotamento Multiplataforma:** Suporte oficial e empacotamento para distribuições Linux e macOS.
