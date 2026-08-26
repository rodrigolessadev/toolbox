import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sun, Moon, Plus, ShoppingBag, Settings, History, X, MessageSquarePlus } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { api, CommandEntry } from "./lib/api";
import { useCommands } from "./hooks/useCommands";
import { useHistory } from "./hooks/useHistory";
import { useTheme } from "./hooks/useTheme";
import { TitleBar } from "./components/TitleBar";
import { CommandList } from "./components/CommandList";
import { HistoryPanel } from "./components/HistoryPanel";
import { AddCommandModal } from "./components/AddCommandModal";
import { SettingsModal } from "./components/SettingsModal";
import { MarketplaceModal } from "./components/MarketplaceModal";
import { FeedbackModal } from "./components/FeedbackModal";
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

function scoreCommand(name: string, entry: CommandEntry, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const n = name.toLowerCase().trim();
  const url = (entry.url || "").toLowerCase();
  const path = (entry.path || "").toLowerCase();
  const args = (entry.args || "").toLowerCase();

  // 1. Match exato no nome do comando
  if (n === q) return 1000;

  // 2. Nome do comando inicia com o termo
  if (n.startsWith(q)) return 800 - Math.min(100, n.length - q.length);

  // 3. Nome do comando contem a palavra
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRegex = new RegExp(`\\b${escaped}`);
  if (wordRegex.test(n)) return 600;

  // 4. Nome contem a substring
  if (n.includes(q)) return 500;

  // 5. Argumentos do comando contem a query
  if (args.includes(q)) return 300;

  // 6. Path do executavel/plugin contem a query
  if (path.includes(q)) {
    if (path.endsWith(q) || path.includes(`/${q}`) || path.includes(`\\${q}`)) return 250;
    return 200;
  }

  // 7. URL contem a query (menor prioridade)
  if (url.includes(q)) return 100;

  return -1;
}

