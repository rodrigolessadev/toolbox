## v1.35.1 - 2026-09-11

# Toolbox v1.35.1

Esta versão traz importantes correções de estabilidade, compatibilidade e experiência visual para usuários de **Linux**, **WSL2** e melhorias no site oficial de download.

---

### 🐧 Compatibilidade Linux & Empacotamento AppImage

- **Correção de Artefatos Gráficos no WebKitGTK**: Desativação do renderizador DMABuf no Linux (`WEBKIT_DISABLE_DMABUF_RENDERER=1`), eliminando as linhas diagonais em formato de 'X' que apareciam sobre inputs e selects ([#148](https://github.com/rodrigolessadev/toolbox/issues/148) via [#154](https://github.com/rodrigolessadev/toolbox/pull/154)).
- **Isolamento de Ambiente para Plugins Python**: Sanitização de variáveis de ambiente herdadas do runtime AppImage (`PYTHONHOME`, `PYTHONPATH`, `PYTHONEXECUTABLE`), garantindo que plugins do marketplace executem no ambiente Python correto sem conflitos de dependências ([#149](https://github.com/rodrigolessadev/toolbox/issues/149) via [#155](https://github.com/rodrigolessadev/toolbox/pull/155)).
- **Sanitização de Execução de Comandos Externos**: Limpeza de variáveis de sistema do AppImage (`LD_LIBRARY_PATH`, `PATH`) ao invocar ferramentas externas e comandos virtuais como o *Toolbox Release* ([#150](https://github.com/rodrigolessadev/toolbox/issues/150) via [#156](https://github.com/rodrigolessadev/toolbox/pull/156)).

---

### 🪟 Integração e Experiência sob WSL2

- **Atalho Global `Ctrl+Space` no WSL2**: Tratamento aprimorado de captura no Linux e integração com o *focus-bridge*, garantindo disparo e foco consistentes da paleta de comandos no WSL2 ([#151](https://github.com/rodrigolessadev/toolbox/issues/151) via [#157](https://github.com/rodrigolessadev/toolbox/pull/157)).
- **Abertura de Links no Navegador do Windows**: Comandos do tipo `link` acionados a partir do WSL2 agora são delegados diretamente ao navegador padrão do host Windows (`cmd.exe /c start`), com escape seguro de parâmetros de URL ([#152](https://github.com/rodrigolessadev/toolbox/issues/152) via [#158](https://github.com/rodrigolessadev/toolbox/pull/158)).

---

### 🌐 Site Oficial & Downloads

- **Correção de Crash de Hooks na Home**: Correção na ordem de execução de hooks do React que provocava a desmontagem inesperada dos botões de download após o carregamento inicial ([#153](https://github.com/rodrigolessadev/toolbox/issues/153) via [#159](https://github.com/rodrigolessadev/toolbox/pull/159)).
- **Pré-carregamento SSR e Opções Fixas**: Integração de SSR via Astro para entrega instantânea dos links de release, mantendo opções fixas e simétricas para Windows (`.exe` / `.msi`) e Linux (`.deb` / `.AppImage`).

---

**Full Changelog**: https://github.com/rodrigolessadev/toolbox/compare/v1.35.0...v1.35.1

## v1.35.0 - 2026-09-11

# Toolbox v1.35.0

Esta versão traz melhorias substanciais na experiência de atualização automática no Linux, correções críticas no instalador de pacotes Debian e paridade completa entre Windows e Linux na landing page oficial.

---

### 🚀 Novas Funcionalidades

- **Auto-Update em Espaço de Usuário via AppImage no Linux ([#142](https://github.com/rodrigolessadev/toolbox/issues/142)):**
  - O Toolbox agora é capaz de se atualizar no Linux de forma 100% transparente e atômica quando executado como AppImage.
  - Elimina a necessidade de permissões root ou execução manual de `sudo dpkg -i`.
  - Suporta substituição in-place sobre `$APPIMAGE`, renomeação atômica (`.old`), aplicação automática de permissões executáveis (`+x`) e reinicialização automática do processo.
  - Para instalações de sistema (`.deb`), o assistente continua fornecendo a opção de download com instruções claras para atualização administrativa.

---

### 🐛 Correções de Bugs e Estabilidade

- **Resolução do Erro `not a Debian format archive` no Auto-Updater ([#143](https://github.com/rodrigolessadev/toolbox/issues/143)):**
  - Corrigido o download de pacotes `.deb` que resultava em arquivos corrompidos ou payloads HTML de erro.
  - Configurado cliente HTTP `reqwest` com cabeçalho `User-Agent: Toolbox-Desktop-Updater` e política explícita de seguimento de redirecionamentos (necessária para os links de CDN da API do GitHub Releases).
  - Implementada validação estrita do cabeçalho de assinatura Unix `ar` (`!<arch>\n`) nos pacotes `.deb`, prevenindo que arquivos inválidos ou arquivos gzip brutos (`0x1f, 0x8b`) sejam gravados como pacotes de sistema.
  - Adicionados testes unitários no backend Rust cobrindo cenários de integridade de arquivo.

---

### 🌐 Site Institucional e Instaladores

- **Correção da URL de Instalação One-Liner no Terminal ([#144](https://github.com/rodrigolessadev/toolbox/issues/144)):**
  - Corrigido o domínio quebrado `toolbox.rodrigolessa.dev` no comando de terminal para resolução dinâmica de host (`window.location.origin`) com fallback seguro para `https://toolbox-nine-phi.vercel.app`.
- **Instalador Oficial para Windows via PowerShell One-Liner ([#144](https://github.com/rodrigolessadev/toolbox/issues/144)):**
  - Adicionada aba nativa para Windows no terminal interativo da home com o comando:
    ```powershell
    irm https://toolbox-nine-phi.vercel.app/install.ps1 | iex
    ```
  - Novo script `install.ps1` que consulta a API de releases mais recente do GitHub, baixa com validação e executa o instalador oficial `.exe`.
- **Paridade Visual e Resiliência na Home ([#144](https://github.com/rodrigolessadev/toolbox/issues/144)):**
  - Botões de download do Windows e Linux mantidos com destaque primário vibrante (`btn-primary` e `is-recommended`) em todas as plataformas.
  - Otimização do estado de carregamento inicial (SSR/Loading) para evitar layout shift e links desabilitados.

---

### 🔗 Pull Requests Relacionados

- **[PR #145](https://github.com/rodrigolessadev/toolbox/pull/145):** `feat(updater): implementar auto-update in-place para appimage no linux em espaco de usuario` (Closes [#142](https://github.com/rodrigolessadev/toolbox/issues/142))
- **[PR #146](https://github.com/rodrigolessadev/toolbox/pull/146):** `fix(updater): validar cabecalho debian ar e redirecionamento no download do updater` (Closes [#143](https://github.com/rodrigolessadev/toolbox/issues/143))
- **[PR #147](https://github.com/rodrigolessadev/toolbox/pull/147):** `fix(site): corrigir url do instalador one-liner e garantir visibilidade e paridade da versao windows na home` (Closes [#144](https://github.com/rodrigolessadev/toolbox/issues/144))
```

---

### 📋 3. Checklist para Publicação

1. **Aprovar e Mesclar os PRs na branch `main`:**
   - [ ] [PR #145](https://github.com/rodrigolessadev/toolbox/pull/145) (Issue #142)
   - [ ] [PR #146](https://github.com/rodrigolessadev/toolbox/pull/146) (Issue #143)
   - [ ] [PR #147](https://github.com/rodrigolessadev/toolbox/pull/147) (Issue #144)
2. **Atualizar a Versão nos Arquivos do Projeto (após merge na `main`):**
   - No app `toolbox-release`, selecionar o repositório `toolbox` e aplicar o bump para **`1.35.0`** (ou executar a sincronização em `package.json`, `src-tauri/tauri.conf.json` e `src-tauri/Cargo.toml`).
3. **Disparar a Publicação:**
   - Iniciar o release pelo **Toolbox Release** ou criar a tag `v1.35.0` e push para disparar o pipeline do GitHub Actions que compila e assina os binários para Windows (`.exe`, `.msi`) e Linux (`.AppImage`, `.deb`).


## v1.34.0 - 2026-09-10

## v1.34.0 - 2026-09-10 (Linux Multiplatform Release)

### 🐧 Toolbox v1.34.0 — Paridade Nativa Linux, WSL2 e Plataforma Multi-SO

Esta versão marca a consolidação completa da migração do Toolbox para o ecossistema Linux e WSL2, transformando o aplicativo em uma plataforma desktop verdadeiramente multiplataforma com instaladores oficiais, atualização inteligente contextual por sistema operacional, isolamento de runtimes e alta disponibilidade.

---

### 🚀 Novas Funcionalidades & Empacotamento Linux
* **Instaladores Nativos para Linux (.deb e AppImage) (Closes #122):**
  - Adicionado suporte oficial aos alvos de empacotamento `"deb"` e `"appimage"` no [tauri.conf.json](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src-tauri/tauri.conf.json), com resolução de dependências de sistema (`libwebkit2gtk-4.1`, `libgtk-3-0`, `libappindicator3-1`).
  - Geração de pacote Debian instalável via `dpkg`/`apt` e binário portátil autossuficiente `AppImage`, ambos com entrada de desktop (.desktop), ícones e metadados de sistema.
* **Instalador One-Liner para Terminal (Closes #124):**
  - Adicionado comando de instalação rápida via terminal na landing page do site (`curl -fsSL https://.../install.sh | bash`) com detecção automática da distribuição e download assistido.
* **Portal Web com Detecção Inteligente de SO (Closes #124, #137):**
  - Componente [DownloadButton.tsx](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/site/src/components/DownloadButton.tsx) reformulado para identificar a plataforma do usuário via `User-Agent`, priorizando `.deb`/`.AppImage` para usuários Linux e `.exe`/`.msi` para Windows, acompanhado de tag `★ Recomendado`.
  - Página `/download` atualizada com matriz comparativa categorizada por sistema operacional e checagem visual de paridade.

---

### 🔄 Atualizações & Distribuição Multiplataforma
* **Fluxo Contextual de Atualização por Sistema Operacional (Closes #123, #131):**
  - O motor de update no [src-tauri/src/lib.rs](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src-tauri/src/lib.rs) agora atua sob a estrutura `InstallUpdateResult`, fornecendo o fluxo correto para cada ambiente:
    - **Windows:** Elevação UAC transparente para instaladores em `Program Files`.
    - **Linux AppImage:** Substituição atômica *in-place* do arquivo executável.
    - **Linux Deb / WSL2:** Download automático do `.deb` para o diretório temporário, com cópia automática do comando `sudo dpkg -i ...` para a Área de Transferência e orientações na tela.
  - Interceptação defensiva no verificador de atualizações ([SettingsModal.tsx](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src/components/SettingsModal.tsx)): usuários Linux não recebem mais mensagens vermelhas de erro quando a release remota ainda não possuir binários empacotados para sua distribuição.

---

### ⚡ Runtimes, Plugins & Interoperabilidade WSL2
* **Paridade de Runtimes e Ambientes Virtuais (.venv) (Closes #122, #129):**
  - O resolvedor de runtimes em [runtimes.rs](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src-tauri/src/runtimes.rs) agora detecta e prioriza ambientes virtuais (`.venv` ou `venv`) na raiz de cada plugin, mapeando `bin/python3` no Linux e `Scripts/python.exe` no Windows.
  - Abstração das pastas de bibliotecas `site-packages` entre Unix e Windows, garantindo que plugins que dependem de pacotes externos funcionem isoladamente em qualquer sistema.
* **Tratamento de Falhas e Health-Check de Plugins na UI (Closes #129):**
  - O [executor.rs](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src-tauri/src/executor.rs) agora monitora o `stderr` imediatamente após o spawn do plugin. Erros de inicialização (falta de bibliotecas GTK/WebKit ou dependências Python) agora exibem o traceback real na interface, eliminando falhas silenciosas.
* **Bridge de Foco e Execução Nativa no WSL2 (Closes #120, #130):**
  - Módulo [wsl.rs](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src-tauri/src/wsl.rs) para detecção de ambiente WSLg e conversão de caminhos absolutos do Windows (`C:\...` para `/mnt/c/...`), permitindo rodar binários PE do Windows diretamente sem passar pelo intermediário instável `cmd.exe /c start`.
  - Tratamento de diretório de trabalho `/mnt/c` para evitar erros com caminhos de rede UNC (`\\wsl.localhost\...`).
  - Implementação de [focus-bridge.ps1](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/scripts/wsl-bridge/focus-bridge.ps1) para trazer janelas executadas no host Windows para o primeiro plano.
  - Sanitização rigorosa de argumentos contra injeção de shell (`^`, `&`, `|`, `%`, `<`, `>`).

---

### 🎨 Interface, UX & Correções Visuais
* **Contraste e Legibilidade de Dropdowns em Tema Escuro (Closes #132):**
  - Resolução do problema crônico no WebKitGTK/Chromium no Linux onde opções `<option>` de seletores suspensos herdavam fundo branco do sistema operacional com texto claro do tema escuro.
  - Padronização explícita de `background-color` e `color` para `.select option`, `.modal__field select option` e estados de foco/seleção em todos os modais.

---

### ♻️ Infraestrutura, Feedback & Performance
* **Migração de Feedback do Supabase para Google Sheets Webhook (Closes #138):**
  - Substituição definitiva da persistência no Supabase por um Webhook HTTP no Google Apps Script integrado ao Google Sheets, eliminando pausas por inatividade do banco de dados e garantindo disponibilidade contínua 24/7.
  - Remoção completa do pacote `@supabase/supabase-js`, resultando em uma redução de até **94%** no bundle do módulo de feedback.
  - Implementação de cliente HTTP nativo em [feedback.ts](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/src/lib/feedback.ts) baseado em `fetch` com `AbortController` (timeout de 10s) e log estruturado de auditoria local.

---

### 🛡️ CI/CD & Quality Gates
* **Matriz de Compilação Multiplataforma (PR #128):**
  - Workflow de release ([release.yml](file:///home/rodrigo/git/toolbox-ecosystem/toolbox/.github/workflows/release.yml)) expandido para compilação simultânea em runners `windows-latest` e `ubuntu-22.04`.
* **Quality Gate de Paridade Estrita (Closes #137):**
  - Inclusão do job `verify-release-parity`, que impede que qualquer release seja publicada caso faltem artefatos de uma das plataformas suportadas.

