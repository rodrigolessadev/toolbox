---
id: "logon-aws"
name: "Logon AWS & Port Forwarding"
description: "Logon AWS SSO no navegador padrão e túneis SSM com fluxo One-Click Connect e ícone dinâmico na barra de tarefas."
version: "1.3.6"
author: "Rodrigo Lessa"
language: "python"
command: "logon-aws"
icon: "cloud-cog"
tags: ["aws", "ssm", "sso", "tunnel", "port-forwarding", "database"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/logon-aws-1.3.6/logon-aws.zip"
updated_at: "2026-08-31"
---

# ☁️ Logon AWS & Port Forwarding (SSM)

O **Logon AWS & Port Forwarding** simplifica a autenticação corporativa via **AWS IAM Identity Center (SSO)** e o gerenciamento de túneis seguros via **AWS Systems Manager (SSM)** para acesso direto a bancos de dados privados (RDS, Aurora, DocumentDB) e instâncias EC2.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `logon-aws` e pressione `Enter`.

---

## 📖 Principais Funcionalidades

### 1. Logon AWS SSO no Navegador Padrão
- Inicie a sessão SSO sem precisar abrir o terminal nem digitar comandos manuais (`aws sso login`).
- O plugin aciona automaticamente o fluxo OAuth no seu navegador padrão e monitora a expiração do token STS em tempo real.

### 2. Fluxo One-Click Connect
- Conecte instantaneamente a túneis configurados previamente: o plugin valida se a sessão SSO está ativa, realiza o login automático se necessário e inicia o encaminhamento de portas (`port-forwarding`) em uma única ação.

### 3. Ícone Dinâmico na Barra de Tarefas & Bandeja
- O ícone do plugin na barra de tarefas e na bandeja do Windows (*System Tray*) reflete o estado dos túneis:
  - 🟢 **Verde:** Túnel ativo e pronto para tráfego local.
  - 🟡 **Amarelo:** Estabelecendo conexão ou autenticando SSO.
  - ⚪ **Cinza:** Desconectado / Inativo.

### 4. Encerramento Limpo de Processos
- Ao fechar a janela ou clicar em "Desconectar", todas as árvores de processos `aws.exe` e `session-manager-plugin.exe` são finalizadas de forma graciosa, liberando as portas locais imediatamente.
