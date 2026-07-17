# Como criar um plugin

1. Copie esta pasta para `plugins/<seu-nome>/`
2. Edite `plugin.json` (nome, versão, descrição)
3. Implemente o entrypoint definido em `plugin.json` (por padrão `main.py`)
4. Cadastre o comando no Toolbox (botão `+` → aba Plugin)
5. Execute!

## Linguagens suportadas

- `python` (padrão) — o Toolbox usa `python`/`python3`/`py` (o que estiver disponível)
- `node` / `javascript` — executa com `node main.js`
- `rust` — requer compilação prévia e PATH configurado
- `exe` / `binary` — executa o entrypoint diretamente (deve ser Windows .exe)

## Recebendo argumentos

O Toolbox não passa argumentos automaticamente. Para CLI, use `sys.argv`.

Para abrir uma interface gráfica, basta instanciar uma janela (Tkinter, PySide, Electron, etc.).
