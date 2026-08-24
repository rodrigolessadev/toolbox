import React, { useState, useEffect, useRef } from 'react';
import { sendFeedback, type FeedbackType } from '../lib/supabase';

interface FeedbackModalProps {
  buttonLabel?: string;
  className?: string;
  variant?: 'nav' | 'button' | 'link';
}

export default function FeedbackModal({
  buttonLabel = 'Enviar feedback',
  className = '',
  variant = 'nav',
}: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Escuta tecla ESC e cliques fora do modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && status !== 'sending') {
        handleClose();
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-feedback-modal', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-feedback-modal', handleCustomOpen);
    };
  }, [isOpen, status]);

  // Foco automático ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleOpen = () => {
    setStatus('idle');
    setErrorMessage('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (status === 'sending') return;
    setIsOpen(false);
    if (status === 'success') {
      setMessage('');
      setEmail('');
      setType('suggestion');
      setStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    if (message.trim().length < 10) {
      setErrorMessage('A mensagem deve conter no mínimo 10 caracteres.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    const res = await sendFeedback({
      type,
      message,
      email,
      honeypot,
      pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
      appVersion: 'site-docs',
    });

    if (res.success) {
      setStatus('success');
      setMessage('');
      setEmail('');
      setHoneypot('');
    } else {
      setStatus('error');
      setErrorMessage(res.error || 'Não foi possível enviar seu feedback agora. Tente novamente.');
    }
  };

  return (
    <>
      {/* Botão de Disparo */}
      {variant === 'nav' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`feedback-nav-btn ${className}`}
          aria-label="Abrir formulário de feedback"
        >
          <span aria-hidden="true" style={{ fontSize: '14px' }}>💬</span>
          <span>{buttonLabel}</span>
        </button>
      ) : variant === 'link' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`feedback-link-btn ${className}`}
          aria-label="Abrir formulário de feedback"
        >
          {buttonLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={`feedback-pill-btn ${className}`}
          aria-label="Abrir formulário de feedback"
        >
          <span>💬</span>
          <span>{buttonLabel}</span>
        </button>
      )}

      {/* Modal / Dialog */}
      {isOpen && (
        <div
          className="feedback-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && status !== 'sending') {
              handleClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div className="feedback-modal" ref={modalRef}>
            {/* Cabeçalho */}
            <div className="feedback-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💬</span>
                <h3 id="feedback-modal-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  Enviar Feedback
                </h3>
              </div>
              <button
                type="button"
                className="feedback-close-btn"
                onClick={handleClose}
                disabled={status === 'sending'}
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo */}
            {status === 'success' ? (
              <div className="feedback-success-state">
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--success)' }}>
                  Obrigado!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 20px 0' }}>
                  Seu feedback foi enviado com sucesso e ajudará a melhorar o Toolbox.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="feedback-submit-btn"
                  style={{ width: 'auto', padding: '8px 24px' }}
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                {/* Alerta de Erro */}
                {errorMessage && (
                  <div className="feedback-error-banner" role="alert">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Tipo de Feedback */}
                <div className="feedback-field">
                  <label htmlFor="feedback-type" className="feedback-label">
                    Tipo de feedback <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    id="feedback-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    disabled={status === 'sending'}
                    className="feedback-select"
                  >
                    <option value="suggestion">💡 Sugestão de melhoria</option>
                    <option value="bug">🐛 Reportar um bug ou problema</option>
                    <option value="question">❓ Dúvida sobre o uso</option>
                    <option value="praise">❤️ Elogio</option>
                    <option value="other">📝 Outro assunto</option>
                  </select>
                </div>

                {/* Mensagem */}
                <div className="feedback-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="feedback-message" className="feedback-label">
                      Mensagem <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <span
                      style={{
                        fontSize: '11px',
                        color: message.length > 5000 ? 'var(--danger)' : 'var(--text-muted)',
                      }}
                    >
                      {message.length} / 5000
                    </span>
                  </div>
                  <textarea
                    id="feedback-message"
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={status === 'sending'}
                    placeholder="Descreva detalhadamente sua sugestão, dúvida ou o que aconteceu..."
                    rows={3}
                    required
                    minLength={10}
                    maxLength={5000}
                    className="feedback-textarea"
                  />
                </div>

                {/* E-mail (Opcional) */}
                <div className="feedback-field">
                  <label htmlFor="feedback-email" className="feedback-label">
                    E-mail <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <input
                    type="email"
                    id="feedback-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'sending'}
                    placeholder="seu.email@exemplo.com"
                    className="feedback-input"
                  />
                  <span className="feedback-hint">
                    Informe seu e-mail caso deseje receber um retorno da equipe.
                  </span>
                </div>

                {/* Campo Honeypot (Oculto para captura de robôs) */}
                <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }}>
                  <label htmlFor="website_url_hp">Não preencha este campo</label>
                  <input
                    type="text"
                    id="website_url_hp"
                    name="website_url_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Aviso de Privacidade */}
                <div className="feedback-privacy-note">
                  🔒 <em>Não envie senhas ou informações confidenciais.</em>
                </div>

                {/* Rodapé de Ações */}
                <div className="feedback-actions">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={status === 'sending'}
                    className="feedback-cancel-btn"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending' || message.trim().length < 10}
                    className="feedback-submit-btn"
                  >
                    {status === 'sending' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="feedback-spinner" /> Enviando...
                      </span>
                    ) : (
                      'Enviar feedback'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Estilos encapsulados com CSS Variables do tema */}
      <style>{`
        .feedback-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          color: var(--accent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .feedback-nav-btn:hover {
          background: color-mix(in srgb, var(--accent) 25%, transparent);
          color: var(--text);
        }
        .feedback-link-btn {
          background: none;
          border: none;
          padding: 0;
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .feedback-link-btn:hover {
          color: var(--text);
        }
        .feedback-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--accent);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.15s ease, background 0.15s ease;
          font-family: inherit;
        }
        .feedback-pill-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .feedback-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: feedbackFadeIn 0.15s ease-out;
        }
        .feedback-modal {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          width: 100%;
          max-width: 480px;
          max-height: min(90vh, 540px);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow);
          overflow: hidden;
          animation: feedbackSlideUp 0.18s ease-out;
        }
        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
        }
        .feedback-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }
        .feedback-close-btn:hover {
          color: var(--text);
          background: color-mix(in srgb, var(--border) 50%, transparent);
        }
        .feedback-form {
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          flex: 1;
        }
        .feedback-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .feedback-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }
        .feedback-select,
        .feedback-input,
        .feedback-textarea {
          width: 100%;
          padding: 9px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-family: inherit;
          font-size: 13px;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }
        .feedback-select:focus,
        .feedback-input:focus,
        .feedback-textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        .feedback-textarea {
          resize: vertical;
          min-height: 65px;
          max-height: 130px;
        }
        .feedback-hint {
          font-size: 11px;
          color: var(--text-muted);
        }
        .feedback-privacy-note {
          font-size: 11px;
          color: var(--text-muted);
          background: color-mix(in srgb, var(--border) 30%, transparent);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
        }
        .feedback-error-banner {
          background: color-mix(in srgb, var(--danger) 15%, transparent);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 12px;
        }
        .feedback-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
        }
        .feedback-cancel-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }
        .feedback-cancel-btn:hover {
          color: var(--text);
          border-color: var(--text-muted);
        }
        .feedback-submit-btn {
          background: var(--accent);
          border: none;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease, opacity 0.15s ease;
        }
        .feedback-submit-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .feedback-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .feedback-success-state {
          padding: 36px 20px;
          text-align: center;
        }
        .feedback-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: feedbackSpin 0.6s linear infinite;
        }
        @keyframes feedbackSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes feedbackFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes feedbackSlideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
