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

/**
 * URL do Webhook do Google Apps Script publicado como Web App conectado à planilha Google Sheets.
 */
export const FEEDBACK_WEBHOOK_URL: string =
  import.meta.env.VITE_FEEDBACK_WEBHOOK_URL ||
  import.meta.env.PUBLIC_FEEDBACK_WEBHOOK_URL ||
  '';

/**
 * Envia feedback através do Webhook do Google Apps Script conectado ao Google Sheets.
 */
export async function sendFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  // 1. Proteção Anti-Spam: Honeypot preenchido por robôs
  if (input.honeypot && input.honeypot.trim() !== '') {
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

  // 5. Validação da URL do Serviço
  if (!FEEDBACK_WEBHOOK_URL) {
    console.warn('[Feedback] URL do Webhook não configurada (VITE_FEEDBACK_WEBHOOK_URL / PUBLIC_FEEDBACK_WEBHOOK_URL ausentes).');
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. O serviço de envio não está configurado.',
    };
  }

  // 6. Envio via fetch nativo com AbortController (timeout de 10s)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const pageUrl = input.pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const appVersion = input.appVersion || 'site-web';

    const payload = {
      action: 'create',
      type: input.type,
      message: trimmedMessage,
      email: trimmedEmail || '',
      version: appVersion,
      platform: 'web',
      page_url: pageUrl,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        // text/plain;charset=utf-8 evita preflight CORS desnecessário no Apps Script
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let resData: any = {};
    try {
      resData = await response.json();
    } catch {
      if (response.ok) {
        resData = { status: 'success' };
      }
    }

    if (resData.status === 'success' || response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: resData.message || 'Não foi possível enviar seu feedback agora. Tente novamente.',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    console.error('[Feedback] Exceção durante envio:', err);

    return {
      success: false,
      error: isTimeout
        ? 'Tempo limite esgotado. Verifique sua conexão com a internet e tente novamente.'
        : 'Não foi possível enviar seu feedback agora. Tente novamente.',
    };
  }
}