export default function App() {
  const { theme, resolvedTheme, setTheme, toggle } = useTheme();
  const [showAdd, setShowAdd]                   = useState(false);
  const [showSettings, setShowSettings]         = useState(false);
  const [showMarketplace, setShowMarketplace]   = useState(false);
  const [showFeedback, setShowFeedback]         = useState(false);
  const [query, setQuery]               = useState("");
  const [activeIndex, setActiveIndex]   = useState(0);
  const [tab, setTab]                   = useState<Tab>("all");
  const [editingCommand, setEditingCommand] = useState<{ name: string; entry: CommandEntry } | null>(null);

  const { commands, reload } = useCommands();
  const loadPluginIcons = useCallback(async () => {
    try {
      const list = await api.listPlugins();
      const map: Record<string, string> = {};
      for (const p of list) {
        if (p.icon) {
          const leaf = p.path.replace(/\\/g, "/").split("/").filter(Boolean).pop()?.toLowerCase();
          if (leaf) map[leaf] = p.icon;
          map[p.name.toLowerCase()] = p.icon;
        }
      }
      setPluginIcons(map);
    } catch (err) {
      console.warn("Falha ao carregar ícones de plugins:", err);
    }
  }, []);

  useEffect(() => {
    loadPluginIcons();
  }, [loadPluginIcons]);
  const { history, reload: reloadHistory } = useHistory();

  const [pluginIcons, setPluginIcons] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef             = useRef(0);
  const inputRef               = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Banner e estados de atualização
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [pluginUpdatesCount, setPluginUpdatesCount] = useState(0);

  const checkPluginUpdates = useCallback(async () => {
    try {
      const catalog = await api.fetchCatalog();
      const updates = catalog.filter((p) => p.status === "update_available").length;
      setPluginUpdatesCount(updates);
    } catch {
      // Silencioso em caso de erro de rede
    }
  }, []);

  useEffect(() => {
    checkPluginUpdates();
  }, [checkPluginUpdates]);

  useEffect(() => {
    const unlisten = listen<{ version: string; body?: string }>("update-available", (event) => {
      setUpdateVersion(event.payload.version);
    });
    return () => { unlisten.then((f) => f()); };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) focusInput();
    };

    window.addEventListener("focus", focusInput);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", focusInput);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [focusInput]);

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

    // ── Lista filtrada e ordenada por relevância + tab ───────────
  const filtered = useMemo<[string, CommandEntry][]>(() => {
    const q = query.trim().toLowerCase();
    let all = Object.entries(commands);

    if (tab === "favorites")                all = all.filter(([, e]) => e.favorite);
    else if (tab !== "all")                 all = all.filter(([, e]) => e.type === tab);

    if (!q) {
      return all.sort(([nameA, entryA], [nameB, entryB]) => {
        if (entryA.favorite && !entryB.favorite) return -1;
        if (!entryA.favorite && entryB.favorite) return 1;
        return nameA.localeCompare(nameB);
      });
    }

    const scored = all
      .map(([name, entry]) => ({
        item: [name, entry] as [string, CommandEntry],
        score: scoreCommand(name, entry, q),
      }))
      .filter(({ score }) => score >= 0);

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item[1].favorite && !b.item[1].favorite) return -1;
      if (!a.item[1].favorite && b.item[1].favorite) return 1;
      return a.item[0].localeCompare(b.item[0]);
    });

    return scored.map(({ item }) => item);
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
        if (showAdd)              { setShowAdd(false);              return; }
        if (showSettings)         { setShowSettings(false);         return; }
        setQuery("");
        inputRef.current?.focus();
        return;
      }

      if (e.code === "Space" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowAdd(false);
        setShowSettings(false);
        setShowMarketplace(false);
        setEditingCommand(null);
        focusInput();
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
  }, [filtered, activeIndex, showAdd, showSettings, execute, focusInput]);

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
            onClick={toggle}
            title={`Alternar tema (atual: ${resolvedTheme === "dark" ? "Escuro" : "Claro"})`}
            aria-label="Alternar tema"
          >
            {resolvedTheme === "dark" ? (
              <Moon size={15} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Sun size={15} strokeWidth={2} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="app__icon-btn"
            onClick={() => setShowAdd(true)}
            title="Novo comando (N)"
            aria-label="Novo comando"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`app__icon-btn${pluginUpdatesCount > 0 ? " app__icon-btn--has-update" : ""}`}
            onClick={() => setShowMarketplace(true)}
            title={
              pluginUpdatesCount > 0
                ? `${pluginUpdatesCount} plugin${pluginUpdatesCount > 1 ? "s" : ""} com atualização disponível`
                : "Marketplace de plugins"
            }
            aria-label={
              pluginUpdatesCount > 0
                ? `${pluginUpdatesCount} plugins com atualização disponível`
                : "Marketplace"
            }
          >
            <ShoppingBag size={15} strokeWidth={2} aria-hidden="true" />
            {pluginUpdatesCount > 0 && (
              <span className="app__icon-btn-badge" aria-hidden="true">
                {pluginUpdatesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`app__icon-btn${updateVersion ? " app__icon-btn--has-update" : ""}`}
            onClick={() => setShowSettings(true)}
            title={
              updateVersion
                ? `Nova versão disponível - v${updateVersion}`
                : "Configurações (Ctrl+,)"
            }
            aria-label={
              updateVersion
                ? `Nova versão disponível: v${updateVersion}`
                : "Configurações"
            }
          >
            <Settings size={15} strokeWidth={2} aria-hidden="true" />
            {updateVersion && (
              <span className="app__icon-btn-badge" aria-hidden="true">!</span>
            )}
          </button>

          <button
            type="button"
            className="app__icon-btn"
            onClick={() => setShowFeedback(true)}
            title="Enviar feedback"
            aria-label="Enviar feedback"
          >
            <MessageSquarePlus size={15} strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`app__icon-btn${tab === "history" ? " app__icon-btn--active" : ""}`}
            onClick={() => setTab(tab === "history" ? "all" : "history")}
            title="Histórico"
            aria-label="Histórico"
          >
            <History size={15} strokeWidth={2} aria-hidden="true" />
          </button>
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
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
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
            pluginIcons={pluginIcons}
            onSelect={execute}
            onToggleFavorite={async (name, current) => {
              try {
                await api.toggleFavorite({ name, favorite: !current });
                await reload();
                push(!current ? `"${name}" favoritado.` : `"${name}" desfavoritado.`, "success");
              } catch { push("Falha ao alterar favorito.", "error"); }
            }}
            onEdit={(name, entry) => setEditingCommand({ name, entry })}
            onDelete={async (name) => {
              try {
                const entry = commands[name];
                if (entry && entry.type === "plugin") {
                  const pluginPath = entry.path || name;
                  const normalized = pluginPath.toLowerCase().replace(/\\/g, "/");
                  const isProtected = normalized.includes("toolbox-plugins/plugins");

                  if (!isProtected) {
                    try {
                      await api.removePlugin(pluginPath);
                    } catch (err) {
                      console.warn("Falha ao apagar pasta do plugin:", err);
                    }
                  }
                }
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
        open={showAdd || Boolean(editingCommand)}
        mode={editingCommand ? "edit" : "create"}
        initialCommand={editingCommand ? {
          name: editingCommand.name,
          type: editingCommand.entry.type,
          url: editingCommand.entry.url,
          path: editingCommand.entry.path,
          args: editingCommand.entry.args,
          run_as_admin: editingCommand.entry.run_as_admin,
          script_type: editingCommand.entry.script_type,
          script_content: editingCommand.entry.script_content,
          icon: editingCommand.entry.icon ?? undefined,
          favorite: editingCommand.entry.favorite,
        } : undefined}
        onClose={() => { setShowAdd(false); setEditingCommand(null); }}
        onCreated={async (name) => { await reload(); push(`"${name}" criado.`, "success"); }}
        onUpdated={async (name) => { await reload(); push(`"${name}" atualizado.`, "success"); }}
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
        updateVersion={updateVersion}
        onUpdateDetected={setUpdateVersion}
        onInstallUpdate={handleInstallUpdate}
        updating={updating}
        theme={theme}
        onThemeChange={setTheme}
        onOpenFeedback={() => setShowFeedback(true)}
      />

      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSuccess={(m) => push(m, "success")}
        onError={(m) => push(m, "error")}
      />
 
      <MarketplaceModal
        open={showMarketplace}
        onClose={() => {
          setShowMarketplace(false);
          checkPluginUpdates();
        }}
        onPluginInstalled={async () => {
          await reload();
          checkPluginUpdates();
        }}
        onPluginRemoved={async () => {
          await reload();
          checkPluginUpdates();
        }}
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
