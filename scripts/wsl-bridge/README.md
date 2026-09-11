# Toolbox WSL2 Focus Bridge

Ponte de atalho global entre o host **Windows** e o **Toolbox** em execução sob o ambiente **WSL2 / WSLg**.

---

## 📌 Por que este serviço é necessário?
Quando o Toolbox é executado dentro do WSL2 (Ubuntu/Debian com WSLg), as teclas de atalho globais registradas pelo motor gráfico X11/Wayland só recebem eventos quando o foco já está sobre uma janela do Linux.

Se o usuário estiver navegando no Chrome, no VS Code nativo ou na Área de Trabalho do Windows, o atalho `Ctrl + Space` não chega ao WSL2.

O **Focus Bridge** registra o atalho global `Ctrl + Space` nativamente na API do Windows (`user32.dll RegisterHotKey`) e, ao ser pressionado, envia um sinal TCP na porta local `127.0.0.1:49152` para o Toolbox trazer sua janela imediatamente para o primeiro plano e focar a busca.

---

## 🚀 Como Usar

### 1. Iniciar Imediatamente (sem janela visível)
Dê um duplo clique em:
- `start-focus-bridge.cmd`

### 2. Iniciar Automaticamente com o Windows (Recomendado)
Dê um duplo clique em:
- `install-focus-bridge.cmd`

Isso criará uma chamada de inicialização silenciosa na pasta `shell:startup` do Windows (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`).

### 3. Desinstalar da Inicialização
Dê um duplo clique em:
- `uninstall-focus-bridge.cmd`
