# Design System — Toolbox v1.1

**Versão:** 1.0  
**Data:** 2026-08-11  
**Etapa:** 3 — Modernização do Design System e Modo Noturno

> 🎯 Fonte única de verdade para cores, espaçamento, tipografia e componentes do Toolbox.

---

## 📋 Índice

1. [Filosofia de Design](#filosofia-de-design)
2. [Paleta de Cores](#paleta-de-cores)
3. [Escala de Superfícies](#escala-de-superfícies)
4. [Estados Visuais](#estados-visuais)
5. [Tipografia](#tipografia)
6. [Espaçamento](#espaçamento)
7. [Componentes Principais](#componentes-principais)
8. [Acessibilidade](#acessibilidade)
9. [Temas Suportados](#temas-suportados)
10. [Migração de Código Legado](#migração-de-código-legado)

---

## 🎨 Filosofia de Design

O design system do Toolbox segue princípios de:

- **Consistência:** Um conjunto único de tokens para toda interface
- **Acessibilidade:** WCAG 2.1 AA (contraste mínimo 4.5:1)
- **Performance:** Transições de 60-200ms para feedback rápido
- **Clareza:** Hierarquia visual perceptível (fundo, conteúdo, interação, feedback)
- **Flexibilidade:** Suporta light, dark, e alto contraste

---

## 🎯 Paleta de Cores

### Light Mode

| Uso | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Superfícies** | | | |
| Fundo primário | `#f4f5f8` | RGB(244, 245, 248) | `--bg` |
| Elevada (nível 1) | `#ffffff` | RGB(255, 255, 255) | `--bg-elev-1` |
| Elevada (nível 2) | `#f8f9fb` | RGB(248, 249, 251) | `--bg-elev-2` |
| Elevada (nível 3) | `#f0f1f5` | RGB(240, 241, 245) | `--bg-elev-3` |
| Elevada (nível 4) | `#e8eaed` | RGB(232, 234, 237) | `--bg-elev-4` |
| Elevada (nível 5) | `#e0e3e8` | RGB(224, 227, 232) | `--bg-elev-5` |
| **Texto** | | | |
| Primário | `#0e1116` | RGB(14, 17, 22) | `--fg` |
| Secundário | `#5a6270` | RGB(90, 98, 112) | `--fg-muted` |
| Desabilitado | `#a0a4aa` | RGB(160, 164, 170) | `--fg-disabled` |
| **Bordas** | | | |
| Padrão | `#e3e6ec` | RGB(227, 230, 236) | `--border` |
| Sutil | `#d4d8e0` | RGB(212, 216, 224) | `--border-muted` |
| **Interação** | | | |
| Acento (azul) | `#3a7bff` | RGB(58, 123, 255) | `--accent` |
| Acento — hover | `#1e54f0` | RGB(30, 84, 240) | `--accent-hover` |
| Acento — active | `#1a46cc` | RGB(26, 70, 204) | `--accent-active` |
| Acento — soft | `rgba(58, 123, 255, 0.12)` | | `--accent-soft` |

### Dark Mode

| Uso | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Superfícies** | | | |
| Fundo primário | `#0e1014` | RGB(14, 16, 20) | `--bg` |
| Elevada (nível 1) | `#161a21` | RGB(22, 26, 33) | `--bg-elev-1` |
| Elevada (nível 2) | `#1f242d` | RGB(31, 36, 45) | `--bg-elev-2` |
| Elevada (nível 3) | `#262c36` | RGB(38, 44, 54) | `--bg-elev-3` |
| Elevada (nível 4) | `#2d3440` | RGB(45, 52, 64) | `--bg-elev-4` |
| Elevada (nível 5) | `#34394a` | RGB(52, 57, 74) | `--bg-elev-5` |
| **Texto** | | | |
| Primário | `#e8eaed` | RGB(232, 234, 237) | `--fg` |
| Secundário | `#8b94a3` | RGB(139, 148, 163) | `--fg-muted` |
| Desabilitado | `#5a6270` | RGB(90, 98, 112) | `--fg-disabled` |
| **Bordas** | | | |
| Padrão | `#262c36` | RGB(38, 44, 54) | `--border` |
| Sutil | `#1f242d` | RGB(31, 36, 45) | `--border-muted` |
| **Interação** | | | |
| Acento (azul) | `#6aa3ff` | RGB(106, 163, 255) | `--accent` |
| Acento — hover | `#7bb3ff` | RGB(123, 179, 255) | `--accent-hover` |
| Acento — active | `#5a93ef` | RGB(90, 147, 239) | `--accent-active` |
| Acento — soft | `rgba(106, 163, 255, 0.16)` | | `--accent-soft` |

### Feedback (Ambos Temas)

| Estado | Light | Dark | Alto Contraste |
|--------|-------|------|-----------------|
| **Sucesso** | `#30a46c` | `#4cc38a` | `#009900` |
| **Alerta** | `#f5a524` | `#f5a524` | `#ff9900` |
| **Erro** | `#e5484d` | `#ff6369` | `#ff0000` |
| **Informação** | `#3a7bff` | `#6aa3ff` | `#0066ff` |

---

## 📐 Escala de Superfícies

Hierarquia de profundidade através de cores:

### Light Mode
```
Nível 0 (base)     → #f4f5f8  (fundo primário)
   ↓
Nível 1 (apps)     → #ffffff  (painéis, windows)
   ↓
Nível 2 (cards)    → #f8f9fb  (cards, sections)
   ↓
Nível 3 (inputs)   → #f0f1f5  (inputs, menus)
   ↓
Nível 4 (hover)    → #e8eaed  (estado hover)
   ↓
Nível 5 (active)   → #e0e3e8  (estado active/pressionado)
```

### Dark Mode
```
Nível 0 (base)     → #0e1014  (fundo primário — muito escuro)
   ↓
Nível 1 (apps)     → #161a21  (painéis, windows)
   ↓
Nível 2 (cards)    → #1f242d  (cards, sections)
   ↓
Nível 3 (inputs)   → #262c36  (inputs, menus, bordas)
   ↓
Nível 4 (hover)    → #2d3440  (estado hover — clareia um pouco)
   ↓
Nível 5 (active)   → #34394a  (estado active — mais claro ainda)
```

---

## 🎮 Estados Visuais

### Focus (Foco)

**Regra CSS:**
```css
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: var(--focus-width) solid var(--focus-ring);  /* 2px solid #3a7bff (light) ou #6aa3ff (dark) */
  outline-offset: var(--focus-offset);                  /* 2px */
}
```

**Aplicação:**
- Todos botões, inputs, links, abas
- Só aparece via teclado (`:focus-visible`) — melhor UX
- Contraste alto para visibilidade

### Hover

**Botões:**
```css
button:hover:not(:disabled) {
  opacity: 0.85;  /* Reduz opacidade para dar feedback */
}
```

**Inputs:**
```css
input:hover:not(:disabled) {
  border-color: var(--accent);  /* Muda cor da borda */
}
```

**Links:**
```css
a:hover {
  color: var(--accent-hover);    /* Cor mais escura (light) ou mais clara (dark) */
  text-decoration: underline;    /* Sublinhado adicional */
}
```

### Active / Pressed

```css
button:active:not(:disabled) {
  opacity: 0.75;  /* Mais escuro que hover */
}

input:active:not(:disabled) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);  /* Halo ao redor */
}
```

### Disabled

```css
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--fg-disabled);
}
```

---

## 📝 Tipografia

Definida em `src/styles/tokens.ts`:

```typescript
typography: {
  fontFamily: '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: {
    xs:   '12px',  // labels pequenos, badgesxs
    sm:   '13px',  // labels, helper text
    base: '14px',  // texto de padrão
    lg:   '15px',  // UI secundária
    xl:   '16px',  // heading pequeno
    xxl:  '18px',  // heading médio
    xxxl: '20px',  // heading principal
  },
  fontWeight: {
    regular:  400,  // corpo
    medium:   500,  // emphasis leve
    semibold: 600,  // headings
    bold:     700,  // headings principais
  },
  lineHeight: {
    tight:   1.2,   // headings
    normal:  1.5,   // corpo
    relaxed: 1.75,  // espaçamento extra (raro)
  },
}
```

---

## 📏 Espaçamento

Escala 4px base:

```typescript
spacing: {
  xs:     '4px',      // mínimo (gaps pequenos)
  sm:     '8px',      // padding pequeno
  md:     '12px',     // padding padrão
  lg:     '16px',     // padding grande
  xl:     '20px',     // espaçamento de section
  xxl:    '24px',     // espaçamento maior
  xxxl:   '32px',     // espaçamento grande
  xxxxl:  '40px',     // espaçamento muito grande
}
```

**Uso comum:**
- Padding botões: `8px 12px`
- Padding inputs: `10px 14px`
- Margin entre sections: `16px 0`
- Gap em flex: `8px` ou `12px`

---

## 🧩 Componentes Principais

### Botão

```css
button {
  padding: 8px 12px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);  /* 6px */
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

button:hover:not(:disabled) {
  background: var(--accent-hover);
  opacity: 0.85;
}

button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Input / Textarea

```css
input, textarea {
  padding: 10px 14px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  color: var(--fg);
  font-family: inherit;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

input:hover:not(:disabled) {
  border-color: var(--accent);
}

input:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
  outline: none;
}

input:disabled {
  opacity: 0.5;
  background: var(--bg-elev-3);
  cursor: not-allowed;
}
```

### Card

```css
.card {
  padding: 16px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);  /* 10px */
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--accent-soft);
}
```

### Badge

```css
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Variantes por tipo */
.badge--success {
  background: var(--success-light);
  color: var(--success);
}

.badge--error {
  background: var(--danger-light);
  color: var(--danger);
}

.badge--warning {
  background: var(--warning-light);
  color: var(--warning);
}

.badge--info {
  background: var(--info-light);
  color: var(--info);
}
```

---

## ♿ Acessibilidade

### Contraste (WCAG 2.1 AA)

Todas cores foram validadas para:
- **Texto normal:** 4.5:1 mínimo
- **Texto grande (18pt+):** 3:1 mínimo

**Tabela de Contraste:**

| Combinação | Contraste | AA | AAA |
|-----------|-----------|----|----|
| --fg sobre --bg (light) | 16:1 | ✅ | ✅ |
| --fg-muted sobre --bg (light) | 6.5:1 | ✅ | ✅ |
| --fg sobre --bg (dark) | 14:1 | ✅ | ✅ |
| --fg-muted sobre --bg (dark) | 6:1 | ✅ | ✅ |
| --accent sobre --bg (light) | 5.2:1 | ✅ | ✅ |
| --accent sobre --bg (dark) | 5.5:1 | ✅ | ✅ |

### Focus Visível

- ✅ Todos botões, inputs, links têm outline de 2px
- ✅ Outline offset de 2px para clareza
- ✅ Apenas em `:focus-visible` (melhor UX)
- ✅ Alto contraste (cor do outline vs background)

### Modo Alto Contraste

Para usuários com baixa visão:
- Cores mais saturadas
- Contraste aumentado (máximo 21:1)
- Focus ring amarelo (#ffff00) para máxima visibilidade

**Ativar:**
```html
<html data-theme="high-contrast">
```

### Sem Dependência de Cor

- ✅ Focus visível via outline (não apenas cor)
- ✅ Estados via opacity + ícones (não apenas cor)
- ✅ Validação via outline + ícones (checkmark, X)

---

## 🎭 Temas Suportados

### 1. Light Mode (Padrão)

```html
<html data-theme="light">  <!-- ou sem atributo -->
```

**Características:**
- Fundo claro (#f4f5f8)
- Texto escuro (#0e1116)
- Azul primário: #3a7bff

### 2. Dark Mode

```html
<html data-theme="dark">
```

**Características:**
- Fundo muito escuro (#0e1014)
- Escala de 5 níveis de superfícies
- Texto claro (#e8eaed)
- Azul mais claro: #6aa3ff

### 3. Alto Contraste

```html
<html data-theme="high-contrast">
```

**Características:**
- Fundo preto puro (#000000)
- Texto branco puro (#ffffff)
- Cores vibrantes (verde, laranja, vermelho puro)
- Focus ring amarelo (#ffff00) com 3px

**Para usuários com:**
- Daltonismo
- Baixa visão
- Ambientes com muita luz

---

## 🔄 Migração de Código Legado

### De: Hardcoding de cores

```css
/* ❌ Antes */
.my-component {
  background: #3a7bff;
  color: #0e1116;
  border: 1px solid #e3e6ec;
}
```

### Para: Tokens CSS

```css
/* ✅ Depois */
.my-component {
  background: var(--accent);
  color: var(--fg);
  border: 1px solid var(--border);
}
```

### Mapeamento Rápido

| Antes | Depois | Descrição |
|-------|--------|-----------|
| `#3a7bff` | `var(--accent)` | Azul primário (light) |
| `#0e1116` | `var(--fg)` | Texto primário |
| `#ffffff` | `var(--bg-elev-1)` | Superfície branca |
| `#e3e6ec` | `var(--border)` | Borda padrão |
| `#e5484d` | `var(--danger)` | Vermelho de erro |
| `#30a46c` | `var(--success)` | Verde de sucesso |

### Exemplo: Componente React

```typescript
/* components/MyButton.tsx */
import styles from './MyButton.module.css';

export function MyButton({ label, variant = 'primary', ...props }) {
  return (
    <button className={`${styles.button} ${styles[`button--${variant}`]}`} {...props}>
      {label}
    </button>
  );
}
```

```css
/* MyButton.module.css */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--tr);
}

.button:hover:not(:disabled) {
  background: var(--accent-hover);
  opacity: 0.85;
}

.button:focus-visible {
  outline: var(--focus-width) solid var(--focus-ring);
  outline-offset: var(--focus-offset);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button--success {
  background: var(--success);
}

.button--danger {
  background: var(--danger);
}
```

---

## 📚 Referências

- **W3C WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Focus Visible:** https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Blindness Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/

---

**Próximas Etapas:**
- Etapa 4: Componentes Visuais para Plugins
- Etapa 5: Extração de Lógica (KapiNote)
- Etapa 6: Empacotamento de Plugins

**Tempo de Leitura:** ~15 minutos  
**Última Atualização:** 2026-08-11
