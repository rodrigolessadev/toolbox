import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getVersion } from "@tauri-apps/api/app";
import { MessageSquarePlus, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { sendFeedback, type FeedbackType } from "../lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function FeedbackModal({ open, onClose, onSuccess, onError }: Props) {
  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted || typeof document === "undefined") return null;

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

  return createPortal(
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
      <div
        className="modal"
        style={{
          width: "490px",
          maxWidth: "94vw",
          maxHeight: "min(90vh, 520px)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquarePlus size={18} style={{ color: "var(--accent)" }} />
            <h2 id="feedback-dialog-title" className="modal__title" style={{ margin: 0 }}>
              Enviar Feedback
            </h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={handleClose}
            disabled={status === "sending"}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        {/* Body / Form */}
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "28px 16px", overflowY: "auto" }}>
            <CheckCircle2
              size={44}
              style={{ color: "var(--success, #4ade80)", marginBottom: "10px" }}
            />
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem" }}>Obrigado!</h3>
            <p
              style={{
                color: "var(--fg-muted)",
                fontSize: "13px",
                margin: "0 0 20px 0",
              }}
            >
              Seu feedback foi enviado com sucesso e ajudará na melhoria contínua do Toolbox.
            </p>
            <button
              type="button"
              className="modal__btn modal__btn--primary"
              onClick={handleClose}
              style={{ padding: "6px 20px" }}
            >
              Concluir
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="modal__form"
            style={{
              padding: "14px 18px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
            }}
          >
            {/* Alerta de erro */}
            {errorMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(248, 113, 113, 0.12)",
                  border: "1px solid var(--danger, #f87171)",
                  color: "var(--danger, #f87171)",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                }}
                role="alert"
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Categoria */}
            <div className="modal__field" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="feedback-desktop-type" className="modal__label" style={{ fontSize: "11px" }}>
                Tipo de feedback <span style={{ color: "var(--danger, #f87171)" }}>*</span>
              </label>
              <select
                id="feedback-desktop-type"
                value={type}
                onChange={(e) => setType(e.target.value as FeedbackType)}
                disabled={status === "sending"}
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  background: "var(--bg-elev-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--fg)",
                  fontSize: "12px",
                  fontFamily: "inherit",
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
            <div className="modal__field" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="feedback-desktop-message" className="modal__label" style={{ fontSize: "11px" }}>
                  Mensagem <span style={{ color: "var(--danger, #f87171)" }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: "10px",
                    color: message.length > 5000 ? "var(--danger)" : "var(--fg-muted)",
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
                rows={3}
                required
                minLength={10}
                maxLength={5000}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "7px 10px",
                  background: "var(--bg-elev-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--fg)",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "65px",
                  maxHeight: "130px",
                }}
              />
            </div>

            {/* E-mail (Opcional) */}
            <div className="modal__field" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="feedback-desktop-email" className="modal__label" style={{ fontSize: "11px" }}>
                E-mail <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(opcional)</span>
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
                  padding: "7px 10px",
                  background: "var(--bg-elev-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--fg)",
                  fontSize: "12px",
                }}
              />
              <span style={{ fontSize: "10px", color: "var(--fg-muted)" }}>
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
                fontSize: "10px",
                color: "var(--fg-muted)",
                background: "var(--bg-elev-2)",
                padding: "5px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              🔒 <em>Não envie senhas ou dados confidenciais. App: v{appVersion}</em>
            </div>

            {/* Rodapé / Ações */}
            <footer
              className="modal__footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                paddingTop: "6px",
                marginTop: "auto",
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                className="modal__btn modal__btn--ghost"
                onClick={handleClose}
                disabled={status === "sending"}
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modal__btn modal__btn--primary"
                disabled={status === "sending" || message.trim().length < 10}
                style={{
                  padding: "6px 16px",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Enviar feedback</span>
                  </>
                )}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
