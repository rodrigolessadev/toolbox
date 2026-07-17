# Guia de Plugins

## O que é um plugin?

Um plugin é um diretório dentro de `plugins/` contendo um arquivo `plugin.json` e um entrypoint executável. O Toolbox descobre plugins dinamicamente ao iniciar — não é necessário recompilar o app.

## Estrutura mínima

```
plugins/
└── meu-plugin/
    ├── plugin.json
    └── main.py
```

## plugin.json

```json
{
  "name": "meu-plugin",
  "version": "1.0.0",
  "description": "Faz algo útil",
  "author": "Seu Nome",
  "entrypoint": "main.py",
  "language": "python"
}
```

| Campo         | Obrigatório | Descrição |
|---------------|-------------|-----------|
| `name`        | sim         | Identificador único |
| `version`     | sim         | Semver |
| `description` | não         | Descrição curta |
| `author`      | não         | Seu nome |
| `entrypoint`  | sim         | Arquivo a executar (relativo à pasta) |
| `language`    | sim         | `python` \| `node` \| `rust` \| `exe` |

## Cadastrando o plugin

Após criar a pasta, registre o comando no Toolbox:

1. Abra o app.
2. Clique em `+`.
3. Aba **Plugin** → informe:
   - **Nome do comando**: ex. `meu-plugin`
   - **Caminho**: `meu-plugin` (relativo a `plugins/`)
4. Salvar. O Toolbox criará automaticamente a entrada em `commands.json` apontando para `plugins/meu-plugin`.

## Exemplo: Python com interface

```python
#!/usr/bin/env python3
import tkinter as tk

def open_ui():
    root = tk.Tk()
    root.title("Meu Plugin")
    tk.Label(root, text="Olá!").pack(padx=20, pady=20)
    root.mainloop()

if __name__ == "__main__":
    open_ui()
```

## Exemplo: Python CLI

```python
import sys
import json

if __name__ == "__main__":
    print(json.dumps({"args": sys.argv[1:]}))
```

## Exemplo: Node.js

```js
// main.js
console.log("Plugin Node ativo!", process.argv.slice(2));
```

`plugin.json`:
```json
{
  "name": "node-plugin",
  "entrypoint": "main.js",
  "language": "node",
  "version": "1.0.0"
}
```

## Exemplo: binário Rust pré-compilado

`plugin.json`:
```json
{
  "name": "fast-plugin",
  "entrypoint": "target/release/fast-plugin.exe",
  "language": "rust",
  "version": "1.0.0"
}
```

## Exemplo: binário Windows

`plugin.json`:
```json
{
  "name": "custom-tool",
  "entrypoint": "tool.exe",
  "language": "exe",
  "version": "1.0.0"
}
```

## Boas práticas

1. **Não bloqueie a toolbox**: abra uma janela ou termine rápido.
2. **Use `cwd = pasta do plugin`**: o Toolbox já configura isso; seus arquivos relativos funcionam.
3. **Valide argumentos**: parse `sys.argv` com cuidado.
4. **Logs**: escreva em arquivo dentro de `logs/` se precisar de histórico.
5. **Ícones**: a UI usa emoji por padrão; você pode passar um ícone no `commands.json`.

## Comandos disponíveis por plugin

| Linguagem | Comando executado |
|-----------|-------------------|
| `python`  | `python main.py` (fallback: `python3`, `py`) |
| `node`    | `node main.js` |
| `rust`    | `<name>.exe` (PATH) |
| `exe`     | `<entrypoint>` direto |

## Erros comuns

- **Plugin não encontrado** — o `path` em `commands.json` deve corresponder à pasta dentro de `plugins/` ou um caminho absoluto.
- **Python não instalado** — o Toolbox procura `python`, depois `python3`, depois `py`. Instale um deles e garanta que está no PATH.
- **Permissões** — no Linux/macOS, plugins Python precisam de `chmod +x` se iniciarem diretamente.

## Recebendo argumentos da toolbox

Por padrão, o Toolbox **não** passa argumentos. Se quiser, leia-os do `commands.json` no frontend (campo `args`) — essa feature é roadmap.

Para um plugin CLI, basta ler `sys.argv`.

## Empacotando plugins

Distribua a pasta do plugin em um arquivo `.zip`. O usuário descompacta dentro de `plugins/` e reinicia o Toolbox (ou ele descobre na próxima execução).

## Templates

Veja `plugins/_template/` para um ponto de partida.
