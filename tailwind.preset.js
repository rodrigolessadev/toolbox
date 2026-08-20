/**
 * Preset oficial do Tailwind CSS para Material Design 3 (M3)
 * Consome as variáveis CSS semânticas geradas a partir de tokens.json
 */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Color Roles M3
        primary: {
          DEFAULT: 'var(--md-sys-color-primary)',
          foreground: 'var(--md-sys-color-on-primary)',
          container: 'var(--md-sys-color-primary-container)',
          'on-container': 'var(--md-sys-color-on-primary-container)'
        },
        secondary: {
          DEFAULT: 'var(--md-sys-color-secondary)',
          foreground: 'var(--md-sys-color-on-secondary)',
          container: 'var(--md-sys-color-secondary-container)',
          'on-container': 'var(--md-sys-color-on-secondary-container)'
        },
        tertiary: {
          DEFAULT: 'var(--md-sys-color-tertiary)',
          foreground: 'var(--md-sys-color-on-tertiary)',
          container: 'var(--md-sys-color-tertiary-container)',
          'on-container': 'var(--md-sys-color-on-tertiary-container)'
        },
        error: {
          DEFAULT: 'var(--md-sys-color-error)',
          foreground: 'var(--md-sys-color-on-error)',
          container: 'var(--md-sys-color-error-container)',
          'on-container': 'var(--md-sys-color-on-error-container)'
        },
        success: {
          DEFAULT: 'var(--md-sys-color-success)',
          foreground: 'var(--md-sys-color-on-success)',
          container: 'var(--md-sys-color-success-container)',
          'on-container': 'var(--md-sys-color-on-success-container)'
        },
        warning: {
          DEFAULT: 'var(--md-sys-color-warning)',
          foreground: 'var(--md-sys-color-on-warning)',
          container: 'var(--md-sys-color-warning-container)',
          'on-container': 'var(--md-sys-color-on-warning-container)'
        },
        surface: {
          DEFAULT: 'var(--md-sys-color-surface)',
          foreground: 'var(--md-sys-color-on-surface)',
          dim: 'var(--md-sys-color-surface-dim)',
          bright: 'var(--md-sys-color-surface-bright)',
          variant: 'var(--md-sys-color-surface-variant)',
          'on-variant': 'var(--md-sys-color-on-surface-variant)',
          lowest: 'var(--md-sys-color-surface-container-lowest)',
          low: 'var(--md-sys-color-surface-container-low)',
          container: 'var(--md-sys-color-surface-container)',
          high: 'var(--md-sys-color-surface-container-high)',
          highest: 'var(--md-sys-color-surface-container-highest)'
        },
        outline: {
          DEFAULT: 'var(--md-sys-color-outline)',
          variant: 'var(--md-sys-color-outline-variant)'
        }
      },
      borderRadius: {
        'm3-none': 'var(--md-sys-shape-corner-none)',
        'm3-xs': 'var(--md-sys-shape-corner-xs)',
        'm3-sm': 'var(--md-sys-shape-corner-sm)',
        'm3-md': 'var(--md-sys-shape-corner-md)',
        'm3-lg': 'var(--md-sys-shape-corner-lg)',
        'm3-xl': 'var(--md-sys-shape-corner-xl)',
        'm3-full': 'var(--md-sys-shape-corner-full)'
      }
    }
  }
};
