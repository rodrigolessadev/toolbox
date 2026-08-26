## v1.24.0 - 2026-08-26

### 🚀 Novidades & Funcionalidades
- **Scripts Inline:** Agora é possível cadastrar e rodar pequenos scripts e automações diretamente pelo Toolbox sem a necessidade de criar arquivos avulsos no disco.
- **Suporte a PowerShell e Batch:** Escolha entre PowerShell (.ps1) e Batch (.bat) com editor integrado e limite de segurança de até 150 linhas.
- **Elevação de Privilégios (UAC):** Opção para executar os scripts cadastrados no modo Administrador.

## v1.23.0 - 2026-08-26

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

## v1.22.3 - 2026-08-25

### 🐛 Padronização da Execução de Plugins em Janelas Independentes (#78, #79)

- **Abertura Dedicada de Plugins (#78):** Removida a interceptação interna legada que forçava a execução dos comandos `converter-data`, `stract-json`, `gerador-marcacoes` e `gerador-afd` em modais React. Agora todos os plugins executam em suas janelas externas e isoladas (pywebview).
- **Limpeza de Código e Otimização do Bundle:** Removidos componentes modais duplicados e estados não utilizados, simplificando a árvore de renderização do `App.tsx` e reduzindo o peso do bundle frontend.
- **Histórico & Atalhos:** Preservado o registro no histórico de comandos e o fluxo de teclado/navegação sem interceptações espúrias.

---

### 🛡️ Testes & Governança
- **Compilação Frontend / TypeScript:** `npm run build` e compilação de tokens Material Design 3 validados sem erros.

## v1.22.2 - 2026-08-24

### 💬 Estabilização do Feedback, React Portal & Logs Estruturados (#73, #75, #76)

- **Renderização via React Portal (#73, #74):** Teletransporte do `FeedbackModal` diretamente para o `document.body` com controle de ciclo de vida seguro para SSR (`mounted`). Isso elimina o corte visual superior na tela causado pelo `backdrop-filter` do cabeçalho, garantindo centralização perfeita tanto no Portal Web (`toolbox-nine-phi.vercel.app`) quanto no Aplicativo Desktop.
- **Fallbacks Nativos do Supabase (#75):** Injeção de configurações padrão para a chave pública anônima no cliente TypeScript, assegurando funcionamento instantâneo e envio de feedbacks sem depender de variáveis manuais em runtime.
- **Logs Estruturados no `toolbox.log` (#76, #77):** Novo comando Tauri `log_event` em Rust para registro detalhado de todas as etapas de envio de feedbacks (início, validações, medição de latência em milissegundos e respostas do Supabase) no arquivo nativo `logs/toolbox.log`.

---

### 🛡️ Testes & Governança
- **Compilação Rust:** `cargo check` aprovado com 100% de sucesso.
- **Compilação TypeScript / Frontend:** `npm run build` do Desktop e da documentação Astro validados sem erros.


## v1.22.1 - 2026-08-24

- Melhorias gerais e correções de desempenho.


## v1.22.0 - 2026-08-24

## Toolbox — v1.22.0 (2026-08-24)
<details>
<summary>Ver detalhes da versão</summary>

### 💬 Sistema Unificado de Feedback com Supabase (#65, #66, #67)
- **Modal de Feedback no App Desktop (#67):** Adicionado modal nativo com Design Tokens Material 3, detecção automática da versão em execução (`app_version`), botão de atalho rápido no cabeçalho e opção dedicada na aba de Configurações.
- **Feedback no Portal Web (#66):** Integrado componente React no portal de documentação (`toolbox-nine-phi.vercel.app`) com atalhos no cabeçalho e rodapé.
- **Proteção Anti-Spam & Validações:** Suporte a campo Honeypot invisível contra robôs, contador de caracteres em tempo real (10 a 5.000 caracteres) e suporte ao fechamento com a tecla ESC.
- **Infraestrutura Supabase & RLS (#65):** Migration SQL oficial com políticas de Row Level Security (RLS) que garantem inserções anônimas protegidas sem exposição de leitura ou edição pública.

### 🛡️ Testes & Qualidade
- 30 testes unitários em Rust e builds de produção do Desktop e da documentação Astro 100% aprovados.

</details>

## v1.21.2 - 2026-08-24

## Toolbox — v1.21.2 (2026-08-24)
<details>
<summary>Ver detalhes da versão</summary>

### 🐛 Correção de Empacotamento de Recursos (#62)
- **Runtime Completo Embutido:** Ajustado o pattern de empacotamento do Tauri para inclusão recursiva profunda (`resources/runtime/**/*`), garantindo que todos os binários do Python e dependências essenciais (`pywebview`, `boto3`, `requests`) sejam incluídos no instalador `.exe` e `.msi`.
- **Instalador Autônomo:** Garantida a execução de plugins em qualquer ambiente Windows sem necessidade de pré-instalação manual do Python.

### 🛡️ Testes & Qualidade
- 30 testes unitários em Rust e compilação de frontend 100% aprovados.

</details>

## v1.21.1 - 2026-08-24

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

## v1.21.0 - 2026-08-21

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

## v1.20.0 - 2026-08-21

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

## v1.19.0 - 2026-08-21

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

## v1.18.0 - 2026-08-21

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


## v1.17.1 - 2026-08-21

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

## v1.17.0 - 2026-08-21

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


## v1.17.00 - 2026-08-20

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


## v1.16.11 - 2026-08-19

### Adicionado
- **Marketplace de Plugins**: Botão "Atualizar todos" exibido dinamicamente na barra de filtros e no rodapé do modal quando há plugins com nova versão disponível.
- **Atualização em Lote Progressiva**: Execução sequencial resiliente com indicadores visuais de carregamento e feedback consolidado via toast ao término.

### Corrigido
- **Fluxo de Atualização de Plugins**: O modal de criação de atalho/comando (`InstallPluginModal`) agora é suprimido durante atualizações (individuais ou em lote), preservando os comandos e configurações pré-existentes.

## v1.16.10 - 2026-08-18

## Documentação Didática e Passo a Passo dos Plugins
- **Guias Amigáveis de Usuário**: Reformulação de toda a documentação dos 10 plugins do catálogo no site do Toolbox com instruções claras passo a passo ("no campo X, preencha Y; clique em Z").
- **Exemplos Práticos e Dicas**: Inclusão de cenários reais de uso, explicações visuais de cada funcionalidade e alertas para prevenção de erros comuns no dia a dia.

## v1.16.9 - 2026-08-18

## v1.16.9 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.9/Toolbox_1.16.9_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Herança Automática de Ícones Oficiais de Plugins
- **Preservação de Ícones no Marketplace**: Ao instalar novos plugins, o comando criado herda e persiste automaticamente o ícone oficial Lucide do manifesto do plugin.
- **Detecção Automática no Cadastro de Comandos**: Ao selecionar ou apontar a pasta de um plugin no `AddCommandModal`, o ícone oficial é pré-carregado no seletor de ícones.
- **Fallback Inteligente na Lista de Comandos**: Na listagem principal (`CommandItem`), comandos do tipo `plugin` sem ícone explícito consultam os metadados dos plugins instalados para exibir o ícone Lucide oficial correspondente antes de recorrer ao fallback `🧩`.

</details>

## v1.16.8 - 2026-08-18

## v1.16.8 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.8/Toolbox_1.16.8_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Sincronização de Tema com Plugins Externos
- **Injeção de Tema Ativo no Runtime**: O executor de plugins agora propaga a variável de ambiente `TOOLBOX_THEME` e o argumento de linha de comando `--theme <light|dark>` ao iniciar processos de plugins Python e baseados em protocolo.
- **Integração com Design System**: Permite que plugins gráficos (Tkinter) abram dinamicamente com o tema claro ou escuro configurado no Toolbox.

</details>

## v1.16.7 - 2026-08-18

## v1.16.7 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.7/Toolbox_1.16.7_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Instalação de Atualização com Elevação de Administrador (UAC)
- **Elevação Automática no Windows**: O processo de atualização agora baixa o instalador e o executa explicitamente com privilégios de Administrador (`runas` / UAC), permitindo atualizar a instalação em `Program Files` sem falhas de permissão.
- **Encerramento Gracioso**: Após o início do instalador elevado, o Toolbox se encerra automaticamente para liberar os binários em uso e evitar conflitos de bloqueio de arquivo.
- **Tratamento de Cancelamento**: Mensagem clara de retorno caso o usuário recuse o diálogo de confirmação do UAC.

</details>

## v1.16.7 - 2026-08-18

## Padronização de Ícones dos Cards do Marketplace com Lucide
    - **Renderização Dinâmica de Ícones**: Substituição do mapeamento estático de emojis por resolução dinâmica de componentes vetoriais `lucide-react` para os cards de plugins no Marketplace.
    - **Fallbacks Resilientes**: Suporte completo para ícones vetoriais Lucide, favicons/imagens (`data:` / `http`) e fallback seguro para o ícone padrão `Puzzle`.
    - **Harmonização Visual do Modal**: Substituição dos caracteres/emojis no cabeçalho e botão de atualização por componentes vetoriais (`ShoppingBag`, `RotateCw`, `X`) com animação contínua de rotação durante requisições de
  recarregamento do catálogo.
    - **Aprimoramento de Contraste e Tokens CSS**: Estilização do container de ícones dos cards (`.marketplace__item-icon`) com cores semânticas (`var(--accent)`, `var(--border)`, `var(--bg)`), garantindo alto contraste no tema
  escuro e claro.
  ──────

## v1.16.7 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.7/Toolbox_1.16.7_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Padronização de Ícones dos Cards do Marketplace com Lucide
- **Renderização Dinâmica de Ícones**: Substituição do mapeamento estático de emojis por resolução dinâmica de componentes vetoriais `lucide-react` para os cards de plugins no Marketplace.
- **Fallbacks Resilientes**: Suporte completo para ícones vetoriais Lucide, favicons/imagens (`data:` / `http`) e fallback seguro para o ícone padrão `Puzzle`.
- **Harmonização Visual do Modal**: Substituição dos caracteres/emojis no cabeçalho e botão de atualização por componentes vetoriais (`ShoppingBag`, `RotateCw`, `X`) com animação contínua de rotação durante requisições de recarregamento do catálogo.
- **Aprimoramento de Contraste e Tokens CSS**: Estilização do container de ícones dos cards (`.marketplace__item-icon`) com cores semânticas (`var(--accent)`, `var(--border)`, `var(--bg)`), garantindo alto contraste no tema escuro e claro.

</details>

## v1.16.6 - 2026-08-18

## v1.16.6 - 2026-08-18 [Download](https://github.com/rodrigolessadev/toolbox/releases/download/v1.16.6/Toolbox_1.16.6_x64-setup.exe)
<details>
<summary>Ver detalhes da versao</summary>

## Harmonização Visual do Cabeçalho e Alternância de Tema
- **Ícones Vetoriais Padronizados**: Substituição dos botões com caracteres e emojis (`☀️`/`🌙`, `+`, `🛒`, `⚙`, `✦`, `✕`) por ícones vetoriais monocromáticos da biblioteca `lucide-react` (`Sun`, `Moon`, `Plus`, `ShoppingBag`, `Settings`, `History`, `X`).
- **Coerência Contextual de Grupo**: Unificação da barra de ações do cabeçalho (`.app__header-actions`) com alinhamento pixel-perfect, dimensões e espessura de traço consistentes.
- **Herança de Cores e Estados Ativos**: Ícones adaptados automaticamente para herdar `currentColor`, tokens semânticos de tema (`var(--fg)`, `var(--accent)`) e suporte ao estado ativo destacado para o painel de Histórico.

</details>

## v1.16.5 - 2026-08-17

## Marketplace Resiliente & Tolerância a Falhas
- **Validação de Status HTTP**: Prevenção do erro `Catálogo inválido: expected value at line 2 column 1` ao validar respostas HTTP 2xx e descartar páginas de erro (como 503 `Backend.max_conn reached`, 429 ou HTML).
- **Retentativa Automática**: Adicionada retentativa automática com timeout de 6s para lidar com oscilações temporárias de rede.
- **Cache Local Persistente em Disco**: O catálogo obtido com sucesso agora é gravado em `catalog_cache.json` no diretório de dados, permitindo acesso instantâneo e offline.
- **Catálogo Embutido de Contingência**: Disponibilizado catálogo embutido de fallback para garantir funcionamento mesmo em ambientes sem conectividade externa inicial.
- **Melhorias de UX no Modal de Marketplace**: Adicionado estado visual de feedback com botão de "Tentar novamente".

## v1.16.4 - 2026-08-17

## Modo Claro e Escuro
- **Sincronização de Tema**: Integração completa do hook `useTheme` para gerenciar os modos `light`, `dark` e `system`.
- **Alternância Rápida no Cabeçalho**: Adicionado botão de toggle (`☀️`/`🌙`) na barra de ações principal para troca instantânea de tema.
- **Detecção do Sistema Operacional**: Adicionado listener em tempo real para `prefers-color-scheme`, atualizando a interface dinamicamente conforme o sistema do usuário.
- **Configurações e Persistência**: Sincronização do `<select>` de temas em Configurações com o `localStorage` e persistência no arquivo `theme.txt` do backend Tauri.
- **Contraste Visual no Modo Claro**: Ajuste nos componentes `TitleBar` e modais para uso dos tokens semânticos CSS, garantindo alto contraste e perfeita legibilidade.

## v1.16.3 - 2026-08-14

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

## v1.16.2 - 2026-08-14

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

## v1.16.1 - 2026-08-14

Crie um novo plugin chamado `log-optimizer` no repositório `toolbox-plugins`.

Objetivo:

Processar arquivos de log e gerar uma versão compacta, normalizada e estruturada, reduzindo duplicidade e volume sem perder as evidências relevantes para investigação de incidentes.

A implementação não pode utilizar IA, modelos de linguagem, APIs externas ou heurísticas não determinísticas.

Funcionalidades obrigatórias:

1. Aceitar logs nos formatos:
   - Texto simples.
   - JSON Lines/NDJSON.
   - Um JSON contendo uma lista de eventos.
   - Logs com stack trace multiline.
   - Arquivos UTF-8 e, quando possível, UTF-8 com BOM.

2. Detectar automaticamente:
   - Timestamp.
   - Nível do log.
   - Serviço.
   - Nome do arquivo.
   - Mensagem.
   - Request ID.
   - Trace ID.
   - Correlation ID.
   - Order ID.
   - User ID.
   - Endpoint.
   - Status HTTP.
   - Exceção.
   - Stack trace.

3. Aceitar configuração opcional:
   - Arquivo de entrada.
   - Arquivo de saída.
   - Níveis a preservar.
   - Intervalo de tempo.
   - Termos de busca.
   - IDs de correlação.
   - Quantidade máxima de amostras por grupo.
   - Limite máximo de caracteres por evento.
   - Lista de campos a preservar.
   - Lista de padrões de mascaramento.
   - Ativação ou desativação de agrupamento.
   - Modo de saída: resumo, timeline, clusters ou evidências.

4. Agrupar eventos semelhantes usando regras determinísticas:
   - Remover timestamps variáveis.
   - Normalizar UUIDs.
   - Normalizar números.
   - Normalizar endereços IP.
   - Normalizar IDs numéricos.
   - Normalizar valores entre aspas.
   - Normalizar durações.
   - Normalizar URLs com parâmetros variáveis.
   - Preservar a mensagem original em amostras.

5. Para cada grupo, gerar:
   - ID do grupo.
   - Template normalizado.
   - Quantidade de ocorrências.
   - Primeiro timestamp.
   - Último timestamp.
   - Níveis encontrados.
   - Serviços encontrados.
   - IDs de correlação associados.
   - Até N amostras.
   - Referência aos números das linhas originais.

6. Gerar uma timeline compacta contendo:
   - Eventos de nível ERROR, FATAL, CRITICAL e EXCEPTION.
   - Eventos associados a IDs informados.
   - Eventos próximos aos erros.
   - Mudanças de status.
   - Primeira e última ocorrência de cada grupo importante.

7. Gerar estatísticas:
   - Total de eventos.
   - Eventos processados.
   - Eventos ignorados.
   - Eventos inválidos.
   - Quantidade por nível.
   - Quantidade por serviço.
   - Quantidade por minuto.
   - Top templates de erro.
   - Quantidade de grupos encontrados.
   - Redução aproximada de linhas e caracteres.

8. Implementar mascaramento antes de gerar qualquer saída:
   - Authorization.
   - Bearer tokens.
   - Cookies.
   - JWTs.
   - API keys.
   - Senhas.
   - CPF.
   - E-mail, quando solicitado.
   - Números de cartão.
   - Valores de campos sensíveis.
   - Query parameters sensíveis.

9. Nunca modificar o arquivo original.

10. Quando o conteúdo exceder os limites:
    - Truncar de forma controlada.
    - Informar `truncated: true`.
    - Informar o total original.
    - Informar quantos registros foram mantidos.
    - Manter prioridade para erros e eventos correlacionados.

Defina uma entrada JSON semelhante a:

{
  "input_file": "caminho/arquivo.log",
  "output_file": "caminho/arquivo-otimizado.json",
  "options": {
    "levels": ["ERROR", "WARN", "FATAL"],
    "keywords": [],
    "correlation_ids": [],
    "group_repetitions": true,
    "samples_per_group": 3,
    "include_timeline": true,
    "include_statistics": true,
    "mask_sensitive_data": true,
    "max_output_chars": 500000
  }
}

Defina uma saída de sucesso semelhante a:

{
  "protocol_version": "1.0",
  "request_id": "req_x",
  "status": "success",
  "result": {
    "summary": {},
    "clusters": [],
    "timeline": [],
    "evidence": [],
    "output_file": "arquivo-otimizado.json",
    "statistics": {
      "input_lines": 0,
      "events_processed": 0,
      "events_discarded": 0,
      "clusters": 0,
      "characters_before": 0,
      "characters_after": 0,
      "reduction_percent": 0
    }
  },
  "error": null,
  "warnings": []
}

Inclua testes para:

- Log vazio.
- Log com uma única linha.
- Log JSON Lines.
- Log com stack trace.
- Eventos repetidos.
- Timestamps em formatos diferentes.
- Dados sensíveis.
- Arquivo inexistente.
- Conteúdo inválido.
- Limite de saída excedido.
- Preservação de eventos associados a request_id.

## v1.16.0 - 2026-08-14

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

## v1.16.0 - 2026-08-14

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

## v1.15.0 - 2026-08-13

## v1.15.0 - 2026-08-13 https://github.com/rodrigolessadev/toolbox/releases

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

## v1.14.0 - 2026-08-03

## v1.13.0 - 2026-08-03

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

## v1.13.0 - 2026-08-03

## v1.13.0 - 2026-08-03

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
  - (sem alterações relacionadas à segurança nesta versão)

</details>

## v1.13.0 - 2026-08-03

## v1.13.0 - 2026-08-03

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
  - (sem alterações relacionadas à segurança nesta versão)

</details>

## v1.12.0 - 2026-07-24

.

## v1.12.0 - 2026-07-24

Teste

## v1.12.0 - 2026-07-24

## v1.12.0 - 2026-07-24

<details>
<summary>Ver detalhes da versão</summary>

- Added:
  - Fluxo guiado de instalação de plugins com criação imediata de comando via modal dedicado.
  - Suporte a ícones do Lucide por nome nos comandos (ex.: `shield-check`, `puzzle`, `calculator`).
  - Geração automática de `plugin.json` padrão quando o pacote do plugin não inclui manifesto.
  - Detecção e remoção de pasta raiz extra em arquivos ZIP de plugins durante a instalação.

- Changed:
  - Resolução do caminho de plugins no executor para aceitar caminhos absolutos e relativos à pasta de plugins.
  - Exclusão de comandos do tipo plugin passou a tentar remover também a pasta física do plugin.
  - Layout dos ícones e truncamento dos títulos na lista de comandos para melhor legibilidade e alinhamento.

- Fixed:
  - Extração de plugins empacotados com uma única pasta raiz, evitando estruturas duplicadas de diretórios.
  - Remoção de plugins agora tenta desvincular e apagar comandos associados, evitando comandos órfãos.

- Removed:
  - (sem alterações nesta categoria)

- Security:
  - (sem alterações nesta categoria)

</details>

﻿## v1.11.1 - 2026-07-23

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

## v1.11.1 - 2026-07-23

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

## v1.11.1 - 

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

# Changelog

## v1.11.0 - 2026-07-23

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
---

---
title: "Changelog"
description: "HistÃ³rico de versÃµes do Toolbox."
---

Aqui ficam as mudanÃ§as de cada versÃ£o. O formato segue o padrÃ£o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## 1.0.0 â€” 16 de julho de 2026

Primeira versÃ£o pÃºblica.

### O que dÃ¡ para fazer

- Buscar comandos por nome (com atalhos de seta, Enter e Esc)
- Filtrar por abas: **Todos**, **Favoritos**, **Plugins**, **Links**, **Aplicativos** e **HistÃ³rico**
- Cadastrar trÃªs tipos de comando: link, aplicativo e plugin
- ConfiguraÃ§Ãµes: importar e exportar a lista de comandos, abrir pastas
- Tema claro e escuro (escolha fica salva)
- Avisos visuais (toasts) ao executar

### Plugins

- Vem com 3 plugins de exemplo:
  - **cpf** â€” abre janelinha para validar ou gerar CPF
  - **gerador-json** â€” abre janelinha para gerar dados fictÃ­cios em JSON
  - **_template** â€” modelo para criar seu prÃ³prio plugin
- Suporte a plugins em **Python**, **Node.js**, **Rust** (binÃ¡rio) ou **.exe** qualquer
- O Toolbox descobre plugins novos sozinho ao iniciar

### Outros recursos

- Atalho global `Ctrl+Space` para abrir e fechar
- Esconde sozinho quando vocÃª clica fora
- HistÃ³rico dos Ãºltimos 100 comandos executados
- Sistema de favoritos (estrelinha)
- Logs salvos em arquivo para diagnÃ³stico

### SeguranÃ§a

- Cada plugin roda em processo separado â€” se um plugin travar, o Toolbox continua funcionando
- ValidaÃ§Ã£o dos caminhos e links ao cadastrar



