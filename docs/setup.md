# Guia de Setup & Desenvolvimento — Toolbox 2.0

Este documento reúne os passos para configurar o ambiente de desenvolvimento local, tanto para o **aplicativo desktop (Tauri 2 + React + Rust)** quanto para o **site oficial (`site/` em Astro 5)**.

---

## 🖥️ 1. Setup do Aplicativo Desktop (Tauri 2)

### Pré-requisitos
- **Node.js**: v18+ (recomendado v22 ou v24)
- **Rust**: Versão estável instalada via `rustup` (`rustc --version`, `cargo --version`)
- **Windows (C++ Build Tools)**:
  - Instale o *Visual Studio Build Tools* selecionando a carga de trabalho "Desenvolvimento para Desktop com C++".
  - WebView2 Runtime (geralmente pré-instalado no Windows 10/11).

### Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/rodrigolessadev/toolbox.git
cd toolbox

# Instale as dependências Node
npm install

# Iniciar em modo de desenvolvimento (Frontend Vite + Backend Rust / Tauri)
npm run tauri dev

# Para compilar o instalador nativo (.exe / .msi)
npm run tauri build
```

---

## 🌐 2. Setup do Site Oficial (`site/`)

O diretório `site/` contém o portal web estático/híbrido construído com Astro 5 + React, preparado para hospedagem na Vercel.

### Estrutura do Site

```
site/                       # Projeto Astro independente
├── astro.config.mjs        # Config: output hybrid, adapter Vercel, MDX, sitemap
├── package.json            # Dependências: astro, react, @astrojs/vercel
├── tsconfig.json           # TypeScript strict
├── vercel.json             # Headers de segurança, framework astro
├── .env.example            # PUBLIC_GITHUB_REPO, PUBLIC_SITE_URL
├── public/
│   ├── favicon.svg
│   └── robots.txt
└── src/
    ├── styles/global.css   # Tema dark/light, tokens, utilitários
    ├── lib/
    │   ├── site.ts         # Configuração do site e navegação
    │   └── github.ts       # Integração com GitHub Releases API
    ├── components/         # Header, Footer, Cards, Ilhas React
    └── pages/              # Rotas, landing page e endpoints serverless
```

### Execução Local do Site

```bash
cd site
npm install
npm run dev      # Disponível em http://localhost:4321
npm run build    # Gera o build de produção em dist/
npm run preview  # Pré-visualiza o build gerado
```

### Deploy na Vercel

1. Importe o repositório do Toolbox na [Vercel](https://vercel.com/new).
2. Configure o **Root Directory** para `site`.
3. Framework: **Astro** (detecção automática).
4. Configure as variáveis de ambiente necessárias (`PUBLIC_GITHUB_REPO = rodrigolessadev/toolbox`).
5. Realize o deploy.
