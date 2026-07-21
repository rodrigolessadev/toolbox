import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, CommandEntry } from "./lib/api";
import { useCommands } from "./hooks/useCommands";
import { useHistory } from "./hooks/useHistory";
import { TitleBar } from "./components/TitleBar";
import { CommandList } from "./components/CommandList";
import { HistoryPanel } from "./components/HistoryPanel";
import { AddCommandModal } from "./components/AddCommandModal";
import { SettingsModal } from "./components/SettingsModal";
import { MarketplaceModal } from "./components/MarketplaceModal";
import "./styles/global.css";

type ToastKind = "success" | "error" | "info";
type Tab = "all" | "favorites" | "plugin" | "link" | "application" | "history";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "all",         label: "Todos" },
  { id: "favorites",   label: "★ Favoritos" },
  { id: "plugin",      label: "Plugins" },
  { id: "link",        label: "Links" },
  { id: "application", label: "Apps" },
  { id: "history",     label: "Histórico" },
];

export default function App() {
  const [showAdd, setShowAdd]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [query, setQuery]               = useState("");
  const [activeIndex, setActiveIndex]   = useState(0);
  const [tab, setTab]                   = useState<Tab>("all");

  const { commands, reload }              = useCommands();
  const { history, reload: reloadHistory } = useHistory();

  const [toasts, setToasts]   = useState<Toast[]>([]);
  const toastIdRef             = useRef(0);
  const inputRef               = useRef<HTMLInputElement>(null);

  // Banner de atualização disponível
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unlisten = listen<{ version: string; body?: string }>("update-available", (event) => {
      setUpdateVersion(event.payload.version);
    });
    return () => { unlisten.then((f) => f()); };
  }, []);

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const handleInstallUpdate = useCallback(async () => {
    setUpdating(true);
    try {
      await api.installUpdate();
      setUpdateVersion(null);
      push("Atualização instalada. O app será reiniciado em breve.", "success");
    } catch (e) {
      push(`Falha ao instalar atualização: ${e instanceof Error ? e.message : String(e)}`, "error");
    } finally {
      setUpdating(false);
    }
  }, [push]);

  // ───── Lista filtrada + tab ─────
  const filtered = useMemo<[string, CommandEntry][]>(() => {
    const q = query.trim().toLowerCase();
    let all = Object.entries(commands);

    if (tab === "favorites")                all = all.filter(([, e]) => e.favorite);
    else if (tab !== "all")                 all = all.filter(([, e]) => e.type === tab);

    if (!q) return all;
    return all.filter(([name, e]) =>
      name.toLowerCase().includes(q) ||
      (e.url  && e.url.toLowerCase().includes(q)) ||
      (e.path && e.path.toLowerCase().includes(q))
    );
  }, [commands, query, tab]);

  useEffect(() => {
    setActiveIndex((i) => (i >= filtered.length ? Math.max(0, filtered.length - 1) : i));
  }, [filtered.length]);

  // ───── execute ─────
  const execute = useCallback(async (name: string) => {
    try {
      const result = await api.runCommand(name);
      push(result.message ?? `Comando "${name}" executado.`, result.ok ? "success" : "error");
      await reloadHistory();
    } catch (e) {
      push(`Falha ao executar "${name}": ${e instanceof Error ? e.message : String(e)}`, "error");
    }
  }, [reloadHistory, push]);

  // ───── Teclado ─────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );

      if (e.key === "Escape") {
        if (showAdd)      { setShowAdd(false);      return; }
        if (showSettings) { setShowSettings(false); return; }
        setQuery("");
        inputRef.current?.focus();
        return;
      }

      if (e.code === "Space" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowAdd(false);
        setShowSettings(false);
        setShowMarketplace(false);
        inputRef.current?.focus();
        return;
      }

      if (isEditable) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        if (filtered.length > 0 && activeIndex >= 0 && activeIndex < filtered.length) {
          e.preventDefault();
          execute(filtered[activeIndex][0]);
        }
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowAdd(true);
      } else if (e.key === "," && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, activeIndex, showAdd, showSettings, execute]);

  // Enter no input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (tab === "history") return;
      if (filtered.length > 0 && activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        execute(filtered[activeIndex][0]);
        setQuery("");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    }
  };

  const clearHistory = async () => {
    try {
      await api.clearHistory();
      await reloadHistory();
      push("Histórico limpo.", "success");
    } catch {
      push("Falha ao limpar histórico.", "error");
    }
  };

  const openPluginFolder = async (): Promise<string | null> => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({ directory: true, multiple: false, title: "Pasta do plugin" });
      return typeof selected === "string" ? selected : null;
    } catch {
      push("Falha ao abrir seletor de pastas.", "error");
      return null;
    }
  };

  const openDataDir = async () => {
    try { await api.openPath(await api.getDataDir()); }
    catch { push("Falha ao abrir pasta de dados.", "error"); }
  };

  const openLogsDir = async () => {
    try { await api.openPath(await api.getLogsDir()); }
    catch { push("Falha ao abrir pasta de logs.", "error"); }
  };

  return (
    <div className="app">
      {/* ── Barra de título ── */}
      <TitleBar />

      {/* ── Header: brand + ações ── */}
      <div className="app__header">
        <div className="app__brand">
          <span className="app__brand-icon">⚡</span>
          <span className="app__brand-name">Toolbox</span>
        </div>
        <div className="app__header-actions">
          <button
            type="button"
            className="app__icon-btn"
            onClick={() => setShowAdd(true)}
            title="Novo comando (N)"
            aria-label="Novo comando"
          >+</button>
          <button
            type="button"
            className="app__icon-btn"
            onClick={() => setShowMarketplace(true)}
            title="Marketplace de plugins"
            aria-label="Marketplace"
          >🛒</button>
          <button
            type="button"
            className="app__icon-btn"
            onClick={() => setShowSettings(true)}
            title="Configurações (Ctrl+,)"
            aria-label="Configurações"
          >⚙</button>
          <button
            type="button"
            className="app__icon-btn"
            onClick={() => setTab("history")}
            title="Histórico"
            aria-label="Histórico"
          >✦</button>
        </div>
      </div>

      {/* ── Banner de atualização ── */}
      {updateVersion && (
        <div className="app__update-banner">
          <span>🎉 Nova versão <strong>{updateVersion}</strong> disponível.</span>
          <div className="app__update-actions">
            <button
              type="button"
              className="app__update-btn"
              onClick={handleInstallUpdate}
              disabled={updating}
            >
              {updating ? "Atualizando..." : "Atualizar agora"}
            </button>
            <button
              type="button"
              className="app__update-dismiss"
              onClick={() => setUpdateVersion(null)}
              aria-label="Fechar"
            >✕</button>
          </div>
        </div>
      )}

      {/* ── Input de busca ── */}
      <div className="app__search">
        <span className="app__search-icon">⚡</span>
        <input
          ref={inputRef}
          type="text"
          className="app__search-input"
          placeholder="Digite um comando e pressione Enter..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setTab("all"); }}
          onKeyDown={handleInputKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="app__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`app__tab${tab === t.id ? " app__tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      <main className="app__content">
        {tab === "history" ? (
          <HistoryPanel
            history={history}
            onSelect={execute}
            onClear={clearHistory}
          />
        ) : filtered.length === 0 ? (
          <div className="app__empty">
            {query
              ? `Nenhum resultado para "${query}".`
              : "Nenhum comando cadastrado. Clique em + para adicionar."}
          </div>
        ) : (
          <CommandList
            items={filtered}
            activeIndex={activeIndex}
            onSelect={execute}
            onToggleFavorite={async (name, current) => {
              try {
                await api.toggleFavorite({ name, favorite: !current });
                await reload();
                push(!current ? `"${name}" favoritado.` : `"${name}" desfavoritado.`, "success");
              } catch { push("Falha ao alterar favorito.", "error"); }
            }}
            onDelete={async (name) => {
              try {
                await api.deleteCommand(name);
                await reload();
                push(`"${name}" removido.`, "success");
              } catch { push("Falha ao remover comando.", "error"); }
            }}
          />
        )}
      </main>

      {/* ── Modais ── */}
      <AddCommandModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={async (name) => { await reload(); push(`"${name}" criado.`, "success"); }}
        onOpenPluginFolder={openPluginFolder}
        onError={(m) => push(m, "error")}
        onInfo={(m) => push(m, "info")}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onImported={async () => { await reload(); push("Comandos importados.", "success"); }}
        onInfo={(m) => push(m, "info")}
        onError={(m) => push(m, "error")}
        onOpenDataDir={openDataDir}
        onOpenLogsDir={openLogsDir}
      />
 
      <MarketplaceModal
        open={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onPluginInstalled={async () => { await reload(); }}
        onPluginRemoved={async () => { await reload(); }}
        onInfo={(m) => push(m, "info")}
        onError={(m) => push(m, "error")}
      />
 
      {/* ── Toasts ── */}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
