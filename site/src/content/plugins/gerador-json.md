---
id: "gerador-json"
name: "Gerador de JSON"
description: "Gera mock data em JSON (Pessoa, Produto, Usuário) com quantidade configurável e cópia para área de transferência."
version: "1.0.0"
author: "Rodrigo Lessa"
language: "python"
command: "gerador-json"
icon: "box"
tags: ["dev", "json", "mock", "dados"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/gerador-json-1.0.0/gerador-json.zip"
updated_at: "2026-08-18"
---

# 📦 Gerador de Mock Data em JSON

O **Gerador de JSON** cria massas de dados estruturadas e realistas em formato JSON (Pessoas, Empresas, Produtos e Usuários de Sistema) para popular bancos de dados de teste, testes de API e protótipos de interface.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `gerador-json` e pressione `Enter`.

---

## 📖 Guia Passo a Passo

### 1. Configurar os Parâmetros da Massa de Dados
1. No campo de seleção **Modelo de Dados**, escolha a entidade que deseja gerar:
   - **Pessoa**: Gera registros com Nome, CPF válido, E-mail, Telefone e Data de Nascimento.
   - **Empresa**: Gera Razão Social, CNPJ válido, Inscrição Estadual e Endereço.
   - **Produto**: Gera Código SKU, Nome do Produto, Categoria, Preço e Estoque.
   - **Usuário**: Gera ID, Username, Senha com Hash e Nível de Acesso.
2. No campo **Quantidade**, digite o número de itens desejados (ex: `5`, `20` ou `50`).
3. Selecione o formato de saída:
   - **Array JSON**: Formato padrão `[ { ... }, { ... } ]`.
   - **NDJSON (Linhas)**: Um objeto JSON por linha, ideal para streaming ou bulk import no Elasticsearch/MongoDB.

### 2. Gerar e Copiar
1. Clique no botão **Gerar JSON**.
2. O resultado formatado com destaque visual aparecerá na caixa de texto.
3. Clique em **Copiar para Área de Transferência** para usar diretamente no seu editor de código ou cliente HTTP (Postman/Insomnia).

---

## 💡 Dicas Úteis

> [!TIP]
> **Validação de Sintaxe**: Todo o JSON gerado passa por formatação estruturada com indentação de 2 espaços, garantindo sintaxe 100% válida.
