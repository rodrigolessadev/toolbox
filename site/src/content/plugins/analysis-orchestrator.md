---
id: "analysis-orchestrator"
name: "Analysis Orchestrator"
description: "Orquestra a análise ponta a ponta executando sanitização, filtragem, otimização, timeline e evidências."
version: "1.0.1"
author: "Rodrigo Lessa"
language: "python"
command: "analysis-orchestrator"
icon: "workflow"
tags: ["logs", "har", "timeline", "orchestrator", "incident"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/analysis-orchestrator-1.0.1/analysis-orchestrator.zip"
updated_at: "2026-08-18"
---

# ⚡ Analysis Orchestrator

O **Analysis Orchestrator** é um pipeline automatizado de ponta a ponta para investigação e diagnóstico de incidentes em sistemas corporativos. Ele executa sequencialmente a sanitização de dados sensíveis, filtragem de ruído, otimização de logs, reconstrução de timeline e compilação de dossiê de evidências.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `analysis-orchestrator` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Selecionar os Arquivos de Entrada
1. No campo **Diretório / Arquivos de Entrada**, selecione a pasta ou os arquivos coletados do incidente (arquivos `.log`, `.har`, dumps de erro ou payloads JSON).

### 2. Configurar as Etapas da Pipeline
Marque as etapas que deseja executar na análise:
- [x] **Sanitização de Dados (LGPD/Segurança)**: Mascara senhas, tokens JWT, cartões e CPFs antes de processar.
- [x] **Filtragem de Ruído**: Remove logs redundantes de healthcheck e polling repetitivo.
- [x] **Otimização & Agrupamento**: Agrupa exceções com mesma assinatura estrutural.
- [x] **Reconstrução de Timeline**: Ordena todos os eventos cronologicamente segundo o fuso horário correto.
- [x] **Dossiê de Evidências**: Gera um arquivo consolidado em Markdown/HTML pronto para anexar no chamado/issue.

### 3. Executar e Visualizar Relatório
1. Clique no botão **Executar Pipeline de Análise**.
2. Acompanhe a barra de progresso em tempo real para cada uma das etapas.
3. Ao concluir, clique em **Visualizar Relatório** ou **Exportar Pacote de Evidências (.zip)**.

---

## 💡 Dicas Úteis & Boas Práticas

> [!TIP]
> **Privacidade Garantida**: A etapa de sanitização roda localmente antes de qualquer geração de relatório, garantindo total conformidade com privacidade de dados.
