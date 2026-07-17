import { useEffect, useMemo, useState } from "react";
import { CommandInput } from "./components/CommandInput";
import { CommandList } from "./components/CommandList";
import { AddCommandModal } from "./components/AddCommandModal";
import { SettingsModal } from "./components/SettingsModal";
import { Toast } from "./components/Toast";
import { HistoryPanel } from "./components/HistoryPanel";
import { api, CommandEntry } from "./lib/api";
import { useCommands } from "./hooks/useCommands";
import { useTheme } from "./hooks/useTheme";
import { useHistory, useToasts } from "./hooks/useToast";


type Tab = "all" | "favorites" | "plugins" | "links" | "apps" | "history";

function matches(query: string, name: string, entry: CommandEntry): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (name.toLowerCase().includes(q)) return true;
  if (name.toLowerCase().includes(q)) return true;
  if (entry.url?.toLowerCase().includes(q)) return true;
  if (entry.path?.toLowerCase().includes(q)) return true;
  return false;
}

export default function App() {
  const { theme, toggle } = useTheme();
  const { toasts, push, dismiss } = useToasts();
  const { commands, reload } = useCommands();
  const { items: history, refresh: reloadHistory } = useHistory();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filtragem
  const filtered = useMemo<[string, CommandEntry][]>(() => {
    let list: [string, CommandEntry][] = Object.entries(commands);

    if (tab === "favorites") {
      list = list.filter(([, e]) => e.favorite);
    } else if (tab === "plugins") {
      list = list.filter(([, e]) => e.type === "plugin");
    } else if (tab === "links") {
      list = list.filter(([, e]) => e.type === "link");
    } else if (tab === "apps") {
      list = list.filter(([, e]) => e.type === "application");
    }

    if (query) {
      list = list.filter(([n, e]) => matches(query, n, e));
    }

    return list.sort(([na, ea], [nb, eb]) => {
      return na.localeCompare(nb);
    });
  }, [commands, tab, query]);

  // Mantém o índice ativo dentro dos limites.
  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered, activeIndex]);

  async function execute(name: string) {
    try {
      const result = await api.runCommand(name);
      const msg = result.message ?? `Comando "${name}" executado.`;
      push(msg, result.ok ? "success" : "error");
      reloadHistory();
      // Esconde a janela após executar.
      await api.hideWindow();
    } catch (e) {
      push(String(e), "error");
    }
  }

  function handleSubmit() {
    if (filtered.length === 0) {
      push("Nenhum comando encontrado para '" + query + "'.", "warning");
      return;
    }
    const target = filtered[activeIndex] ?? filtered[0];
    execute(target[0]);
  }

  async function handleDelete(name: string) {
    if (!window.confirm(`Remover o comando "${name}"?`)) return;
    try {
      await api.deleteCommand(name);
      push(`Comando "${name}" removido.`, "success");
      await reload();
    } catch (e) {
      push(String(e), "error");
    }
  }

  async function handleToggleFavorite(name: string, current: boolean) {
    try {
      await api.toggleFavorite({ name, favorite: !current });
      await reload();
    } catch (e) {
      push(String(e), "error");
    }
  }

  async function openPluginFolder(path: string) {
    try {
      const workdir = await api.getWorkdir();
      const full = `${workdir}\\${path.replace(/\//g, "\\")}`;
      await api.openPath(full);
    } catch (e) {
      push(String(e), "error");
    }
  }

  return (
    <div className="toolbox">
      <header className="toolbox__titlebar">
        <span className="toolbox__brand">⚡ Toolbox</span>
        <div className="toolbox__actions">
          <button
            className="icon-btn"
            title="Novo comando"
            onClick={() => setShowAdd(true)}
          >
            ＋
          </button>
          <button
            className="icon-btn"
            title="Configurações"
            onClick={() => setShowSettings(true)}
          >
            ⚙
          </button>
          <button
            className="icon-btn"
            title="Alternar tema"
            onClick={toggle}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
        </div>
      </header>

      <CommandInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setActiveIndex(0);
        }}
        onSubmit={handleSubmit}
        onEscape={async () => {
          await api.hideWindow();
        }}
        onArrowDown={() => setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))}
        onArrowUp={() => setActiveIndex((i) => Math.max(0, i - 1))}
        autoFocus
      />

      <nav className="tabs tabs--inline">
        {(
          [
            { k: "all", l: "Todos" },
            { k: "favorites", l: "★ Favoritos" },
            { k: "plugins", l: "Plugins" },
            { k: "links", l: "Links" },
            { k: "apps", l: "Apps" },
            { k: "history", l: "Histórico" },
          ] as { k: Tab; l: string }[]
        ).map((t) => (
          <button
            key={t.k}
            className={`tab ${tab === t.k ? "tab--active" : ""}`}
            onClick={() => setTab(t.k)}
          >
            {t.l}
          </button>
        ))}
      </nav>

      <main className="toolbox__content">
        {tab === "history" ? (
          <HistoryPanel
            history={history}
            onSelect={(name) => execute(name)}
            onClear={async () => {
              await api.clearHistory();
              await reloadHistory();
              push("Histórico limpo.", "success");
            }}
          />
        ) : (
          <CommandList
            items={filtered}
            activeIndex={activeIndex}
            onSelect={(name) => execute(name)}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
            emptyMessage={
              query
                ? `Nenhum resultado para "${query}".`
                : "Nenhum comando cadastrado. Use o botão + para criar um."
            }
          />
        )}
      </main>

      <AddCommandModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={async (name) => {
          await reload();
          push(`Comando "${name}" criado.`, "success");
        }}
        onOpenPluginFolder={openPluginFolder}
        onError={(m) => push(m, "error")}
        onInfo={(m) => push(m, "info")}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onImported={async () => {
          await reload();
        }}
        onInfo={(m) => push(m, "info")}
        onError={(m) => push(m, "error")}
        onOpenWorkdir={async () => {
          try {
            const wd = await api.getWorkdir();
            await api.openPath(wd);
          } catch (e) {
            push(String(e), "error");
          }
        }}
        onOpenLogsDir={async () => {
          try {
            const ld = await api.getLogsDir();
            await api.openPath(ld);
          } catch (e) {
            push(String(e), "error");
          }
        }}
      />

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
