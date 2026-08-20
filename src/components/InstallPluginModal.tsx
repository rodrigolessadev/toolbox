import { useEffect, useState } from "react";
import { resolveLucideIcon, isImageIcon, FallbackPluginIcon } from "../lib/icons";

export interface InstallPluginModalProps {
  plugin: {
    name: string;
    suggestedCommand: string;
    icon?: string;
  } | null;
  open: boolean;
  onConfirm: (data: { commandName: string; favorite: boolean }) => void;
  onCancel: () => void;
}

function PluginIconPreview({ icon }: { icon?: string }) {
  if (!icon) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", marginRight: 8 }}>
        <FallbackPluginIcon size={22} color="var(--accent)" strokeWidth={2} />
      </span>
    );
  }

  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt=""
        style={{ width: 24, height: 24, objectFit: "contain", marginRight: 8 }}
      />
    );
  }

  const LucideComp = resolveLucideIcon(icon);
  if (LucideComp) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", marginRight: 8 }}>
        <LucideComp size={22} color="var(--accent)" strokeWidth={2} />
      </span>
    );
  }

  if (icon.length <= 4) {
    return <span style={{ fontSize: 22, marginRight: 8 }}>{icon}</span>;
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", marginRight: 8 }}>
      <FallbackPluginIcon size={22} color="var(--accent)" strokeWidth={2} />
    </span>
  );
}

export function InstallPluginModal({
  open,
  plugin,
  onConfirm,
  onCancel,
}: InstallPluginModalProps) {
  const [commandName, setCommandName] = useState("");
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (open && plugin) {
      setCommandName(plugin.suggestedCommand);
      setFavorite(false);
    }
  }, [open, plugin]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || !plugin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandName.trim();
    if (!trimmed) return;
    onConfirm({ commandName: trimmed, favorite });
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-plugin-modal-title"
      >
        <header className="modal__header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <PluginIconPreview icon={plugin.icon} />
            <h2 id="install-plugin-modal-title">Plugin instalado com sucesso</h2>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal__form">
          <p
            className="modal__subtitle"
            style={{ margin: "0 0 10px 0", color: "var(--fg-muted)", fontSize: "13px" }}
          >
            Escolha o comando para abrir o <strong>{plugin.name}</strong>
          </p>

          <div className="modal__field">
            <label htmlFor="plugin-command-input" className="modal__label">
              Comando
            </label>
            <input
              id="plugin-command-input"
              type="text"
              className="modal__input"
              value={commandName}
              onChange={(e) => setCommandName(e.target.value)}
              placeholder="ex: meu-comando"
              autoFocus
              required
            />
          </div>

          <label className="modal__checkbox">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span>Marcar como favorito</span>
          </label>

          <footer className="modal__footer">
            <button
              type="button"
              className="modal__btn modal__btn--ghost"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={!commandName.trim()}
            >
              Confirmar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
