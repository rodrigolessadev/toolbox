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

