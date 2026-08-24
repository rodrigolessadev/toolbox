import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type FeedbackType = 'suggestion' | 'bug' | 'question' | 'praise' | 'other';

export interface FeedbackInput {
  type: FeedbackType;
  message: string;
  email?: string;
  honeypot?: string;
  pageUrl?: string;
  appVersion?: string;
}

export interface FeedbackResult {
  success: boolean;
  error?: string;
}

let supabaseInstance: SupabaseClient | null = null;

const DEFAULT_SUPABASE_URL = 'https://syxbwffzkiotgwjofvvo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_3-HaS5nHZ5sQaKn-3dHpDw_pjTQ16z_';

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

export async function sendFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  // 1. Proteção Anti-Spam: Honeypot preenchido por robôs
  if (input.honeypot && input.honeypot.trim() !== '') {
    // Retorna sucesso falso para enganar bots sem gravar no banco
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true };
  }

  // 2. Validação do Tipo
  const validTypes: FeedbackType[] = ['suggestion', 'bug', 'question', 'praise', 'other'];
  if (!validTypes.includes(input.type)) {
    return { success: false, error: 'Por favor, selecione uma categoria válida.' };
  }

  // 3. Validação da Mensagem
  const trimmedMessage = (input.message || '').trim();
  if (trimmedMessage.length < 10) {
    return { success: false, error: 'A mensagem deve conter no mínimo 10 caracteres.' };
  }
  if (trimmedMessage.length > 5000) {
    return { success: false, error: 'A mensagem não pode ultrapassar 5.000 caracteres.' };
  }

  // 4. Validação de E-mail (opcional)
  const trimmedEmail = input.email ? input.email.trim() : null;
  if (trimmedEmail && (!trimmedEmail.includes('@') || !trimmedEmail.includes('.'))) {
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido ou deixe em branco.' };
  }

  // 5. Inicialização do Cliente
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Feedback] Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes).');
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. O serviço de envio não está configurado.',
    };
  }

  // 6. Persistência no Banco Supabase
  try {
    const pageUrl = input.pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const appVersion = input.appVersion || 'site-web';

    const { error } = await supabase.from('feedbacks').insert([
      {
        type: input.type,
        message: trimmedMessage,
        email: trimmedEmail || null,
        page_url: pageUrl,
        app_version: appVersion,
        status: 'new',
      },
    ]);

    if (error) {
      console.error('[Feedback] Erro ao gravar feedback no Supabase:', error.message);
      return {
        success: false,
        error: 'Não foi possível enviar seu feedback agora. Tente novamente.',
      };
    }

    return { success: true };
  } catch (err) {
    console.error('[Feedback] Exceção durante envio:', err);
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. Tente novamente.',
    };
  }
}
