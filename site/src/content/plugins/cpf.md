---
id: "cpf"
name: "Validador de CPF"
description: "Valida e gera CPFs com interface gráfica. Suporta formatação automática e cópia para área de transferência."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "cpf"
icon: "id-card"
tags: ["utilidade", "cpf", "validação"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/cpf-1.0.0/cpf.zip"
updated_at: "2026-08-18"
---

# 🪪 Validador & Gerador de CPF

O **Validador de CPF** é uma ferramenta rápida e prática para verificar se um número de CPF é matematicamente válido ou gerar novos números de CPF válidos para testes e desenvolvimento de software.

---

## 🚀 Como Abrir o Plugin

1. Abra o launcher do **Toolbox** pressionando `Ctrl + Space` (ou `Alt + Space`).
2. Digite `cpf` e pressione `Enter`.
3. A janela do Validador de CPF será exibida na tela.

---

## 📖 Guia Passo a Passo

### 1. Como Validar um CPF Existente
1. No campo **CPF**, digite ou cole o número do documento que deseja verificar (você pode digitar apenas os números ou com pontos e traço).
2. Clique no botão **Validar CPF** (ou pressione `Enter`).
3. Observe a mensagem logo abaixo do campo:
   - 🟢 **CPF Válido**: O número segue corretamente a regra dos dígitos verificadores.
   - 🔴 **CPF Inválido**: O número contém erro de digitação ou dígitos verificadores incorretos.

### 2. Como Gerar um Novo CPF Válido para Testes
1. Clique no botão **Gerar CPF**.
2. Um novo CPF válido será gerado instantaneamente no campo de texto.
3. O número gerado é copiado automaticamente para a sua **Área de Transferência** (Clipboard), pronto para você colar com `Ctrl + V` onde precisar.

---

## 💡 Dicas Úteis & Como Evitar Erros

> [!TIP]
> **Formatação Automática**: Não se preocupe em digitar pontos ou traços. O plugin aceita tanto `12345678909` quanto `123.456.789-09`.

> [!IMPORTANT]
> **Apenas para Testes e Homologação**: Os números gerados por esta ferramenta são calculados algoritmicamente para testes de validação em sistemas e não pertencem a pessoas reais.
