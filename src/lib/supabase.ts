import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { api } from './api';

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

/**
 * Registra logs estruturados no toolbox.log via comando Tauri (com fallback defensivo no console).
 */
async function logFeedback(level: 'info' | 'warn' | 'error' | 'debug', message: string): Promise<void> {
  try {
    await api.logEvent(level, 'FEEDBACK', message);
  } catch (err) {
    if (level === 'error') {
      console.error(`[FEEDBACK] ${message}`, err);
    } else if (level === 'warn') {
      console.warn(`[FEEDBACK] ${message}`);
    } else {
      console.log(`[FEEDBACK] ${message}`);
    }
  }
}

export function getSupabaseClient(): { client: SupabaseClient; url: string } | null {
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

  return { client: supabaseInstance, url: supabaseUrl };
}

export async function sendFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  const pageUrl = input.pageUrl || 'desktop://toolbox/app';
  const appVersion = input.appVersion || 'desktop-1.22.1';
  const trimmedMessage = (input.message || '').trim();
  const trimmedEmail = input.email ? input.email.trim() : null;

  // Log de Início da Rotina de Envio
  await logFeedback(
    'info',
    `Iniciando envio de feedback [tipo: ${input.type}, versao: ${appVersion}, rota: ${pageUrl}, tamanho: ${trimmedMessage.length} chars, email: ${trimmedEmail ? 'sim' : 'nao'}]`
  );

  // 1. Proteção Anti-Spam: Honeypot preenchido por robôs
  if (input.honeypot && input.honeypot.trim() !== '') {
    await logFeedback('warn', 'Protecao anti-spam acionada: honeypot preenchido.');
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true };
  }

  // 2. Validação de Tipo
  const validTypes: FeedbackType[] = ['suggestion', 'bug', 'question', 'praise', 'other'];
  if (!validTypes.includes(input.type)) {
    await logFeedback('warn', `Validacao falhou: categoria de feedback invalida '${input.type}'.`);
    return { success: false, error: 'Por favor, selecione uma categoria válida.' };
  }

  // 3. Validação de Mensagem
  if (trimmedMessage.length < 10) {
    await logFeedback('warn', `Validacao falhou: mensagem com menos de 10 caracteres (${trimmedMessage.length} chars).`);
    return { success: false, error: 'A mensagem deve conter no mínimo 10 caracteres.' };
  }
  if (trimmedMessage.length > 5000) {
    await logFeedback('warn', `Validacao falhou: mensagem ultrapassou 5.000 caracteres (${trimmedMessage.length} chars).`);
    return { success: false, error: 'A mensagem não pode ultrapassar 5.000 caracteres.' };
  }

  // 4. Validação de E-mail (opcional)
  if (trimmedEmail && (!trimmedEmail.includes('@') || !trimmedEmail.includes('.'))) {
    await logFeedback('warn', 'Validacao falhou: formato de e-mail invalido informado.');
    return { success: false, error: 'Por favor, informe um endereço de e-mail válido ou deixe em branco.' };
  }

  // 5. Inicialização do Cliente
  const config = getSupabaseClient();
  if (!config) {
    await logFeedback('error', 'Falha de configuracao: Supabase URL ou Anon Key ausentes.');
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. O serviço de envio não está configurado.',
    };
  }

  // 6. Persistência no Banco Supabase
  const startTime = performance.now();
  try {
    await logFeedback('debug', `Conectando ao Supabase para gravar feedback...`);

    const { error } = await config.client.from('feedbacks').insert([
      {
        type: input.type,
        message: trimmedMessage,
        email: trimmedEmail || null,
        page_url: pageUrl,
        app_version: appVersion,
        status: 'new',
      },
    ]);

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      await logFeedback(
        'error',
        `Falha ao gravar feedback no Supabase (latencia: ${duration}ms, erro: ${error.message}${error.code ? `, codigo: ${error.code}` : ''})`
      );
      return {
        success: false,
        error: 'Não foi possível enviar seu feedback agora. Tente novamente.',
      };
    }

    await logFeedback(
      'info',
      `Feedback gravado com sucesso no Supabase (latencia: ${duration}ms, status: 201 Created).`
    );
    return { success: true };
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    const errDetail = err instanceof Error ? err.message : String(err);
    await logFeedback(
      'error',
      `Excecao inesperada durante envio do feedback (latencia: ${duration}ms): ${errDetail}`
    );
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. Tente novamente.',
    };
  }
}

