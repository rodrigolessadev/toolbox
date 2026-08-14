---
id: "gerador-json"
name: "Gerador de JSON"
description: "Gera mock data em JSON (Pessoa, Produto, Usuário) com quantidade configurável e cópia para área de transferência."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "gerador-json"
tags: ["dev", "json", "mock", "dados"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-json-1.0.0/gerador-json.zip"
updated_at: "2026-08-14"
---
## 📌 Visão Geral

O plugin **Gerador de JSON** é uma extensão oficial para o **Toolbox Desktop** desenvolvida em **Python**.
Gera mock data em JSON (Pessoa, Produto, Usuário) com quantidade configurável e cópia para área de transferência.

---

## 🚀 Como Instalar e Ativar

1. Abra o **Toolbox Desktop**.
2. Acesse a aba **Marketplace**.
3. Localize o card **Gerador de JSON** e clique em **Instalar** (ou **Atualizar**).
4. O plugin será instalado automaticamente no diretório local de plugins e estará pronto para uso.

---

## 💻 Modos de Uso

### 1. Interface Gráfica (Desktop)
Você pode abrir a janela interativa do plugin diretamente pelo launcher do Toolbox digitando `gerador-json` ou selecionando-o na lista de ferramentas.

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

Gera mock data em JSON (Pessoa, Produto, Usuário).

## Como executar

O Toolbox descobre este plugin automaticamente. Digite `gerador-json` na barra
de pesquisa e pressione Enter.

## Templates disponíveis

- **Pessoa**: nome, email, idade, cidade, ativo
- **Produto**: nome, preço, estoque, categoria
- **Usuário**: id, username, email, role, createdAt

## Recursos

- Quantidade configurável (1 a 50)
- Saída formatada com indentação
- Cópia para área de transferência
- UI dark mode

## Requisitos

- Python 3.7+ (Tkinter é nativo)
