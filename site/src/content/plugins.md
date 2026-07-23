---
title: "Guia de Plugins"
description: "Crie seus próprios plugins para o Toolbox em qualquer linguagem."
---

Um **plugin** é um programinha separado que o Toolbox sabe executar. Você pode usar para qualquer coisa que dê para automatizar: gerar CPF, validar JSON, abrir uma janela com botões, consultar uma API — o que sua necessidade pedir.

O melhor: **você não precisa saber Rust nem mexer no código do Toolbox**. Plugins são arquivos soltos numa pasta, escritos na linguagem que você preferir.

## O que vem junto

Quando você instala o Toolbox, já ganhamos dois plugins prontos para você ver como funciona:

| Plugin | O que faz | Linguagem |
|---|---|---|
| `cpf` | Valida e gera CPF (abre uma janelinha) | Python |
| `gerador-json` | Gera dados fictícios em formato JSON (abre uma janelinha) | Python |
| `_template` | Um plugin mínimo pronto para você renomear e customizar | Python |

## A estrutura de um plugin

Cada plugin é uma **pasta** dentro de `plugins\`. A pasta tem dois arquivos: o `plugin.json` (que diz quem é o plugin) e o código que faz o trabalho.

```
plugins\
└── meu-plugin\              ← nome da pasta = identificador do plugin
    ├── plugin.json          ← manifesto (obrigatório)
    └── main.py              ← código (ou main.js, main.rs, app.exe...)
```

## O arquivo plugin.json

É o "RG" do plugin. Crie um arquivo `plugin.json` dentro da pasta dele com este conteúdo:

```json
{
  "name": "meu-plugin",
  "version": "1.0.0",
  "description": "O que seu plugin faz (aparece no app)",
  "author": "Seu nome",
  "entrypoint": "main.py",
  "language": "python"
}
```

| Campo | Obrigatório | O que colocar |
|---|---|---|
| `name` | Sim | Identificador único (sem espaços, tudo minúsculo) |
| `version` | Sim | Versão, formato `1.0.0` |
| `description` | Não | Frase curta que aparece quando o usuário busca |
| `author` | Não | Seu nome |
| `entrypoint` | Sim | Nome do arquivo principal (`main.py`, `app.js`, `tool.exe`...) |
| `language` | Sim | `python`, `node`, `rust` ou `exe` |

## Como cadastrar o plugin no app

Depois de criar a pasta do plugin, ele **ainda não aparece** para o usuário — você precisa cadastrá-lo como um comando:

1. Abra o Toolbox (Ctrl+Space)
2. Clique no botão **+** (canto superior direito)
3. Escolha a aba **Plugin**
4. Preencha:
   - **Nome do comando**: como o usuário vai chamar (ex.: `meu-plugin`)
   - **Caminho**: o nome da pasta do plugin (ex.: `meu-plugin`)
5. Clique em **Salvar**

Pronto. Agora quando o usuário digitar `meu-plugin`, seu plugin vai aparecer na lista.

## Exemplo 1: Plugin Python com janela

Esse aqui abre uma janelinha com um "Olá!". É o jeito mais simples de ver algo acontecer.

Crie `plugins/ola/plugin.json`:

```json
{
  "name": "ola",
  "version": "1.0.0",
  "description": "Abre uma janela dizendo Olá",
  "entrypoint": "main.py",
  "language": "python"
}
```

Crie `plugins/ola/main.py`:

```python
import tkinter as tk

