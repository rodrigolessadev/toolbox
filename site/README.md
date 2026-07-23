# Toolbox — Site

Landing page + documentação do Toolbox, construída com **Astro 5 + React**.

## Estrutura

```
site/
├── public/           # assets estáticos (favicon, imagens, screenshots)
├── src/
│   ├── components/   # componentes Astro/React
│   ├── content/      # coleções de conteúdo (docs, changelog)
│   ├── layouts/      # layouts base
│   ├── lib/          # helpers (github, version, theme)
│   ├── pages/        # rotas
│   │   ├── api/      # endpoints serverless
│   │   └── docs/     # páginas de documentação
│   └── styles/       # CSS global
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── vercel.json
```

## Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (porta 4321)
npm run dev

# Build de produção
npm run build

# Preview do build local
npm run preview
```

## Deploy

O deploy é feito automaticamente pela Vercel quando há push na branch `main`
(integração Git configurada no painel). O workflow `release.yml` também pode
disparar deploy manual via `VERCEL_TOKEN`.

## Variáveis de ambiente (opcional)

Defina no painel da Vercel ou em `.env`:

- `PUBLIC_GITHUB_REPO` — dono/repo no GitHub (padrão: `usuario/toolbox`)
- `PUBLIC_SITE_URL` — URL pública do site

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing com hero e botão de download |
| `/download` | Versões disponíveis e checksums |
| `/changelog` | Histórico de versões |
| `/docs/architecture` | Arquitetura (de `docs/ARCHITECTURE.md`) |
| `/docs/plugins` | Guia de plugins (de `docs/PLUGIN_GUIDE.md`) |
| `/docs/roadmap` | Roadmap (de `docs/FUTURE.md`) |
| `/api/latest` | Última release do GitHub (JSON) |
| `/api/releases` | Todas as releases (JSON) |
