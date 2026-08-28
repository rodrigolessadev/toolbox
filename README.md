# 🧰 Toolbox 2.0

Coleção de utilitários desktop construídos com [Tauri 2](https://tauri.app/) + **React** + **TypeScript**, organizados como plugins independentes, comandos do sistema e ferramentas integradas. Cada utilitário é um app autocontido de alta performance.

> 🌐 **Site oficial:** [toolbox-nine-phi.vercel.app](https://toolbox-nine-phi.vercel.app)

---

## ✨ Recursos (Toolbox 2.0)

- **Arquitetura baseada em plugins & protocolo v1.0** — Comunicação assíncrona IPC (STDIN/STDOUT JSON/NDJSON) entre o container Tauri e plugins em Python/Node/binários
- **Comandos do Sistema & Execução Dinâmica** — Descoberta automática de executáveis no PATH, ferramentas do Windows e execução direta ou com elevação de Administrador (UAC)
- **Persistência & Cache Nativo em SQLite** — Inicialização instantânea com cache SQLite em Rust para indexação de comandos e preferências
- **Interfaces React Integradas** — Modais integradas no shell para *Stract JSON*, *Converter Data*, *Gerador de Marcações* e *Gerador de AFD*
- **Marketplace Seguro** — Download e atualização de plugins com verificação SHA-256, proteção Zip Slip e validação estrita de manifestos a partir do repositório [`toolbox-plugins`](https://github.com/rodrigolessadev/toolbox-plugins)
- **Design System Acessível** — Modos Claro, Escuro e Alto Contraste (WCAG 2.1 AA) e suporte ao Material 3
- **Configurações & Backup** — Gerenciamento de preferências, exportação e backup de banco de dados e chave mestra
- **Fallback Garantido** — Execução em janela legada Tkinter preservada para compatibilidade de plugins legados
- **Logs Estruturados** — Roteamento automático de logs para `logs/toolbox.log`

---

## 🚀 Stack

| Camada        | Tecnologia                       |
| ------------- | -------------------------------- |
| Runtime       | [Tauri 2](https://tauri.app/)    |
| Backend       | Rust (`rusqlite`, `tokio`, IPC)  |
| Frontend      | React 18 + TypeScript            |
| Banco Local   | SQLite                           |
| Protocolo IPC | Protocol v1.0 (JSON/NDJSON)      |
| Build         | Vite                             |
| Empacotamento | Tauri Bundler                    |
| CI/CD         | GitHub Actions                   |

---

## 📋 Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/) 18+ (recomendado Node 22+)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows)
- Dependências do Tauri para o seu SO: <https://tauri.app/start/prerequisites/>

---

## 🛠️ Instalação

```bash
git clone https://github.com/rodrigolessadev/toolbox.git
cd toolbox
npm install
```

---

## 💻 Comandos

| Comando            | Descrição                                |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Inicia o frontend Vite em desenvolvimento|
| `npm run build`    | Compila o frontend React/TypeScript      |
| `npm run tauri dev`| Inicia o app Tauri completo em modo dev  |
| `npm run tauri build` | Gera o instalador nativo multiplataforma|

---

## ⌨️ Atalhos

| Atalho           | Ação                                |
| ---------------- | ----------------------------------- |
| `Ctrl/Cmd + K`   | Abre a busca de comandos e plugins  |
| `Ctrl/Cmd + ,`   | Abre as configurações               |
| `Ctrl + Enter`   | Executa a ação da modal aberta     |
| `Esc`            | Fecha diálogos/modais               |

---

## 🧩 Ferramentas e Plugins

| Plugin / Ferramenta    | Modo Integrado | Protocolo v1.0 | Fallback Tkinter | Testes |
| ---------------------- | :------------: | :------------: | :--------------: | :----: |
| `stract-json`          |       ✅       |       ✅       |        ✅        |   ✅   |
| `converter-data`       |       ✅       |       ✅       |        ✅        |   ✅   |
| `gerador-marcacoes`    |       ✅       |       ✅       |        ✅        |   ✅   |
| `gerador-afd`          |       ✅       |       ✅       |        ✅        |   ✅   |
| `cpf`                  |       —        |       —        |        ✅        |   ✅   |
| `calc-jornadas`        |       —        |       —        |        ✅        |   ✅   |
| `gerador-json`         |       —        |       —        |        ✅        |   ✅   |
| `_template`            |       —        |       —        |        —         |   —    |

> Para criar um novo plugin, consulte [`docs/plugin-protocol.md`](./docs/plugin-protocol.md) e [`docs/PLUGIN_GUIDE.md`](./docs/PLUGIN_GUIDE.md).

---

## 📁 Estrutura do projeto

```
toolbox/
├── .github/
│   └── workflows/              # CI/CD (GitHub Actions)
├── docs/                       # Documentação técnica e arquitetura
│   ├── ARCHITECTURE.md         # Decisões de arquitetura e IPC
│   ├── PLUGIN_GUIDE.md         # Guia de desenvolvimento de plugins
│   ├── design-system.md        # Tokens de design e acessibilidade
│   └── FUTURE.md               # Roadmap e evolução
├── plugins/                    # Plugins locais e templates
├── site/                       # Código-fonte do site oficial (Astro 5)
├── src/                        # Frontend React/TypeScript
│   ├── components/             # CommandInput, Modais, Marketplace, Settings
│   ├── hooks/                  # useCommands, useTheme, useToasts
│   ├── lib/                    # Bridge com a API Tauri (IPC)
│   ├── styles/                 # Tailwind / CSS Custom Properties
│   └── types/                  # Definições TypeScript
├── src-tauri/                  # Backend nativo em Rust
│   ├── src/
│   │   ├── commands_store.rs   # Gerenciamento de comandos
│   │   ├── system_commands.rs  # Indexação do PATH e execução como Admin
│   │   ├── storage.rs          # Persistência e cache SQLite
│   │   ├── marketplace.rs      # Gestão de plugins remotos
│   │   ├── executor.rs         # Roteador de execução de processos
│   │   └── lib.rs              # Registro de comandos Tauri
│   └── Cargo.toml
├── releases.md                 # Histórico completo de versões
├── package.json
└── vite.config.ts
```

---

## ⚙️ CI/CD

O projeto usa **GitHub Actions** para automatizar build, testes e release. As definições ficam em `.github/workflows/`.

---

## 🎨 Temas

Suporte a três temas:

- ☀️ **Claro**
- 🌙 **Escuro**
- 🔳 **Alto contraste**

A configuração é persistida por usuário via SQLite/localStorage.

---

## 📚 Documentação adicional

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — decisões de arquitetura e módulos Rust/Tauri
- [`docs/PLUGIN_GUIDE.md`](./docs/PLUGIN_GUIDE.md) — como criar um novo plugin
- [`docs/FUTURE.md`](./docs/FUTURE.md) — roadmap e ideias futuras
- [`releases.md`](./releases.md) — notas de release e changelog oficial

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para mudanças grandes, abra primeiro uma *issue* para discutir o que você gostaria de mudar.

1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [`LICENSE`](./LICENSE) para mais detalhes.

---

## 🌐 Site

Acesse [toolbox-nine-phi.vercel.app](https://toolbox-nine-phi.vercel.app) para ver a vitrine dos plugins, changelog e downloads.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/rodrigolessadev">Rodrigo Lessa</a>
</p>

