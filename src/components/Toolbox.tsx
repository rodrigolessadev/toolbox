import { CommandEntry, CommandsMap, HistoryEntry } from "../lib/api";

interface ToolboxProps {
  commands: CommandsMap;
  history: HistoryEntry[];
  filtered: [string, CommandEntry][];
  query: string;
  setQuery: (q: string) => void;
  tab: string;
  tabs: { id: string; label: string }[];
  setTab: (t: any) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onExecute: (name: string) => void;
  onDelete: (name: string) => void;
  onToggleFavorite: (name: string) => void;
  onAdd: () => void;
  onSettings: () => void;
  onToggleTheme: () => void;
  onClearHistory: () => void;
  onHide: () => void;
  onKey: (e: React.KeyboardEvent) => void;
  workingDir: string;
}

const TYPE_ICONS: Record<string, string> = {
  plugin: "🧩",
  link: "🔗",
  application: "⚙️",
};

function subtitleFor(_name: string, entry: CommandEntry): string {
  if (entry.type === "link") return entry.url || "";
  if (entry.type === "application") return entry.path || "";
  if (entry.type === "plugin") return entry.path || "";
  return "";
}

export function Toolbox(props: ToolboxProps) {
  const {
    filtered,
    query,
    setQuery,
    tab,
    tabs,
    setTab,
    activeIndex,
    setActiveIndex,
    onExecute,
    onToggleFavorite,
    onAdd,
    onSettings,
    onToggleTheme,
    onHide,
    onKey,
    history,
    workingDir,
  } = props;

  const showHistory = tab === "history";

  return (
    <div className="toolbox" tabIndex={0} onKeyDown={onKey}>
      <div className="titlebar">
        <div className="brand">
          <span>⚡</span>
          <span>Command Toolbox</span>
        </div>
        <div className="actions">
          <button
            onClick={onToggleTheme}
            title="Alternar tema"
            aria-label="Alternar tema"
          >
            🌓
          </button>
          <button
            onClick={onSettings}
            title="Configurações"
            aria-label="Configurações"
          >
            ⚙
          </button>
          <button onClick={onHide} title="Fechar" aria-label="Fechar">
            ✕
          </button>
        </div>
      </div>

      <div className="search-row">
        <input
          autoFocus
          placeholder="Digite um comando e pressione ENTER..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
        />
        <button
          className="btn-add"
          onClick={onAdd}
          title="Adicionar novo comando"
          aria-label="Adicionar comando"
        >
          +
        </button>
      </div>

      <div className="toolbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id as any)}
          >
            {t.label}
          </button>
        ))}
        <div className="spacer" />
        {showHistory && history.length > 0 && (
          <button
            className="icon-btn"
            onClick={props.onClearHistory}
            title="Limpar histórico"
          >
            🗑
          </button>
        )}
      </div>

      <div className="list">
        {showHistory ? (
          history.length === 0 ? (
            <EmptyState
              hint="Nenhum comando executado ainda. Digite um comando acima."
            />
          ) : (
            history.map((h, i) => (
              <div
                key={`${h.command}-${h.timestamp}`}
                className={`item ${i === activeIndex ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => onExecute(h.command)}
              >
                <div className="icon">⏱</div>
                <div className="body">
                  <div className="title">{h.command}</div>
                  <div className="subtitle">
                    {new Date(h.timestamp).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="type-badge">{h.command_type}</div>
              </div>
            ))
          )
        ) : filtered.length === 0 ? (
          <EmptyState
            hint={
              query
                ? "Nenhum comando corresponde à busca."
                : "Nenhum comando cadastrado. Clique em + para adicionar."
            }
          />
        ) : (
          filtered.map(([name, entry], i) => {
            const icon = entry.icon || TYPE_ICONS[entry.type] || "▸";
            return (
              <div
                key={name}
                className={`item ${i === activeIndex ? "active" : ""}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => onExecute(name)}
              >
                <div className="icon">{icon}</div>
                <div className="body">
                  <div className="title">
                    {name}{" "}
                    {entry.url && (
                      <span className="command-item__subtitle">{entry.url}</span>
                    )}
                  </div>
                  <div className="subtitle">{subtitleFor(name, entry)}</div>
                </div>
                <button
                  className={`star ${entry.favorite ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(name);
                  }}
                  title={entry.favorite ? "Desfavoritar" : "Favoritar"}
                >
                  {entry.favorite ? "★" : "☆"}
                </button>
                <div className="type-badge">{entry.type}</div>
              </div>
            );
          })
        )}
      </div>

      <div className="statusbar">
        <div className="hint">
          <kbd>↑↓</kbd> navegar · <kbd>Enter</kbd> executar ·{" "}
          <kbd>Esc</kbd> fechar · <kbd>Tab</kbd> alternar
        </div>
        <div className="dir" title={workingDir}>
          {filtered.length} comando{filtered.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="list-empty">
      <div style={{ fontSize: 36, opacity: 0.4 }}>🔍</div>
      <div className="hint">{hint}</div>
    </div>
  );
}
