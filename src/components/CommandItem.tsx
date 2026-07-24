import { CommandEntry } from "../lib/api";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CommandItemProps {
  name: string;
  entry: CommandEntry;
  active: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TYPE_FALLBACK: Record<string, string> = {
  link:        "🔗",
  plugin:      "🧩",
  application: "⚙️",
};

/** Retorna true se o ícone é uma imagem (data URL ou URL http) */
function isImageIcon(icon: string): boolean {
  return icon.startsWith("data:") || icon.startsWith("http");
}

/** Converte "meu-nome" ou "MeuNome" para o nome do export Lucide (PascalCase) */
function toPascalCase(name: string): string {
  return name
    .replace(/-+/g, " ")
    .replace(/_+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

/** Resolve o componente Lucide pelo nome do ícone (ex: "puzzle" → Puzzle component) */
function resolveLucideIcon(name: string): LucideIcon | null {
  if (!name) return null;
  const key = toPascalCase(name) as keyof typeof LucideIcons;
  const Icon = LucideIcons[key];
  if (typeof Icon === "function") return Icon as LucideIcon;
  return null;
}

function IconCell({ entry }: { entry: CommandEntry }) {
  const icon = entry.icon;

  // Sem ícone → fallback por tipo
  if (!icon) {
    return (
      <span className="command-item__icon" aria-hidden="true">
        {TYPE_FALLBACK[entry.type] ?? "▸"}
      </span>
    );
  }

  // Imagem (favicon data URL)
  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt=""
        className="command-item__icon"
        onError={(e) => {
          // Se a imagem falhar, troca por emoji de fallback
          const span = document.createElement("span");
          span.className = "command-item__icon";
          span.textContent = TYPE_FALLBACK[entry.type] ?? "▸";
          (e.currentTarget as HTMLImageElement).replaceWith(span);
        }}
      />
    );
  }

  // Tenta resolver nome de ícone do Lucide (ex: "shield-check", "calculator", "puzzle")
  const LucideComp = resolveLucideIcon(icon);
  if (LucideComp) {
    return (
      <span className="command-item__icon" aria-hidden="true">
        <LucideComp size={16} color="var(--accent)" strokeWidth={2} />
      </span>
    );
  }

  // Emoji ou texto curto (ex: ≤ 4 caracteres)
  if (icon.length <= 4) {
    return (
      <span className="command-item__icon" aria-hidden="true">
        {icon}
      </span>
    );
  }

  // Fallback se for string longa desconhecida
  return (
    <span className="command-item__icon" aria-hidden="true">
      {TYPE_FALLBACK[entry.type] ?? "▸"}
    </span>
  );
}

function kindLabel(entry: CommandEntry): string {
  if (entry.type === "link")        return entry.url  ?? "";
  if (entry.type === "plugin")      return entry.path ?? "";
  if (entry.type === "application") return entry.path ?? "";
  return "";
}

export function CommandItem({ name, entry, active, onClick, onToggleFavorite, onEdit, onDelete }: CommandItemProps) {
  const subtitle = kindLabel(entry);

  return (
    <li
      className={`command-item${active ? " command-item--active" : ""}`}
      onClick={onClick}
      role="option"
      aria-selected={active}
    >
      <div className="command-item__main">
        <IconCell entry={entry} />

        <span className="command-item__title">{name}</span>

        {subtitle && subtitle !== name && (
          <span className="command-item__subtitle">{subtitle}</span>
        )}
      </div>

      <div className="command-item__actions">
        <button
          type="button"
          className="command-item__btn"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          aria-label={entry.favorite ? "Remover dos favoritos" : "Favoritar"}
          title={entry.favorite ? "Remover dos favoritos" : "Favoritar"}
        >
          {entry.favorite ? "★" : "☆"}
        </button>

        <button
          type="button"
          className="command-item__btn"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          aria-label="Editar"
          title="Editar"
        >
          ✎
        </button>

        <button
          type="button"
          className="command-item__btn command-item__btn--danger"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Excluir"
          title="Excluir"
        >
          ×
        </button>
      </div>
    </li>
  );
}
