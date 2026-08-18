---
id: "converter-data"
name: "Converter Data"
description: "Converte data e hora para número serial Excel/Lotus e vice-versa."
version: "1.0.1"
author: "Rodrigo Lessa"
language: "python"
command: "converter-data"
icon: "calendar-sync"
tags: ["excel", "data", "conversão", "utilidade"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/converter-data-1.0.1/converter-data.zip"
updated_at: "2026-08-18"
---

# 📅 Conversor de Data e Serial Excel

O **Converter Data** realiza a conversão bidirecional entre datas/horas civis convencionais e o formato de **Número Serial do Excel** (base `30/12/1899`), muito utilizado em integrações de banco de dados, relatórios e fórmulas de planilhas.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `converter-data` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Converter Data e Hora para Serial Excel
1. No campo **Data**, digite a data desejada no formato `AAAA-MM-DD` (ex: `2026-08-18`).
2. No campo **Hora**, digite o horário no formato `HH:MM` (ex: `14:30`).
3. O número serial correspondente (ex: `46252.604167`) é gerado automaticamente no quadro inferior.
4. Clique em cima do número serial ou no botão **Copiar** para transferi-lo para a Área de Transferência.

### 2. Converter Serial Excel de Volta para Data e Hora
1. Caso você tenha um número serial (ex: `45500.5`), cole-o no campo **Número Serial**.
2. Clique no botão **Converter para Data**.
3. Os campos **Data** e **Hora** serão atualizados instantaneamente com o valor legível correspondente.

---

## 💡 Dicas Úteis & Como Evitar Erros

> [!TIP]
> **Data Padrão**: Ao abrir a tela, o plugin já vem pré-preenchido com a data e horário atual do seu computador, permitindo obter o serial de hoje em 1 segundo.

> [!WARNING]
> Certifique-se de usar o formato `AAAA-MM-DD` com 4 dígitos no ano para evitar interpretações ambíguas de século.
