import { invoke } from "@tauri-apps/api/core";

// ───────────────────────── Tipos ─────────────────────────

export type CommandType = "plugin" | "link" | "application";

export interface CommandEntry {
  type: CommandType;
  path?: string;     // plugin / application
  url?: string;      // link
  favorite?: boolean;
  icon?: string | null;
  createdAt?: string;
}

export type CommandsMap = Record<string, CommandEntry>;

export interface CommandsFile {
  commands: CommandsMap;
}

export interface PluginInfo {
  name: string;
  version: string;
  path: string;
  language: string;
  entry: string;
}

export interface HistoryEntry {
  command: string;
  timestamp: string;
  success: boolean;
}

export interface CreateCommandPayload {
  name: string;
  type: CommandType;
  path?: string;
  url?: string;
}

export interface ToggleFavoritePayload {
  name: string;
  favorite: boolean;
}

// ─────────────────────── Bridge Tauri ────────────────────

export const api = {
  // Comandos
  listCommands: () => invoke<CommandsMap>("list_commands"),
  getCommandsFile: () => invoke<CommandsFile>("get_commands_file"),
  createCommand: (payload: CreateCommandPayload) =>
    invoke<CommandsFile>("create_command", { payload }),
  deleteCommand: (name: string) =>
    invoke<CommandsFile>("delete_command", { name }),
  toggleFavorite: (payload: ToggleFavoritePayload) =>
    invoke<CommandsFile>("toggle_favorite", { payload }),
  importCommands: (json: string) =>
    invoke<CommandsFile>("import_commands", { json }),
  exportCommands: () => invoke<string>("export_commands"),

  // Plugins
  listPlugins: () => invoke<PluginInfo[]>("list_plugins"),
  openPluginFolder: (path: string) =>
    invoke<void>("open_plugin_folder", { path }),

  // Execução
  runCommand: (name: string) =>
    invoke<{ ok: boolean; message?: string }>("run_command", { name }),

  // Histórico
  listHistory: () => invoke<HistoryEntry[]>("list_history"),
  clearHistory: () => invoke<void>("clear_history"),

  // Sistema
  getTheme: () => invoke<string>("get_theme"),
  setTheme: (theme: "light" | "dark") => invoke<void>("set_theme", { theme }),
  getDataDir: () => invoke<string>("get_data_dir"),
  getPluginsDir: () => invoke<string>("get_plugins_dir"),
  getLogsDir: () => invoke<string>("get_logs_dir"),
  openPath: (path: string) => invoke<void>("open_path", { path }),
};