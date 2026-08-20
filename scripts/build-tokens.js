/**
 * Script de Build e Compilação dos Design Tokens (Material Design 3)
 * Gera src/styles/theme.css e src/tokens/index.ts a partir de src/tokens/tokens.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tokensJsonPath = path.join(rootDir, 'src', 'tokens', 'tokens.json');
const themeCssPath = path.join(rootDir, 'src', 'styles', 'theme.css');
const tokensIndexPath = path.join(rootDir, 'src', 'tokens', 'index.ts');

console.log('[TOKENS BUILD] Lendo tokens mestre de:', tokensJsonPath);
const rawData = fs.readFileSync(tokensJsonPath, 'utf-8');
const data = JSON.parse(rawData);

// 1. Gera CSS Variables
function camelToKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function generateColorCss(colorObj) {
  let css = '';
  for (const [key, value] of Object.entries(colorObj)) {
    const varName = `--md-sys-color-${camelToKebab(key)}`;
    css += `  ${varName}: ${value};\n`;
  }
  return css;
}

let cssContent = `/* ============================================================
   AUTO-GENERATED: DO NOT EDIT DIRECTLY
   Gerado por scripts/build-tokens.js a partir de src/tokens/tokens.json
   ============================================================ */

/* ------------------------------------------------------------
   1. Dark Theme Tokens (M3 Padrão)
   ------------------------------------------------------------ */
:root, [data-theme="dark"] {
${generateColorCss(data.color.dark)}
  /* Aliases de Retrocompatibilidade (Dark) */
  --bg:           var(--md-sys-color-surface-container-lowest);
  --bg-elev-1:    var(--md-sys-color-surface-container-low);
  --bg-elev-2:    var(--md-sys-color-surface-container);
  --bg-elev-3:    var(--md-sys-color-surface-container-high);
  --bg-elev-4:    var(--md-sys-color-surface-container-highest);
  --bg-elev-5:    var(--md-sys-color-surface-bright);

  --input-bg:     var(--md-sys-color-surface-container-lowest);
  --input-border: var(--md-sys-color-outline-variant);
  --border:       var(--md-sys-color-outline-variant);
  --border-muted: var(--md-sys-color-surface-variant);
  --border-focus: var(--md-sys-color-primary);

  --fg:           var(--md-sys-color-on-surface);
  --fg-muted:     var(--md-sys-color-on-surface-variant);
  --fg-disabled:  var(--md-sys-color-outline);

  --accent:       var(--md-sys-color-primary);
  --accent-hover: #c2e7ff;
  --accent-active:#8ab4f8;
  --accent-soft:  rgba(168, 199, 250, 0.16);

  --success:      var(--md-sys-color-success);
  --success-light:rgba(109, 213, 140, 0.18);
  --warning:      var(--md-sys-color-warning);
  --warning-light:rgba(253, 214, 99, 0.18);
  --danger:       var(--md-sys-color-error);
  --danger-light: rgba(242, 184, 181, 0.18);
  --info:         var(--md-sys-color-tertiary);
  --info-light:   rgba(109, 213, 237, 0.18);
}

/* ------------------------------------------------------------
   2. Light Theme Tokens (M3 Claro)
   ------------------------------------------------------------ */