janela = tk.Tk()
janela.title("Olá")
tk.Label(janela, text="Olá! Este é meu primeiro plugin.").pack(padx=20, pady=20)
janela.mainloop()
```

## Exemplo 2: Plugin Python que só executa e fecha

Esse aqui roda no terminal, mostra uma mensagem e termina. Bom para tarefas rápidas.

```python
print("Plugin executou com sucesso!")
```

## Exemplo 3: Plugin em Node.js

Crie `plugins/horas/plugin.json`:

```json
{
  "name": "horas",
  "version": "1.0.0",
  "description": "Mostra a hora atual",
  "entrypoint": "main.js",
  "language": "node"
}
```

Crie `plugins/horas/main.js`:

```javascript
const agora = new Date();
console.log(`Agora são ${agora.toLocaleTimeString()}`);
```

## Exemplo 4: Binário Windows qualquer

Se você já tem um `.exe` que faz algo útil, é só apontar para ele:

```json
{
  "name": "minha-ferramenta",
  "version": "1.0.0",
  "entrypoint": "ferramenta.exe",
  "language": "exe"
}
```

## Quais linguagens são suportadas

| Linguagem | Como o Toolbox executa | Requisito |
|---|---|---|
| `python` | `python main.py` (ou `python3`, ou `py`) | Ter Python instalado e no PATH |
| `node` | `node main.js` | Ter Node.js instalado e no PATH |
| `rust` | Executa o binário direto | Binário pré-compilado |
| `exe` | Executa o `.exe` direto | Qualquer executável Windows |

Se Python não estiver no PATH, o plugin simplesmente não abre e você verá um erro genérico. Instale o Python marcando a opção **"Add to PATH"** na instalação.

## Como distribuir seu plugin

A forma mais simples é **zipar a pasta do plugin** e mandar para quem vai usar. A pessoa descompacta dentro de `plugins\` (a pasta `plugins\` está em `C:\Users\SeuNome\AppData\Roaming\Toolbox\plugins\`) e o plugin aparece na próxima vez que abrir o Toolbox.

```
meu-plugin.zip
└── meu-plugin\
    ├── plugin.json
    └── main.py
```

Quem recebe só precisa:
1. Fechar o Toolbox
2. Descompactar o zip dentro de `plugins\`
3. Abrir o Toolbox de novo
4. Cadastrar o plugin como comando (mesmo passo de antes)

## Recebendo argumentos do usuário

Por enquanto, o Toolbox passa o **nome do comando** como primeiro argumento. Se o seu plugin precisa de mais coisa, leia os próximos argumentos da linha de comando:

```python
import sys
print(f"Plugin chamado com: {sys.argv}")
```

(Recursos mais avançados como pedir valores para o usuário estão no [Roadmap](/docs/roadmap).)

## Dicas para plugins que não irritam

- **Não fique rodando em loop infinito** — abra uma janela ou termine logo. O usuário quer velocidade.
- **Salve seus arquivos dentro da pasta do plugin** — o Toolbox já configura o diretório de trabalho para você.
- **Valide os dados antes de processar** — se o plugin depende de input, confira antes de usar.
- **Use `print` para mensagens rápidas** — o usuário vê no terminal que abre.
- **Para interfaces complexas**, use Tkinter (Python), Electron (Node) ou qualquer framework — o Toolbox só precisa que o `.exe`/`.py`/`.js` execute.

## Erros comuns e como resolver

**O plugin não aparece na lista**
- O `plugin.json` tem erro de sintaxe? Valide em [jsonlint.com](https://jsonlint.com)
- A pasta está no lugar certo? Deve estar dentro de `plugins\` (e não `plugins\outra-coisa\meu-plugin\`)
- Reiniciou o Toolbox? Ele só descobre plugins na inicialização

**"Python não foi encontrado"**
- Instale o Python pelo [python.org](https://python.org) e marque "Add Python to PATH" na instalação

**A janela abre e fecha rápido**
- Provavelmente o script terminou (ou deu erro). Rode direto no terminal para ver a mensagem:
  ```
  cd C:\Users\SeuNome\AppData\Roaming\Toolbox\plugins\meu-plugin
  python main.py
  ```

**Permissão negada (Linux/Mac)**
- Dê permissão de execução: `chmod +x main.py`

## Usando o template

A pasta `_template` que vem com o Toolbox é um plugin mínimo pronto para você copiar e renomear. Duplique a pasta, edite o `plugin.json` e o `main.py`, cadastre como comando e pronto.

## Próximo passo

Quer ver ideias do que dá para fazer com plugins? Veja o [Roadmap](/docs/roadmap) — tem planos para plugins com comunicação mais rica, marketplace e mais.
