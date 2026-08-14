---
id: "cpf"
name: "Validador de CPF"
description: "Valida e gera CPFs com interface gráfica. Suporta formatação automática e cópia para área de transferência."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "cpf"
tags: ["utilidade", "cpf", "validação"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/cpf-1.0.0/cpf.zip"
updated_at: "2026-08-14"
---
## 📌 Visão Geral

O plugin **Validador de CPF** é uma extensão oficial para o **Toolbox Desktop** desenvolvida em **Python**.
Valida e gera CPFs com interface gráfica. Suporta formatação automática e cópia para área de transferência.

---

## 🚀 Como Instalar e Ativar

1. Abra o **Toolbox Desktop**.
2. Acesse a aba **Marketplace**.
3. Localize o card **Validador de CPF** e clique em **Instalar** (ou **Atualizar**).
4. O plugin será instalado automaticamente no diretório local de plugins e estará pronto para uso.

---

## 💻 Modos de Uso

### 1. Interface Gráfica (Desktop)
Você pode abrir a janela interativa do plugin diretamente pelo launcher do Toolbox digitando `cpf` ou selecionando-o na lista de ferramentas.

### 2. Protocolo Headless (IPC v1.0)
Para integrações via linha de comando ou automações externas, o plugin suporta o **Protocolo Toolbox IPC v1.0** via `STDIN`/`STDOUT` no formato JSON:

#### Exemplo de Entrada (STDIN):
```json
{
  "protocol_version": "1.0",
  "request_id": "req_001",
  "action": "run",
  "input": {
    "sample_field": "valor_de_exemplo"
  },
  "options": {}
}
```

#### Exemplo de Saída (STDOUT):
```json
{
  "protocol_version": "1.0",
  "request_id": "req_001",
  "status": "success",
  "result": {
    "output": "Operação realizada com sucesso."
  },
  "error": null,
  "warnings": []
}
```

---

## 🔒 Segurança e Privacidade
- **Processamento 100% Local**: O plugin executa exclusivamente no ambiente do usuário, sem chamadas para APIs de terceiros ou serviços externos.
- **Determinismo**: Todas as saídas são geradas por algoritmos e regras determinísticas.
- **Não Destrutivo**: O plugin nunca sobrescreve arquivos originais sem autorização explícita.


---

## 📖 Documentação Detalhada

Validador e gerador de CPF com interface Tkinter.

## Como funciona

O Toolbox detecta a pasta `plugins/cpf/` automaticamente ao iniciar. Quando
o usuário digita `cpf` e pressiona Enter, o Toolbox executa o comando
configurado em `plugin.json`:

```json
{
  "name": "cpf",
  "version": "1.0.0",
  "entry": "pythonw main.py"
}
```

Isso abre a janela do plugin de forma independente.

## Recursos

- Validação completa pelo algoritmo dos dígitos verificadores
- Geração de CPFs válidos aleatórios
- Formatação automática com máscara
- Cópia para área de transferência
- UI dark mode com Tkinter

## Requisitos

- Python 3.7+ (Tkinter é nativo)

## Personalização

Edite `main.py` para alterar o comportamento. Não é necessário recompilar o
Toolbox.