[data-theme="light"] {
${generateColorCss(data.color.light)}
  /* Aliases de Retrocompatibilidade (Light) */
  --bg:           var(--md-sys-color-surface-container-lowest);
  --bg-elev-1:    var(--md-sys-color-surface-container-low);
  --bg-elev-2:    var(--md-sys-color-surface-container);
  --bg-elev-3:    var(--md-sys-color-surface-container-high);
  --bg-elev-4:    var(--md-sys-color-surface-container-highest);
  --bg-elev-5:    var(--md-sys-color-surface-dim);

  --input-bg:     #ffffff;
  --input-border: var(--md-sys-color-outline-variant);
  --border:       var(--md-sys-color-outline-variant);
  --border-muted: var(--md-sys-color-surface-variant);
  --border-focus: var(--md-sys-color-primary);

  --fg:           var(--md-sys-color-on-surface);
  --fg-muted:     var(--md-sys-color-on-surface-variant);
  --fg-disabled:  var(--md-sys-color-outline);

  --accent:       var(--md-sys-color-primary);
  --accent-hover: #0842a0;
  --accent-active:#041e49;
  --accent-soft:  rgba(11, 87, 208, 0.12);

  --success:      var(--md-sys-color-success);
  --success-light:rgba(20, 108, 46, 0.14);
  --warning:      var(--md-sys-color-warning);
  --warning-light:rgba(124, 88, 0, 0.14);
  --danger:       var(--md-sys-color-error);
  --danger-light: rgba(179, 38, 30, 0.14);
  --info:         var(--md-sys-color-tertiary);
  --info-light:   rgba(0, 104, 122, 0.14);
}

/* ------------------------------------------------------------
   3. Shape, Typography & Elevation M3
   ------------------------------------------------------------ */
:root {
`;

for (const [key, value] of Object.entries(data.shape)) {
  cssContent += `  --md-sys-shape-corner-${key}: ${value};\n`;
}

cssContent += `
  /* Aliases de Forma */
  --radius-xs:    var(--md-sys-shape-corner-xs);
  --radius-sm:    var(--md-sys-shape-corner-sm);
  --radius:       var(--md-sys-shape-corner-md);
  --radius-lg:    var(--md-sys-shape-corner-lg);
  --radius-xl:    var(--md-sys-shape-corner-xl);
  --radius-full:  var(--md-sys-shape-corner-full);

  /* Sombras Tonal Elevation */
`;

for (const [key, value] of Object.entries(data.elevation)) {
  cssContent += `  --md-sys-elevation-${key}: ${value};\n`;
}

cssContent += `}\n`;

fs.writeFileSync(themeCssPath, cssContent, 'utf-8');
console.log('✔ [TOKENS BUILD] Gerado:', themeCssPath);

// 2. Gera TypeScript Index
const tsContent = `/**
 * AUTO-GENERATED: DO NOT EDIT DIRECTLY
 * Gerado por scripts/build-tokens.js a partir de src/tokens/tokens.json
 */

export interface ColorRoles {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
  warning: string;
  onWarning: string;
  warningContainer: string;
  onWarningContainer: string;
  surface: string;
  onSurface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceTint: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
}

export interface ShapeScale {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface TypeStyle {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
}

export interface TypographyScale {
  displayLarge: TypeStyle;
  displayMedium: TypeStyle;
  displaySmall: TypeStyle;
  headlineLarge: TypeStyle;
  headlineMedium: TypeStyle;
  headlineSmall: TypeStyle;
  titleLarge: TypeStyle;
  titleMedium: TypeStyle;
  titleSmall: TypeStyle;
  bodyLarge: TypeStyle;
  bodyMedium: TypeStyle;
  bodySmall: TypeStyle;
  labelLarge: TypeStyle;
  labelMedium: TypeStyle;
  labelSmall: TypeStyle;
}

export interface M3Tokens {
  $schema?: string;
  version: string;
  name: string;
  color: {
    dark: ColorRoles;
    light: ColorRoles;
  };
  shape: ShapeScale;
  typography: {
    fontFamily: {
      brand: string;
      plain: string;
      code: string;
    };
    scale: TypographyScale;
  };
  elevation: Record<string, string>;
}

export const designTokens: M3Tokens = ${JSON.stringify(data, null, 2)};

export default designTokens;
`;

fs.writeFileSync(tokensIndexPath, tsContent, 'utf-8');
console.log('✔ [TOKENS BUILD] Gerado:', tokensIndexPath);
console.log('✔ [TOKENS BUILD] Compilação de tokens M3 concluída com sucesso!');
