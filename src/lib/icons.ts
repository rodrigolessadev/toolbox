import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Converte kebab-case, snake_case ou espaçado para PascalCase correspondente
 * ao nome de exportação do Lucide React (ex: "clock-3" -> "Clock3", "badge-check" -> "BadgeCheck").
 */
export function toPascalCase(name: string): string {
  if (!name) return "";
  return name
    .replace(/-+/g, " ")
    .replace(/_+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

/**
 * Retorna true se a string representa uma imagem (data URL ou URL http/https).
 */
export function isImageIcon(icon?: string | null): boolean {
  if (!icon) return false;
  return icon.startsWith("data:") || icon.startsWith("http://") || icon.startsWith("https://");
}

/**
 * Resolve dinamicamente o componente Lucide a partir do identificador (ex: "workflow", "search-code", "ticket").
 * Suporta componentes exportados como função ou objeto (React forwardRef).
 */
export function resolveLucideIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  const key = toPascalCase(name) as keyof typeof LucideIcons;
  const Icon = LucideIcons[key];
  if (typeof Icon === "function" || (typeof Icon === "object" && Icon !== null)) {
    return Icon as LucideIcon;
  }
  return null;
}

/**
 * Ícone genérico de fallback para plugins (Puzzle).
 */
export const FallbackPluginIcon: LucideIcon = LucideIcons.Puzzle;

/**
 * Lista de sugestões de ícones para o seletor (picker), incluindo ícones oficiais de plugins do ecossistema.
 */
export const SUGGESTED_LUCIDE_ICONS: string[] = [
  // Ícones oficiais dos plugins do ecossistema
  "workflow",
  "clock-3",
  "calendar-sync",
  "file-clock",
  "file-json",
  "database",
  "search-code",
  "scan-search",
  "file-search",
  "badge-check",
  "ticket",
  // Ícones utilitários comuns
  "puzzle",
  "terminal",
  "cpu",
  "code",
  "wrench",
  "bolt",
  "flask-conical",
  "layers",
  "blocks",
  "settings",
  "zap",
  "package",
  "box",
  "command",
  "binary",
];
