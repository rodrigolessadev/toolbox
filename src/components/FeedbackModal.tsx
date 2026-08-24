import { useState, useEffect, useRef } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { MessageSquarePlus, X, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { sendFeedback, type FeedbackType } from "../lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function FeedbackModal({ open, onClose, onSuccess, onError }: Props) {
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carrega versão da aplicação
  useEffect(() => {
    if (open) {
      getVersion()
        .then((v) => setAppVersion(v))
        .catch(() => setAppVersion("1.0.0"));
      setStatus("idle");
      setErrorMessage("");
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [open]);

  // Escuta tecla ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "sending") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, status, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    if (message.trim().length < 10) {
      setErrorMessage("A mensagem deve conter no mínimo 10 caracteres.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const res = await sendFeedback({
      type,
      message,
      email,
      honeypot,
      pageUrl: "desktop://toolbox/main",
      appVersion: `desktop-v${appVersion}`,
    });

    if (res.success) {
      setStatus("success");
      setMessage("");
      setEmail("");
      setHoneypot("");
      onSuccess?.("Obrigado! Seu feedback foi enviado com sucesso.");
    } else {
      setStatus("error");
      const err = res.error || "Não foi possível enviar seu feedback agora. Tente novamente.";
      setErrorMessage(err);
      onError?.(err);
    }
  };

  const handleClose = () => {
    if (status === "sending") return;
    onClose();
    if (status === "success") {
      setStatus("idle");
      setMessage("");
      setEmail("");
      setType("suggestion");
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "sending") {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div className="modal-window" style={{ maxWidth: "520px" }}>
        {/* Header */}
        <header className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquarePlus size={18} style={{ color: "var(--md-sys-color-primary, #7c9eff)" }} />
            <h2 id="feedback-dialog-title" style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
              Enviar Feedback
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            disabled={status === "sending"}
            aria-label="Fechar modal"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--md-sys-color-on-surface-variant, #888)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </header>

        {/* Body */}
        <div className="modal-body" style={{ padding: "16px 20px" }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "28px 12px" }}>
              <CheckCircle2
                size={48}
                style={{ color: "var(--md-sys-color-primary, #4ade80)", marginBottom: "12px" }}
              />
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Obrigado!</h3>
              <p
                style={{
                  color: "var(--md-sys-color-on-surface-variant, #9aa3b2)",
                  fontSize: "13px",
                  margin: "0 0 24px 0",
                }}
              >
                Seu feedback foi enviado com sucesso e ajudará na melhoria contínua do Toolbox.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
                style={{ padding: "8px 24px" }}
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Alerta de erro */}
              {errorMessage && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(248, 113, 113, 0.12)",
                    border: "1px solid rgba(248, 113, 113, 0.4)",
                    color: "var(--md-sys-color-error, #f87171)",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  role="alert"
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Categoria */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor="feedback-desktop-type"
                  style={{ fontSize: "12px", fontWeight: 600, color: "var(--md-sys-color-on-surface, #e6e9ef)" }}
                >
                  Tipo de feedback <span style={{ color: "var(--md-sys-color-error, #f87171)" }}>*</span>
                </label>
                <select
                  id="feedback-desktop-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackType)}
                  disabled={status === "sending"}
                  className="modal-select"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "var(--md-sys-color-surface-container, #131722)",
                    border: "1px solid var(--md-sys-color-outline-variant, #2a3142)",
                    borderRadius: "6px",
                    color: "var(--md-sys-color-on-surface, #e6e9ef)",
                    fontSize: "13px",
                  }}
                >
                  <option value="suggestion">💡 Sugestão de melhoria</option>
                  <option value="bug">🐛 Reportar um bug ou problema</option>
                  <option value="question">❓ Dúvida sobre o uso</option>
                  <option value="praise">❤️ Elogio</option>
                  <option value="other">📝 Outro assunto</option>
                </select>
              </div>

              {/* Mensagem */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label
                    htmlFor="feedback-desktop-message"
                    style={{ fontSize: "12px", fontWeight: 600, color: "var(--md-sys-color-on-surface, #e6e9ef)" }}
                  >
                    Mensagem <span style={{ color: "var(--md-sys-color-error, #f87171)" }}>*</span>
                  </label>
                  <span
                    style={{
                      fontSize: "11px",
                      color:
                        message.length > 5000
                          ? "var(--md-sys-color-error, #f87171)"
                          : "var(--md-sys-color-on-surface-variant, #9aa3b2)",
                    }}
                  >
                    {message.length} / 5000
                  </span>
                </div>
                <textarea
                  id="feedback-desktop-message"
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === "sending"}
                  placeholder="Descreva detalhadamente sua sugestão, dúvida ou o que aconteceu..."
                  rows={4}
                  required
                  minLength={10}
                  maxLength={5000}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 12px",
                    background: "var(--md-sys-color-surface-container, #131722)",
                    border: "1px solid var(--md-sys-color-outline-variant, #2a3142)",
                    borderRadius: "6px",
                    color: "var(--md-sys-color-on-surface, #e6e9ef)",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "90px",
                  }}
                />
              </div>

              {/* E-mail (Opcional) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor="feedback-desktop-email"
                  style={{ fontSize: "12px", fontWeight: 600, color: "var(--md-sys-color-on-surface, #e6e9ef)" }}
                >
                  E-mail{" "}
                  <span style={{ color: "var(--md-sys-color-on-surface-variant, #9aa3b2)", fontWeight: 400 }}>
                    (opcional)
                  </span>
                </label>
                <input
                  type="email"
                  id="feedback-desktop-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                  placeholder="seu.email@exemplo.com"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 12px",
                    background: "var(--md-sys-color-surface-container, #131722)",
                    border: "1px solid var(--md-sys-color-outline-variant, #2a3142)",
                    borderRadius: "6px",
                    color: "var(--md-sys-color-on-surface, #e6e9ef)",
                    fontSize: "13px",
                  }}
                />
                <span style={{ fontSize: "11px", color: "var(--md-sys-color-on-surface-variant, #9aa3b2)" }}>
                  Informe seu e-mail caso deseje receber um retorno da equipe.
                </span>
              </div>

              {/* Honeypot invisível */}
              <div style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, overflow: "hidden" }}>
                <label htmlFor="website_url_hp_desktop">Não preencher</label>
                <input
                  type="text"
                  id="website_url_hp_desktop"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Nota de Privacidade */}
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--md-sys-color-on-surface-variant, #9aa3b2)",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "6px 10px",
                  borderRadius: "4px",
                }}
              >
                🔒 <em>Não envie senhas ou informações confidenciais. Versão enviada: v{appVersion}</em>
              </div>

              {/* Rodapé / Ações */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={status === "sending"}
                  style={{ padding: "8px 16px" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={status === "sending" || message.trim().length < 10}
                  style={{
                    padding: "8px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Enviar feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
