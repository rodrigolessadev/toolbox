# 🧰 Toolbox

Coleção de utilitários desktop construídos com [Tauri 2](https://tauri.app/) + **React** + **TypeScript**, organizados como plugins independentes. Cada plugin é um pequeno app autocontido que resolve um problema específico do dia a dia.

> 🌐 **Site oficial:** [toolbox-nine-phi.vercel.app](https://toolbox-nine-phi.vercel.app)

---

## ✨ Recursos

- **Arquitetura baseada em plugins** — cada utilitário é um plugin isolado, fácil de adicionar, remover ou versionar
- **Stack moderna** — Tauri 2 (Rust) no backend, React + TypeScript no frontend
- **Multiplataforma** — builds para Windows, macOS e Linux
- **Temas personalizáveis** — claro, escuro e alto contraste
- **Cadastro de plugins** — habilite/desabilite plugins dinamicamente
- **Logs estruturados** — tudo em `logs/toolbox.log` para auditoria
- **Atalhos globais** — produtividade direto do teclado

---

## 🚀 Stack

| Camada       | Tecnologia                       |
| ------------ | -------------------------------- |
| Runtime      | [Tauri 2](https://tauri.app/)    |
| Backend      | Rust                             |
| Frontend     | React 18 + TypeScript            |
| Build        | Vite                             |
| Empacotamento| Tauri Bundler                    |
| CI/CD        | GitHub Actions                   |

---

## 📋 Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [pnpm](https://pnpm.io/) (ou npm/yarn)
- Dependências do Tauri para o seu SO: <https://tauri.app/start/prerequisites/>

---

## 🛠️ Instalação

```bash
git clone https://github.com/rodrigolessadev/toolbox.git
cd toolbox
pnpm install
```

---

## 💻 Comandos

| Comando            | Descrição                                |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Inicia o app em modo desenvolvimento     |
| `pnpm build`       | Gera o build de produção                 |
| `pnpm tauri dev`   | Inicia o app Tauri em modo dev           |
| `pnpm tauri build` | Gera o instalador nativo multiplataforma |

---

## ⌨️ Atalhos

| Atalho           | Ação                                |
| ---------------- | ----------------------------------- |
| `Ctrl/Cmd + K`   | Abre a busca de plugins             |
| `Ctrl/Cmd + ,`   | Abre as configurações               |
| `Esc`            | Fecha diálogos/modais               |

---

## 🧩 Plugins inclusos

| Plugin                 | Descrição                                              | Testes |
| ---------------------- | ------------------------------------------------------ | :----: |
| `cpf`                  | Geração e validação de CPF                             |   ✅   |
| `calc-jornadas`        | Cálculo de jornadas de trabalho                        |   ✅   |
| `converter-data`       | Conversão entre formatos de data                        |   ✅   |
| `gerador-marcacoes`    | Geração de marcações em texto (Markdown, HTML, etc.)   |   ✅   |
| `gerador-json`         | Geração de JSON a partir de schemas                    |   ✅   |
| `stract-json`          | Extração e transformação de JSON                       |   ✅   |
| `_template`            | Template base para criar novos plugins                 |   —    |

> Para criar um novo plugin, copie `plugins/_template/` e siga o `PLUGIN_GUIDE.md`.

---

## 📁 Estrutura do projeto

```
toolbox/
├── .github/
│   └── workflows/              # CI/CD (GitHub Actions)
├── builds/                     # Artefatos de build
├── graphify-out/               # Saída de grafos de dependências
├── logs/                       # Logs da aplicação (toolbox.log)
├── plugins/                    # Plugins do toolbox
│   ├── _template/              # Template base para novos plugins
│   ├── calc-jornadas/
│   ├── converter-data/
│   ├── cpf/
│   ├── gerador-json/
│   ├── gerador-marcacoes/
│   └── stract-json/
├── site/                       # Código-fonte do site oficial (Vercel)
├── src/                        # Frontend React/TypeScript
│   ├── components/
│   ├── hooks/
│   ├── lib/                    # Bridge com a API Tauri
│   ├── styles/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── .kiroignore
├── ARCHITECTURE.md             # Decisões de arquitetura
├── FUTURE.md                   # Roadmap
├── LICENSE
├── PLUGIN_GUIDE.md             # Como criar plugins
├── README.md
├── RELEASE.md                  # Notas de release
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                 # Config de deploy do site
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

A configuração é persistida por usuário.

---

## 🧾 Cadastro de plugins

Plugins podem ser ativados/desativados individualmente em **Configurações → Plugins**. Quando desativado, o plugin deixa de aparecer no menu e não consome recursos.

---

## 📚 Documentação adicional

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — decisões de arquitetura
- [`PLUGIN_GUIDE.md`](./PLUGIN_GUIDE.md) — como criar um novo plugin
- [`FUTURE.md`](./FUTURE.md) — roadmap e ideias futuras
- [`RELEASE.md`](./RELEASE.md) — notas de release

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
