-- ==============================================================================
-- Schema de Feedback do Ecossistema Toolbox (Supabase PostgreSQL)
-- Migration: 20260824_create_feedbacks_table.sql
-- ==============================================================================

-- 1. Criação da Tabela feedbacks
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  email TEXT,
  page_url TEXT,
  app_version TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Restrições de Integridade (Constraints)
ALTER TABLE public.feedbacks
  DROP CONSTRAINT IF EXISTS feedback_type_check;

ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedback_type_check
  CHECK (type IN ('suggestion', 'bug', 'question', 'praise', 'other'));

ALTER TABLE public.feedbacks
  DROP CONSTRAINT IF EXISTS feedback_status_check;

ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedback_status_check
  CHECK (status IN ('new', 'reviewing', 'planned', 'resolved', 'archived'));

ALTER TABLE public.feedbacks
  DROP CONSTRAINT IF EXISTS feedback_message_length_check;

ALTER TABLE public.feedbacks
  ADD CONSTRAINT feedback_message_length_check
  CHECK (char_length(message) >= 10 AND char_length(message) <= 5000);

-- 3. Índices de Performance e Consulta
CREATE INDEX IF NOT EXISTS feedbacks_created_at_idx
  ON public.feedbacks (created_at DESC);

CREATE INDEX IF NOT EXISTS feedbacks_status_idx
  ON public.feedbacks (status);

-- 4. Habilitação de Segurança em Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso
-- Permitir exclusivamente INSERÇÃO por usuários anônimos e autenticados com validação estrita
DROP POLICY IF EXISTS "Permitir envio publico de feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Permitir envio público de feedback" ON public.feedbacks;

CREATE POLICY "Permitir envio público de feedback"
  ON public.feedbacks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(message) >= 10
    AND char_length(message) <= 5000
    AND type IN ('suggestion', 'bug', 'question', 'praise', 'other')
  );

-- Comentários descritivos
COMMENT ON TABLE public.feedbacks IS 'Armazena feedbacks, dúvidas, sugestões e bugs reportados pelos usuários do Toolbox e do site de documentação.';
COMMENT ON COLUMN public.feedbacks.type IS 'Categoria do feedback: suggestion, bug, question, praise, other.';
COMMENT ON COLUMN public.feedbacks.status IS 'Status de triagem: new, reviewing, planned, resolved, archived.';
COMMENT ON COLUMN public.feedbacks.email IS 'E-mail opcional para contato de resposta.';
