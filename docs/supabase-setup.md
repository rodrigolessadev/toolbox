# 🗄️ Guia de Configuração do Supabase (Sistema de Feedback)

Este guia orienta a configuração do projeto no **Supabase** para persistência e gestão segura dos feedbacks de usuários enviados pelo aplicativo Desktop e pelo site de documentação ([toolbox-nine-phi.vercel.app](https://toolbox-nine-phi.vercel.app/)).

---

## 1. Criação do Projeto no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) e faça login.
2. Clique em **"New Project"**.
3. Escolha um nome para a organização e defina o nome do projeto (ex: `toolbox-feedbacks`).
4. Defina uma senha forte para o banco de dados PostgreSQL e selecione a região mais próxima (ex: `sa-east-1` / São Paulo).
5. Clique em **"Create new project"** e aguarde a inicialização.

---

## 2. Aplicação da Migration SQL

1. No menu lateral do dashboard do Supabase, clique no ícone **SQL Editor** (`</>`).
2. Clique em **"New Query"**.
3. Copie o conteúdo completo do arquivo [`supabase/migrations/20260824_create_feedbacks_table.sql`](../supabase/migrations/20260824_create_feedbacks_table.sql) e cole no editor.
4. Clique no botão **"Run"** (ou pressione `Ctrl + Enter`).
5. A mensagem `Success. No rows returned` confirmará a criação da tabela `feedbacks`, constraints, índices e políticas de Row Level Security (RLS).

---

## 3. Obtenção das Credenciais Públicas (API Keys)

1. No dashboard do Supabase, acesse **Project Settings** (ícone de engrenagem) > **API**.
2. Na seção **Project URL**, copie a URL do projeto (ex: `https://xyzcompany.supabase.co`).
3. Na seção **Project API Keys**, copie a chave pública identificada como **`anon` / `public`**.
   > ⚠️ **NUNCA** utilize ou exponha a chave `service_role` no código do cliente ou frontend!

---

## 4. Configuração das Variáveis de Ambiente

### A. No Ambiente Local (`toolbox/` e `toolbox/site/`)
Crie os arquivos `.env` baseados nos respectivos `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### B. Na Vercel (Produção do Site)
1. Acesse o projeto `toolbox-nine-phi` no painel da [Vercel](https://vercel.com).
2. Vá em **Settings** > **Environment Variables**.
3. Adicione as variáveis:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon pública
4. Marque os ambientes: **Production**, **Preview** e **Development**.
5. Salve as alterações.

---

## 5. Governança e Moderação de Feedbacks

Para visualizar, filtrar e responder aos feedbacks recebidos:
1. No painel do Supabase, acesse **Table Editor** > tabela `feedbacks`.
2. Você poderá ordenar por `created_at DESC` e atualizar o campo `status` conforme o fluxo:
   - `new` (Novo)
   - `reviewing` (Em análise)
   - `planned` (Planejado)
   - `resolved` (Resolvido / Implementado)
   - `archived` (Arquivado)
