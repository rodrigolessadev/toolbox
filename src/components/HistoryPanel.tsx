import { HistoryEntry } from "../lib/api";

interface Props {
  history: HistoryEntry[];
  onSelect: (name: string) => void;
  onClear: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export function HistoryPanel({ history, onSelect, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="command-list command-list--empty">
        <p>Histórico vazio.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="command-list">
        {history.map((h) => (
          <li
            key={`${h.command}-${h.timestamp}`}
            className="command-item"
            onClick={() => onSelect(h.command)}
          >
            <span className="command-item__icon">⏱</span>
            <div className="command-item__body">
              <div className="command-item__title">
                <span className="command-item__name">{h.command}</span>
                <span className="command-item__subtitle"></span>
              </div>
            </div>
            <span className={`badge badge--${h.kind}`}>{h.kind}</span>
          </li>
        ))}
      </ul>
      <div className="history-footer">
        <button className="btn btn--ghost" onClick={onClear}>
          Limpar histórico
        </button>
      </div>
    </>
  );
}
