/**
 * Configuração central do site — edite aqui para apontar para o seu repo.
 */
export const SITE = {
  name: 'Toolbox',
  tagline: 'Launcher inteligente para Windows com sistema de plugins',
  description:
    'Aplicativo desktop moderno, leve e extensível para Windows — semelhante ao PowerToys Run, mas com sistema de plugins próprio. Construído com Tauri 2 + Rust + React.',
  url: 'https://toolbox-nine-phi.vercel.app',
  github: 'https://github.com/rodrigolessadev/toolbox',
  repo: 'rodrigolessadev/toolbox',
  plugins_repo: 'https://github.com/rodrigolessadev/toolbox-plugins',
  author: 'Rodrigo Lessa',
} as const;

export const NAV = [
  { href: '/', label: 'Início' },
  { href: '/plugins', label: 'Plugins' },
  { href: '/docs/commands', label: 'Como usar' },
  { href: '/download', label: 'Download' },
  { href: '/changelog', label: 'Changelog' },
  { href: SITE.github, label: 'GitHub', external: true },
] as const;
