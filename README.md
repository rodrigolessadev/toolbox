# ⚡ Toolbox

Aplicativo desktop moderno, leve e extensível para Windows — semelhante ao PowerToys Run / Alfred / Wox, **mas com sistema de plugins próprio**.

Construído com **Tauri 2 + Rust + React + TypeScript**.

## ✨ Recursos

- 🎯 Campo único para digitar e executar comandos
- 🔌 Sistema de plugins (Python, Node, Rust, binário) — descubra, instale e use sem recompilar
- 🔗 Comandos do tipo **Link** (abrem URL no navegador padrão)
- ▶️ Comandos do tipo **Aplicativo** (executam `.exe`)
- 🔍 Autocomplete em tempo real
- 📜 Histórico persistente dos últimos 100 comandos
- ⭐ Sistema de favoritos
- 🎨 Tema claro e escuro
- ⌨️ Atalho global **Ctrl + Space** para abrir/fechar
- 📁 Importar / Exportar `commands.json`
- 🪟 Janela sem decoração, transparente, sempre no topo
- 📝 Logs em `logs/toolbox.log`
- 🪶 Build standalone pequeno (~5–10 MB)

## 📁 Estrutura

```
toolbox/
├── commands.json          # comandos cadastrados
├── package.json           # deps JS
├── vite.config.ts         # build do frontend
├── tsconfig.json
├── index.html
├── src/                   # frontend React + TS
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/api.ts         # wrappers para invoke() do Tauri
│   ├── styles/
│   └── types/
├── src-tauri/             # backend Rust
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   ├── icons/
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       ├── commands_store.rs
│       ├── plugins.rs
│       ├── executor.rs
│       ├── history.rs
│       ├── logger.rs
│       ├── models.rs
│       ├── paths.rs
│       └── error.rs
├── plugins/               # plugins externos
│   ├── cpf/
│   ├── gerador-json/
│   └── _template/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PLUGIN_GUIDE.md
│   └── FUTURE.md
├── logs/
└── CHANGELOG.md
```

## 🚀 Como rodar (desenvolvimento)

### Pré-requisitos

- **Rust** 1.77+ — <https://rustup.rs>
- **Node.js** 18+ — <https://nodejs.org>
- **Python** 3.7+ (para os plugins de exemplo)
- **Microsoft C++ Build Tools** (necessário para o Tauri no Windows)
- **WebView2 Runtime** (já vem no Windows 11; no 10 instalar separadamente)

### Passos

```bash
git clone <repo>
cd toolbox

# 1) Instalar deps do frontend
npm install

# 2) Rodar em modo dev (hot-reload)
npm run tauri:dev
```

A janela do Toolbox abrirá automaticamente.

### Build de produção (instalador .msi / .exe)

```bash
npm run tauri:build
```

O instalador será gerado em `src-tauri/target/release/bundle/`.

## 🧪 Testando os plugins

Após o app iniciar, digite:

- `cpf` → abre a janela do Validador de CPF
- `gerador-json` → abre o Gerador de JSON
- `google` → abre https://google.com.br no navegador
- `notepad` → abre o Bloco de Notas do Windows

## ➕ Cadastrando novos comandos

Clique no botão `+` no canto superior direito e escolha o tipo:

- **Plugin** — informa nome + caminho (será salvo em `plugins/<nome>/`)
- **Link** — informa nome + URL
- **Aplicativo** — informa nome + caminho do `.exe`

## 🎨 Temas

Botão 🌙/☀ no topo alterna entre tema claro e escuro. A preferência é persistida em `localStorage`.

## ⌨️ Atalhos

| Atalho | Ação |
|--------|------|
| `Ctrl + Space` | Abre / fecha o Toolbox |
| `↑` / `↓` | Navega entre os comandos |
| `Enter` | Executa o comando selecionado |
| `Esc` | Esconde a janela |

## 📚 Documentação adicional

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — diagrama e módulos
- [PLUGIN_GUIDE.md](docs/PLUGIN_GUIDE.md) — como criar plugins em qualquer linguagem
- [FUTURE.md](docs/FUTURE.md) — roadmap e ideias de evolução

## 📝 Licença

MIT — veja [LICENSE](LICENSE).
