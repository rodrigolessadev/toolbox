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



