import { CommandEntry } from "../lib/api";

interface CommandItemProps {
  name: string;
  entry: CommandEntry;
  active?: boolean;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect?: (name: string) => void;
  onExecute?: (name: string) => void;
  onToggleFavorite?: (name: string, favorite: boolean) => void;
}

export function CommandItem({
  name,
  entry,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onExecute,
  onToggleFavorite,
}: CommandItemProps) {
  // Subtitle genérico: usa URL (links) ou path (plugins/apps), o que existir
  const subtitle = entry.url ?? entry.path;

  const typeLabel: Record<CommandEntry["type"], string> = {
    plugin: "Plugin",
    link: "Link",
    application: "App",
  };

  return (
    <div
      className={`command-item ${isSelected ? "command-item--selected" : ""}`}
      onClick={() => onSelect?.(name)}
      onDoubleClick={() => onExecute?.(name)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onExecute?.(name);
      }}
    >
      <div className="command-item__main">
        <span className="command-item__title">{name}</span>

        {subtitle && subtitle !== name && (
          <span className="command-item__subtitle">{subtitle}</span>
        )}
      </div>

      <div className="command-item__meta">
        <span className={`command-item__type command-item__type--${entry.type}`}>
          {typeLabel[entry.type]}
        </span>

        <button
          className={`command-item__favorite ${isFavorite || entry.favorite ? "is-active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(name, !entry.favorite);
          }}
          aria-label={entry.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={entry.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {entry.favorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}

export default CommandItem;