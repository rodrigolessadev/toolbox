import { invoke } from "@tauri-apps/api/core";

// ───────────────────────── Tipos ─────────────────────────

export type CommandType = "plugin" | "link" | "application";

export interface CommandEntry {
  type: CommandType;
  path?: string;
  url?: string;
  favorite: boolean;
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
  command_type: "plugin" | "link" | "application";
  timestamp: string;
  success: boolean;
}

export interface CreateCommandPayload {
  name: string;
  type: CommandType;        // <-- "type", não "kind"
  path?: string;
  url?: string;
}

export interface ToggleFavoritePayload {
  name: string;
  favorite: boolean;
}

export interface RunResult {
  ok: boolean;
  message?: string;
}

// ─────────────────────── Bridge Tauri ────────────────────

export const api = {
  listCommands: () => invoke<CommandsMap>("list_commands"),
  getCommandsFile: () => invoke<CommandsFile>("get_commands_file"),
  getCommands: () => invoke<CommandsMap>("list_commands"),

  createCommand: (payload: CreateCommandPayload) =>
    invoke<CommandsFile>("create_command", { payload }),
  deleteCommand: (name: string) =>
    invoke<CommandsFile>("delete_command", { name }),
  toggleFavorite: (payload: ToggleFavoritePayload) =>
    invoke<CommandsFile>("toggle_favorite", { payload }),

  importCommands: (json: string) =>
    invoke<CommandsFile>("import_commands", { json }),
  exportCommands: () => invoke<string>("export_commands"),

  listPlugins: () => invoke<PluginInfo[]>("list_plugins"),
  openPluginFolder: (path: string) =>
    invoke<void>("open_plugin_folder", { path }),

  runCommand: (name: string) => invoke<RunResult>("run_command", { name }),
  executeCommand: (name: string) => invoke<RunResult>("run_command", { name }),

  listHistory: () => invoke<HistoryEntry[]>("list_history"),
  getHistory: () => invoke<HistoryEntry[]>("list_history"),
  clearHistory: () => invoke<void>("clear_history"),

  getTheme: () => invoke<string>("get_theme"),
  setTheme: (theme: "light" | "dark") => invoke<void>("set_theme", { theme }),

  getDataDir: () => invoke<string>("get_data_dir"),
  getPluginsDir: () => invoke<string>("get_plugins_dir"),
  getLogsDir: () => invoke<string>("get_logs_dir"),
  getWorkdir: () => invoke<string>("get_data_dir"),
  openPath: (path: string) => invoke<void>("open_path", { path }),

  hideWindow: () => invoke<void>("hide_window"),
  showWindow: () => invoke<void>("show_window"),

  closeWindow: () => invoke<void>("close_window"),
  minimizeWindow: () => invoke<void>("minimize_window"),
  fetchFavicon: (url: string) => invoke<string>("fetch_favicon", { url }),
};