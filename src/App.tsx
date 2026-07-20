import { useEffect, useMemo, useRef, useState } from "react";
import { api, CommandEntry } from "./lib/api";
import { useCommands } from "./hooks/useCommands";
import { useHistory } from "./hooks/useHistory";
import { TitleBar } from "./components/TitleBar";
import { CommandList } from "./components/CommandList";
import { AddCommandModal } from "./components/AddCommandModal";
import { SettingsModal } from "./components/SettingsModal";
import "./styles/global.css";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

export default function App() {
  // ───── Estado da UI ─────
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // ───── Hooks de dados ─────
  const { commands, reload } = useCommands();
  const { history, reload: reloadHistory } = useHistory();

  // ───── Toast ─────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const push = (message: string, kind: ToastKind = "info") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  };

  // ───── Lista filtrada ─────
  const filtered = useMemo<[string, CommandEntry][]>(() => {
    const q = query.trim().toLowerCase();
    const all = Object.entries(commands);
    if (!q) return all;
    return all.filter(([name, entry]) => {
      if (name.toLowerCase().includes(q)) return true;
      if (entry.url && entry.url.toLowerCase().includes(q)) return true;
      if (entry.path && entry.path.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [commands, query]);

  // Mantém o índice ativo dentro dos limites
  useEffect(() => {
    setActiveIndex((i) =>
      i >= filtered.length ? Math.max(0, filtered.length - 1) : i
    );
  }, [filtered.length]);

  // ───── Atalhos de teclado globais ─────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Não intercepta quando o foco está em input/textarea
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        if (showAdd) setShowAdd(false);
        else if (showSettings) setShowSettings(false);
        else setQuery("");
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
  }, [filtered, activeIndex, showAdd, showSettings]);

  // ───── Ações ─────
  const execute = async (name: string) => {
    try {
      const result = await api.runCommand(name);
      const msg = result.message ?? `Comando "${name}" executado.`;
      push(msg, result.ok ? "success" : "error");
      await reloadHistory();
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      push(`Falha ao executar "${name}": ${err}`, "error");
    }
  };

  const openPluginFolder = async (): Promise<string | null> => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Selecione a pasta do plugin",
      });
      return typeof selected === "string" ? selected : null;
    } catch (e) {
      push("Falha ao abrir seletor de pastas.", "error");
      return null;
    }
  };

  const openDataDir = async () => {
    try {
      const path = await api.getDataDir();
      await api.openPath(path);
    } catch (e) {
      push("Falha ao abrir pasta de dados.", "error");
    }
  };

  const openLogsDir = async () => {
    try {
      const path = await api.getLogsDir();
      await api.openPath(path);
    } catch (e) {
      push("Falha ao abrir pasta de logs.", "error");
    }
  };

  // ───── Render ─────
  return (
    <div className="toolbox">
      <TitleBar />

      <div className="toolbox__search">
        <input
          type="text"
          className="toolbox__search-input"
          placeholder="Buscar comando…  (N para novo, Ctrl+, para configurações)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          className="toolbox__btn toolbox__btn--primary"
          onClick={() => setShowAdd(true)}
          title="Novo comando (N)"
        >
          + Novo
        </button>
        <button
          type="button"
          className="toolbox__btn"
          onClick={() => setShowSettings(true)}
          title="Configurações (Ctrl+,)"
        >
          ⚙
        </button>
      </div>

      <main className="toolbox__main">
        {filtered.length === 0 ? (
          <div className="toolbox__empty">
            {query
              ? `Nenhum comando encontrado para "${query}".`
              : "Nenhum comando cadastrado. Clique em + Novo para começar."}
          </div>
        ) : (
          <CommandList
            items={filtered}
            activeIndex={activeIndex}
            onSelect={execute}
            onToggleFavorite={async ([name, entry]) => {
              try {
                await api.toggleFavorite({ name, favorite: !entry.favorite });
                await reload();
                push(
                  !entry.favorite
                    ? `"${name}" adicionado aos favoritos.`
                    : `"${name}" removido dos favoritos.`,
                  "success"
                );
              } catch (e) {
                push("Falha ao alterar favorito.", "error");
              }
            }}
            onDelete={async ([name]) => {
              try {
                await api.deleteCommand(name);
                await reload();
                push(`Comando "${name}" removido.`, "success");
              } catch (e) {
                push("Falha ao remover comando.", "error");
              }
            }}
          />
        )}
      </main>

      {history.length > 0 && (
        <footer className="toolbox__statusbar">
          <span>
            {history.length} execuç{history.length === 1 ? "ão" : "ões"} registrada
            {history.length === 1 ? "" : "s"}
          </span>
        </footer>
      )}

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
          push("Comandos importados com sucesso.", "success");
        }}
        onInfo={(m) => push(m, "info")}
        onError={(m) => push(m, "error")}
        onOpenDataDir={openDataDir}
        onOpenLogsDir={openLogsDir}
      />

      {/* Toasts */}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}