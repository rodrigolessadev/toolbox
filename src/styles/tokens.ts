/**
 * Design Tokens — Fonte única de verdade para cores e estilos
 * Suporta: light, dark, high-contrast
 * Data: 2026-08-11 (Etapa 3 — Modernização do Design System)
 */

export const tokens = {
  /**
   * Paleta de Cores
   * Light Mode: baseado em grays neutros
   * Dark Mode: escala expandida de 5 níveis
   * High Contrast: saturação aumentada
   */
  colors: {
    light: {
      // Superfícies
      bg: '#f4f5f8',           // Fundo primário
      bgElev1: '#ffffff',      // Cards, panels
      bgElev2: '#f8f9fb',      // Menus, dropdowns
      bgElev3: '#f0f1f5',      // Inputs
      bgElev4: '#e8eaed',      // Hover estado
      bgElev5: '#e0e3e8',      // Active estado

      // Texto
      fg: '#0e1116',           // Texto primário
      fgMuted: '#5a6270',      // Texto secundário
      fgDisabled: '#a0a4aa',   // Texto desabilitado

      // Bordas
      border: '#e3e6ec',       // Bordas padrão
      borderMuted: '#d4d8e0',  // Bordas sutis (inputs)

      // Interação
      accent: '#3a7bff',       // Azul primário
      accentSoft: 'rgba(58, 123, 255, 0.12)',
      accentHover: '#1e54f0',  // Hover mais escuro
      accentActive: '#1a46cc', // Active ainda mais escuro

      // Feedback
      success: '#30a46c',
      successLight: 'rgba(48, 164, 108, 0.12)',
      warning: '#f5a524',
      warningLight: 'rgba(245, 165, 36, 0.12)',
      danger: '#e5484d',
      dangerLight: 'rgba(229, 72, 77, 0.12)',
      info: '#3a7bff',
      infoLight: 'rgba(58, 123, 255, 0.12)',

      // Focus
      focusRing: '#3a7bff',
      focusRingWidth: '2px',
      focusRingOffset: '2px',
    },

    dark: {
      // Superfícies (5 níveis)
      bg: '#0e1014',           // Nível 0: background primário (muito escuro)
      bgElev1: '#161a21',      // Nível 1: windows, apps principais
      bgElev2: '#1f242d',      // Nível 2: cards, sections
      bgElev3: '#262c36',      // Nível 3: inputs, borders
      bgElev4: '#2d3440',      // Nível 4: hover estado
      bgElev5: '#34394a',      // Nível 5: active estado

      // Texto
      fg: '#e8eaed',           // Texto primário (luminosidade >85%)
      fgMuted: '#8b94a3',      // Texto secundário (luminosidade ~55%)
      fgDisabled: '#5a6270',   // Texto desabilitado (luminosidade ~40%)

      // Bordas
      border: '#262c36',       // Bordas padrão
      borderMuted: '#1f242d',  // Bordas sutis

      // Interação
      accent: '#6aa3ff',       // Azul mais claro
      accentSoft: 'rgba(106, 163, 255, 0.16)',
      accentHover: '#7bb3ff',  // Hover ainda mais claro
      accentActive: '#5a93ef', // Active mais escuro

      // Feedback
      success: '#4cc38a',
      successLight: 'rgba(76, 195, 138, 0.18)',
      warning: '#f5a524',
      warningLight: 'rgba(245, 165, 36, 0.12)',
      danger: '#ff6369',
      dangerLight: 'rgba(255, 99, 105, 0.18)',
      info: '#6aa3ff',
      infoLight: 'rgba(106, 163, 255, 0.16)',

      // Focus
      focusRing: '#6aa3ff',
      focusRingWidth: '2px',
      focusRingOffset: '2px',
    },

    highContrast: {
      // Alto contraste para acessibilidade
      // Saturação aumentada, contraste máximo
      bg: '#000000',           // Preto puro
      bgElev1: '#1a1a1a',      // Muito escuro
      bgElev2: '#333333',      // Cinza escuro
      bgElev3: '#4d4d4d',      // Cinza médio
      bgElev4: '#666666',      // Cinza claro
      bgElev5: '#808080',      // Cinza muito claro

      fg: '#ffffff',           // Branco puro
      fgMuted: '#cccccc',      // Cinza claro
      fgDisabled: '#666666',   // Cinza médio

      border: '#ffffff',       // Branco para máximo contraste
      borderMuted: '#cccccc',

      // Cores vibrantes
      accent: '#0066ff',       // Azul puro
      accentSoft: 'rgba(0, 102, 255, 0.25)',
      accentHover: '#0052cc',
      accentActive: '#003d99',

      success: '#009900',      // Verde puro
      successLight: 'rgba(0, 153, 0, 0.25)',
      warning: '#ff9900',      // Laranja puro
      warningLight: 'rgba(255, 153, 0, 0.25)',
      danger: '#ff0000',       // Vermelho puro
      dangerLight: 'rgba(255, 0, 0, 0.25)',
      info: '#0066ff',
      infoLight: 'rgba(0, 102, 255, 0.25)',

      focusRing: '#ffff00',    // Amarelo puro para máxima visibilidade
      focusRingWidth: '3px',
      focusRingOffset: '3px',
    },
  },

  /**
   * Espaçamento — Escala 4px base
   */
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    xxxxl: '40px',
  },

  /**
   * Raio de Borda
   */
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    full: '999px',
  },

  /**
   * Transições
   */
  transitions: {
    fast: '60ms ease',
    normal: '120ms ease',
    slow: '200ms ease',
  },

  /**
   * Sombras
   */
  shadows: {
    light: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
      md: '0 4px 16px rgba(0, 0, 0, 0.08)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
      xl: '0 12px 32px rgba(0, 0, 0, 0.16)',
    },
    dark: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.25)',
      md: '0 4px 16px rgba(0, 0, 0, 0.35)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.45)',
      xl: '0 12px 32px rgba(0, 0, 0, 0.55)',
    },
  },

  /**
   * Tipografia
   */
  typography: {
    fontFamily: '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '15px',
      xl: '16px',
      xxl: '18px',
      xxxl: '20px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  /**
   * Estados de Componentes
   */
  states: {
    hover: {
      opacity: 0.08,           // Overlay de hover (em dark, aumentar para 0.12)
      transition: 'background 120ms ease',
    },
    active: {
      opacity: 0.16,           // Overlay mais forte para active
      transition: 'background 60ms ease',
    },
    focus: {
      outline: '2px solid',
      outlineOffset: '2px',
      transition: 'outline 60ms ease',
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
};

/**
 * Função Helper: Obter token por tema
 * Uso: getThemeTokens('dark') retorna tokens do dark mode
 */
export function getThemeTokens(theme: 'light' | 'dark' | 'highContrast' = 'light') {
  return tokens.colors[theme as keyof typeof tokens.colors];
}

/**
 * Função Helper: Validar contraste (WCAG 2.1 AA)
 * Retorna true se contraste >= 4.5:1 (texto normal)
 * 
 * @param _color1 Primeira cor (hex)
 * @param _color2 Segunda cor (hex)
 * @returns true se contraste está OK
 */
export function validateContrast(_color1: string, _color2: string): boolean {
  // Placeholder: implementar com biblioteca wcag-contrast
  // Para agora, apenas retorna true (será validado via ferramentas)
  console.warn('⚠️ Contraste não validado (implementar wcag-contrast)');
  return true;
}

export default tokens;
