---
id: "gerador-marcacoes"
name: "Gerador de Marcações SQL"
description: "Gera INSERTs SQL para a tabela R070ACC compatíveis com SQL Server e Oracle. Suporta campos opcionais dinâmicos, múltiplos horários e intervalo de datas."
version: "2.5.0"
author: "Rodrigo Lessa"
language: "python"
command: "gerador-marcacoes"
icon: "database"
tags: ["sql", "banco de dados", "insert"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-marcacoes-2.5.0/gerador-marcacoes.zip"
updated_at: "2026-08-25"
---

# 🗄️ Gerador de Marcações SQL (R070ACC)

O **Gerador de Marcações SQL** cria scripts de inserção em lote (`INSERT INTO R070ACC`) compatíveis com bancos de dados **SQL Server** e **Oracle**, agilizando a simulação de marcações de ponto para testes em sistemas de RH e controle de ponto.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `gerador-marcacoes` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Identificação do Colaborador
1. No campo **Empresa (NUMEMP)**, informe o código numérico da empresa (ex: `1`).
2. No campo **Tipo de Colaborador (TIPCOL)**, informe o tipo (ex: `1` para Empregado, `2` para Terceiro, `3` para Parceiro).
3. No campo **Cadastro (NUMCAD)**, informe o número de matrícula do colaborador (ex: `1001`).

### 2. Período e Horários de Marcação
1. No campo **Data Início**, preencha a data inicial no formato `DD/MM/AAAA`.
2. No campo **Data Fim**, preencha a data final do período.
3. No campo **Horários de Marcação**, liste os horários diários separados por vírgula (ex: `08:00, 12:00, 13:00, 18:00`).

### 3. Seleção do Dialeto de Banco de Dados
- Selecione a opção correspondente ao seu ambiente:
  - 🔵 **SQL Server**: Gera datas com `CONVERT(DATETIME, 'YYYY-MM-DD...', 120)`.
  - 🟠 **Oracle**: Gera datas com `TO_DATE('YYYY-MM-DD...', 'YYYY-MM-DD HH24:MI:SS')`.

### 4. Geração do Script
1. Clique no botão **Gerar Script SQL**.
2. O script completo de `INSERT` será apresentado no editor de texto inferior.
3. Clique em **Copiar Script** para colar no SQL Server Management Studio (SSMS), DBeaver ou PL/SQL Developer.

---

## 💡 Dicas Úteis & Como Evitar Erros

> [!NOTE]
> **Dias Úteis**: O gerador preenche as marcações dia a dia respeitando o intervalo de datas informado.
