---
id: "stract-json"
name: "Stract JSON"
description: "Extrai valores de um campo específico a partir de um JSON colado. Útil para transformar listas de objetos em listas de valores."
version: "1.0.1"
author: "Rodrigo Lessa"
language: "python"
command: "stract-json"
icon: "braces"
tags: ["dev", "json", "extração", "dados"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/stract-json-1.0.1/stract-json.zip"
updated_at: "2026-08-18"
---

# 🧩 Stract JSON (Extrator de Campos)

O **Stract JSON** extrai os valores de uma chave ou propriedade específica a partir de listas de objetos ou payloads complexos em JSON, convertendo-os em listas limpas prontas para uso em consultas SQL, filtros ou planilhas.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `stract-json` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Colar o Conteúdo JSON
1. No campo superior **JSON**, cole o seu payload ou lista de objetos (ex: uma resposta de API contendo uma lista de usuários).

### 2. Informar o Campo a Extrair
1. No campo **Nome do Campo**, digite o nome da propriedade que deseja extrair (ex: `id`, `email` ou `codigo`).
2. *(Opcional)* Escolha o delimitador de saída:
   - **Quebra de linha**: Um valor por linha (ideal para listas ou blocos de notas).
   - **Vírgula**: Valores separados por vírgula (`1, 2, 3, 4`).
   - **SQL IN**: Valores entre aspas e separados por vírgula `('item1', 'item2', 'item3')`.

### 3. Extrair e Copiar
1. Clique no botão **Extrair Valores**.
2. O resultado limpo e consolidado aparecerá no painel de saída.
3. Clique em **Copiar Resultado** para transferir para a Área de Transferência.

---

## 💡 Exemplo Prático

**Entrada (JSON):**
```json
[
  { "id": 101, "nome": "Ana Silva", "ativo": true },
  { "id": 102, "nome": "Carlos Lessa", "ativo": false },
  { "id": 103, "nome": "Mariana Souza", "ativo": true }
]
```

**Campo Informado:** `id` com formato **SQL IN**

**Saída Gerada:**
```sql
(101, 102, 103)
```

---

## 💡 Dicas Úteis

> [!TIP]
> **Campos Aninhados**: O plugin suporta acesso a objetos internos através de notação com ponto (ex: `endereco.cidade`).
