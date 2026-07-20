/**
 * LucideIconPicker
 *
 * Campo de busca de ícone Lucide com preview ao vivo.
 * Renderiza o ícone como SVG inline (sem rede), converte para
 * data:image/svg+xml;base64 e notifica o pai via onSelect.
 */
import { useState, useEffect, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// Ícones sugeridos para plugins (aparecem como atalhos)
const SUGGESTIONS = [
  "puzzle", "terminal", "cpu", "code", "wrench", "bolt",
  "flask-conical", "layers", "blocks", "settings",
  "zap", "package", "box", "command", "binary",
];

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
function resolveIcon(name: string): LucideIcon | null {
  if (!name) return null;
  const key = toPascalCase(name) as keyof typeof LucideIcons;
  const Icon = LucideIcons[key];
  if (typeof Icon === "function") return Icon as LucideIcon;
  return null;
}

/** Gera uma data URL SVG a partir do componente Lucide.
 *  Usa cor fixa (#6aa3ff = accent dark) para funcionar em <img src=...> */
function iconToDataUrl(Icon: LucideIcon): string {
  const svg = renderToStaticMarkup(
    React.createElement(Icon, {
      size: 24,
      color: "#6aa3ff",
      strokeWidth: 2,
    })
  );
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

interface Props {
  /** data URL atual (pode estar vazia) */
  value: string;
  /** Chamado com a data URL do SVG selecionado (ou "" para limpar) */
  onSelect: (dataUrl: string) => void;
}

export function LucideIconPicker({ value, onSelect }: Props) {
  const [query, setQuery]       = useState("");
  const [preview, setPreview]   = useState<LucideIcon | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!value) { setQuery(""); setPreview(null); setNotFound(false); }
  }, [value]);

  const handleChange = useCallback((raw: string) => {
    setQuery(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setPreview(null);
      setNotFound(false);
      onSelect("");
      return;
    }
    const Icon = resolveIcon(trimmed);
    if (Icon) {
      setPreview(Icon);
      setNotFound(false);
      onSelect(iconToDataUrl(Icon));
    } else {
      setPreview(null);
      setNotFound(true);
      onSelect("");
    }
  }, [onSelect]);

  const pick = useCallback((name: string) => {
    setQuery(name);
    const Icon = resolveIcon(name);
    if (Icon) {
      setPreview(Icon);
      setNotFound(false);
      onSelect(iconToDataUrl(Icon));
    }
  }, [onSelect]);

  return (
    <div className="lucide-picker">
      {/* Campo de busca + preview */}
      <div className="modal__row">
        <input
          type="text"
          className="modal__input"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="puzzle, terminal, cpu, zap…"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="modal__icon-preview" aria-live="polite">
          {preview
            ? React.createElement(preview, { size: 20, color: "var(--accent)", strokeWidth: 2 })
            : <span style={{ opacity: 0.25, fontSize: 16 }}>🧩</span>}
        </div>
      </div>

      {/* Mensagem de não encontrado */}
      {notFound && query && (
        <small className="modal__hint modal__hint--warn">
          Ícone "{query}" não encontrado.{" "}
          <a
            href={`https://lucide.dev/icons/?search=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noreferrer"
            className="lucide-picker__link"
          >
            Ver no lucide.dev ↗
          </a>
        </small>
      )}

      {/* Sugestões rápidas */}
      {!preview && !query && (
        <div className="lucide-picker__suggestions">
          {SUGGESTIONS.map((name) => {
            const Icon = resolveIcon(name);
            if (!Icon) return null;
            return (
              <button
                key={name}
                type="button"
                className="lucide-picker__chip"
                title={name}
                onClick={() => pick(name)}
              >
                {React.createElement(Icon, { size: 16, strokeWidth: 2 })}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
