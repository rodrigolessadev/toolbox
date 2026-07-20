import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LucideIconPicker } from "./LucideIconPicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
  onOpenPluginFolder?: () => Promise<string | null>;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

type Tab = "plugin" | "link" | "application";

const TABS: { id: Tab; label: string }[] = [
  { id: "plugin",      label: "Plugin"     },
  { id: "link",        label: "Link"       },
  { id: "application", label: "Aplicativo" },
];

export function AddCommandModal({ open, onClose, onCreated, onOpenPluginFolder, onError, onInfo }: Props) {
  const [tab,        setTab]        = useState<Tab>("plugin");
  const [name,       setName]       = useState("");
  const [url,        setUrl]        = useState("");
  const [path,       setPath]       = useState("");
  const [icon,       setIcon]       = useState("");
  const [favorite,   setFavorite]   = useState(false);
  const [iconLoading, setIconLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setTab("plugin");
      setName("");
      setUrl("");
      setPath("");
      setIcon("");
      setFavorite(false);
      setIconLoading(false);
      setSubmitting(false);
    }
  }, [open]);

  // Auto-busca favicon ao digitar URL
  useEffect(() => {
    if (tab !== "link" || !open || !url || url.length < 8) {
      setIcon("");
      return;
    }
    setIconLoading(true);
    const timer = setTimeout(async () => {
      try {
        const dataUrl = await api.fetchFavicon(url);
        setIcon(dataUrl);
      } catch {
        setIcon("");
      } finally {
        setIconLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [url, tab, open]);

  // Auto-extrai ícone do .exe ao digitar o caminho
  useEffect(() => {
    if (tab !== "application" || !open || !path || path.length < 4) {
      if (tab === "application") setIcon("");
      return;
    }
    // Só tenta se termina com extensão executável
    const lower = path.toLowerCase();
    if (!lower.endsWith(".exe") && !lower.endsWith(".dll")) return;

    setIconLoading(true);
    const timer = setTimeout(async () => {
      try {
        const dataUrl = await api.extractExeIcon(path);
        setIcon(dataUrl);
      } catch {
        setIcon(""); // silencia — usa fallback ⚙️
      } finally {
        setIconLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [path, tab, open]);

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const pluginPlaceholder = tab === "plugin" ? "meu-plugin" : "";
  const canSubmit =
    name.trim().length > 0 &&
    (tab === "link"
      ? url.trim().length > 0
      : path.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await api.createCommand({
        name:  name.trim(),
        type:  tab,
        url:   tab === "link" ? url.trim()  : undefined,
        path:  tab !== "link" ? path.trim() : undefined,
        // favicon (data URL) para links, emoji/texto para outros
        icon:  icon || undefined,
      });
      if (favorite) {
        await api.toggleFavorite({ name: name.trim(), favorite: true });
      }
      onInfo?.(`Comando "${name.trim()}" criado.`);
      onCreated(name.trim());
      onClose();
    } catch (err) {
      onError?.("Falha ao criar: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const browseFolder = async () => {
    try {
      let selected: string | null = null;
      if (onOpenPluginFolder) {
        selected = await onOpenPluginFolder();
      } else {
        const { open: dlg } = await import("@tauri-apps/plugin-dialog");
        const r = await dlg({ directory: true, multiple: false, title: "Pasta do plugin" });
        if (typeof r === "string") selected = r;
      }
      if (selected) setPath(selected);
    } catch { onError?.("Não foi possível abrir o seletor de pastas."); }
  };

  const browseExe = async () => {
    try {
      const { open: dlg } = await import("@tauri-apps/plugin-dialog");
      const r = await dlg({
        multiple: false,
        title: "Selecione o executável",
        filters: [{ name: "Executáveis", extensions: ["exe", "bat", "cmd"] }, { name: "Todos", extensions: ["*"] }],
      });
      if (typeof r === "string") setPath(r);
    } catch { onError?.("Não foi possível abrir o seletor de arquivos."); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="modal__header">
          <h2>Novo comando</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        {/* Tabs */}
        <div className="modal__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`modal__tab${tab === t.id ? " modal__tab--active" : ""}`}
              onClick={() => { setTab(t.id); setPath(""); setUrl(""); setIcon(""); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal__form">

          {/* Nome */}
          <div className="modal__field">
            <label className="modal__label">Nome do Comando</label>
            <input
              type="text"
              className="modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: cpf, google, word"
              autoFocus
              required
            />
          </div>

          {/* Plugin: caminho relativo */}
          {tab === "plugin" && (
            <>
              <div className="modal__field">
                <label className="modal__label">Caminho do Plugin (relativo a plugins/)</label>
                <div className="modal__row">
                  <input
                    type="text"
                    className="modal__input"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder={pluginPlaceholder}
                    required
                  />
                  <button type="button" className="modal__browse-btn" onClick={browseFolder} title="Selecionar pasta">
                    📁
                  </button>
                </div>
                <small className="modal__hint">
                  Após salvar, crie a pasta{" "}
                  <code>plugins/{path || "meu-plugin"}</code> com{" "}
                  <code>plugin.json</code> e <code>main.py</code>.
                </small>
              </div>
            </>
          )}

          {/* Link: URL */}
          {tab === "link" && (
            <div className="modal__field">
              <label className="modal__label">URL</label>
              <div className="modal__row">
                <input
                  type="url"
                  className="modal__input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  required
                />
                <div className="modal__icon-preview" aria-live="polite">
                  {iconLoading
                    ? <span className="modal__icon-spinner" />
                    : icon
                    ? <img src={icon} alt="" className="modal__icon-img" />
                    : <span style={{ opacity: 0.3, fontSize: 18 }}>🔗</span>}
                </div>
              </div>
            </div>
          )}

          {/* Aplicativo: caminho .exe */}
          {tab === "application" && (
            <div className="modal__field">
              <label className="modal__label">Caminho do Executável</label>
              <div className="modal__row">
                <input
                  type="text"
                  className="modal__input"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="C:\Program Files\App\app.exe"
                  required
                />
                <div className="modal__icon-preview" aria-live="polite">
                  {iconLoading
                    ? <span className="modal__icon-spinner" />
                    : icon
                    ? <img src={icon} alt="" className="modal__icon-img" />
                    : <span style={{ opacity: 0.3, fontSize: 18 }}>⚙️</span>}
                </div>
                <button type="button" className="modal__browse-btn" onClick={browseExe} title="Selecionar arquivo">
                  📁
                </button>
              </div>
            </div>
          )}

          {/* Ícone: Lucide picker para plugin, emoji para application */}
          {tab === "plugin" && (
            <div className="modal__field">
              <label className="modal__label">Ícone (Lucide)</label>
              <LucideIconPicker
                value={icon}
                onSelect={(dataUrl) => setIcon(dataUrl)}
              />
              <small className="modal__hint">
                Busque em{" "}
                <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="lucide-picker__link">
                  lucide.dev/icons
                </a>
                {" "}— ex: puzzle, terminal, cpu, zap
              </small>
            </div>
          )}

          {tab === "application" && (
            <div className="modal__field">
              <label className="modal__label">Ícone (emoji ou texto curto)</label>
              <input
                type="text"
                className="modal__input"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="⚙️"
                maxLength={8}
              />
              <small className="modal__hint">Deixe em branco para usar o ícone extraído do executável.</small>
            </div>
          )}

          {/* Favorito */}
          <label className="modal__checkbox">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span>Marcar como favorito</span>
          </label>

          {/* Footer */}
          <footer className="modal__footer">
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={!canSubmit || submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
