---
id: "har-kibana-planner"
name: "HAR Kibana Planner"
description: "Gera planos de consulta determinísticos no Elasticsearch/Kibana a partir de arquivos HAR 1.2."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "har-kibana-planner"
icon: "network"
tags: ["har-kibana-planner", "kibana", "elasticsearch", "logs"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/har-kibana-planner-1.0.0/har-kibana-planner.zip"
updated_at: "2026-08-18"
---

# 🌐 HAR Kibana Planner

O **HAR Kibana Planner** analisa arquivos de tráfego de rede **HAR (HTTP Archive)** gravados no DevTools do navegador e constrói planos de consulta determinísticos e prontos para uso no **Kibana Discover** e no **Elasticsearch**.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `har-kibana-planner` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Como Exportar o Arquivo HAR no Navegador
1. No Google Chrome, Edge ou Firefox, abra a página onde ocorreu a lentidão ou erro.
2. Pressione `F12` para abrir as Ferramentas do Desenvolvedor e vá até a aba **Rede** (Network).
3. Reproduza a ação com erro e clique no botão de exportar: **Salvar todos como HAR com conteúdo** (Save all as HAR with content).

### 2. Importar o HAR no Plugin
1. No plugin **HAR Kibana Planner**, clique no botão **📁 Selecionar Arquivo HAR** e escolha o arquivo `.har` salvo.
2. O plugin analisará automaticamente todas as entradas de requisições, identificando endpoints, códigos de status HTTP (200, 404, 500), tempos de resposta e identificadores de correlação (ex: `correlationId`, `traceId`, `x-request-id`).

### 3. Gerar Consultas para o Kibana
1. Selecione os filtros desejados (ex: apenas requisições com status `>= 400` ou tempo `> 1000ms`).
2. Clique no botão **Gerar Plano de Consulta**.
3. O plugin fornecerá:
   - A query formatada em **KQL (Kibana Query Language)** para colar na barra de busca do Kibana.
   - A consulta **Elasticsearch DSL (JSON)** para o Dev Tools Console.
   - O intervalo de datas exato (`time range`) para ajustar no filtro de tempo do Kibana.
4. Clique em **Copiar Consulta** e cole no seu Kibana.

---

## 💡 Dicas Úteis

> [!TIP]
> **Identificação Rápida de Gargalos**: As requisições que demoraram mais tempo são destacadas no topo do relatório com seu respectivo tempo em milissegundos.
