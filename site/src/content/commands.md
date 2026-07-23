---
title: "Como cadastrar comandos"
description: "Passo a passo para adicionar links, aplicativos e plugins ao Toolbox."
---

O Toolbox tem três tipos de comando: **link** (site), **aplicativo** (programa no seu PC) e **plugin** (script). Esta página mostra como cadastrar cada um.

## Onde fica o botão de cadastrar

1. Abra o Toolbox apertando `Ctrl+Space`
2. No canto superior direito, clique no botão **+** (mais)
3. Uma janelinha com três abas abre: **Link**, **Aplicativo** e **Plugin**

![Botão + no canto superior direito](#)

## Como cadastrar um link (site)

Use quando quiser abrir um site com um atalho. Exemplos: abrir o GitHub, abrir o WhatsApp Web, abrir a busca do Google.

1. Clique no botão **+**
2. Fique na aba **Link**
3. Preencha:
   - **Nome do comando** — como você quer chamar. Ex.: `github`, `whats`, `gmail`
   - **URL** — o endereço completo. Ex.: `https://github.com`
   - **Ícone** *(opcional)* — um emoji para facilitar a busca visual. Ex.: 🐙
4. Clique em **Salvar**

Pronto. Agora aperte `Ctrl+Space`, digite `github` e o site abre no seu navegador padrão.

> **Dica:** use nomes curtos. Em vez de `abrir-github`, prefira `github` ou `gh` — você digita menos.

## Como cadastrar um aplicativo

Use quando quiser abrir um programa que já está instalado no seu Windows. Exemplos: Notepad++, VS Code, Calculadora, Spotify.

1. Clique no botão **+**
2. Mude para a aba **Aplicativo**
3. Preencha:
   - **Nome do comando** — como você quer chamar. Ex.: `code` para abrir o VS Code
   - **Caminho do executável** — onde está o `.exe`. Ex.: `C:\Users\SeuNome\AppData\Local\Programs\Microsoft VS Code\Code.exe`
   - **Argumentos** *(opcional)* — flags para passar ao programa. Ex.: `--new-window`
   - **Ícone** *(opcional)* — emoji
4. Clique em **Salvar**

### Como descobrir o caminho do .exe

O jeito mais fácil:

1. Clique com o botão direito no ícone do programa na área de trabalho ou no menu Iniciar
2. Escolha **"Abrir local do arquivo"** (ou **"Mais → Abrir local do arquivo"**)
3. Clique com o botão direito no `.exe` e escolha **"Copiar como caminho"**
4. Cole no campo **Caminho do executável** do Toolbox

> **Atalho:** se você mantém o programa fixo na barra de tarefas, segure `Shift` e clique com o botão direito no ícone — aparece a opção **"Copiar como caminho"** direto.

## Como cadastrar um plugin

Você precisa ter um plugin já criado na pasta `plugins\` antes de cadastrá-lo. Se ainda não tem, veja o [Guia de Plugins](/docs/plugins).

1. Clique no botão **+**
2. Mude para a aba **Plugin**
3. Preencha:
   - **Nome do comando** — como você quer chamar. Ex.: `cpf`, `gerar-json`
   - **Caminho** — o nome da pasta do plugin. Ex.: `cpf` (deve corresponder à pasta dentro de `plugins\`)
4. Clique em **Salvar**

## Editando e removendo comandos

Para **editar** um comando já existente:

1. Passe o mouse por cima do comando na lista
2. Clique no ícone de **lápis** que aparece
3. Altere o que quiser
4. Clique em **Salvar**

Para **remover**:

1. Passe o mouse por cima do comando
2. Clique no ícone de **lixeira**
3. Confirme a remoção

Para **favoritar** (deixar sempre no topo):

- Clique na **estrela** que aparece quando você passa o mouse em cima

## Importando e exportando comandos

Se você usa o Toolbox em mais de um computador (trabalho e casa, por exemplo), pode levar sua lista com você.

1. Abra o Toolbox
2. Clique no ícone de **engrenagem** (configurações)
3. Use **Exportar JSON** para baixar um arquivo com todos os seus comandos
4. No outro computador, abra as configurações e use **Importar JSON** para carregar

O arquivo exportado contém apenas os comandos — os plugins precisam ser instalados separadamente em cada máquina.

## Onde os comandos ficam salvos

Sua lista fica em:

```
C:\Users\SeuNome\AppData\Roaming\Toolbox\commands.json
```

Pode abrir esse arquivo em qualquer editor de texto para ver (e editar) à mão se preferir. O formato é JSON simples.

## Dicas

- **Use ícones diferentes para cada tipo**: 🐙 para sites, ⚙️ para apps, 🧩 para plugins. Facilita achar visualmente.
- **Agrupe por prefixo**: tudo que abre no navegador começa com a mesma letra, ou use prefixos como `w-` (web) e `app-`.
- **Mantenha nomes curtos** — você digita toda vez.
- **Não duplique comandos** que já existem como atalho do Windows. O Toolbox é para o que **não tem** atalho.
