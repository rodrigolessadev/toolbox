import { CommandEntry } from "../lib/api";
import { CommandItem } from "./CommandItem";

interface Props {
  items: [string, CommandEntry][];
  activeIndex: number;
  pluginIcons?: Record<string, string>;
  onSelect: (name: string) => void;
  onToggleFavorite: (name: string, current: boolean) => void;
  onEdit: (name: string, entry: CommandEntry) => void;
  onDelete: (name: string) => void;
  emptyMessage?: string;
}

export function CommandList({
  items,
  activeIndex,
  pluginIcons,
  onSelect,
  onToggleFavorite,
  onEdit,
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
      {items.map(([name, entry], idx) => {
        let pluginIcon: string | undefined;
        if (entry.type === "plugin" && pluginIcons) {
          const rawPath = entry.path || name;
          const leaf = rawPath.toLowerCase().replace(/\\/g, "/").split("/").filter(Boolean).pop();
          pluginIcon = (leaf && pluginIcons[leaf]) || pluginIcons[name.toLowerCase()] || pluginIcons[rawPath.toLowerCase()];
        }

        return (
          <CommandItem
            key={name}
            name={name}
            entry={entry}
            active={idx === activeIndex}
            pluginIcon={pluginIcon}
            onClick={() => onSelect(name)}
            onToggleFavorite={() => onToggleFavorite(name, entry.favorite)}
            onEdit={() => onEdit(name, entry)}
            onDelete={() => onDelete(name)}
          />
        );
      })}
    </ul>
  );
}
