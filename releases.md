## v1.32.1 - 2026-08-28 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.32.1/Toolbox_1.32.1_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🐛 Correções & Interface (UI/UX)
- **Correção de Sobreposição dos Botões nas Configurações (#107):**
  - Corrigida a colisão visual e travamento de largura nos botões da seção *Backup & Sincronização Automática* (`Abrir Pasta`, `Fazer Backup`, `Restaurar`), que herdavam indevidamente dimensões fixas de 36px.
  - Implementada a classe semântica `.settings__btn-action` com dimensionamento dinâmico, espaçamento padronizado (`gap: 8px`), suporte a quebra responsiva de linha (`flex-wrap`) e estados visuais aprimorados em todas as seções de ações do modal de Configurações (*Pastas*, *Comandos do Sistema*, *Backup* e *Feedback*).

</details>

## v1.32.0 - 2026-08-28 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.32.0/Toolbox_1.32.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### ⚡ Melhorias de Performance & Arquitetura
- **Persistência de Comandos do Sistema no SQLite Central (#105):** Criada a tabela `system_commands_cache` no `toolbox.db` para armazenamento permanente e leitura instantânea (< 1ms) de comandos e utilitários do sistema operacional, eliminando a varredura pesada de disco no startup.
- **Indexação Nativa Ultrarrápida do Windows (#105):** Substituição da leitura bruta de diretórios no `System32`/`SysWOW64`/`PATH` pela consulta direta a fontes nativas:
  - Registro do Windows (`App Paths` em `HKLM` e `HKCU` via `winreg`);
  - Atalhos do Menu Iniciar (`.lnk` em Programas);
  - Aliases de execução do WindowsApps;
  - Catálogo embutido de ferramentas administrativas e consoles essenciais (`services.msc`, `regedit`, `taskmgr`, `wt`, etc.).
- **Inicialização Assíncrona & Não Bloqueante (#105):** O scan inicial roda em background thread sem travar o carregamento da interface ou o canal IPC do Tauri, prevenindo telas brancas e quedas de hooks de atalhos globais (`Ctrl + Space`).

### ⚙️ Interface & Configurações
- **Reindexação Sob Demanda (#105):** Adicionado botão **"Reindexar Comandos"** na aba de Configurações, com indicador de progresso (spinner) e notificação toast com o total de comandos indexados.

</details>

## v1.31.0 - 2026-08-28 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.31.0/Toolbox_1.31.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## O que há de novo na v1.31.0

### 🚀 Novas Funcionalidades
- **Descoberta Dinâmica de Comandos do PATH:** Agora o Toolbox pesquisa e executa utilitários do sistema operacional, consoles MMC (`services.msc`, `compmgmt.msc`), itens do painel de controle (`sysdm.cpl`) e App Execution Aliases (`wt.exe` / Windows Terminal) mesmo que não estejam previamente cadastrados na lista de comandos.
- **Atalho de Elevação UAC (Executar como Administrador):** Pressione `Ctrl + Shift + Enter` ou `Ctrl + Enter` em qualquer comando para executá-lo imediatamente com privilégios elevados.
- **Tratamento Gracioso de Cancelamento do UAC:** Se o prompt de elevação for recusado ou cancelado, o aplicativo exibe uma mensagem informativa sem disparar falhas ou travar.
- **Precedência Inteligente de Busca:** Seus comandos cadastrados e favoritos continuam com prioridade máxima nos resultados de busca.
- **Barra de Action Hints:** Rodapé visual com atalhos de navegação e execução rápida.
- **Controle em Configurações:** Opção dedicada no modal de Configurações para ativar ou desativar a descoberta automática de comandos do sistema a qualquer momento.

</details>

## v1.30.0 - 2026-08-27 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.30.0/Toolbox_1.30.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 📝 Rotação Diária de Logs & Retenção de 7 Dias (#98)
- **Nomenclatura Diária Padronizada:** Os logs do aplicativo passam a ser gerados no formato `toolbox-DD-MM-YYYY.log` (ex: `toolbox-27-08-2026.log`), facilitando a rastreabilidade por data.
- **Rotação Contínua e Automática:** O sistema detecta a transição de dias em tempo real e redireciona os registros para o arquivo do novo dia sem necessidade de reiniciar a aplicação.
- **Política de Retenção e Expurgos (7 Dias):** Rotina de limpeza automática executada na inicialização e na virada do dia, excluindo logs que completarem 1 semana (7 dias) de existência.
- **Testes Automatizados:** 44 testes unitários em Rust e build do frontend TypeScript executados com 100% de aprovação.

### 🔗 Issues & PRs Relacionados
- Closes #98
- PR: #101

</details>

## v1.29.0 - 2026-08-27 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.29.0/Toolbox_1.29.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🗄️ Auto-Migração Transparente & Persistência Relacional SQLite (#97)
- **Auto-Migração no Startup:** O Toolbox agora migra automaticamente no primeiro startup os dados de `commands.json`, `data/history.json` e `theme.txt` para o banco de dados `toolbox.db` (SQLite) em uma transação atômica e segura.
- **Backup de Segurança Automático:** O arquivo `commands.json` legado é preservado como cópia de backup `commands.json.migrated.bak`, garantindo risco zero de perda de dados.
- **Refatoração dos Handlers IPC:** Handlers do Tauri (`commands_store`, `history`, `paths`, `executor`) agora lêem e persistem diretamente no SQLite via `DatabaseManager`, mantendo shadow backup resiliente em segundo plano.
- **Interoperabilidade Preservada:** Os recursos de *Exportar Comandos* e *Importar Comandos* continuam aceitando e gerando JSON no formato amigável do Toolbox.
- **Testes Automatizados:** 41 testes unitários em Rust e build completo do frontend TypeScript validados com 100% de sucesso.

### 🔗 Issues & PRs Relacionados
- Closes #97
- PR: #100

</details>

## v1.27.2 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.27.2/Toolbox_1.27.2_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## v1.28.0 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.28.0/Toolbox_1.28.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🎨 Design System & Espaçamento Material Design 3 (#94)
- **Escala Oficial de Espaçamento M3:** Formalização dos tokens semânticos baseados no Grid de 4px / 8px (`--md-sys-spacing-none` até `--md-sys-spacing-xxxxl`) em `tokens.json` e folhas de estilo globais.
- **Utilitários no Tailwind CSS:** Integração de classes utilitárias de espaçamento (`m3-none`, `m3-xs`, `m3-sm`, `m3-md`, `m3-lg`, `m3-xl`, `m3-xxl`, `m3-xxxl`, `m3-xxxxl`) para simplificar o alinhamento de paddings, margins e gaps nos componentes.
- **Governança e Sincronização:** Sincronização automatizada de variáveis CSS com templates web e suíte de testes unitários dedicada no ecossistema.

### 🔗 Issues & PRs Relacionados
- Closes #94
- PR: #95

</details>

</details>

## v1.27.1 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.27.1/Toolbox_1.27.1_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🐛 Correções no Editor de Comandos & Seleção de Ícones
- **Persistência de Ícones Personalizados:** Corrigida a perda de estado e reversão para o modo Emoji/Texto ao selecionar imagens locais no editor de comandos.
- **Estabilização de Lifecycle do Modal:** Adicionada chave de ciclo de vida (`key`) e controle refinado de abertura no `AddCommandModal`, prevenindo resets de formulário disparados por perda/ganho de foco durante a abertura de diálogos nativos do sistema operacional.
- **Proteção de Auto-detecção:** Os efeitos de auto-busca de favicon e extração de ícone executável agora respeitam seleções manuais e personalizadas do usuário.

</details>

## v1.27.0 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.27.0/Toolbox_1.27.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🎨 Customização de Ícones & Comandos
- **Importação de Ícones Locais:** Agora você pode personalizar qualquer comando (links, aplicativos, scripts, snippets e plugins) importando suas próprias imagens (`.png`, `.ico`, `.svg`, `.jpg`, `.webp`).
- **Persistência Segura e Resiliente:** Os arquivos de ícones importados são armazenados internamente na pasta do Toolbox, evitando que o ícone quebre se o arquivo de origem for movido ou excluído.
- **Seletor Universal de Ícones:** Alterne facilmente entre emojis/texto, a biblioteca completa de ícones Lucide ou arquivos de imagem do seu computador diretamente no modal de criação e edição.

</details>

## v1.26.0 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.26.0/Toolbox_1.26.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🛡️ Segurança & Resiliência de Dados
- **Backup & Sincronização Automática de Comandos:** Todos os seus comandos agora contam com shadow backup automático salvo fora do AppData (priorizando pastas sincronizadas como o OneDrive e Documentos), protegendo suas configurações contra limpezas de temporários ou reinstalações do Windows.
- **Snapshot de Segurança Pré-Atualização:** Antes de atualizar para uma nova versão, o Toolbox grava um snapshot de segurança dos seus dados.
- **Restauração Inteligente em 1 Clique:** Detecção automática de backups existentes ao iniciar com uma base limpa e novo painel de controle de backup na tela de Configurações.

</details>

## v1.25.0 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.25.0/Toolbox_1.25.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🚀 Novidades & Funcionalidades
- **Snippets e Quick Copy:** Cadastre comandos personalizados com textos, caminhos ou trechos de código frequentes para copiar instantaneamente para a Área de Transferência com um clique ou pressionando `Enter` na busca.
- **Aba Snippets:** Nova aba dedicada na navegação principal (ao lado de Apps) para organizar, filtrar e gerenciar seus trechos de texto.
- **Busca Aprimorada:** O buscador rápido agora também localiza snippets pelo conteúdo e observações.

</details>

## v1.24.0 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.24.0/Toolbox_1.24.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🚀 Novidades & Funcionalidades
- **Scripts Inline:** Agora é possível cadastrar e rodar pequenos scripts e automações diretamente pelo Toolbox sem a necessidade de criar arquivos avulsos no disco.
- **Suporte a PowerShell e Batch:** Escolha entre PowerShell (.ps1) e Batch (.bat) com editor integrado e limite de segurança de até 150 linhas.
- **Elevação de Privilégios (UAC):** Opção para executar os scripts cadastrados no modo Administrador.

</details>

## v1.23.0 - 2026-08-26 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.23.0/Toolbox_1.23.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## 🚀 Toolbox Desktop v1.23.0

### ✨ Novidades e Recursos (Features)
- **Execução Nativa de Scripts PowerShell e Batch:**
  - Suporte ao cadastro e disparo direto de scripts PowerShell (`.ps1`) e arquivos de lote (`.bat`, `.cmd`) na aba de Aplicativos.
  - Execução segura e transparente invocando `powershell.exe` (com `-NoProfile` e `Bypass`) e `cmd.exe` (`/c`).
  - Suporte a argumentos extras e opção de elevação de privilégios como Administrador (UAC) para scripts.
  - Identificação visual e ícones dedicados de Terminal para scripts na listagem de comandos.

### 🔗 Issues & PRs Relacionados
- Closes #81
- PR: #83

</details>

## v1.22.3 - 2026-08-25 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.22.3/Toolbox_1.22.3_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🐛 Padronização da Execução de Plugins em Janelas Independentes (#78, #79)

- **Abertura Dedicada de Plugins (#78):** Removida a interceptação interna legada que forçava a execução dos comandos `converter-data`, `stract-json`, `gerador-marcacoes` e `gerador-afd` em modais React. Agora todos os plugins executam em suas janelas externas e isoladas (pywebview).
- **Limpeza de Código e Otimização do Bundle:** Removidos componentes modais duplicados e estados não utilizados, simplificando a árvore de renderização do `App.tsx` e reduzindo o peso do bundle frontend.
- **Histórico & Atalhos:** Preservado o registro no histórico de comandos e o fluxo de teclado/navegação sem interceptações espúrias.

---

### 🛡️ Testes & Governança
- **Compilação Frontend / TypeScript:** `npm run build` e compilação de tokens Material Design 3 validados sem erros.

</details>

## v1.22.2 - 2026-08-24 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.22.2/Toolbox_1.22.2_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 💬 Estabilização do Feedback, React Portal & Logs Estruturados (#73, #75, #76)

- **Renderização via React Portal (#73, #74):** Teletransporte do `FeedbackModal` diretamente para o `document.body` com controle de ciclo de vida seguro para SSR (`mounted`). Isso elimina o corte visual superior na tela causado pelo `backdrop-filter` do cabeçalho, garantindo centralização perfeita tanto no Portal Web (`toolbox-nine-phi.vercel.app`) quanto no Aplicativo Desktop.
- **Fallbacks Nativos do Supabase (#75):** Injeção de configurações padrão para a chave pública anônima no cliente TypeScript, assegurando funcionamento instantâneo e envio de feedbacks sem depender de variáveis manuais em runtime.
- **Logs Estruturados no `toolbox.log` (#76, #77):** Novo comando Tauri `log_event` em Rust para registro detalhado de todas as etapas de envio de feedbacks (início, validações, medição de latência em milissegundos e respostas do Supabase) no arquivo nativo `logs/toolbox.log`.

---

### 🛡️ Testes & Governança
- **Compilação Rust:** `cargo check` aprovado com 100% de sucesso.
- **Compilação TypeScript / Frontend:** `npm run build` do Desktop e da documentação Astro validados sem erros.

</details>

## v1.22.1 - 2026-08-24 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.22.1/Toolbox_1.22.1_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

- Melhorias gerais e correções de desempenho.

</details>

## v1.22.0 - 2026-08-24 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.22.0/Toolbox_1.22.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 💬 Sistema Unificado de Feedback com Supabase (#65, #66, #67)
- **Modal de Feedback no App Desktop (#67):** Adicionado modal nativo com Design Tokens Material 3, detecção automática da versão em execução (`app_version`), botão de atalho rápido no cabeçalho e opção dedicada na aba de Configurações.
- **Feedback no Portal Web (#66):** Integrado componente React no portal de documentação (`toolbox-nine-phi.vercel.app`) com atalhos no cabeçalho e rodapé.
- **Proteção Anti-Spam & Validações:** Suporte a campo Honeypot invisível contra robôs, contador de caracteres em tempo real (10 a 5.000 caracteres) e suporte ao fechamento com a tecla ESC.
- **Infraestrutura Supabase & RLS (#65):** Migration SQL oficial com políticas de Row Level Security (RLS) que garantem inserções anônimas protegidas sem exposição de leitura ou edição pública.

### 🛡️ Testes & Qualidade
- 30 testes unitários em Rust e builds de produção do Desktop e da documentação Astro 100% aprovados.

</details>


## v1.21.2 - 2026-08-24 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.21.2/Toolbox_1.21.2_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Toolbox — v1.21.2 (2026-08-24)
<details>
<summary>Ver detalhes da versão</summary>

### 🐛 Correção de Empacotamento de Recursos (#62)
- **Runtime Completo Embutido:** Ajustado o pattern de empacotamento do Tauri para inclusão recursiva profunda (`resources/runtime/**/*`), garantindo que todos os binários do Python e dependências essenciais (`pywebview`, `boto3`, `requests`) sejam incluídos no instalador `.exe` e `.msi`.
- **Instalador Autônomo:** Garantida a execução de plugins em qualquer ambiente Windows sem necessidade de pré-instalação manual do Python.

### 🛡️ Testes & Qualidade
- 30 testes unitários em Rust e compilação de frontend 100% aprovados.

</details>

</details>

## v1.21.1 - 2026-08-24 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.21.1/Toolbox_1.21.1_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Toolbox — v1.21.1 (2026-08-21)
<details>
<summary>Ver detalhes da versão</summary>

### ⚙️ Automação de Build & Runtime Embutido (#60)
- **Instalador Autossuficiente:** O processo de build agora baixa, configura e embute automaticamente a distribuição oficial do **Python 3.12** e as dependências essenciais (`pywebview`, `boto3`, `requests`).
- **Execução Sem Pré-requisitos:** Computadores sem Python instalado no Windows agora conseguem executar plugins Python e Webview diretamente após a instalação do Toolbox.
- **Preparação Automática (`npm run prepare:runtime`):** Rotina integrada no fluxo de compilação do instalador Tauri.

### 🛡️ Testes & Governança
- 30 testes unitários em Rust e compilação de frontend 100% aprovados.

</details>

</details>

## v1.21.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.21.0/Toolbox_1.21.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Toolbox — v1.21.0 (2026-08-21)
<details>
<summary>Ver detalhes da versão</summary>

### 🚀 Novas Funcionalidades
- **Suporte a Python Embutido (#58):** O Toolbox agora suporta execução de plugins através de uma distribuição integrada de Python (Embedded Runtime), permitindo funcionamento imediato e isolado sem requerer instalação prévia do Python no Windows.
- **Resolução em Cascata de Runtimes:** Busca automática priorizando o runtime embutido com fallback transparente para o Python do sistema operacional.
- **Painel de Runtimes nas Configurações:** Nova seção visual nas Configurações exibindo o status, versão e origem do interpretador ativo (Embutido ou Sistema).

### 🛡️ Testes & Estabilidade
- Atualizada a suíte de testes unitários para cobrir os fluxos de resolução e isolamento de ambiente (`30 testes aprovados`).

</details>

</details>

## v1.20.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.20.0/Toolbox_1.20.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Toolbox — v1.20.0 (2026-08-21)
<details>
<summary>Ver detalhes da versão</summary>

### 🚀 Novas Funcionalidades
- **Detecção de Runtimes no Marketplace (#56):** O Toolbox agora verifica silenciosamente se o interpretador Python está disponível na máquina ao navegar pelo catálogo de plugins.
- **Avisos de Pré-Requisitos e Ações Rápidas:** Plugins dependentes de Python exibem uma badge de advertência e um banner orientativo com link direto de download oficial (`python.org`) e botão para copiar o comando de instalação via `winget`.
- **Mensagens Amigáveis no Executor:** Em caso de tentativa de execução de um plugin sem o interpretador configurado, o aplicativo orienta o usuário de forma clara sobre como resolver a dependência.

### 🛡️ Testes & Estabilidade
- Adicionados testes automatizados para verificação e consulta de runtimes do sistema no backend Rust (`30 testes aprovados`).

</details>

</details>

## v1.19.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.19.0/Toolbox_1.19.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## v1.19.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.19.0/Toolbox_1.19.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🚀 Marketplace & Resiliência de Download (#54)
- **Retry Inteligente com Backoff Exponencial:** O instalador e atualizador de plugins agora realiza até 3 tentativas automáticas com intervalos progressivos (2s, 4s, 6s) ao encontrar instabilidades de rede ou respostas HTTP transitórias.
- **Tratamento de Propagação de Release:** Eliminação de falhas prematuras (HTTP 404) quando um plugin recém-publicado ainda está sendo indexado na CDN do GitHub.
- **Mensagens Contextuais e Orientativas:** Se o arquivo de release ainda estiver em processamento após as tentativas, o usuário recebe uma notificação clara e amigável orientando a aguardar 1 a 2 minutos para a propagação da CDN.

### 🛡️ Estabilidade & Qualidade
- Tratamento aprimorado de timeouts e integridade na camada HTTP do backend Tauri.
- 100% da suíte de testes de integração e validação do Marketplace aprovada.

</details>

</details>

## v1.18.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.18.0/Toolbox_1.18.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## v1.18.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.18.0/Toolbox_1.18.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🚀 Novas Funcionalidades & Auto-Updater
- **Botão Verificar Atualização (#51):** Adicionado botão interativo de checagem manual sob demanda na seção *Atualizações do Sistema* da tela de Configurações (`SettingsModal`).
- **Feedback em Tempo Real:** Indicador de carregamento animado com spinner (`Verificando...`), exibição do timestamp da última consulta bem-sucedida e notificações toast contextuais.
- **Acionamento Imediato:** Quando uma nova versão for detectada, a interface atualiza dinamicamente o card com a versão encontrada e habilita o botão "Atualizar agora".

### ⚡ Backend Tauri (Rust)
- **Comando `check_update`:** Endpoint IPC serializável nativo que consulta o manifesto de atualização e emite eventos `update-available`.

### 🎨 Design System & UX
- Novos estilos e micro-animações para botões de verificação e linhas de atualização alinhados ao Material Design 3.

</details>

</details>

## v1.17.1 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.17.1/Toolbox_1.17.1_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🎨 Design System & Material Design 3
- Sincronização automática de Design Tokens M3 (`tokens.json` ➔ `theme.css` / `index.ts`).
- Suporte aprimorado para temas Claro e Escuro com paletas harmônicas e contraste acessível (WCAG AA).
- Padronização de componentes visuais, elevações e tipografia responsiva.

### 🚀 Novas Funcionalidades & Auto-Updater
- Reativação completa do manifesto de atualização contínua (`latest.json`) no pipeline de empacotamento Tauri.
- Compatibilidade total do notificador de novas versões para usuários em builds anteriores.
- Integração nativa com novos plugins corporativos do catálogo (ex: *Logon AWS & Port Forwarding*).

### 🐛 Correções & Estabilidade
- Resiliência na compilação do instalador desktop em múltiplos ambientes com tratamento inteligente de chaves de assinatura.
- Otimização no carregamento de ícones e fontes offline para inicialização ultra-rápida.
- Validação automática de Quality Gates pré-release para garantia de integridade SemVer.

</details>

## v1.17.0 - 2026-08-21 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.17.0/Toolbox_1.17.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🎨 Design System & Material Design 3
- Sincronização automática de Design Tokens M3 (`tokens.json` ➔ `theme.css` / `index.ts`).
- Suporte aprimorado para temas Claro e Escuro com paletas harmônicas e contraste acessível (WCAG AA).
- Padronização de componentes visuais, elevações e tipografia responsiva.

### 🚀 Novas Funcionalidades & Auto-Updater
- Reativação completa do manifesto de atualização contínua (`latest.json`) no pipeline de empacotamento Tauri.
- Compatibilidade total do notificador de novas versões para usuários em builds anteriores.
- Integração nativa com novos plugins corporativos do catálogo (ex: *Logon AWS & Port Forwarding*).

### 🐛 Correções & Estabilidade
- Resiliência na compilação do instalador desktop em múltiplos ambientes com tratamento inteligente de chaves de assinatura.
- Otimização no carregamento de ícones e fontes offline para inicialização ultra-rápida.
- Validação automática de Quality Gates pré-release para garantia de integridade SemVer.

</details>

## v1.17.00 - 2026-08-20 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.17.00/Toolbox_1.17.00_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### 🎨 Design System & Material Design 3
- Adoção de novos componentes visuais e superfícies tonais M3.
- Suporte aprimorado a temas Claro e Escuro com transição suave.

### 📦 Design Tokens & Temas
- Atualização e sincronização dos tokens de cores, formas e tipografia.
- Exportação automatizada de variáveis CSS e presets de estilização.

### 🚀 Novas Funcionalidades & Automações
- Novas opções e fluxos de trabalho adicionados aos módulos do ecossistema.

### 🐛 Correções & Ajustes
- Correções de bugs, tratamento de exceções e melhorias de estabilidade.

### ♿ Acessibilidade (WCAG AA)
- Conformidade estrita de contraste de cores (mínimo 4.5:1 / 3.0:1) em todas as interfaces.

</details>

## v1.16.11 - 2026-08-19 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.11/Toolbox_1.16.11_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

### Adicionado
- **Marketplace de Plugins**: Botão "Atualizar todos" exibido dinamicamente na barra de filtros e no rodapé do modal quando há plugins com nova versão disponível.
- **Atualização em Lote Progressiva**: Execução sequencial resiliente com indicadores visuais de carregamento e feedback consolidado via toast ao término.

### Corrigido
- **Fluxo de Atualização de Plugins**: O modal de criação de atalho/comando (`InstallPluginModal`) agora é suprimido durante atualizações (individuais ou em lote), preservando os comandos e configurações pré-existentes.

</details>

## v1.16.10 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.10/Toolbox_1.16.10_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Documentação Didática e Passo a Passo dos Plugins
- **Guias Amigáveis de Usuário**: Reformulação de toda a documentação dos 10 plugins do catálogo no site do Toolbox com instruções claras passo a passo ("no campo X, preencha Y; clique em Z").
- **Exemplos Práticos e Dicas**: Inclusão de cenários reais de uso, explicações visuais de cada funcionalidade e alertas para prevenção de erros comuns no dia a dia.

</details>

## v1.16.9 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.9/Toolbox_1.16.9_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## v1.16.9 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.9/Toolbox_1.16.9_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Herança Automática de Ícones Oficiais de Plugins
- **Preservação de Ícones no Marketplace**: Ao instalar novos plugins, o comando criado herda e persiste automaticamente o ícone oficial Lucide do manifesto do plugin.
- **Detecção Automática no Cadastro de Comandos**: Ao selecionar ou apontar a pasta de um plugin no `AddCommandModal`, o ícone oficial é pré-carregado no seletor de ícones.
- **Fallback Inteligente na Lista de Comandos**: Na listagem principal (`CommandItem`), comandos do tipo `plugin` sem ícone explícito consultam os metadados dos plugins instalados para exibir o ícone Lucide oficial correspondente antes de recorrer ao fallback `🧩`.

</details>

</details>

## v1.16.8 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.8/Toolbox_1.16.8_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## v1.16.8 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.8/Toolbox_1.16.8_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Sincronização de Tema com Plugins Externos
- **Injeção de Tema Ativo no Runtime**: O executor de plugins agora propaga a variável de ambiente `TOOLBOX_THEME` e o argumento de linha de comando `--theme <light|dark>` ao iniciar processos de plugins Python e baseados em protocolo.
- **Integração com Design System**: Permite que plugins gráficos (Tkinter) abram dinamicamente com o tema claro ou escuro configurado no Toolbox.

</details>

</details>

## v1.16.7 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.7/Toolbox_1.16.7_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## v1.16.7 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.7/Toolbox_1.16.7_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Instalação de Atualização com Elevação de Administrador (UAC)
- **Elevação Automática no Windows**: O processo de atualização agora baixa o instalador e o executa explicitamente com privilégios de Administrador (`runas` / UAC), permitindo atualizar a instalação em `Program Files` sem falhas de permissão.
- **Encerramento Gracioso**: Após o início do instalador elevado, o Toolbox se encerra automaticamente para liberar os binários em uso e evitar conflitos de bloqueio de arquivo.
- **Tratamento de Cancelamento**: Mensagem clara de retorno caso o usuário recuse o diálogo de confirmação do UAC.

</details>

</details>

## v1.16.7 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.7/Toolbox_1.16.7_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Padronização de Ícones dos Cards do Marketplace com Lucide
    - **Renderização Dinâmica de Ícones**: Substituição do mapeamento estático de emojis por resolução dinâmica de componentes vetoriais `lucide-react` para os cards de plugins no Marketplace.
    - **Fallbacks Resilientes**: Suporte completo para ícones vetoriais Lucide, favicons/imagens (`data:` / `http`) e fallback seguro para o ícone padrão `Puzzle`.
    - **Harmonização Visual do Modal**: Substituição dos caracteres/emojis no cabeçalho e botão de atualização por componentes vetoriais (`ShoppingBag`, `RotateCw`, `X`) com animação contínua de rotação durante requisições de
  recarregamento do catálogo.
    - **Aprimoramento de Contraste e Tokens CSS**: Estilização do container de ícones dos cards (`.marketplace__item-icon`) com cores semânticas (`var(--accent)`, `var(--border)`, `var(--bg)`), garantindo alto contraste no tema
  escuro e claro.
  ──────

</details>

## v1.16.6 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.6/Toolbox_1.16.6_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Harmonização Visual do Cabeçalho e Alternância de Tema
- **Ícones Vetoriais Padronizados**: Substituição dos botões com caracteres e emojis (`☀️`/`🌙`, `+`, `🛒`, `⚙`, `✦`, `✕`) por ícones vetoriais monocromáticos da biblioteca `lucide-react` (`Sun`, `Moon`, `Plus`, `ShoppingBag`, `Settings`, `History`, `X`).
- **Coerência Contextual de Grupo**: Unificação da barra de ações do cabeçalho (`.app__header-actions`) com alinhamento pixel-perfect, dimensões e espessura de traço consistentes.
- **Herança de Cores e Estados Ativos**: Ícones adaptados automaticamente para herdar `currentColor`, tokens semânticos de tema (`var(--fg)`, `var(--accent)`) e suporte ao estado ativo destacado para o painel de Histórico.

</details>

## v1.16.5 - 2026-08-17 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.5/Toolbox_1.16.5_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Marketplace Resiliente & Tolerância a Falhas
- **Validação de Status HTTP**: Prevenção do erro `Catálogo inválido: expected value at line 2 column 1` ao validar respostas HTTP 2xx e descartar páginas de erro (como 503 `Backend.max_conn reached`, 429 ou HTML).
- **Retentativa Automática**: Adicionada retentativa automática com timeout de 6s para lidar com oscilações temporárias de rede.
- **Cache Local Persistente em Disco**: O catálogo obtido com sucesso agora é gravado em `catalog_cache.json` no diretório de dados, permitindo acesso instantâneo e offline.
- **Catálogo Embutido de Contingência**: Disponibilizado catálogo embutido de fallback para garantir funcionamento mesmo em ambientes sem conectividade externa inicial.
- **Melhorias de UX no Modal de Marketplace**: Adicionado estado visual de feedback com botão de "Tentar novamente".

</details>

## v1.16.4 - 2026-08-17 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.4/Toolbox_1.16.4_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Modo Claro e Escuro
- **Sincronização de Tema**: Integração completa do hook `useTheme` para gerenciar os modos `light`, `dark` e `system`.
- **Alternância Rápida no Cabeçalho**: Adicionado botão de toggle (`☀️`/`🌙`) na barra de ações principal para troca instantânea de tema.
- **Detecção do Sistema Operacional**: Adicionado listener em tempo real para `prefers-color-scheme`, atualizando a interface dinamicamente conforme o sistema do usuário.
- **Configurações e Persistência**: Sincronização do `<select>` de temas em Configurações com o `localStorage` e persistência no arquivo `theme.txt` do backend Tauri.
- **Contraste Visual no Modo Claro**: Ajuste nos componentes `TitleBar` e modais para uso dos tokens semânticos CSS, garantindo alto contraste e perfeita legibilidade.

</details>

## v1.16.3 - 2026-08-14 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.3/Toolbox_1.16.3_x64-setup.exe)
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - (sem novas adições nesta versão)

- Changed:
  - Modo do instalador de atualização configurado para `basicUi` no Windows para exibir a barra de progresso da instalação e solicitar a elevação do UAC do Windows.

- Fixed:
  - Correção na desserialização do catálogo do Marketplace: adicionados valores padrão e tolerância a campos ausentes (`language`, `icon`, `author`, `command`), eliminando o erro ao abrir o Marketplace.
  - Correção na instalação de atualizações do Toolbox no Windows: adicionada execução com elevação de Administrador (`runas` / UAC) caso o updater nativo encontre restrições de permissão.

- Removed:
  - (sem itens nesta versão)

- Security:
  - (sem alterações de segurança nesta versão)

</details>

## v1.16.2 - 2026-08-14 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.2/Toolbox_1.16.2_x64-setup.exe)
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - (sem novas adições nesta versão)

- Changed:
  - Mecanismo de busca de comandos otimizado com algoritmo de relevância ponderada: correspondências pelo nome do comando (exatas, prefixo ou palavras) agora têm prioridade máxima sobre correspondências em argumentos, caminhos ou URLs.

- Fixed:
  - Correção na ordenação de resultados da busca, evitando que comandos secundários com URLs extensas sejam exibidos antes de comandos diretamente relevantes pelo nome.

- Removed:
  - (sem itens nesta versão)

- Security:
  - (sem alterações de segurança nesta versão)

</details>

## v1.16.1 - 2026-08-14 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.1/Toolbox_1.16.1_x64-setup.exe)
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - (sem novas adições nesta versão)

- Changed:
  - Exclusão de plugins agora protege diretórios de desenvolvimento (plugins locais/embutidos), impedindo remoção acidental de arquivos do projeto em desenvolvimento.

- Fixed:
  - Correção na exclusão de comandos e plugins: impede que a remoção de um plugin em diretório de desenvolvimento/workspace apague os arquivos físicos do disco (Issue #10).

- Removed:
  - (sem itens nesta versão)

- Security:
  - Prevenção contra exclusão acidental de arquivos locais de plugins em desenvolvimento.

</details>

## v1.16.0 - 2026-08-14 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.0/Toolbox_1.16.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Destaque visual no ícone do Marketplace (carrinho 🛒) com token de destaque `var(--accent)`, tooltip informativa e badge com contagem exata quando houver plugins com atualização disponível.
  - Destaque visual no ícone de Configurações (⚙️) com token de destaque `var(--accent)`, tooltip indicando a nova versão e badge de aviso `!` quando houver update do Toolbox.
  - Seção dedicada "Atualizações do Sistema" na modal de Configurações, exibindo a versão atual instalada e o botão "Atualizar agora" exclusivamente quando houver nova versão disponível.

- Changed:
  - Fluxo de atualização de plugins no Marketplace: atualizações de plugins já instalados agora ocorrem de forma direta e isolada via backend IPC, preservando 100% dos comandos cadastrados em `commands.json` sem solicitar nova parametrização.

- Fixed:
  - Eliminação da chamada indevida do modal de criação de comando (`InstallPluginModal`) ao clicar em "Atualizar" em plugins existentes.

- Removed:
  - (sem itens nesta versão)

- Security:
  - Preservação da integridade de comandos e configurações locais durante o ciclo de vida de atualização de plugins.

</details>

## v1.15.0 - 2026-08-13 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.15.0/Toolbox_1.15.0_x64-setup.exe)
<details>
<summary>Ver detalhes da versão</summary>

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
<summary>Ver detalhes da versão</summary>

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
<summary>Ver detalhes da versão</summary>

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
<summary>Ver detalhes da versão</summary>

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
<summary>Ver detalhes da versão</summary>

- Added:
  - Definição de um logger global baseado em arquivo para centralizar os registros da aplicação.

- Changed:
  - Ajustes cosméticos de formatação em código de extração de ícone no Windows.
  - Logger padrão deixa de usar saída no console (stderr) e passa a depender do logger de arquivo.

- Fixed:
  - Tratamento de erros do catálogo do marketplace com logs detalhados para falhas de rede, leitura e JSON inválido.
  - Fluxo de download e instalação de plugins mais robusto, com logs em falhas de rede, criação de pastas e processamento do ZIP.

- Removed:
  - Saída de logs via `env_logger` no console padrão (stderr).

- Security:
  - Validação adicional do arquivo de plugin baixado, verificando se o conteúdo retornado possui assinatura de ZIP antes da extração.

</details>

## v1.11.0 - 2026-07-23
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Configuração de markdown no site com Shiki (tema `github-dark-dimmed`) e suporte preparado para GFM.
  - Nova versão da página de arquitetura com linguagem mais amigável e front-matter para SEO.

- Changed:
  - `astro.config.mjs` atualizado para o modelo de saída estática do Astro 5, com domínio fixo `https://toolbox.seudominio.com.br`.
  - Stack do site ajustada para versões compatíveis com Astro 5 (`astro`, `@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`, `@astrojs/vercel`).
  - Favicon do site redesenhado com ícone minimalista.
  - Conteúdo da página de arquitetura simplificado e voltado para usuários finais em vez de detalhes internos de implementação.

- Fixed:
  - N/A (nenhuma correção de bug específica identificada neste patch).

- Removed:
  - N/A (não houve remoção de funcionalidades, apenas substituição de conteúdo/visual).

- Security:
  - N/A (nenhuma alteração diretamente relacionada à segurança identificada).

</details>

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
  - Modal de comando agora diferencia visualmente modo criação e modo edição (título e texto do botão).
  - Estilo dos títulos de comandos atualizado para permitir quebra de linha e evitar truncamento.

- Fixed:
  - Removida a limitação de não conseguir editar comandos existentes (agora podem ser atualizados em vez de recriados).

- Removed:
  - Nenhum recurso removido nesta versão.

- Security:
  - Sem alterações relacionadas à segurança nesta versão.

</details>

## v1.9.1 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Ao detectar o atalho `Ctrl+Space`: foco automático no campo de busca principal e fechamento de modais temporários (Add, Settings, Marketplace).

- Changed:
  - Comportamento de navegação e atalhos de teclado refinados.

- Fixed:
  - Prevenção do comportamento padrão do navegador ao pressionar `Ctrl+Space`.

- Removed:
  - N/A

- Security:
  - Sem alterações de segurança nesta versão.

</details>

## v1.9.0 - 2026-07-21
<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Suporte a auto-update via `tauri-plugin-updater`, com endpoint de releases no GitHub.
  - Campo de argumentos extras para comandos do tipo "Aplicativo", com parsing que respeita aspas.
  - Campo de argumentos na modal de criação de comandos, com hint sobre uso semelhante ao "Destino" de atalhos do Windows.

- Changed:
  - Ordem das abas na modal de comandos: agora a aba padrão é "Link", seguida de "Aplicativo" e "Plugin".
  - Comportamento da busca: o texto é limpo após executar um comando com Enter.
  - Ícones do aplicativo e instalador MSI atualizados para refletir a nova versão.

- Fixed:
  - Melhoria de UX ao criar comandos e executar buscas, reduzindo confusão com filtros persistentes.

- Removed:
  - N/A

- Security:
  - Configuração de chave pública de updater e geração de artefatos de atualização, garantindo integridade das atualizações baixadas.

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
