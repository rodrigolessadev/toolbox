---
id: "gerador-afd"
name: "Gerador de AFD"
description: "Gera arquivo AFD (Arquivo de Fonte de Dados) no padrão REP-C com CRC16. Suporta múltiplos colaboradores, horários e intervalo de datas."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "gerador-afd"
icon: "fingerprint"
tags: ["rh", "ponto", "afd", "rep"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-afd-1.0.0/gerador-afd.zip"
updated_at: "2026-08-18"
---

# 🖨️ Gerador de Arquivo AFD (REP-C)

O **Gerador de AFD** cria arquivos de espelho de ponto eletrônico no formato oficial **AFD (Arquivo de Fonte de Dados)** conforme a regulamentação do MTE (Portaria 671 / REP-C), incluindo cálculo correto de CRC16 e totalizadores.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `gerador-afd` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Dados da Empresa (Cabeçalho - Registro Tipo 1)
1. No campo **CNPJ/CPF Empregador**, informe o documento da empresa (somente números, 14 dígitos para CNPJ ou 11 para CPF).
2. No campo **Razão Social**, informe a razão social da empresa (até 150 caracteres).
3. No campo **Nº Fabricação REP**, informe o número de série do relógio de ponto (17 dígitos).

### 2. Período e Colaboradores (Marcações - Registro Tipo 3)
1. No campo **Data Inicial**, informe a data de início do período (ex: `01/08/2026`).
2. No campo **Data Final**, informe a data de término do período (ex: `15/08/2026`).
3. No campo **PIS dos Colaboradores**, digite ou cole os números de PIS (um por linha, 11 dígitos cada).
4. No campo **Horários**, defina as batidas diárias separadas por vírgula (ex: `08:00, 12:00, 13:00, 18:00`).

### 3. Geração e Exportação
1. Clique no botão **Gerar Arquivo AFD**.
2. A pré-visualização completa do arquivo será gerada na tela, contendo:
   - Registro `1` (Cabeçalho).
   - Registros `3` sequenciais numerados com NSR contínuo.
   - Registro `9` (Trailer com totalizadores de registros e hash CRC16).
3. Clique em **Salvar Arquivo (.txt)** para gravar no seu computador ou em **Copiar** para a área de transferência.

---

## 💡 Dicas Úteis & Como Evitar Erros

> [!IMPORTANT]
> **Validação de PIS**: Certifique-se de que os números de PIS tenham 11 dígitos numéricos. Caracteres não numéricos serão removidos automaticamente.
