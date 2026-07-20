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
## v1.5.0 - 2026-07-20

<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Script de inicialização de tema em `index.html` usando `localStorage` e `prefers-color-scheme`
  - Tokens de tema para campos de entrada (`--input-bg`, `--input-border`) e estilos específicos para SettingsModal e sistema de toasts
  - Configuração de `build.rs` em `src-tauri/Cargo.toml` para personalização de build

- Changed:
  - Atualização das dependências para Tauri 2.x e reorganização de plugins (`opener`, `dialog`, `global-shortcut`)
  - Capabilities padrão mais restritas, removendo acesso direto a shell e filesystem
  - Setup do backend garantindo diretórios de dados/histórico e mantendo o app funcional mesmo quando o atalho global Ctrl+Space não puder ser registrado
  - Contrato de histórico no frontend (`HistoryEntry`) usando strings literais para tipo de comando
  - Estilização de inputs, modais, ícones de comando e preview de favicon para melhor consistência entre temas claro/escuro

- Fixed:
  - Download de favicon passa a validar `content-type`, evitando salvar respostas HTML (erros 404 etc.) como imagens
  - Pequenas melhorias de robustez na inicialização e no armazenamento de comandos

- Removed:
  - Módulo de plugins nativos (`PluginManager`), incluindo descoberta dinâmica e execução de plugins externos
  - Módulo de erros customizados (`AppError/AppResult`)
  - Módulo central de modelos (`models.rs`) em favor de uma estrutura mais enxuta e alinhada com os comandos atuais
  - Permissões de shell e filesystem nas capabilities default

- Security:
  - Endurecimento do fluxo de download de favicons ao aceitar apenas content-types iniciados em `image/`, reduzindo o risco de tratar conteúdo inesperado como imagem

</details>

## v1.6.0 - 2026-07-20

<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Abas de filtro na lista de comandos (Todos, Favoritos, Plugins, Links, Apps, Histórico)
  - Integração do painel de histórico como aba dedicada na interface
  - Suporte a ícones de comandos:
    - Favicon automático para links via `fetch_favicon`
    - Extração de ícones de executáveis via novo comando `extract_exe_icon`
    - Ícones Lucide para plugins (dependência `lucide-react` e LucideIconPicker)
  - Possibilidade de marcar comandos como favoritos diretamente na criação
  - ErrorBoundary no frontend para capturar e exibir erros de renderização
  - Constante `MAX_HISTORY` para controle de tamanho do histórico

- Changed:
  - Layout principal da aplicação (header com marca, barra de busca, tabs e lista de comandos)
  - Fluxo de teclado (ESC limpa busca/fecha modais e foca input; Enter executa comando ativo; setas navegam na lista)
  - Inicialização do logger, que agora recebe o diretório de logs resolvido pelo `AppHandle`
  - Estrutura do `commands.json`, agora agrupando comandos em um objeto raiz `"commands"`
  - Apresentação dos itens da lista, com ícones de fallback por tipo e ações mais visíveis
  - Textos e UX do SettingsModal, toasts e modais em geral
  - Configuração de build do Vite, criando chunk separado para `lucide-react`

- Fixed:
  - Limite do histórico para evitar crescimento indefinido do arquivo (mantém apenas as últimas 100 entradas)
  - Uso do campo `command_type` na badge do HistoryPanel em vez de `kind`

- Removed:
  - Targets de bundle `deb`, `appimage` e `dmg` (foco em Windows: MSI e NSIS)
  - Lógica de histórico acoplada ao hook `useToast` (responsabilidades separadas)

- Security:
  - Sem alterações específicas de segurança nesta versão, além de melhorias indiretas de robustez (limite de histórico e melhor tratamento de erros de UI).

</details>