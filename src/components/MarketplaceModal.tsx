import { useEffect, useState } from "react";
import { ShoppingBag, RotateCw, X, Puzzle, ArrowUpCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api, MarketplaceEntry } from "../lib/api";
import { InstallPluginModal } from "./InstallPluginModal";

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
  { id: "all",              label: "Todos"        },
  { id: "installed",        label: "Instalados"   },
  { id: "available",        label: "Disponíveis"  },
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
  const [entries,        setEntries]        = useState<MarketplaceEntry[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [updatingAll,    setUpdatingAll]    = useState(false);
  const [filter,         setFilter]         = useState<Filter>("all");
  const [search,         setSearch]         = useState("");
  const [busy,           setBusy]           = useState<Record<string, boolean>>({});
  const [pendingInstall, setPendingInstall] = useState<MarketplaceEntry | null>(null);

  // Carrega catálogo ao abrir
  useEffect(() => {
    if (!open) return;
    setFilter("all");
    setSearch("");
    setPendingInstall(null);
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
    const isUpdate = entry.status === "update_available";
    setBusy((b) => ({ ...b, [entry.id]: true }));
    try {
      await api.installPlugin(entry.id, entry.download_url);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, status: "installed", installed_version: entry.version }
            : e
        )
      );

      if (isUpdate) {
        onInfo?.(`Plugin "${entry.name}" atualizado para v${entry.version}.`);
        onPluginInstalled?.(entry.id);
      } else {
        setPendingInstall(entry);
      }
    } catch (e) {
      onError?.(
        `Falha ao ${isUpdate ? "atualizar" : "instalar"} "${entry.name}": ` +
          (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setBusy((b) => ({ ...b, [entry.id]: false }));
    }
  }

  async function handleUpdateAll() {
    const updateEntries = entries.filter((e) => e.status === "update_available");
    if (updateEntries.length === 0 || updatingAll) return;

    setUpdatingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const entry of updateEntries) {
      setBusy((b) => ({ ...b, [entry.id]: true }));
      try {
        await api.installPlugin(entry.id, entry.download_url);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: "installed", installed_version: entry.version }
              : e
          )
        );
        onPluginInstalled?.(entry.id);
        successCount++;
      } catch (e) {
        failCount++;
        console.error(`Falha ao atualizar "${entry.name}":`, e);
      } finally {
        setBusy((b) => ({ ...b, [entry.id]: false }));
      }
    }

    setUpdatingAll(false);

    if (failCount === 0) {
      onInfo?.(
        successCount === 1
          ? "1 plugin foi atualizado com sucesso."
          : `${successCount} plugins foram atualizados com sucesso.`
      );
    } else if (successCount > 0) {
      onError?.(`${successCount} plugins atualizados, mas ${failCount} falharam.`);
    } else {
      onError?.("Falha ao atualizar os plugins disponíveis.");
    }
  }

  async function handleConfirmInstall({ commandName, favorite }: { commandName: string; favorite: boolean }) {
    if (!pendingInstall) return;
    const entry = pendingInstall;
    setPendingInstall(null);
    try {
      await api.createCommand({
        name: commandName,
        type: "plugin",
        path: entry.id,
        icon: entry.icon || undefined,
        favorite,
      });
      onInfo?.(`Comando "${commandName}" criado para o plugin "${entry.name}".`);
      onPluginInstalled?.(entry.id);
    } catch (e) {
      onError?.(`Falha ao criar comando para "${entry.name}": ` + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function handleRemove(entry: MarketplaceEntry) {
    setBusy((b) => ({ ...b, [entry.id]: true }));
    try {
      await api.removePlugin(entry.id);
      try {
        const cmds = await api.getCommands();
        for (const [cmdName, cmdEntry] of Object.entries(cmds)) {
          if (cmdEntry.type === "plugin" && (cmdEntry.path === entry.id || cmdName === entry.id)) {
            await api.deleteCommand(cmdName);
          }
        }
      } catch (e) {
        console.warn("Falha ao desvincular comandos do plugin:", e);
      }
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
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (updatingAll) return;
        if (pendingInstall) {
          setPendingInstall(null);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, pendingInstall, updatingAll]);

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
    <div className="modal-backdrop" onClick={updatingAll ? undefined : onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <header className="modal__header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag size={18} aria-hidden="true" style={{ color: "var(--accent)" }} />
            Marketplace de Plugins
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Fechar"
            disabled={updatingAll}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        {/* Barra de busca */}
        <div className="marketplace__search-bar">
          <input
            type="text"
            className="modal__input"
            placeholder="Buscar por nome, descrição ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={updatingAll}
            autoFocus
          />
          <button
            type="button"
            className="marketplace__refresh-btn"
            title="Atualizar catálogo"
            onClick={loadCatalog}
            disabled={loading || updatingAll}
          >
            <RotateCw size={16} className={loading ? "marketplace__refresh-icon--spinning" : ""} aria-hidden="true" />
          </button>
        </div>

        {/* Filtros e Ação em Lote */}
        <div className="marketplace__tabs-bar">
          <div className="modal__tabs" role="tablist">
            {FILTER_LABELS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`modal__tab${filter === f.id ? " modal__tab--active" : ""}`}
                onClick={() => setFilter(f.id)}
                disabled={updatingAll}
              >
                {f.label}
                {f.id === "update_available" && updateCount > 0 && (
                  <span className="marketplace__badge-count">{updateCount}</span>
                )}
              </button>
            ))}
          </div>

          {updateCount > 0 && (
            <button
              type="button"
              className="modal__btn modal__btn--primary marketplace__btn-update-all"
              onClick={handleUpdateAll}
              disabled={updatingAll || loading}
              title="Atualizar todos os plugins com atualização disponível"
            >
              <ArrowUpCircle
                size={15}
                className={updatingAll ? "marketplace__refresh-icon--spinning" : ""}
                aria-hidden="true"
              />
              <span>{updatingAll ? "Atualizando..." : `Atualizar todos (${updateCount})`}</span>
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="marketplace__list">
          {loading && entries.length === 0 ? (
            <div className="marketplace__loading">Carregando catálogo...</div>
          ) : visible.length === 0 ? (
            <div className="marketplace__empty">
              {q ? (
                `Nenhum plugin encontrado para "${q}".`
              ) : entries.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <span>Não foi possível carregar os plugins no momento.</span>
                  <button
                    type="button"
                    className="modal__btn modal__btn--primary"
                    onClick={loadCatalog}
                    disabled={loading || updatingAll}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                "Nenhum plugin nesta categoria."
              )}
            </div>
          ) : (
            visible.map((entry) => (
              <div key={entry.id} className="marketplace__item">
                <div className="marketplace__item-icon">
                  <MarketplaceItemIcon icon={entry.icon} />
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
                      disabled={busy[entry.id] || updatingAll}
                      onClick={() => handleRemove(entry)}
                    >
                      {busy[entry.id] ? "..." : "Remover"}
                    </button>
                  )}
                  {entry.status === "available" && (
                    <button
                      type="button"
                      className="modal__btn modal__btn--primary"
                      disabled={busy[entry.id] || updatingAll}
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
                        disabled={busy[entry.id] || updatingAll}
                        onClick={() => handleInstall(entry)}
                      >
                        {busy[entry.id] ? "Atualizando..." : "Atualizar"}
                      </button>
                      <button
                        type="button"
                        className="modal__btn modal__btn--ghost marketplace__btn-remove"
                        disabled={busy[entry.id] || updatingAll}
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
            {updateCount > 0 &&
              ` • ${updateCount} atualização${updateCount > 1 ? "ões" : ""} disponível${updateCount > 1 ? "is" : ""}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {updateCount > 0 && (
              <button
                type="button"
                className="modal__btn modal__btn--primary marketplace__btn-update-all"
                onClick={handleUpdateAll}
                disabled={updatingAll || loading}
              >
                <ArrowUpCircle
                  size={15}
                  className={updatingAll ? "marketplace__refresh-icon--spinning" : ""}
                  aria-hidden="true"
                />
                <span>{updatingAll ? "Atualizando..." : `Atualizar todos (${updateCount})`}</span>
              </button>
            )}
            <button
              type="button"
              className="modal__btn modal__btn--ghost"
              onClick={onClose}
              disabled={updatingAll}
            >
              Fechar
            </button>
          </div>
        </footer>

        {pendingInstall && (
          <InstallPluginModal
            open={Boolean(pendingInstall)}
            plugin={{
              name: pendingInstall.name,
              suggestedCommand: pendingInstall.command || pendingInstall.id,
              icon: pendingInstall.icon,
            }}
            onConfirm={handleConfirmInstall}
            onCancel={() => setPendingInstall(null)}
          />
        )}
      </div>
    </div>
  );
}

/** Retorna true se o ícone é uma imagem (data URL ou URL http) */
function isImageIcon(icon: string): boolean {
  return icon.startsWith("data:") || icon.startsWith("http");
}

/** Converte "meu-nome" ou "MeuNome" para o nome do export Lucide (PascalCase) */
function toPascalCase(name: string): string {
  return name
    .replace(/-+/g, " ")
    .replace(/_+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

/** Resolve o componente Lucide pelo nome do ícone (ex: "shield-check" -> ShieldCheck component) */
function resolveLucideIcon(name: string): LucideIcon | null {
  if (!name) return null;
  const key = toPascalCase(name) as keyof typeof LucideIcons;
  const Icon = LucideIcons[key];
  if (typeof Icon === "function") return Icon as LucideIcon;
  return null;
}

function MarketplaceItemIcon({ icon }: { icon?: string | null }) {
  if (!icon) {
    return <Puzzle size={24} strokeWidth={2} aria-hidden="true" />;
  }

  // Imagem (favicon / data URL ou URL externa)
  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt=""
        className="marketplace__item-icon-img"
        onError={(e) => {
          const fallback = document.createElement("span");
          fallback.className = "marketplace__item-icon-fallback";
          (e.currentTarget as HTMLImageElement).replaceWith(fallback);
        }}
      />
    );
  }

  // Resolução dinâmica de ícone Lucide
  const LucideComp = resolveLucideIcon(icon);
  if (LucideComp) {
    return <LucideComp size={24} strokeWidth={2} aria-hidden="true" />;
  }

  // Emoji ou texto curto (≤ 4 caracteres)
  if (icon.length <= 4) {
    return <span aria-hidden="true">{icon}</span>;
  }

  // Fallback para ícone genérico de plugin
  return <Puzzle size={24} strokeWidth={2} aria-hidden="true" />;
}
