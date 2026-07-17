import { CommandEntry } from "../lib/api";

interface Props {
  name: string;
  entry: CommandEntry;
  active?: boolean;
  onClick?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

function kindLabel(entry: CommandEntry): string {
  if (entry.type === "link") return entry.url ?? "";
  if (entry.type === "plugin") return entry.path ?? "";
  return entry.path ?? "";
}

function kindIcon(entry: CommandEntry): string {
  if (entry.icon) return entry.icon;
  if (entry.type === "link") return "🔗";
  if (entry.type === "plugin") return "🔌";
  return "▶";
}

export function CommandItem({
  name,
  entry,
  active,
  onClick,
  onToggleFavorite,
  onDelete,
}: Props) {
  return (
    <li
      className={`command-item ${active ? "command-item--active" : ""}`}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="command-item__icon">{kindIcon(entry)}</span>
      <div className="command-item__body">
        <div className="command-item__title">
          <span className="command-item__name">{name}</span>
          {name && entry.favorite !== undefined && (
            <span className="command-item__subtitle">{name}</span>
          )}
        </div>
        <div className="command-item__meta">
          <span className={`badge badge--${entry.type}`}>{entry.type}</span>
          <span className="command-item__detail">{kindLabel(entry)}</span>
        </div>
      </div>
      <div className="command-item__actions">
        <button
          className="icon-btn"
          title={entry.favorite ? "Remover dos favoritos" : "Marcar como favorito"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
        >
          {entry.favorite ? "★" : "☆"}
        </button>
        <button
          className="icon-btn icon-btn--danger"
          title="Remover comando"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          🗑
        </button>
      </div>
    </li>
  );
}
