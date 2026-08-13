# Plugin UI Components — Biblioteca Etapa 4

Documentação completa da biblioteca de componentes visuais para interfaces de plugins.

## 📚 Índice

- [Componentes Base](#componentes-base)
- [Componentes Compostos](#componentes-compostos)
- [Design Tokens](#design-tokens)
- [Temas Suportados](#temas-suportados)
- [Padrões de Uso](#padrões-de-uso)
- [Acessibilidade](#acessibilidade)

---

## Componentes Base

### Button

Botão reutilizável com múltiplas variantes e tamanhos.

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'` — Tipo de botão (padrão: `primary`)
- `size?: 'sm' | 'md' | 'lg'` — Tamanho (padrão: `md`)
- `disabled?: boolean` — Estado desabilitado
- `children: React.ReactNode` — Conteúdo

**Exemplo:**
```tsx
import { Button } from '@/components';

export function MyPlugin() {
  return (
    <>
      <Button>Padrão</Button>
      <Button variant="secondary">Secundário</Button>
      <Button variant="danger" size="sm">Deletar</Button>
      <Button disabled>Desabilitado</Button>
    </>
  );
}
```

**Estilos CSS Aplicados:**
- `.button` — Base com padding, border-radius, transitions
- `.button--${variant}` — Cores por variante
- `.button--${size}` — Padding e font-size por tamanho
- `:hover`, `:active`, `:focus-visible` — Estados interativos
- `:disabled` — Opacidade reduzida e cursor `not-allowed`

---

### Input

Input de texto com suporte a validação e tamanhos.

**Props:**
- `error?: string` — Mensagem de erro (ativa estado de erro)
- `success?: boolean` — Indica sucesso (background verde)
- `sizeVariant?: 'sm' | 'md' | 'lg'` — Tamanho (padrão: `md`)
- Estende `HTMLInputElement` attributes

**Exemplo:**
```tsx
import { Input } from '@/components';
import { useState } from 'react';

export function Form() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <Input
      type="email"
      placeholder="seu@email.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={error ? 'Email inválido' : ''}
      success={email.includes('@')}
    />
  );
}
```

**CSS Classes:**
- `.input` — Base com border, padding, transitions
- `.input--${sizeVariant}` — Variantes de tamanho
- `.input--error` — Background vermelho + border danger
- `.input--success` — Background verde + border success
- `.input__error` — Texto de erro em vermelho

---

### Label

Label acessível com indicador de campo obrigatório.

**Props:**
- `htmlFor: string` — ID do input associado
- `required?: boolean` — Mostra asterisco de obrigatório
- `children: React.ReactNode` — Conteúdo

**Exemplo:**
```tsx
import { Label, Input, FormGroup } from '@/components';

export function FormField() {
  return (
    <FormGroup inputId="name" label="Nome Completo" required>
      <Input id="name" placeholder="João Silva" />
    </FormGroup>
  );
}
```

---

### Textarea

Área de texto com suporte a contador de caracteres.

**Props:**
- `error?: string` — Mensagem de erro
- `success?: boolean` — Estado de sucesso
- `showCounter?: boolean` — Mostrar contador
- `maxLength?: number` — Limite de caracteres

**Exemplo:**
```tsx
import { Textarea } from '@/components';
import { useState } from 'react';

export function CommentBox() {
  const [text, setText] = useState('');

  return (
    <Textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      maxLength={500}
      showCounter
      placeholder="Digite seu comentário..."
    />
  );
}
```

---

### Select

Dropdown com suporte a validação.

**Props:**
- `options: Array<{label: string, value: any}>` — Opções do dropdown
- `placeholder?: string` — Texto placeholder
- `error?: string` — Mensagem de erro
- `success?: boolean` — Estado de sucesso

**Exemplo:**
```tsx
import { Select, FormGroup } from '@/components';
import { useState } from 'react';

export function LanguageSelector() {
  const [lang, setLang] = useState('pt-br');

  return (
    <FormGroup inputId="lang" label="Idioma">
      <Select
        options={[
          { label: 'Português', value: 'pt-br' },
          { label: 'English', value: 'en' },
          { label: 'Español', value: 'es' },
        ]}
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      />
    </FormGroup>
  );
}
```

---

### Checkbox

Checkbox com label integrada.

**Props:**
- `id: string` — ID único
- `label?: string` — Label do checkbox
- `error?: string` — Mensagem de erro
- Estende `HTMLInputElement` attributes

**Exemplo:**
```tsx
import { Checkbox } from '@/components';
import { useState } from 'react';

export function TermsAgreement() {
  const [agreed, setAgreed] = useState(false);

  return (
    <Checkbox
      id="agree"
      label="Concordo com os termos de uso"
      checked={agreed}
      onChange={(e) => setAgreed(e.target.checked)}
      error={!agreed ? 'Você deve concordar' : ''}
    />
  );
}
```

---

### Radio

Radio button com label integrada.

**Props:**
- `id: string` — ID único
- `name: string` — Grupo de radio
- `value: any` — Valor
- `label?: string` — Label
- `error?: string` — Mensagem de erro

**Exemplo:**
```tsx
import { Radio } from '@/components';
import { useState } from 'react';

export function SubscriptionPlan() {
  const [plan, setPlan] = useState('basic');

  return (
    <>
      <Radio
        name="plan"
        value="basic"
        label="Básico - R$ 19/mês"
        checked={plan === 'basic'}
        onChange={(e) => setPlan(e.target.value)}
      />
      <Radio
        name="plan"
        value="pro"
        label="Pro - R$ 49/mês"
        checked={plan === 'pro'}
        onChange={(e) => setPlan(e.target.value)}
      />
    </>
  );
}
```

---

### FormGroup

Componente composto para agrupar label + input + mensagens de validação.

**Props:**
- `inputId: string` — ID do input
- `label: string` — Texto da label
- `children: React.ReactNode` — Elemento de input
- `error?: string` — Mensagem de erro
- `help?: string` — Texto de ajuda
- `required?: boolean` — Marca como obrigatório

**Exemplo:**
```tsx
import { FormGroup, Input, Button } from '@/components';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrors({ email: 'Email inválido' });
      return;
    }
    // Submit...
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup
        inputId="email"
        label="Email"
        error={errors.email}
        required
      >
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
        />
      </FormGroup>

      <FormGroup
        inputId="password"
        label="Senha"
        help="Mínimo 8 caracteres"
        required
      >
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormGroup>

      <Button type="submit">Entrar</Button>
    </form>
  );
}
```

---

## Componentes Compostos

### PluginHeader

Cabeçalho reutilizável exibindo informações do plugin.

**Props:**
- `name: string` — Nome do plugin
- `version: string` — Versão (ex: "1.0.0")
- `icon?: React.ReactNode` — Ícone emoji ou SVG
- `author?: string` — Autor do plugin
- `onClose?: () => void` — Callback ao fechar
- `className?: string` — Classes CSS adicionais

**Exemplo:**
```tsx
import { PluginHeader } from '@/components';

export function PluginUI() {
  return (
    <PluginHeader
      name="Gerador de JSON"
      version="1.0.0"
      icon="📄"
      author="João Silva"
      onClose={() => window.close()}
    />
  );
}
```

**Layout:**
```
┌─────────────────────────────────────────────┐
│ 📄 Gerador de JSON  v1.0.0 por João Silva  ✕│
└─────────────────────────────────────────────┘
```

---

### PluginCard

Card reutilizável para listagem de plugins.

**Props:**
- `id: string` — ID único
- `name: string` — Nome
- `icon?: React.ReactNode` — Ícone
- `version?: string` — Versão
- `description?: string` — Descrição
- `selected?: boolean` — Se está selecionado
- `active?: boolean` — Se está ativo (mostra checkmark)
- `onClick?: () => void` — Callback ao clicar

**Exemplo:**
```tsx
import { PluginCard } from '@/components';
import { useState } from 'react';

export function PluginList() {
  const [selected, setSelected] = useState('');
  const plugins = [
    {
      id: 'json-gen',
      name: 'Gerador de JSON',
      icon: '📄',
      version: '1.0.0',
      description: 'Converte dados para JSON',
    },
    // ...more plugins
  ];

  return (
    <div>
      {plugins.map(plugin => (
        <PluginCard
          key={plugin.id}
          {...plugin}
          selected={selected === plugin.id}
          active={true}
          onClick={() => setSelected(plugin.id)}
        />
      ))}
    </div>
  );
}
```

---

### ValidationMessage

Mensagens de validação/feedback com ícones.

**Props:**
- `type: 'error' | 'success' | 'warning' | 'info'` — Tipo de mensagem
- `children: React.ReactNode` — Conteúdo
- `showIcon?: boolean` — Mostra ícone (padrão: false)

**Exemplo:**
```tsx
import { ValidationMessage } from '@/components';
import { useState } from 'react';

export function PasswordValidator() {
  const [password, setPassword] = useState('');

  const isValid = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return (
    <>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {password.length < 8 && (
        <ValidationMessage type="error" showIcon>
          Mínimo 8 caracteres
        </ValidationMessage>
      )}
      
      {hasNumber && (
        <ValidationMessage type="success" showIcon>
          Contém número
        </ValidationMessage>
      )}
      
      {!hasSpecial && (
        <ValidationMessage type="warning" showIcon>
          Adicione caractere especial
        </ValidationMessage>
      )}
    </>
  );
}
```

---

### EmptyState

Estado vazio com ícone, título, descrição e ação.

**Props:**
- `icon?: React.ReactNode` — Ícone (emoji ou SVG)
- `title: string` — Título
- `description?: string` — Descrição
- `action?: React.ReactNode` — Elemento de ação (botão)

**Exemplo:**
```tsx
import { EmptyState, Button } from '@/components';
import { useState } from 'react';

export function DataViewer() {
  const [items, setItems] = useState([]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="Nenhum resultado"
        description="Importe ou crie novos dados para começar"
        action={<Button onClick={() => {}}>Importar dados</Button>}
      />
    );
  }

  return (
    // ... render items
  );
}
```

---

### LoadingSpinner

Indicador de carregamento com mensagem opcional.

**Props:**
- `size: 'sm' | 'md' | 'lg'` — Tamanho (padrão: `md`)
- `message?: string` — Mensagem de status
- `className?: string` — Classes adicionais

**Exemplo:**
```tsx
import { LoadingSpinner, ValidationMessage } from '@/components';
import { useState, useEffect } from 'react';

export function DataProcessor() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleProcess = async () => {
    setLoading(true);
    setStatus('Processando dados...');
    
    // Simulate work
    await new Promise(r => setTimeout(r, 2000));
    
    setLoading(false);
    setStatus('');
  };

  if (loading) {
    return <LoadingSpinner message={status} size="md" />;
  }

  return <Button onClick={handleProcess}>Processar</Button>;
}
```

---

### CopyButton

Botão para copiar texto com feedback visual.

**Props:**
- `text: string` — Texto a copiar
- `label?: string` — Label do botão (padrão: "Copiar")
- `onCopy?: () => void` — Callback ao copiar
- `className?: string` — Classes adicionais

**Exemplo:**
```tsx
import { CopyButton } from '@/components';

export function CommandDisplay() {
  const command = 'npm install @toolbox/plugins';

  return (
    <div>
      <code>{command}</code>
      <CopyButton text={command} label="Copiar comando" />
    </div>
  );
}
```

**Comportamento:**
- Mostra "📋 Copiar" normalmente
- Ao clicar, copia para clipboard
- Exibe "✓ Copiado!" por 2 segundos
- Volta ao estado normal

---

### ResultArea

Área de resultado com suporte a múltiplos formatos e copiar.

**Props:**
- `content: string | React.ReactNode` — Conteúdo a exibir
- `format: 'text' | 'json' | 'code' | 'html'` — Formato (padrão: `text`)
- `copyable?: boolean` — Permite copiar (padrão: false)
- `copyLabel?: string` — Label do botão copiar
- `minHeight?: string` — Altura mínima (padrão: `150px`)

**Exemplo:**
```tsx
import { ResultArea, LoadingSpinner } from '@/components';
import { useState } from 'react';

export function JsonGenerator() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generateJson = async () => {
    setLoading(true);
    // Generate JSON...
    const json = { foo: 'bar', items: [1, 2, 3] };
    setResult(JSON.stringify(json, null, 2));
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner message="Gerando JSON..." />;
  }

  return (
    <>
      <button onClick={generateJson}>Gerar</button>
      
      {result && (
        <ResultArea
          content={result}
          format="json"
          copyable
          copyLabel="Copiar JSON"
          minHeight="300px"
        />
      )}
    </>
  );
}
```

---

## Design Tokens

Todos os componentes usam CSS variables para cores, espaçamento e transições:

**Cores (Tema Light):**
```css
--accent:       #006aa8;
--success:      #2d7d3f;
--warning:      #b25f0f;
--danger:       #c9392e;
--info:         #0066ff;
--fg:           #1a1a1a;
--fg-muted:     #666666;
--bg:           #ffffff;
--bg-elev-1:    #f5f5f5;
--bg-elev-2:    #ebebeb;
--bg-elev-3:    #e0e0e0;
--border:       #d0d0d0;
```

**Cores (Tema Dark):**
```css
--accent:       #6aa3ff;
--success:      #4cc38a;
--warning:      #f5a524;
--danger:       #ff6369;
--fg:           #e8eaed;
--bg:           #0e1014;
--bg-elev-1:    #161a21;
--bg-elev-2:    #1f242d;
--bg-elev-3:    #262c36;
--border:       #262c36;
```

**Espaçamento:**
```css
--radius:       10px;
--radius-sm:    6px;
--radius-lg:    14px;
--radius-full:  999px;
```

**Transições:**
```css
--tr:           120ms ease;
--tr-fast:      60ms ease;
--tr-slow:      200ms ease;
```

---

## Temas Suportados

### Ativar Tema

```tsx
// Light (padrão)
document.documentElement.removeAttribute('data-theme');

// Dark
document.documentElement.setAttribute('data-theme', 'dark');

// High Contrast
document.documentElement.setAttribute('data-theme', 'high-contrast');
```

Todos os componentes respeitam automaticamente o tema ativo via CSS variables.

---

## Padrões de Uso

### 1. Formulários Completos

```tsx
import {
  FormGroup,
  Input,
  Textarea,
  Select,
  Checkbox,
  Button,
  ValidationMessage,
} from '@/components';

export function PluginForm() {
  const [data, setData] = useState({
    name: '',
    description: '',
    language: 'python',
    isPublic: false,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.name) newErrors.name = 'Nome obrigatório';
    if (!data.description) newErrors.description = 'Descrição obrigatória';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit...
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup
        inputId="name"
        label="Nome do Plugin"
        error={errors.name}
        required
      >
        <Input
          id="name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </FormGroup>

      <FormGroup
        inputId="desc"
        label="Descrição"
        error={errors.description}
        required
      >
        <Textarea
          id="desc"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          maxLength={500}
          showCounter
        />
      </FormGroup>

      <FormGroup inputId="lang" label="Linguagem">
        <Select
          id="lang"
          value={data.language}
          onChange={(e) => setData({ ...data, language: e.target.value })}
          options={[
            { label: 'Python', value: 'python' },
            { label: 'TypeScript', value: 'typescript' },
          ]}
        />
      </FormGroup>

      <Checkbox
        id="public"
        label="Publicar no marketplace"
        checked={data.isPublic}
        onChange={(e) => setData({ ...data, isPublic: e.target.checked })}
      />

      <Button type="submit">Criar Plugin</Button>
    </form>
  );
}
```

### 2. Gerenciador de Plugins com Estados

```tsx
import {
  PluginCard,
  EmptyState,
  LoadingSpinner,
  PluginHeader,
  Button,
} from '@/components';

export function PluginManager() {
  const [plugins, setPlugins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPlugins = async () => {
    setLoading(true);
    // Fetch plugins...
    setLoading(false);
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Carregando plugins..." />;
  }

  if (plugins.length === 0) {
    return (
      <EmptyState
        icon="🔌"
        title="Nenhum plugin instalado"
        description="Comece instalando um plugin do marketplace"
        action={<Button>Explorar Marketplace</Button>}
      />
    );
  }

  return (
    <div>
      {selected && (
        <PluginHeader
          name={selected.name}
          version={selected.version}
          icon={selected.icon}
          author={selected.author}
          onClose={() => setSelected(null)}
        />
      )}

      <div style={{ display: 'grid', gap: '8px' }}>
        {plugins.map(plugin => (
          <PluginCard
            key={plugin.id}
            {...plugin}
            selected={selected?.id === plugin.id}
            onClick={() => setSelected(plugin)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Acessibilidade

Todos os componentes implementam padrões WCAG 2.1 AA:

### Keyboard Navigation
- `Tab` — Navega entre elementos
- `Shift+Tab` — Volta
- `Enter` / `Space` — Ativa botões e checkboxes
- `Arrow Keys` — Navega entre radio buttons/options

### ARIA Attributes
- `aria-label` — Rótulos para elementos sem texto
- `aria-pressed` — Estado de botões toggleáveis
- `aria-live="polite"` — Anúncios de validação
- `aria-hidden="true"` — Esconde ícones decorativos
- `role="alert"` — Marca mensagens de erro

### Focus Visible
Todos os elementos interativos mostram ring de focus em `:focus-visible` com a cor `--focus-ring`:

```css
:focus-visible {
  outline: var(--focus-width) solid var(--focus-ring);
  outline-offset: var(--focus-offset);
}
```

### Contraste
Todas as cores mantêm **mínimo 4.5:1** de contraste WCAG AA:
- Texto escuro sobre claro: ✅
- Texto claro sobre escuro: ✅
- Feedback colors (success, danger, warning): ✅

---

## Arquivos

- **Componentes Base:** `src/components/Button.tsx`, `Input.tsx`, etc.
- **Componentes Compostos:** `src/components/PluginHeader.tsx`, `PluginCard.tsx`, etc.
- **Estilos:** `src/styles/components.css` (importado em `global.css`)
- **Tokens:** `src/styles/tokens.ts`
- **Índice de Exportação:** `src/components/index.ts`

---

## Próximas Etapas

- **Etapa 5:** Extração da lógica do KapiNote
- **Etapa 6:** Empacotamento dos 4 plugins iniciais
- **Etapa 7:** Padronização visual das interfaces legadas
- **Etapa 8:** Definição do protocolo entre Toolbox e plugins
