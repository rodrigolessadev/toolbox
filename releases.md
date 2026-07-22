# Releases

## v1.10.0 - 2026-07-22

## v1.10.0 - 2026-07-22

<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Comando Tauri `update_command` para atualizar e renomear comandos existentes.
  - Payload `UpdateCommandPayload` no backend com suporte a `favorite`.
  - Suporte a marcação de favoritos diretamente ao criar comandos no frontend.
  - Fluxo completo de edição de comandos via modal (nome, tipo, URL/path/args, ícone, favorito).
  - Foco automático no campo de busca ao retornar para a janela ou aba da aplicação.

- Changed:
  - Criação de comandos passa a respeitar o campo `favorite` enviado pelo frontend.
  - Modal de comando agora diferencia visualmente modo criação e modo edição (titulo e texto do botão).
  - Estilo dos títulos de comandos atualizado para permitir quebra de linha e evitar truncamento.

- Fixed:
  - Removida a limitação de não conseguir editar comandos existentes (agora podem ser atualizados em vez de recriados).

- Removed:
  - Nenhum recurso removido nesta versão.

- Security:
  - Sem alterações relacionadas à segurança nesta versão.

</details>
**Instalador:** [Toolbox_1.0.0_x64_en-US.msi](./releases/Toolbox_1.0.0_x64_en-US.msi)

---

## v1.9.1 - 2026-07-21
## v1.9.0 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>
- Added:
  - Suporte a auto-update via `tauri-plugin-updater`, com endpoint de releases no GitHub.
  - Campo de argumentos extras para comandos do tipo “Aplicativo”, com parsing que respeita aspas.
  - Campo de argumentos na modal de criação de comandos, com hint sobre uso semelhante ao “Destino” de atalhos do Windows.
- Changed:
  - Ordem das abas na modal de comandos: agora a aba padrão é “Link”, seguida de “Aplicativo” e “Plugin”.
  - Comportamento da busca: o texto é limpo após executar um comando com Enter.
  - Ícones do aplicativo e instalador MSI atualizados para refletir a nova versão.
- Fixed:
  - Melhoria de UX ao criar comandos e executar buscas, reduzindo confusão com filtros persistentes.
- Removed:
  - N/A
- Security:
  - Configuração de chave pública de updater e geração de artefatos de atualização, garantindo integridade das atualizações baixadas.
</details>
**Instalador:** [Toolbox_1.0.0_x64_en-US.msi](./releases/Toolbox_1.0.0_x64_en-US.msi)
---
## v1.9.0 - 2026-07-21
## v1.9.0 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>
- Added:
  - Suporte a auto-update via `tauri-plugin-updater`, com endpoint de releases no GitHub.
  - Campo de argumentos extras para comandos do tipo “Aplicativo”, com parsing que respeita aspas.
  - Campo de argumentos na modal de criação de comandos, com hint sobre uso semelhante ao “Destino” de atalhos do Windows.
- Changed:
  - Ordem das abas na modal de comandos: agora a aba padrão é “Link”, seguida de “Aplicativo” e “Plugin”.
  - Comportamento da busca: o texto é limpo após executar um comando com Enter.
  - Ícones do aplicativo e instalador MSI atualizados para refletir a nova versão.
- Fixed:
  - Melhoria de UX ao criar comandos e executar buscas, reduzindo confusão com filtros persistentes.
- Removed:
  - N/A
- Security:
  - Configuração de chave pública de updater e geração de artefatos de atualização, garantindo integridade das atualizações baixadas.
</details>
**Instalador:** [Toolbox_1.0.0_x64_en-US.msi](./releases/Toolbox_1.0.0_x64_en-US.msi)
---
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
## v1.7.0 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>
- Added:
  - Suporte a argumentos extras em comandos de tipo "Aplicativo" (campo `args` no backend e frontend).
  - Parser de linha de comando que respeita aspas simples e duplas ao executar aplicativos.
  - Integração com `tauri-plugin-updater`, com artefatos de atualização e endpoint configurado para GitHub Releases.
  - Novo conjunto de ícones para o aplicativo desktop.
- Changed:
  - Modal de novo comando abre na aba "Link" por padrão e reorganiza a ordem das abas (Link → Aplicativo → Plugin).
  - Formulário de comando de aplicativo separado em campos de executável e argumentos, com dicas de uso.
  - Campo de busca é limpo automaticamente após executar um comando via Enter, melhorando a experiência de uso.
  - Configuração Tauri ajustada para gerar artefatos de atualização (`createUpdaterArtifacts`).
- Fixed:
  - Evita manter o texto de busca após execução de comando, reduzindo confusão na navegação de resultados.
- Removed:
  - Nenhuma funcionalidade foi removida nesta versão.
- Security:
  - Introduz suporte a atualização assinada via chave pública (`pubkey`), fortalecendo a segurança no processo de distribuição e update do aplicativo.
</details>
## v1.8.0 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>
- Added:
  - Suporte a argumentos extras em comandos do tipo aplicativo, com parsing de argumentos respeitando aspas, similar ao campo "Destino" de atalhos do Windows.
  - Integração com o Tauri Updater, incluindo geração de artefatos de atualização e configuração de endpoint GitHub para `latest.json`.
  - Campo `pubkey` na configuração da aplicação para validação de atualizações assinadas.
- Changed:
  - Comportamento da busca: ao executar um comando via teclado, a caixa de pesquisa é limpa automaticamente.
  - Modal de criação de comando: aba padrão alterada para "Link" e nova ordem das abas (Link, Aplicativo, Plugin).
  - Seção de aplicativo no modal: separação entre campo de executável e campo de argumentos opcionais, com texto de ajuda.
  - Atualização dos ícones da aplicação (PNG/ICO) e do instalador MSI.
- Fixed:
  - Refinamento de UX na execução de comandos pela busca, evitando que a mesma query permaneça após execução.
- Removed:
  - Nenhuma funcionalidade removida nesta versão.
- Security:
  - Adição de chave pública na configuração da aplicação para suportar validação de artefatos de atualização.
  - Estrutura inicial de configuração do plugin de updater, preparando o fluxo de updates assinados.
</details>
## v1.9.0 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>
- Added:
  - Suporte a auto-update via `tauri-plugin-updater`, com endpoint de releases no GitHub.
  - Campo de argumentos extras para comandos do tipo “Aplicativo”, com parsing que respeita aspas.
  - Campo de argumentos na modal de criação de comandos, com hint sobre uso semelhante ao “Destino” de atalhos do Windows.
- Changed:
  - Ordem das abas na modal de comandos: agora a aba padrão é “Link”, seguida de “Aplicativo” e “Plugin”.
  - Comportamento da busca: o texto é limpo após executar um comando com Enter.
  - Ícones do aplicativo e instalador MSI atualizados para refletir a nova versão.
- Fixed:
  - Melhoria de UX ao criar comandos e executar buscas, reduzindo confusão com filtros persistentes.
- Removed:
  - N/A
- Security:
  - Configuração de chave pública de updater e geração de artefatos de atualização, garantindo integridade das atualizações baixadas.
</details>
