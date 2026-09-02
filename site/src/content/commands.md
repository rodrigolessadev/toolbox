---
title: "Como cadastrar comandos e usar o Marketplace"
description: "Passo a passo para adicionar links, aplicativos e gerenciar plugins no Toolbox."
---

O Toolbox permite executar três tipos principais de recursos: **links** (sites), **aplicativos** (executáveis locais) e **plugins** (extensões integradas).

---

## 🏬 Como Instalar Plugins via Marketplace

O jeito mais simples e rápido de estender o Toolbox é através do **Marketplace de Plugins nativo**:

1. Abra o Toolbox apertando `Ctrl + Space`.
2. Acesse a aba **Marketplace** no topo da janela.
3. Navegue pela lista de plugins oficiais (ou use a barra de pesquisa para filtrar por nome/tag).
4. Clique no botão **Instalar / Atualizar**.
5. O Toolbox baixa o pacote, valida sua integridade e disponibiliza o comando imediatamente para uso.

---

## ➕ Como Cadastrar Links e Aplicativos Manuais

Para adicionar atalhos customizados para a internet ou programas locais:

1. Abra o Toolbox (`Ctrl + Space`).
2. No canto superior direito, clique no botão **+** (Adicionar Comando).
3. Selecione a aba correspondente ao tipo de comando:

### 1. Cadastrando um Link (Web)
- **Nome do comando:** O termo que você digitará na busca (ex.: `github`, `jira`, `gmail`).
- **URL:** O endereço web completo (ex.: `https://github.com`).
- **Ícone:** Emoji ou identificador visual para localização rápida.
- Clique em **Salvar**.

### 2. Cadastrando um Aplicativo (.exe)
- **Nome do comando:** Termo de ativação (ex.: `code`, `dbeaver`, `notepad`).
- **Caminho do executável:** Localização do arquivo no disco (ex.: `C:\Program Files\Notepad++\notepad++.exe`).
- **Argumentos** *(opcional)*: Parâmetros de linha de comando para o aplicativo.
- Clique em **Salvar**.

> [!TIP]
> **Como copiar o caminho do .exe rapidamente:** No menu Iniciar ou na Área de Trabalho, clique com o botão direito no programa e selecione **"Copiar como caminho"** (`Ctrl + Shift + C`).

---

## ✏️ Editando, Favoritando e Removendo Comandos

- **Favoritar (Fixar no topo):** Clique no ícone de **estrela** ao lado do comando. Os favoritos são priorizados automaticamente no topo dos resultados.
- **Editar:** Passe o mouse sobre o comando e clique no ícone de **lápis** para alterar URL, argumentos ou ícone.
- **Remover:** Clique no ícone de **lixeira** e confirme para excluir o atalho.

---

## 🗄️ Onde os Dados Ficam Salvos

Todos os comandos, histórico de execuções com busca FTS5 e configurações são persistidos de forma segura no banco de dados SQLite Central:

```text
%APPDATA%\com.toolbox.desktop\toolbox.db
```

Os dados contam com integridade referencial, transações ACID e backup simplificado.
