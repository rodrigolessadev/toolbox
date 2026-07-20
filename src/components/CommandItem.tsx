import { CommandEntry } from "../lib/api";

export interface CommandItemProps {
  name: string;
  entry: CommandEntry;
  active: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function kindLabel(entry: CommandEntry): string {
  if (entry.type === "link") return entry.url ?? "";
  if (entry.type === "plugin") return entry.path ?? "";
  return entry.path ?? "";
}

export function CommandItem(props: CommandItemProps) {
  const { name, entry, active, onClick, onToggleFavorite, onDelete } = props;
  const subtitle = kindLabel(entry);

  return (
    <li
      className={`command-item${active ? " command-item--active" : ""}`}
      onClick={onClick}
      role="option"
      aria-selected={active}
    >
      <div className="command-item__main">
        {entry.icon && (
          <img
            src={entry.icon}
            alt=""
            className="command-item__icon"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <span className="command-item__title">{name}</span>
        {subtitle && subtitle !== name && (
          <span className="command-item__subtitle">{subtitle}</span>
        )}
      </div>

      <div className="command-item__actions">
        <button
          type="button"
          className="command-item__btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={entry.favorite ? "Remover dos favoritos" : "Marcar como favorito"}
          title={entry.favorite ? "Remover dos favoritos" : "Marcar como favorito"}
        >
          {entry.favorite ? "★" : "☆"}
        </button>

        <button
          type="button"
          className="command-item__btn command-item__btn--danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Excluir comando"
          title="Excluir"
        >
          ×
        </button>
      </div>
    </li>
  );
}