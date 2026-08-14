## v1.16.0 - 2026-08-14 https://github.com/rodrigolessadev/toolbox/releases

<details>
<summary>Ver detalhes da versao</summary>

- Added:
  - Destaque visual no ícone do Marketplace (carrinho 🛒) com token de destaque var(--accent), tooltip informativa e badge com contagem exata quando houver plugins com atualização disponível.
  - Destaque visual no ícone de Configurações (⚙️) com token de destaque var(--accent), tooltip indicando a nova versão e badge de aviso ! quando houver update do Toolbox.
  - Seção dedicada "Atualizações do Sistema" na modal de Configurações, exibindo a versão atual instalada e o botão "Atualizar agora" exclusivamente quando houver nova versão disponível.

- Changed:
  - Fluxo de atualização de plugins no Marketplace: atualizações de plugins já instalados agora ocorrem de forma direta e isolada via backend IPC, preservando 100% dos comandos cadastrados em commands.json sem solicitar nova parametrização.

- Fixed:
  - Eliminação da chamada indevida do modal de criação de comando (InstallPluginModal) ao clicar em "Atualizar" em plugins existentes.

- Removed:
  - (sem itens nesta versão)

- Security:
  - Preservação da integridade de comandos e configurações locais durante o ciclo de vida de atualização de plugins.

</details>

## v1.16.0 - 2026-08-14 https://github.com/rodrigolessadev/toolbox/releases

<details>
<summary>Ver detalhes da versao</summary>

- Added:
  - Destaque visual no ícone do Marketplace (carrinho 🛒) com token de destaque var(--accent), tooltip informativa e badge com contagem exata quando houver plugins com atualização disponível.
  - Destaque visual no ícone de Configurações (⚙️) com token de destaque var(--accent), tooltip indicando a nova versão e badge de aviso ! quando houver update do Toolbox.
  - Seção dedicada "Atualizações do Sistema" na modal de Configurações, exibindo a versão atual instalada e o botão "Atualizar agora" exclusivamente quando houver nova versão disponível.

- Changed:
  - Fluxo de atualização de plugins no Marketplace: atualizações de plugins já instalados agora ocorrem de forma direta e isolada via backend IPC, preservando 100% dos comandos cadastrados em commands.json sem solicitar nova parametrização.

- Fixed:
  - Eliminação da chamada indevida do modal de criação de comando (InstallPluginModal) ao clicar em "Atualizar" em plugins existentes.

- Removed:
  - (sem itens nesta versão)

- Security:
  - Preservação da integridade de comandos e configurações locais durante o ciclo de vida de atualização de plugins.

</details>

## v1.15.0 - 2026-08-13 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.15.0/Toolbox_1.15.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

