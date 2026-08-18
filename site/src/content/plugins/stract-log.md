---
id: "stract-log"
name: "Stract Log"
description: "Filtra e extrai blocos de log por nível, parâmetro adicional e regra de recorrência (mais recente / mais antiga). Salva o resultado em um arquivo .log ao lado do original."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "stract-log"
icon: "filter"
tags: ["log", "suporte", "filtro", "análise"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/stract-log-1.0.0/stract-log.zip"
updated_at: "2026-08-18"
---

# 🔍 Stract Log (Filtro e Extrator de Logs)

O **Stract Log** analisa arquivos de log extensos (dezenas ou centenas de megabytes), filtrando blocos de eventos por nível de severidade (ERROR, WARN, INFO, DEBUG) e palavras-chave, gerando um novo arquivo consolidado e preservando o log original.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `stract-log` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Seleção do Arquivo de Log
1. No campo **Arquivo de Log**, clique no botão **📁 Procurar** e selecione o seu arquivo `.log` ou `.txt`.

### 2. Configuração dos Filtros
1. No campo **Nível de Log**, selecione a severidade desejada:
   - `ERROR`: Apenas erros e exceções de sistema.
   - `WARN`: Alertas e avisos.
   - `INFO`: Mensagens informativas.
   - `TODOS`: Todos os níveis.
2. No campo **Filtro de Texto / Palavra-Chave**, digite termos específicos que o bloco deve conter (ex: `NullPointerException`, `Timeout` ou `ID_USUARIO`).
3. No campo **Regra de Recorrência**:
   - **Todas as Ocorrências**: Extrai todas as entradas que atendem aos filtros.
   - **Mais Recente**: Mantém apenas a última ocorrência de cada erro repetido.
   - **Mais Antiga**: Mantém apenas a primeira ocorrência do incidente.

### 3. Processamento e Abertura
1. Clique no botão **Filtrar e Extrair**.
2. O plugin processará o log e criará um novo arquivo no mesmo diretório (ex: `app.filtered.log`).
3. Uma notificação exibirá a quantidade de blocos encontrados. Clique em **Abrir Arquivo** para inspecionar no Bloco de Notas ou VS Code.

---

## 💡 Dicas Úteis

> [!NOTE]
> **Segurança do Arquivo Original**: O arquivo de log original **nunca é modificado ou sobrescrito**. O plugin sempre gera uma cópia limpa filtrada.
