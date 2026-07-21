import { useEffect, useState } from "react";
import { api, MarketplaceEntry } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onPluginInstalled?: (pluginId: string) => void;
  onPluginRemoved?: (pluginId: string) => void;
  onInfo?: (message: string) => void;
  onError?: (message: string) => void;
}

type Filter = "all" | "installed" | "available" | "update_available";

const FILTER_LABELS: { id: Filter; label: string }[] = [
  { id: "all",              label: "Todos"       },
  { id: "installed",        label: "Instalados"  },
  { id: "available",        label: "Disponíveis" },
  { id: "update_available", label: "Atualizações" },
];

const STATUS_LABEL: Record<string, string> = {
  installed:        "Instalado",
  available:        "Disponível",
  update_available: "Atualização",
};

const STATUS_CLASS: Record<string, string> = {
  installed:        "marketplace__badge--installed",
  available:        "marketplace__badge--available",
  update_available: "marketplace__badge--update",
};

export function MarketplaceModal({
  open,
  onClose,
  onPluginInstalled,
  onPluginRemoved,
  onInfo,
  onError,
}: Props) {
  const [entries,    setEntries]    = useState<MarketplaceEntry[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [filter,     setFilter]     = useState<Filter>("all");
  const [search,     setSearch]     = useState("");
  const [busy,       setBusy]       = useState<Record<string, boolean>>({});

  // Carrega catálogo ao abrir
  useEffect(() => {
    if (!open) return;
    setFilter("all");
    setSearch("");
    loadCatalog();
  }, [open]);

  async function loadCatalog() {
    setLoading(true);
    try {
      const data = await api.fetchCatalog();
      setEntries(data);
    } catch (e) {
      onError?.("Falha ao carregar catálogo: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  async function handleInstall(entry: MarketplaceEntry) {
    setBusy((b) => ({ ...b, [entry.id]: true }));
    try {
      await api.installPlugin(entry.id, entry.download_url);
      onInfo?.(`"${entry.name}" instalado com sucesso.`);
      onPluginInstalled?.(entry.id);
      // Atualiza status localmente
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, status: "installed", installed_version: entry.version }
            : e
        )
      );
    } catch (e) {
      onError?.(`Falha ao instalar "${entry.name}": ` + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy((b) => ({ ...b, [entry.id]: false }));
    }
  }

  async function handleRemove(entry: MarketplaceEntry) {
    setBusy((b) => ({ ...b, [entry.id]: true }));
    try {
      await api.removePlugin(entry.id);
      onInfo?.(`"${entry.name}" removido.`);
      onPluginRemoved?.(entry.id);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, status: "available", installed_version: undefined }
            : e
        )
      );
    } catch (e) {
      onError?.(`Falha ao remover "${entry.name}": ` + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy((b) => ({ ...b, [entry.id]: false }));
    }
  }

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const q = search.trim().toLowerCase();
  const visible = entries.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const updateCount = entries.filter((e) => e.status === "update_available").length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="modal__header">
          <h2>🛒 Marketplace de Plugins</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
        </header>

        {/* Barra de busca */}
        <div className="marketplace__search-bar">
          <input
            type="text"
            className="modal__input"
            placeholder="Buscar plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="marketplace__refresh-btn"
            onClick={loadCatalog}
            disabled={loading}
            title="Recarregar catálogo"
          >
            {loading ? "⏳" : "↻"}
          </button>
        </div>

        {/* Filtros */}
        <div className="modal__tabs" role="tablist">
          {FILTER_LABELS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`modal__tab${filter === f.id ? " modal__tab--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              {f.id === "update_available" && updateCount > 0 && (
                <span className="marketplace__badge-count">{updateCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="marketplace__list">
          {loading && entries.length === 0 ? (
            <div className="marketplace__loading">Carregando catálogo...</div>
          ) : visible.length === 0 ? (
            <div className="marketplace__empty">
              {q ? `Nenhum plugin encontrado para "${q}".` : "Nenhum plugin nesta categoria."}
            </div>
          ) : (
            visible.map((entry) => (
              <div key={entry.id} className="marketplace__item">
                <div className="marketplace__item-icon">
                  {entry.icon ? iconEmoji(entry.icon) : "🔌"}
                </div>

                <div className="marketplace__item-body">
                  <div className="marketplace__item-title">
                    <span className="marketplace__item-name">{entry.name}</span>
                    <span className={`marketplace__badge ${STATUS_CLASS[entry.status] ?? ""}`}>
                      {STATUS_LABEL[entry.status] ?? entry.status}
                    </span>
                    <span className="marketplace__item-version">v{entry.version}</span>
                  </div>
                  <p className="marketplace__item-desc">{entry.description}</p>
                  <div className="marketplace__item-meta">
                    <span className="marketplace__item-author">by {entry.author}</span>
                    {entry.tags.map((t) => (
                      <span key={t} className="marketplace__tag">{t}</span>
                    ))}
                    {entry.installed_version && entry.status === "update_available" && (
                      <span className="marketplace__item-old-ver">
                        instalado: v{entry.installed_version}
                      </span>
                    )}
                  </div>
                </div>

                <div className="marketplace__item-actions">
                  {entry.status === "installed" && (
                    <button
                      type="button"
                      className="modal__btn modal__btn--ghost marketplace__btn-remove"
                      disabled={busy[entry.id]}
                      onClick={() => handleRemove(entry)}
                    >
                      {busy[entry.id] ? "..." : "Remover"}
                    </button>
                  )}
                  {entry.status === "available" && (
                    <button
                      type="button"
                      className="modal__btn modal__btn--primary"
                      disabled={busy[entry.id]}
                      onClick={() => handleInstall(entry)}
                    >
                      {busy[entry.id] ? "Instalando..." : "Instalar"}
                    </button>
                  )}
                  {entry.status === "update_available" && (
                    <>
                      <button
                        type="button"
                        className="modal__btn modal__btn--primary"
                        disabled={busy[entry.id]}
                        onClick={() => handleInstall(entry)}
                      >
                        {busy[entry.id] ? "Atualizando..." : "Atualizar"}
                      </button>
                      <button
                        type="button"
                        className="modal__btn modal__btn--ghost marketplace__btn-remove"
                        disabled={busy[entry.id]}
                        onClick={() => handleRemove(entry)}
                      >
                        Remover
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="modal__footer">
          <span className="marketplace__footer-info">
            {entries.length} plugins no catálogo
            {updateCount > 0 && ` · ${updateCount} atualização${updateCount > 1 ? "ões" : ""} disponível${updateCount > 1 ? "is" : ""}`}
          </span>
          <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}

// Converte nome de ícone Lucide em emoji aproximado para exibição simples
function iconEmoji(icon: string): string {
  const map: Record<string, string> = {
    "shield-check": "🛡️",
    "braces": "{ }",
    "database": "🗄️",
    "clock": "⏰",
    "file-json": "📄",
    "calendar": "📅",
    "puzzle": "🧩",
    "terminal": "⌨️",
    "cpu": "🖥️",
    "zap": "⚡",
  };
  return map[icon] ?? "🔌";
}
