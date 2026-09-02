---
id: "novo-ticket"
name: "Novo Ticket"
description: "Criação de tickets (CLIENTE_TICKET) e extrator temporal de logs com interface moderna pywebview e tema dark oficial."
version: "1.6.0"
author: "Rodrigo Lessa"
language: "python"
command: "novo-ticket"
icon: "ticket"
tags: ["ticket", "atendimento", "suporte", "diretorio", "logs", "filtro", "utilidade"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/novo-ticket-1.6.0/novo-ticket.zip"
updated_at: "2026-08-28"
---

# 🎫 Novo Ticket & Extrator Temporal de Logs

O **Novo Ticket** automatiza a criação padronizada de diretórios de atendimento técnico no formato `CLIENTE_TICKET`, além de integrar um extrator inteligente de logs por intervalo temporal para análise rápida de incidentes e chamados de suporte.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `novo-ticket` e pressione `Enter`.

---

## 📖 Principais Funcionalidades

### 1. Criação Padronizada de Pastas de Atendimento
- Criação instantânea da hierarquia de diretórios com nomenclatura canônica:
  ```text
  C:\tickets\CLIENTE_NUMERODOTICKET\
  ├── logs\
  ├── evidencias\
  └── analise.md
  ```
- Gera automaticamente o arquivo de template `analise.md` pré-formatado com seções de contexto, causa raiz, logs analisados e plano de ação.

### 2. Extrator Temporal de Logs
- Filtre arquivos de log massivos informando data/hora inicial e final do incidente.
- Extrai apenas as linhas e stacktraces ocorridas na janela do problema, reduzindo arquivos de gigabytes para poucos megabytes focados.
- Salvamento automático do log recortado diretamente dentro da pasta `logs/` do chamado.

### 3. Integração com o Explorer do Windows
- Abertura com 1 clique do diretório recém-criado no Explorador de Arquivos ou no VS Code.
- Cópia do caminho absoluto para a área de transferência com feedback visual imediato.
