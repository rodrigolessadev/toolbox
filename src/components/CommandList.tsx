import { CommandEntry } from "../lib/api";
import { CommandItem } from "./CommandItem";

interface Props {
  items: [string, CommandEntry][];
  activeIndex: number;
  onClick: () => void;
  onSelect: (name: string) => void;
  onToggleFavorite: (name: string, current: boolean) => void;
  onDelete: (name: string) => void;
  emptyMessage?: string;
}

export function CommandList({
  items,
  activeIndex,
  onSelect,
  onToggleFavorite,
  onDelete,
  emptyMessage,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="command-list command-list--empty">
        <p>{emptyMessage ?? "Nenhum comando encontrado."}</p>
        <small>Digite algo ou cadastre um novo com o botão +.</small>
      </div>
    );
  }

  return (
    <ul className="command-list" role="listbox">
      {items.map(([name, entry], idx) => (
        <CommandItem
          key={name}
          name={name}
          entry={entry}
          active={idx === activeIndex}
          onClick={() => onSelect(name)}
          onToggleFavorite={() => onToggleFavorite(name, entry.favorite)}
          onDelete={() => onDelete(name)}
        />
      ))}
    </ul>
  );
}
