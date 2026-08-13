# Etapa 3: Modernização do Design System — Análise Técnica

**Data:** 2026-08-11  
**Status:** Planejamento

---

## 1. Achados Atuais

### 1.1 Tokens CSS em global.css

**Light Mode (:root)**
```css
--bg:           #f4f5f8;      /* Fundo primário */
--bg-elev:      #ffffff;      /* Superfícies elevadas */
--bg-elev-2:    #f0f1f5;      /* Superfícies menos elevadas */
--fg:           #0e1116;      /* Texto primário */
--fg-muted:     #5a6270;      /* Texto secundário */
--border:       #e3e6ec;      /* Bordas */
--input-bg:     #ffffff;      /* Fundo de input */
--input-border: #d4d8e0;      /* Borda de input */
--accent:       #3a7bff;      /* Ação primária */
--accent-soft:  rgba(58, 123, 255, 0.12);
--danger:       #e5484d;      /* Erro */
--warning:      #f5a524;      /* Aviso */
--success:      #30a46c;      /* Sucesso */
--shadow:       0 8px 24px rgba(0, 0, 0, 0.08);
--radius:       10px;
--tr:           120ms ease;
```

**Dark Mode ([data-theme="dark"])**
```css
--bg:           #0e1014;      /* Fundo primário (muito escuro) */
--bg-elev:      #161a21;      /* Superfícies elevadas */
--bg-elev-2:    #1f242d;      /* Superfícies menos elevadas */
--fg:           #f0f2f5;      /* Texto primário */
--fg-muted:     #8b94a3;      /* Texto secundário */
--border:       #262c36;      /* Bordas */
--input-bg:     #0e1014;
--input-border: #262c36;
--accent:       #6aa3ff;      /* Azul mais claro */
--accent-soft:  rgba(106, 163, 255, 0.16);
--danger:       #ff6369;      /* Vermelho mais claro */
--warning:      #f5a524;      /* (mesmo) */
--success:      #4cc38a;      /* Verde mais claro */
--shadow:       0 12px 32px rgba(0, 0, 0, 0.5);
```

### 1.2 Consumo de Tokens

**Arquivos CSS:**
- `src/styles/global.css` (238 linhas)
- `src/styles/modal.css` (17 linhas)
- `src/styles/titlebar.css` (87 linhas)

**Consumo em componentes:**
- `.app__` classes (principal layout)
- `.command-item` (itens da lista)
- `.badge--*` (badges com cores específicas)
- `.modal` (modais)

### 1.3 Hook useTheme

**Localização:** `src/hooks/useTheme.ts`

**Funcionalidades:**
- Detecta tema do sistema (prefers-color-scheme)
- Persiste em localStorage (chave: `toolbox:theme`)
- Aplica `data-theme` em `<html>`
- Retorna `{theme, setTheme, toggle}`

**Problema:** Nunca chama `set_theme()` do backend (Rust) — apenas localStorage

---

## 2. Problemas Identificados

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| **P1** | 🔴 ALTA | Dark mode tem contraste marginal em alguns textos |
| **P2** | 🔴 ALTA | Não há escala intermediária de cores para superfícies |
| **P3** | 🟠 MÉDIA | Foco visível não é consistente em todos controles |
| **P4** | 🟠 MÉDIA | Sem tokens para hover/active/disabled |
| **P5** | 🟠 MÉDIA | Alto contraste mode não está implementado |
| **P6** | 🟡 BAIXA | Hardcoding de cores em Python (plugins) |
| **P7** | 🟡 BAIXA | Sem arquivo de documentação de design system |

---

## 3. Objetivos da Etapa 3

1. ✅ **Escala de cores expandida**
   - Dark: 3 níveis de superfície (bg, bg-elev, bg-elev-2)
   - + 2 níveis intermediários (bg-elev-3, bg-elev-4) = 5 total
   
2. ✅ **Estados visuais claros**
   - Default, hover, active, focus, disabled
   - Aplicar a botões, inputs, cards
   
3. ✅ **Acessibilidade (WCAG 2.1 AA)**
   - Contraste mínimo 4.5:1 para texto
   - Foco visível (outline ou highlight)
   
4. ✅ **Alto contraste**
   - Modo adicional com cores mais saturadas
   
5. ✅ **Documentação**
   - `docs/design-system.md` com especificação completa

---

## 4. Estratégia de Implementação (Faseada)

### Fase 1: Tokens Centralizados
- [ ] Criar `src/styles/tokens.ts` com constantes
- [ ] Exportar escala de cores
- [ ] Validar contraste (via ferramentas)

