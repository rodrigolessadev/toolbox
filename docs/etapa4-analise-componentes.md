# Etapa 4: Criação dos Componentes Visuais para Plugins — Análise Técnica

**Data:** 2026-08-12  
**Status:** Planejamento  
**Pré-requisitos:** ✅ Etapa 3 (Design System), ✅ Etapa 2 (Contrato)

---

## 1. Componentes Existentes

### 1.1 Componentes Base Encontrados

| Componente | Arquivo | Linhas | Props | Uso |
|-----------|---------|--------|-------|-----|
| **CommandInput** | CommandInput.tsx | 52 | value, onChange, onSubmit, onEscape, onArrowDown, onArrowUp, placeholder, autoFocus | Busca de comandos |
| **CommandItem** | CommandItem.tsx | 150+ | name, entry, active, onClick, onToggleFavorite, onEdit, onDelete | Item de lista |
| **CommandList** | CommandList.tsx | ? | entries, ... | Lista de comandos |
| **Toast** | Toast.tsx | 12 | toasts, onDismiss | Notificações |
| **TitleBar** | TitleBar.tsx | ? | | Barra superior |
| **Toolbox** | Toolbox.tsx | ? | | Componente principal |

### 1.2 Componentes Existentes (Modals)

| Modal | Arquivo | Objetivo |
|-------|---------|----------|
| SettingsModal | SettingsModal.tsx | Configurações do app |
| MarketplaceModal | MarketplaceModal.tsx | Marketplace de plugins |
| InstallPluginModal | InstallPluginModal.tsx | Instalação de plugins |
| AddCommandModal | AddCommandModal.tsx | Adicionar novo comando |
| LucideIconPicker | LucideIconPicker.tsx | Seletor de ícones |

---

## 2. Componentes Necessários (Por Categoria)

### 2.1 Base / Primitivos (NOVOS)

| Componente | Necessário? | Impacto | Status |
|-----------|-----------|--------|--------|
| **Button** | ✅ CRÍTICO | Usado em toda UI | ❌ Não encontrado |
| **FormGroup** | ✅ CRÍTICO | Wrapper para label+input | ❌ Não encontrado |
| **Input** | ⚠️ EXISTE | CommandInput existe, mas genérico | ⏳ Adaptar |
| **Textarea** | ✅ ALTO | Áreas de texto | ❌ Não encontrado |
| **Select** | ✅ ALTO | Dropdowns | ❌ Não encontrado |
| **Checkbox** | ✅ MÉDIO | Checkboxes | ❌ Não encontrado |
| **Radio** | ✅ MÉDIO | Radio buttons | ❌ Não encontrado |
| **Label** | ✅ ALTO | Labels para acessibilidade | ❌ Não encontrado |

### 2.2 Compostos (NOVOS)

| Componente | Objetivo | Status |
|-----------|----------|--------|
| **PluginHeader** | Cabeçalho de plugin (nome, versão, ícone) | ❌ Não encontrado |
| **PluginCard** | Card reutilizável de plugin | ⚠️ Existe como CommandItem |
| **ValidationMessage** | Mensagens de erro/sucesso | ❌ Não encontrado |
| **EmptyState** | Estado vazio com ícone + mensagem | ❌ Não encontrado |
| **LoadingSpinner** | Indicador de carregamento | ❌ Não encontrado |
| **CopyButton** | Botão de copiar com feedback | ❌ Não encontrado |
| **ResultArea** | Área de resultado com estilos | ❌ Não encontrado |

---

## 3. Padrões Identificados

### 3.1 Estrutura de Componentes Existentes

```typescript
// CommandInput.tsx
interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommandInput({ ... }: Props) {
  return (
    <div className="command-input">
      <span className="command-input__icon">⚡</span>
      <input {...} />
    </div>
  );
}
```

**Padrões:**
- ✅ BEM CSS (`.component__element--modifier`)
- ✅ Props bem tipadas em TypeScript
- ✅ Callbacks para interação
- ✅ Keyboard shortcuts tratados

### 3.2 Styling Pattern

```css
/* global.css */
.command-input {
  display: flex;
  padding: var(--spacing-md);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  transition: border-color var(--tr);
}

.command-input:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.command-input__icon { ... }
.command-input__input { ... }
```

**Padrões:**
- ✅ CSS variables (tokens da Etapa 3)
- ✅ Estados via CSS (`:focus-within`, `:hover:not(:disabled)`)
- ✅ Transições suaves (120ms ease)

---

## 4. Estratégia de Implementação

### 4.1 Fase 1: Componentes Base (Primitivos)

**Objetivo:** Criar wrappers reutilizáveis sobre elementos HTML padrão

```
Button.tsx          — <button> com temas
Input.tsx           — <input> genérico com label
Label.tsx           — <label> acessível
Textarea.tsx        — <textarea> com counter opcional
Select.tsx          — <select> estilizado
Checkbox.tsx        — <input type="checkbox"> + label
Radio.tsx           — <input type="radio"> + label
FormGroup.tsx       — wrapper <label><input>Error
```

