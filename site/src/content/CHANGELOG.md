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