### Fase 2: CSS Global Atualizado
- [ ] Expandir `src/styles/global.css` com tokens novos
- [ ] Adicionar estados (hover, active, focus, disabled)
- [ ] Adicionar modo alto contraste

### Fase 3: Componentes
- [ ] Auditar componentes React atuais
- [ ] Aplicar estados visuais faltantes
- [ ] Adicionar focus outlines

### Fase 4: Documentação
- [ ] Criar `docs/design-system.md`
- [ ] Incluir exemplos visuais (cor + contraste)
- [ ] Guia de uso para novos componentes

---

## 5. Tokens Propostos (Novo Schema)

### Cores Base

**Dark Mode - Escala Expandida**
```
Level 0: #0d0f14   (background primário — muito escuro)
Level 1: #16192f   (elevated-1 — apps, windows)
Level 2: #1f242d   (elevated-2 — cards, sections)
Level 3: #262c36   (elevated-3 — inputs, borders)
Level 4: #2d3440   (elevated-4 — hover estado)
Level 5: #34394a   (elevated-5 — active estado)
```

**Texto**
```
Primary:   #e8eaed  (foreground — texto principal)
Secondary: #8b94a3  (muted — texto secundário)
Tertiary:  #6e767e  (disabled — texto desabilitado)
```

**Interação**
```
Accent:      #6aa3ff  (azul — ação primária)
Accent-soft: rgba(106, 163, 255, 0.12)
Accent-hover: #7bb3ff  (versão mais brilhante)
Accent-active: #5a93ef  (versão mais escura)
```

**Feedback**
```
Success:  #4cc38a
Warning:  #f5a524
Danger:   #ff6369
Info:     #6aa3ff
```

**Focus**
```
Focus-ring: var(--accent)
Focus-width: 2px
Focus-offset: 2px
Focus-style: solid (outline)
```

---

## 6. Caminho de Implementação

### Passo 1: Criar tokens.ts

Arquivo: `src/styles/tokens.ts`

```typescript
export const tokens = {
  colors: {
    light: {
      bg: '#f4f5f8',
      bgElev: ['#ffffff', '#f8f9fb', '#f0f1f5'],
      fg: '#0e1116',
      fgMuted: '#5a6270',
      border: '#e3e6ec',
      accent: '#3a7bff',
      danger: '#e5484d',
      warning: '#f5a524',
      success: '#30a46c',
    },
    dark: {
      bg: '#0e1014',
      bgElev: ['#161a21', '#1f242d', '#262c36', '#2d3440', '#34394a'],
      fg: '#e8eaed',
      fgMuted: '#8b94a3',
      border: '#262c36',
      accent: '#6aa3ff',
      danger: '#ff6369',
      warning: '#f5a524',
      success: '#4cc38a',
    },
    highContrast: {
      // Saturação aumentada
    },
  },
  spacing: [4, 8, 12, 16, 20, 24, 32, 40],
  radius: [6, 10],
  transitions: '120ms ease',
};
```

### Passo 2: global.css Expandido

Adicionar:
- Estados (`:hover`, `:active`, `:focus-visible`, `:disabled`)
- Escala de cores (bg-elev-3, bg-elev-4)
- Alto contraste (`[data-theme="high-contrast"]`)

### Passo 3: Componentes

Revisar e aplicar a:
- `CommandInput`
- `CommandItem`
- `CommandList`
- `SettingsModal`
- `AddCommandModal`
- `Badge`

### Passo 4: Testes

- [ ] Validar contraste com `axe` ou `Pa11y`
- [ ] Verificar foco em todos botões
- [ ] Testar com leitor de tela (NVDA/JAWS)

---

## 7. Cronograma

| Fase | Tempo | Tarefas |
|------|-------|---------|
| 1 | 30 min | Criar tokens.ts, validar contraste |
| 2 | 1h | Atualizar global.css, adicionar estados |
| 3 | 1h | Auditar e atualizar componentes |
| 4 | 30 min | Documentar em design-system.md |
| **Total** | **3h** | |

---

## 8. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|--------|-----------|
| Regressão visual em componentes | 🔴 ALTO | Antes/depois com screenshots |
| Contraste insuficiente | 🔴 ALTO | Validação automática (axe) |
| Tema legado quebrado | 🟠 MÉDIO | Manter compatibilidade em global.css |
| Foco invisível em alguns casos | 🟡 BAIXO | Testar com tab em todos elementos |

---

**Status:** Pronto para Implementação (Fase 1 iniciará agora)