**Padrão:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return <button className={classes} {...props} />;
}
```

### 4.2 Fase 2: Componentes Compostos

```
PluginHeader.tsx    — { name, version, icon, author }
PluginCard.tsx      — { plugin, onSelect, onEdit, onDelete }
ValidationMessage.tsx — { error?, success?, warning? }
EmptyState.tsx      — { icon, title, description }
LoadingSpinner.tsx  — { size?, message? }
CopyButton.tsx      — { text, onCopy }
ResultArea.tsx      — { content, format?, copyable? }
```

**Padrão:**
```typescript
interface PluginHeaderProps {
  name: string;
  version: string;
  icon?: React.ReactNode;
  author?: string;
  onClose?: () => void;
}

export function PluginHeader({
  name,
  version,
  icon,
  author,
  onClose,
}: PluginHeaderProps) {
  return (
    <header className="plugin-header">
      <div className="plugin-header__content">
        {icon && <span className="plugin-header__icon">{icon}</span>}
        <div className="plugin-header__info">
          <h1 className="plugin-header__name">{name}</h1>
          <span className="plugin-header__version">v{version}</span>
          {author && <span className="plugin-header__author">{author}</span>}
        </div>
      </div>
      {onClose && (
        <button className="plugin-header__close" onClick={onClose}>×</button>
      )}
    </header>
  );
}
```

### 4.3 Fase 3: Documentação e Exemplos

```
docs/plugin-ui-components.md
├── Componentes Base
│  ├── Button (variants, sizes, disabled)
│  ├── Input (label, error, success)
│  ├── FormGroup (accessibility patterns)
│  └── ...
├── Componentes Compostos
│  ├── PluginHeader (exemplo de uso)
│  ├── PluginCard (exemplo de uso)
│  └── ...
├── Acessibilidade
│  ├── Labels associados
│  ├── ARIA attributes
│  └── Keyboard navigation
└── Exemplos de Telas
   └── Exemplo: gerador-json com componentes novos
```

---

## 5. Implementação Passo a Passo

### Passo 1: Criar Button.tsx

```typescript
// src/components/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    props.className,
  ].filter(Boolean).join(' ');

  return <button className={classes} {...props} />;
}
```

### Passo 2: Adicionar CSS em global.css

```css
/* Buttons */
.button {
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--tr), color var(--tr), border-color var(--tr);
}

.button--primary {
  background: var(--accent);
  color: #fff;
}

.button--primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.button--secondary {
  background: var(--bg-elev-3);
  color: var(--fg);
  border-color: var(--border);
}

.button--secondary:hover:not(:disabled) {
  background: var(--bg-elev-4);
  border-color: var(--accent);
}

.button--danger {
  background: var(--danger);
  color: #fff;
}

.button--success {
  background: var(--success);
  color: #fff;
}

.button:focus-visible {
  outline: var(--focus-width) solid var(--focus-ring);
  outline-offset: var(--focus-offset);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.button--sm { padding: 4px 8px; font-size: 12px; }
.button--lg { padding: 12px 16px; font-size: 16px; }
```

### Passo 3-8: Repetir para outros componentes

---

## 6. Cronograma

| Fase | Tempo | Tarefas |
|------|-------|---------|
| 1 | 1.5h | Button, Input, Label, Textarea, Select, Checkbox, Radio (7 componentes) |
| 2 | 1.5h | PluginHeader, PluginCard, ValidationMessage, EmptyState, LoadingSpinner, CopyButton, ResultArea (7 componentes) |
| 3 | 1h | CSS global.css atualizado, documentação, exemplos |
| 4 | 30min | Testes (a11y, visual), build validation |
| **Total** | **4.5h** | |

---

## 7. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|--------|-----------|
| Duplicar componentes existentes | 🔴 ALTO | Auditar codebase antes (feito com file_search) |
| Componentes muito genéricos | 🟠 MÉDIO | Começar com casos de uso reais (4 plugins KapiNote) |
| Quebra de compatibilidade visual | 🔴 ALTO | Usar CSS classes (não mudar HTML existente) |
| Falta de acessibilidade | 🟠 MÉDIO | Testar com axe/wave, adicionar labels, ARIA |

---

## 8. Critério de Sucesso

- [x] Análise de componentes existentes completa
- [ ] ⏳ 14 componentes base + compostos implementados
- [ ] ⏳ CSS atualizado (~200 linhas novas)
- [ ] ⏳ Documentação (plugin-ui-components.md)
- [ ] ⏳ Acessibilidade validada (keyboard, labels, ARIA)
- [ ] ⏳ Build sucesso (0 erros)
- [ ] ⏳ Exemplo: gerador-json usando componentes novos

---

**Status:** Pronto para Fase 1 (Implementação de Componentes Base)

**Próximo:** Iniciar criação de Button.tsx, Input.tsx, Label.tsx, ...
