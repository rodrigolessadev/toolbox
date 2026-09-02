---
id: "safe"
name: "Cofre Seguro (Safe)"
description: "Cofre de senhas e Hub de integração com KeePassXC Desktop com criptografia ponta a ponta e API para outros plugins."
version: "1.10.3"
author: "Rodrigo Lessa"
language: "python"
command: "safe"
icon: "shield-check"
tags: ["segurança", "senhas", "cofre", "criptografia", "keepassxc", "windows hello", "vault"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/safe-1.10.3/safe.zip"
updated_at: "2026-09-02"
---

# 🛡️ Cofre Seguro (Safe) & Hub KeePassXC

O **Cofre Seguro (Safe)** é o gerenciador local de credenciais, segredos e certificados do ecossistema **Toolbox**. Ele combina criptografia de nível militar com integração transparente com o **KeePassXC Desktop** e autenticação biométrica via **Windows Hello**.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `safe` e pressione `Enter`.

---

## 🔒 Arquitetura de Segurança & Criptografia

O Safe adota o princípio *Zero-Knowledge* e proteção em múltiplas camadas:

- **Derivação de Chaves:** **Argon2id** (64 MB de memória, 3 iterações, 4 threads em paralelo) ou PBKDF2 como contingência.
- **Criptografia em Repouso:** **AES-256-GCM** autenticado com vetor de inicialização (IV) de 96 bits e tag de autenticação de 128 bits.
- **Biometria Windows Hello:** Autenticação nativa com `UserConsentVerifier` e envelope reforçado `DPP1:` vinculado a sal criptográfico de hardware/sessão do SO.
- **Zeroização em Memória:** As chaves mestras e payloads sensíveis são mantidos em `bytearray` protegidos e sobrescritos com zeros (`zeroize`) imediatamente após o bloqueio ou encerramento.
- **Banco de Dados Central:** Persistência no SQLite Central do Toolbox (`%APPDATA%\com.toolbox.desktop\toolbox.db`), sem criação de bancos avulsos.

---

## 📖 Principais Funcionalidades

### 1. Hub de Integração com KeePassXC
- Conexão bidirecional via protocolo nativo KeePassXC Browser API (`keepassxc-proxy`).
- Troca de chaves efêmeras via **Curve25519** e mensagens cifradas com **ChaCha20-Poly1305**.
- Consulta em tempo real aos bancos de dados do KeePassXC diretamente na busca do Toolbox.

### 2. Autenticação Híbrida & Windows Hello
- Desbloqueie o cofre instantaneamente com biometria facial, impressão digital ou PIN do Windows.
- Suporte a foco de primeiro plano e handle de janela nativo (`HWND`).
- Contingência garantida por Senha Mestra em qualquer situação.

### 3. Importação Universal de Credenciais
- Importe seus dados facilmente de múltiplos formatos com detecção automática de encoding (UTF-8, UTF-16, Windows-1252):
  - 📄 **XML** (Microsoft Safe / KeePass XML)
  - 📊 **CSV** (delimitado por vírgula ou ponto-e-vírgula)
  - 📝 **TXT** (estruturado em pares Chave: Valor)
  - 🗄️ **JSON** (schema export / SafePack)
- Pré-visualização com detecção de duplicidades e políticas de conflito (*Sobrescrever*, *Duplicar*, *Ignorar*).

### 4. Proteção de Área de Transferência & Auto-Bloqueio
- Cópia segura de senhas para o clipboard com limpeza automática após tempo configurável (15s, 30s, 60s).
- Bloqueio automático por inatividade e ao bloquear a sessão do Windows (`Win + L`).

---

## 💡 Boas Práticas & Dicas

> [!TIP]
> **Backup Criptografado:** Utilize a função de exportação **SafePack** para gerar backups cifrados das suas credenciais com chave de alta entropia.
