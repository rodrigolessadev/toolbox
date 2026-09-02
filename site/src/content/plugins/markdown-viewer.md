---
id: "markdown-viewer"
name: "Visualizador de Markdown"
description: "Visualizador e editor de Markdown com títulos dinâmicos de abas, retenção de sessão (Hot Exit) e suporte a GFM."
version: "1.6.4"
author: "Rodrigo Lessa"
language: "python"
command: "markdown-viewer"
icon: "file-text"
tags: ["markdown", "viewer", "editor", "docs", "session", "utilidade"]
download_url: "https://github.com/rodrigolessadev/toolbox-plugins/releases/download/markdown-viewer-1.6.4/markdown-viewer.zip"
updated_at: "2026-09-02"
---

# 📝 Visualizador e Editor de Markdown (GFM)

O **Visualizador de Markdown** é um visualizador e editor com renderização em tempo real de **GitHub Flavored Markdown (GFM)**, suporte a múltiplas abas, retenção automática de sessão (*Hot Exit*) e monitoramento dinâmico de arquivos externos.

---

## 🚀 Como Abrir o Plugin

1. Abra o **Toolbox** (`Ctrl + Space`).
2. Digite `markdown-viewer` e pressione `Enter`.

---

## 📖 Principais Funcionalidades

### 1. Suporte Avançado a GitHub Flavored Markdown (GFM)
- Renderização rica de tabelas com alinhamento, listas de tarefas com checkboxes (`- [x]`), blocos de citação, badges e diagramas Mermaid.
- Suporte aprimorado para **blocos de código cercados e indentados** aninhados em múltiplos níveis de listas.
- Realce de sintaxe (*syntax highlighting*) em tempo real com botão de cópia em 1 clique.

### 2. Múltiplas Abas com Títulos Dinâmicos
- Abra múltiplos documentos simultaneamente com navegação rápida por abas.
- O título da aba é atualizado automaticamente a partir do primeiro cabeçalho `# Título` do documento ou do nome do arquivo.
- Indicador visual de alterações pendentes de salvamento (`*`).

### 3. Retenção de Sessão (*Hot Exit*)
- Ao fechar o aplicativo ou o Windows, todas as abas abertas e seus conteúdos não salvos são preservados automaticamente em cache local seguro.
- Ao reabrir o plugin, a sessão completa é restaurada exatamente de onde você parou.

### 4. Monitoramento em Tempo Real (*Live Watch*)
- Se o arquivo aberto for editado por outro programa (ex.: VS Code, Git ou scripts), o visualizador detecta a alteração externa e recarrega o conteúdo sem perder o scroll.

### 5. Modos de Visualização & Atalhos
- 👁️ **Modo Visualização:** Renderização pura com suporte a links clicáveis e seleção livre de texto.
- ✏️ **Modo Editor:** Área de texto monoespaçada com contadores de palavras, linhas e caracteres em tempo real.
- 🌓 **Modo Dividido (Split):** Editor lado a lado com preview simultâneo.

---

## ⌨️ Atalhos Úteis

- `Ctrl + N`: Nova Aba
- `Ctrl + W`: Fechar Aba Ativa
- `Ctrl + O`: Abrir Arquivo Local
- `Ctrl + S`: Salvar Arquivo
- `Ctrl + E`: Alternar entre Visualização e Editor
