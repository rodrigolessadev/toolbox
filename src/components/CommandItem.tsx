import { Shield, Terminal } from "lucide-react";
import { CommandEntry } from "../lib/api";
import { resolveLucideIcon, isImageIcon, FallbackPluginIcon } from "../lib/icons";

export interface CommandItemProps {
  name: string;
  entry: CommandEntry;
  active: boolean;
  pluginIcon?: string;
  onClick: () => void;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TYPE_FALLBACK: Record<string, string> = {
  link:        "🔗",
  plugin:      "🧩",
  application: "⚙️",
  script:      "📜",
};

function IconCell({ entry, pluginIcon }: { entry: CommandEntry; pluginIcon?: string }) {
  const icon = entry.icon || (entry.type === "plugin" ? pluginIcon : undefined);

  // Sem ícone -> fallback por tipo
  if (!icon) {
    if (entry.type === "plugin") {
      return (
        <span className="command-item__icon" aria-hidden="true">
          <FallbackPluginIcon size={16} color="var(--accent)" strokeWidth={2} />
        </span>
      );
    }
    if (entry.type === "script") {
      return (
        <span className="command-item__icon" aria-hidden="true">
          <Terminal size={16} color="var(--accent)" strokeWidth={2} />
        </span>
      );
    }
    if (entry.type === "application" && entry.path) {
      const p = entry.path.toLowerCase();
      if (p.endsWith(".ps1") || p.endsWith(".bat") || p.endsWith(".cmd")) {
        return (
          <span className="command-item__icon" aria-hidden="true">
            <Terminal size={16} color="var(--accent)" strokeWidth={2} />
          </span>
        );
      }
    }
    return (
      <span className="command-item__icon" aria-hidden="true">
        {TYPE_FALLBACK[entry.type] ?? "⚡"}
      </span>
    );
  }

  // Imagem (favicon data URL ou ícone extraído)
  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt=""
        className="command-item__icon"
        onError={(e) => {
          const span = document.createElement("span");
          span.className = "command-item__icon";
          span.textContent = TYPE_FALLBACK[entry.type] ?? "⚡";
          (e.currentTarget as HTMLImageElement).replaceWith(span);
        }}
      />
    );
  }

  // Tenta resolver nome de ícone do Lucide (ex: "workflow", "clock-3", "search-code", "ticket", "puzzle")
  const LucideComp = resolveLucideIcon(icon);
  if (LucideComp) {
    return (
      <span className="command-item__icon" aria-hidden="true">
        <LucideComp size={16} color="var(--accent)" strokeWidth={2} />
      </span>
    );
  }

  // Emoji ou texto curto (ex: ⚙️)
  if (icon.length <= 4) {
    return (
      <span className="command-item__icon" aria-hidden="true">
        {icon}
      </span>
    );
  }

  // Fallback se for string longa desconhecida
  if (entry.type === "plugin") {
    return (
      <span className="command-item__icon" aria-hidden="true">
        <FallbackPluginIcon size={16} color="var(--accent)" strokeWidth={2} />
      </span>
    );
  }

  return (
    <span className="command-item__icon" aria-hidden="true">
      {TYPE_FALLBACK[entry.type] ?? "⚡"}
    </span>
  );
}

function kindLabel(entry: CommandEntry): string {
  if (entry.type === "link")        return entry.url  ?? "";
  if (entry.type === "plugin")      return entry.path ?? "";
  if (entry.type === "application") return entry.path ?? "";
  if (entry.type === "script")      return entry.script_type === "batch" ? "Script Batch" : "Script PowerShell";
  return "";
}

export function CommandItem({
  name,
  entry,
  active,
  pluginIcon,
  onClick,
  onToggleFavorite,
  onEdit,
  onDelete
}: CommandItemProps) {
  const subtitle = kindLabel(entry);

  return (
    <li
      className={`command-item${active ? " command-item--active" : ""}`}
      onClick={onClick}
      role="option"
      aria-selected={active}
    >
      <div className="command-item__main">
        <IconCell entry={entry} pluginIcon={pluginIcon} />

        <span className="command-item__title">
          {name}
          {(entry.type === "application" || entry.type === "script") && entry.run_as_admin && (
            <span
              className="command-item__admin-badge"
              title="Executa com privilégios de Administrador (UAC)"
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginLeft: 6,
                verticalAlign: "middle",
                color: "var(--warning, #f59e0b)",
                opacity: 0.9,
              }}
            >
              <Shield size={12} strokeWidth={2.5} />
            </span>
          )}
        </span>

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
          ✕
        </button>
      </div>
    </li>
  );
}
