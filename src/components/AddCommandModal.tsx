import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
  onOpenPluginFolder?: () => Promise<string | null>;
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

type Tab = "link" | "plugin" | "application";

export function AddCommandModal({
  open,
  onClose,
  onCreated,
  onOpenPluginFolder,
  onError,
  onInfo,
}: Props) {
  const [tab, setTab] = useState<Tab>("link");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [iconLoading, setIconLoading] = useState(false);
  const [iconError, setIconError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reseta o formulário quando o modal abre
  useEffect(() => {
    if (open) {
      setName("");
      setUrl("");
      setPath("");
      setIcon(null);
      setIconError(false);
      setIconLoading(false);
      setSubmitting(false);
      setTab("link");
    }
  }, [open]);

  // Busca o favicon automaticamente quando a URL muda (so na aba Link)
  useEffect(() => {
    if (!open || tab !== "link") {
      setIcon(null);
      setIconError(false);
      return;
    }
    if (!url || url.length < 4) {
      setIcon(null);
      setIconError(false);
      return;
    }

    setIconLoading(true);
    setIconError(false);

    const timer = setTimeout(async () => {
      try {
        const dataUrl = await api.fetchFavicon(url);
        setIcon(dataUrl);
        setIconError(false);
      } catch (e) {
        setIcon(null);
        setIconError(true);
      } finally {
        setIconLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [url, tab, open]);

  // Fecha com tecla ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Nao renderiza nada se o modal estiver fechado
  if (!open) return null;

  const canSubmit =
    name.trim().length > 0 &&
    ((tab === "link" && url.trim().length > 0) ||
      (tab === "plugin" && path.trim().length > 0) ||
      (tab === "application" && path.trim().length > 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        type: tab,
      };
      if (tab === "link") {
        payload.url = url.trim();
        if (icon) payload.icon = icon;
      } else {
        payload.path = path.trim();
      }

      await api.createCommand(payload);
      onInfo?.("Comando " + name.trim() + " criado com sucesso.");
      onCreated(name.trim());
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.("Falha ao criar comando: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrowseFolder = async () => {
    try {
      let selected: string | null = null;

      if (onOpenPluginFolder) {
        // App fornece um seletor customizado
        selected = await onOpenPluginFolder();
      } else {
        // Fallback: diálogo nativo do Tauri
        const { open } = await import("@tauri-apps/plugin-dialog");
        const result = await open({
          directory: true,
          multiple: false,
          title: "Selecione a pasta do plugin",
        });
        if (typeof result === "string") selected = result;
      }

      if (selected) {
        setPath(selected);
      }
    } catch (e) {
      onError?.("Nao foi possivel abrir o seletor de pastas.");
    }
  };

  const handleBrowseExe = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        title: "Selecione o executavel",
        filters: [
          { name: "Executaveis", extensions: ["exe", "bat", "cmd"] },
          { name: "Todos os arquivos", extensions: ["*"] },
        ],
      });
      if (typeof selected === "string") {
        setPath(selected);
      }
    } catch (e) {
      onError?.("Nao foi possivel abrir o seletor de arquivos.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Novo comando</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar (Esc)"
          >
            x
          </button>
        </header>

        <div className="modal__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "link"}
            className={"modal__tab " + (tab === "link" ? "modal__tab--active" : "")}
            onClick={() => setTab("link")}
          >
            Link
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "plugin"}
            className={"modal__tab " + (tab === "plugin" ? "modal__tab--active" : "")}
            onClick={() => setTab("plugin")}
          >
            Plugin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "application"}
            className={"modal__tab " + (tab === "application" ? "modal__tab--active" : "")}
            onClick={() => setTab("application")}
          >
            Aplicativo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal__form">
          <label className="modal__field">
            <span>Nome</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: GitHub, VS Code, Terminal"
              autoFocus
              required
            />
          </label>

          {tab === "link" && (
            <label className="modal__field">
              <span>URL</span>
              <div className="modal__url-row">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com"
                  required
                />
                <div className="modal__icon-preview" aria-live="polite">
                  {iconLoading && <span className="modal__icon-spinner" />}
                  {icon && !iconLoading && (
                    <img src={icon} alt="" className="modal__icon" />
                  )}
                  {iconError && !iconLoading && (
                    <span
                      className="modal__icon-error"
                      title="Nao foi possivel buscar o icone"
                    >
                      !
                    </span>
                  )}
                </div>
              </div>
              {iconError && !iconLoading && (
                <small className="modal__hint">
                  Nao foi possivel buscar o icone do site. O comando sera salvo sem icone.
                </small>
              )}
            </label>
          )}

          {tab === "plugin" && (
            <label className="modal__field">
              <span>Caminho do plugin</span>
              <div className="modal__path-row">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="C:\plugins\meu-plugin\plugin.json"
                  required
                />
                <button
                  type="button"
                  className="modal__browse"
                  onClick={handleBrowseFolder}
                  title="Selecionar pasta do plugin"
                >
                  Pasta
                </button>
              </div>
            </label>
          )}

          {tab === "application" && (
            <label className="modal__field">
              <span>Caminho do executavel</span>
              <div className="modal__path-row">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="C:\Program Files\MeuApp\app.exe"
                  required
                />
                <button
                  type="button"
                  className="modal__browse"
                  onClick={handleBrowseExe}
                  title="Selecionar executavel"
                >
                  Arquivo
                </button>
              </div>
            </label>
          )}

          <footer className="modal__footer">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}