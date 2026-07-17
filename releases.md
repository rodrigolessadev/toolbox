## v1.3.0 - 2026-07-17

<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Comandos Tauri para fechar e minimizar a janela (`close_window`, `minimize_window`).
  - Funções de API no frontend para controle da janela (`api.closeWindow`, `api.minimizeWindow`).
  - Componente de barra de título customizada (`TitleBar`) no layout principal.
  - Classe de layout `.toolbox__main` para organizar o conteúdo principal.

- Changed:
  - Dimensões padrão da janela aumentadas (largura e altura) e tamanhos mínimos ajustados.
  - Janela deixa de ser transparente e passa a ser visível na barra de tarefas.
  - Janela não fica mais sempre em primeiro plano (remoção de comportamento always-on-top).
  - Configuração visual da janela ajustada (remoção de sombra).
  - Código CSS global reformatado para maior consistência.

- Fixed:
  - N/A.

- Removed:
  - Propriedade `alwaysOnTop` da configuração da janela.
  - Propriedade `shadow` da configuração da janela.

- Security:
  - N/A.

</details>
