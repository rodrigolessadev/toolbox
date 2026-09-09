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

/**
 * URL do Webhook do Google Apps Script publicado como Web App conectado à planilha Google Sheets.
 */
export const FEEDBACK_WEBHOOK_URL: string =
  import.meta.env.VITE_FEEDBACK_WEBHOOK_URL ||
  import.meta.env.PUBLIC_FEEDBACK_WEBHOOK_URL ||
  '';

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

/**
 * Detecta a plataforma operacional simplificada do cliente.
 */
function detectPlatform(): string {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'desktop';
  }
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux') || ua.includes('x11')) return 'linux';
  if (ua.includes('mac')) return 'macos';
  return 'desktop';
}

/**
 * Envia feedback através do Webhook do Google Apps Script conectado ao Google Sheets.
 */
export async function sendFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  const pageUrl = input.pageUrl || 'desktop://toolbox/app';
  const appVersion = input.appVersion || 'desktop-1.0.0';
  const trimmedMessage = (input.message || '').trim();
  const trimmedEmail = input.email ? input.email.trim() : null;
  const platform = detectPlatform();

  // Log de Início da Rotina de Envio
  await logFeedback(
    'info',
    `Iniciando envio de feedback [tipo: ${input.type}, versao: ${appVersion}, plataforma: ${platform}, rota: ${pageUrl}, tamanho: ${trimmedMessage.length} chars, email: ${trimmedEmail ? 'sim' : 'nao'}]`
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

  // 5. Validação da URL do Serviço
  if (!FEEDBACK_WEBHOOK_URL) {
    await logFeedback('error', 'Falha de configuracao: URL do Webhook do Google Sheets ausente (VITE_FEEDBACK_WEBHOOK_URL).');
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. O serviço de envio não está configurado.',
    };
  }

  // 6. Envio via fetch com AbortController (timeout de 10s)
  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    await logFeedback('debug', 'Conectando ao Webhook do Google Sheets para registrar feedback...');

    const payload = {
      action: 'create',
      type: input.type,
      message: trimmedMessage,
      email: trimmedEmail || '',
      version: appVersion,
      platform,
      page_url: pageUrl,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        // text/plain;charset=utf-8 evita requisição preflight OPTIONS no Apps Script
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);

    let resData: any = {};
    try {
      resData = await response.json();
    } catch {
      // Alguns redirecionamentos do Apps Script podem retornar HTML ou texto simples
      if (response.ok) {
        resData = { status: 'success' };
      }
    }

    if (resData.status === 'success' || response.ok) {
      await logFeedback(
        'info',
        `Feedback gravado com sucesso no Google Sheets (latencia: ${duration}ms, id: ${resData.id || 'ok'}).`
      );
      return { success: true };
    }

    const errorMsg = resData.message || `HTTP ${response.status}`;
    await logFeedback(
      'error',
      `Falha ao gravar feedback no Google Sheets (latencia: ${duration}ms, erro: ${errorMsg})`
    );
    return {
      success: false,
      error: 'Não foi possível enviar seu feedback agora. Tente novamente.',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Math.round(performance.now() - startTime);
    const isTimeout = err.name === 'AbortError';

    await logFeedback(
      'error',
      `Excecao durante envio de feedback para Google Sheets (latencia: ${duration}ms, timeout: ${isTimeout}): ${err.message || String(err)}`
    );

    return {
      success: false,
      error: isTimeout
        ? 'Tempo limite esgotado. Verifique sua conexão com a internet e tente novamente.'
        : 'Não foi possível enviar seu feedback agora. Tente novamente.',
    };
  }
}