- Added:
  - Design System completo em React (`tokens.ts`, `global.css`) com 80+ variáveis CSS, 3 temas visuais (light, dark, high-contrast) e conformidade WCAG 2.1 AA.
  - Biblioteca de 15 novos componentes visuais reutilizáveis em `src/components/` (`Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `FormGroup`, `ResultArea`, `PluginCard`, `PluginHeader`, `CopyButton`, etc.).
  - Especificação e executor do Protocolo IPC v1.0 assíncrono via STDIN/STDOUT JSON (NDJSON) em Rust (`src-tauri/src/protocol.rs`) e SDK Python (`plugins/shared/python/toolbox_protocol.py`).
  - Modais nativas integradas em React (`StractJsonModal`, `ConverterDataModal`, `GeradorMarcacoesModal`, `GeradorAfdModal`) com comunicação via protocolo IPC v1.0 e fallback gracioso para Tkinter.
  - Recursos de segurança avançados no Marketplace (`src-tauri/src/marketplace.rs`): checksum SHA-256 e proteção Zip Slip contra extrações maliciosas.

- Changed:
  - Modelo de manifesto evoluído para PluginManifest v2 (`src-tauri/src/plugin.rs`), incorporando validação estrita dos campos `protocol_version`, `capabilities` e `min_toolbox_version`.
  - Desacoplamento da camada de domínio dos plugins em módulos Python puros e testáveis (`test_domain.py`).

- Fixed:
  - Validação pós-instalação de pacotes baixados do Marketplace garantindo consistência do arquivo de entrada e integridade do `plugin.json`.

- Removed:
  - (sem itens nesta versão)

- Security:
  - Proteção estrita Zip Slip durante a extração de plugins para prevenir substituição de arquivos fora do diretório de destino.
  - Suporte à verificação de integridade dos pacotes do catálogo por SHA-256.

</details>

## v1.14.0 - 2026-08-03 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.14.0/Toolbox_1.14.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

- Added:
  - Suporte a campos opcionais dinâmicos no plugin Gerador de Marcações, com seletor tipo combobox e remoção individual de campos.
  - Geração de INSERTs com múltiplos horários (HORACC) e intervalo de datas, incluindo filtro por dias da semana.
  - Máscara automática de horário (HH:MM) nos campos Entrada/Saída e parâmetros noturnos da Calculadora de Jornadas, preservando o cursor.
  - Captura de stdout e stderr dos plugins pelo executor, com envio ao log interno do toolbox e identificação por tag `plugin::<nome>`.

- Changed:
  - Plugin Calculadora de Jornadas: aplicação de tema escuro completo ao TreeView, entradas e totais, com destaque visual para colunas editáveis.
  - Comportamento de edição na tabela de jornadas: um clique abre o editor inline, conteúdo atual é selecionado e navegação por TAB entre Entrada/Saída e nova linha.
  - Plugin Gerador de Marcações: UI reorganizada em layout com scroll, seções de campos fixos, principais e opcionais, e melhoria na geração de SQL para SQL Server e Oracle.
  - Executor de plugins: passa a capturar stdout/stderr, registrar logs internamente e, no Windows, evitar abertura de janela de terminal. Campo `message` do RunResult passa a ser sempre serializado para o frontend.

- Fixed:
  - Correção do comportamento do cursor durante a digitação de horários na Calculadora de Jornadas (não volta para posições anteriores ao aplicar a máscara).
  - Limitação consistente de 4 dígitos para entrada de hora (HHMM) nos campos de jornada, evitando valores inválidos na máscara.

- Removed:
  - (sem itens nesta versão)

- Security:
  - (sem alterações relacionadas à segurança nesta versão)

</details>

## v1.13.0 - 2026-08-03 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.13.0/Toolbox_1.13.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

- Added:
  - Suporte a campos opcionais dinâmicos no plugin Gerador de Marcações, com seletor tipo combobox e remoção individual de campos.
  - Geração de INSERTs com múltiplos horários (HORACC) e intervalo de datas, incluindo filtro por dias da semana.
  - Máscara automática de horário (HH:MM) nos campos Entrada/Saída e parâmetros noturnos da Calculadora de Jornadas, preservando o cursor.

- Changed:
  - Plugin Calculadora de Jornadas: aplicação de tema escuro completo ao TreeView, entradas e totais, com destaque visual para colunas editáveis.
  - Comportamento de edição na tabela de jornadas: um clique abre o editor inline, conteúdo atual é selecionado e navegação por TAB entre Entrada/Saída e nova linha.
  - Plugin Gerador de Marcações: UI reorganizada em layout com scroll, seções de campos fixos, principais e opcionais, e melhoria na geração de SQL para SQL Server e Oracle.
  - Backend executor (RunResult): campo `message` deixa de ser omitido quando `None` e passa a ser sempre serializado para o frontend.

- Fixed:
  - Correção do comportamento do cursor durante a digitação de horários na Calculadora de Jornadas (não volta para posições anteriores ao aplicar a máscara).
  - Limitação consistente de 4 dígitos para entrada de hora (HHMM) nos campos de jornada, evitando valores inválidos na máscara.

- Removed:
  - (sem itens nesta versão)

- Security:
  - (sem alterações nesta versão)

</details>

## v1.12.0 - 2026-07-24 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.12.0/Toolbox_1.12.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

- Added:
  - Suporte a downloads e instalações com verificação de integridade via hash SHA-256 no catálogo de plugins.
  - Registro estruturado de eventos de execução e telemetria básica no backend Tauri.

- Changed:
  - Otimização do tempo de inicialização da janela principal e tratamento assíncrono de busca.

- Fixed:
  - Ajuste na persistência de comandos favoritos no `commands.json`.

- Removed:
  - (sem itens nesta versão)

- Security:
  - Proteção de integridade nos pacotes de plugins baixados do repositório remoto.

</details>

## v1.11.1 - 2026-07-23

<details>
<summary>Ver detalhes da versao</summary>

## v1.11.1 - 2026-07-23
<details>
<summary>Ver detalhes da versÃ£o</summary>

- Added:
  - DefiniÃ§Ã£o de um logger global baseado em arquivo para centralizar os registros da aplicaÃ§Ã£o

- Changed:
  - Ajustes cosmÃ©ticos de formataÃ§Ã£o em cÃ³digo de extraÃ§Ã£o de Ã­cone no Windows
  - Logger padrÃ£o deixa de usar saÃ­da no console (stderr) e passa a depender do logger de arquivo

- Fixed:
  - Tratamento de erros do catÃ¡logo do marketplace com logs detalhados para falhas de rede, leitura e JSON invÃ¡lido
  - Fluxo de download e instalaÃ§Ã£o de plugins mais robusto, com logs em falhas de rede, criaÃ§Ã£o de pastas e processamento do ZIP

- Removed:
  - SaÃ­da de logs via `env_logger` no console padrÃ£o (stderr)

- Security:
  - ValidaÃ§Ã£o adicional do arquivo de plugin baixado, verificando se o conteÃºdo retornado possui assinatura de ZIP antes da extraÃ§Ã£o

</details>

</details>

## v1.11.0 - 2026-07-23

<details>
<summary>Ver detalhes da versao</summary>

## v1.11.0 - 2026-07-23

<details>
<summary>Ver detalhes da versÃ£o</summary>

- Added:
  - ConfiguraÃ§Ã£o de markdown no site com Shiki (tema `github-dark-dimmed`) e suporte preparado para GFM.
  - Nova versÃ£o da pÃ¡gina de arquitetura com linguagem mais amigÃ¡vel e front-matter para SEO.

- Changed:
  - `astro.config.mjs` atualizado para o modelo de saÃ­da estÃ¡tica do Astro 5, com domÃ­nio fixo `https://toolbox.seudominio.com.br`.
  - Stack do site ajustada para versÃµes compatÃ­veis com Astro 5 (`astro`, `@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/vercel`).
  - Favicon do site redesenhado com Ã­cone minimalista.
  - ConteÃºdo da pÃ¡gina de arquitetura simplificado e voltado para usuÃ¡rios finais em vez de detalhes internos de implementaÃ§Ã£o.

- Fixed:
  - N/A (nenhuma correÃ§Ã£o de bug especÃ­fica identificada neste patch).

- Removed:
  - N/A (nÃ£o houve remoÃ§Ã£o de funcionalidades, apenas substituiÃ§Ã£o de conteÃºdo/visual).

- Security:
  - N/A (nenhuma alteraÃ§Ã£o diretamente relacionada Ã  seguranÃ§a identificada).

</details>
</details>

---

## v1.10.0 - 2026-07-22
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Comando Tauri `update_command` para atualizar e renomear comandos existentes.
  - Payload `UpdateCommandPayload` no backend com suporte a `favorite`.
  - Suporte a marcaÃ§Ã£o de favoritos diretamente ao criar comandos no frontend.
  - Fluxo completo de ediÃ§Ã£o de comandos via modal (nome, tipo, URL/path/args, Ã­cone, favorito).
  - Foco automÃ¡tico no campo de busca ao retornar para a janela ou aba da aplicaÃ§Ã£o.
- Changed:
  - CriaÃ§Ã£o de comandos passa a respeitar o campo `favorite` enviado pelo frontend.
  - Modal de comando agora diferencia visualmente modo criaÃ§Ã£o e modo ediÃ§Ã£o (titulo e texto do botÃ£o).
  - Estilo dos tÃ­tulos de comandos atualizado para permitir quebra de linha e evitar truncamento.
- Fixed:
  - Removida a limitaÃ§Ã£o de nÃ£o conseguir editar comandos existentes (agora podem ser atualizados em vez de recriados).
- Removed:
  - Nenhum recurso removido nesta versÃ£o.
- Security:
  - Sem alteraÃ§Ãµes relacionadas Ã  seguranÃ§a nesta versÃ£o.
</details>
## v1.9.1 - 2026-07-21
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Suporte a auto-update via `tauri-plugin-updater`, com endpoint de releases no GitHub.
  - Campo de argumentos extras para comandos do tipo â€œAplicativoâ€, com parsing que respeita aspas.
  - Campo de argumentos na modal de criaÃ§Ã£o de comandos, com hint sobre uso semelhante ao â€œDestinoâ€ de atalhos do Windows.
- Changed:
  - Ordem das abas na modal de comandos: agora a aba padrÃ£o Ã© â€œLinkâ€, seguida de â€œAplicativoâ€ e â€œPluginâ€.
  - Comportamento da busca: o texto Ã© limpo apÃ³s executar um comando com Enter.
  - Ãcones do aplicativo e instalador MSI atualizados para refletir a nova versÃ£o.
- Fixed:
  - Melhoria de UX ao criar comandos e executar buscas, reduzindo confusÃ£o com filtros persistentes.
- Removed:
  - N/A
- Security:
  - ConfiguraÃ§Ã£o de chave pÃºblica de updater e geraÃ§Ã£o de artefatos de atualizaÃ§Ã£o, garantindo integridade das atualizaÃ§Ãµes baixadas.
</details>
## v1.9.0 - 2026-07-21
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Suporte a auto-update via `tauri-plugin-updater`, com endpoint de releases no GitHub.
  - Campo de argumentos extras para comandos do tipo â€œAplicativoâ€, com parsing que respeita aspas.
  - Campo de argumentos na modal de criaÃ§Ã£o de comandos, com hint sobre uso semelhante ao â€œDestinoâ€ de atalhos do Windows.
- Changed:
  - Ordem das abas na modal de comandos: agora a aba padrÃ£o Ã© â€œLinkâ€, seguida de â€œAplicativoâ€ e â€œPluginâ€.
  - Comportamento da busca: o texto Ã© limpo apÃ³s executar um comando com Enter.
  - Ãcones do aplicativo e instalador MSI atualizados para refletir a nova versÃ£o.
- Fixed:
  - Melhoria de UX ao criar comandos e executar buscas, reduzindo confusÃ£o com filtros persistentes.
- Removed:
  - N/A
- Security:
  - ConfiguraÃ§Ã£o de chave pÃºblica de updater e geraÃ§Ã£o de artefatos de atualizaÃ§Ã£o, garantindo integridade das atualizaÃ§Ãµes baixadas.
</details>
## v1.8.0 - 2026-07-21
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Suporte a argumentos extras em comandos do tipo aplicativo, com parsing de argumentos respeitando aspas, similar ao campo "Destino" de atalhos do Windows.
  - IntegraÃ§Ã£o com o Tauri Updater, incluindo geraÃ§Ã£o de artefatos de atualizaÃ§Ã£o e configuraÃ§Ã£o de endpoint GitHub para `latest.json`.
  - Campo `pubkey` na configuraÃ§Ã£o da aplicaÃ§Ã£o para validaÃ§Ã£o de atualizaÃ§Ãµes assinadas.
- Changed:
  - Comportamento da busca: ao executar um comando via teclado, a caixa de pesquisa Ã© limpa automaticamente.
  - Modal de criaÃ§Ã£o de comando: aba padrÃ£o alterada para "Link" e nova ordem das abas (Link, Aplicativo, Plugin).
  - SeÃ§Ã£o de aplicativo no modal: separaÃ§Ã£o entre campo de executÃ¡vel e campo de argumentos opcionais, com texto de ajuda.
  - AtualizaÃ§Ã£o dos Ã­cones da aplicaÃ§Ã£o (PNG/ICO) e do instalador MSI.
- Fixed:
  - Refinamento de UX na execuÃ§Ã£o de comandos pela busca, evitando que a mesma query permaneÃ§a apÃ³s execuÃ§Ã£o.
- Removed:
  - Nenhuma funcionalidade removida nesta versÃ£o.
- Security:
  - AdiÃ§Ã£o de chave pÃºblica na configuraÃ§Ã£o da aplicaÃ§Ã£o para suportar validaÃ§Ã£o de artefatos de atualizaÃ§Ã£o.
  - Estrutura inicial de configuraÃ§Ã£o do plugin de updater, preparando o fluxo de updates assinados.
</details>
## v1.7.0 - 2026-07-21
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Suporte a argumentos extras em comandos de tipo "Aplicativo" (campo `args` no backend e frontend).
  - Parser de linha de comando que respeita aspas simples e duplas ao executar aplicativos.
  - IntegraÃ§Ã£o com `tauri-plugin-updater`, com artefatos de atualizaÃ§Ã£o e endpoint configurado para GitHub Releases.
  - Novo conjunto de Ã­cones para o aplicativo desktop.
- Changed:
  - Modal de novo comando abre na aba "Link" por padrÃ£o e reorganiza a ordem das abas (Link â†’ Aplicativo â†’ Plugin).
  - FormulÃ¡rio de comando de aplicativo separado em campos de executÃ¡vel e argumentos, com dicas de uso.
  - Campo de busca Ã© limpo automaticamente apÃ³s executar um comando via Enter, melhorando a experiÃªncia de uso.
  - ConfiguraÃ§Ã£o Tauri ajustada para gerar artefatos de atualizaÃ§Ã£o (`createUpdaterArtifacts`).
- Fixed:
  - Evita manter o texto de busca apÃ³s execuÃ§Ã£o de comando, reduzindo confusÃ£o na navegaÃ§Ã£o de resultados.
- Removed:
  - Nenhuma funcionalidade foi removida nesta versÃ£o.
- Security:
  - Introduz suporte a atualizaÃ§Ã£o assinada via chave pÃºblica (`pubkey`), fortalecendo a seguranÃ§a no processo de distribuiÃ§Ã£o e update do aplicativo.
</details>
## v1.6.0 - 2026-07-20
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Abas de filtro na lista de comandos (Todos, Favoritos, Plugins, Links, Apps, HistÃ³rico)
  - IntegraÃ§Ã£o do painel de histÃ³rico como aba dedicada na interface
  - Suporte a Ã­cones de comandos:
    - Favicon automÃ¡tico para links via `fetch_favicon`
    - ExtraÃ§Ã£o de Ã­cones de executÃ¡veis via novo comando `extract_exe_icon`
    - Ãcones Lucide para plugins (dependÃªncia `lucide-react` e LucideIconPicker)
  - Possibilidade de marcar comandos como favoritos diretamente na criaÃ§Ã£o
  - ErrorBoundary no frontend para capturar e exibir erros de renderizaÃ§Ã£o
  - Constante `MAX_HISTORY` para controle de tamanho do histÃ³rico
- Changed:
  - Layout principal da aplicaÃ§Ã£o (header com marca, barra de busca, tabs e lista de comandos)
  - Fluxo de teclado (ESC limpa busca/fecha modais e foca input; Enter executa comando ativo; setas navegam na lista)
  - InicializaÃ§Ã£o do logger, que agora recebe o diretÃ³rio de logs resolvido pelo `AppHandle`
  - Estrutura do `commands.json`, agora agrupando comandos em um objeto raiz `"commands"`
  - ApresentaÃ§Ã£o dos itens da lista, com Ã­cones de fallback por tipo e aÃ§Ãµes mais visÃ­veis
  - Textos e UX do SettingsModal, toasts e modais em geral
  - ConfiguraÃ§Ã£o de build do Vite, criando chunk separado para `lucide-react`
- Fixed:
  - Limite do histÃ³rico para evitar crescimento indefinido do arquivo (mantÃ©m apenas as Ãºltimas 100 entradas)
  - Uso do campo `command_type` na badge do HistoryPanel em vez de `kind`
- Removed:
  - Targets de bundle `deb`, `appimage` e `dmg` (foco em Windows: MSI e NSIS)
  - LÃ³gica de histÃ³rico acoplada ao hook `useToast` (responsabilidades separadas)
- Security:
  - Sem alteraÃ§Ãµes especÃ­ficas de seguranÃ§a nesta versÃ£o, alÃ©m de melhorias indiretas de robustez (limite de histÃ³rico e melhor tratamento de erros de UI).
</details>
## v1.5.0 - 2026-07-20
<details>
<summary>Ver detalhes da versÃ£o</summary>
- Added:
  - Script de inicializaÃ§Ã£o de tema em `index.html` usando `localStorage` e `prefers-color-scheme`
  - Tokens de tema para campos de entrada (`--input-bg`, `--input-border`) e estilos especÃ­ficos para SettingsModal e sistema de toasts
  - ConfiguraÃ§Ã£o de `build.rs` em `src-tauri/Cargo.toml` para personalizaÃ§Ã£o de build
- Changed:
  - AtualizaÃ§Ã£o das dependÃªncias para Tauri 2.x e reorganizaÃ§Ã£o de plugins (`opener`, `dialog`, `global-shortcut`)
  - Capabilities padrÃ£o mais restritas, removendo acesso direto a shell e filesystem
  - Setup do backend garantindo diretÃ³rios de dados/histÃ³rico e mantendo o app funcional mesmo quando o atalho global Ctrl+Space nÃ£o puder ser registrado
  - Contrato de histÃ³rico no frontend (`HistoryEntry`) usando strings literais para tipo de comando
  - EstilizaÃ§Ã£o de inputs, modais, Ã­cones de comando e preview de favicon para melhor consistÃªncia entre temas claro/escuro
- Fixed:
  - Download de favicon passa a validar `content-type`, evitando salvar respostas HTML (erros 404 etc.) como imagens
  - Pequenas melhorias de robustez na inicializaÃ§Ã£o e no armazenamento de comandos
- Removed:
  - MÃ³dulo de plugins nativos (`PluginManager`), incluindo descoberta dinÃ¢mica e execuÃ§Ã£o de plugins externos
  - MÃ³dulo de erros customizados (`AppError/AppResult`)
  - MÃ³dulo central de modelos (`models.rs`) em favor de uma estrutura mais enxuta e alinhada com os comandos atuais
  - PermissÃµes de shell e filesystem nas capabilities default
- Security:
  - Endurecimento do fluxo de download de favicons ao aceitar apenas content-types iniciados em `image/`, reduzindo o risco de tratar conteÃºdo inesperado como imagem
</details>
