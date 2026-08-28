import { invoke } from "@tauri-apps/api/core";

// ───────────────────────── Tipos ─────────────────────────

export type CommandType = "plugin" | "link" | "application" | "script" | "clipboard";

export interface CommandEntry {
  type: CommandType;
  path?: string;
  /** Argumentos extras para aplicativos (ex: "--verbose --config=foo.cfg") */
  args?: string;
  /** Executar como Administrador no Windows (elevação UAC) */
  run_as_admin?: boolean;
  /** Tipo de script ("powershell" | "batch") */
  script_type?: "powershell" | "batch";
  /** Conteúdo do script inline */
  script_content?: string;
  /** Conteúdo de texto para Área de Transferência (Clipboard / Snippets) */
  text_content?: string;
  /** Descrição ou observação opcional do comando */
  description?: string;
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
  icon?: string;
}

export interface HistoryEntry {
  command: string;
  command_type: "plugin" | "link" | "application" | "script" | "clipboard";
  timestamp: string;
  success: boolean;
}

export interface CreateCommandPayload {
  name: string;
  type: CommandType;
  path?: string;
  /** Argumentos extras para aplicativos */
  args?: string;
  /** Executar como Administrador no Windows (elevação UAC) */
  run_as_admin?: boolean;
  /** Tipo de script ("powershell" | "batch") */
  script_type?: "powershell" | "batch";
  /** Conteúdo do script inline */
  script_content?: string;
  /** Conteúdo de texto para Área de Transferência (Clipboard / Snippets) */
  text_content?: string;
  /** Descrição ou observação opcional do comando */
  description?: string;
  url?: string;
  icon?: string | null;
  favorite?: boolean;
}

export interface UpdateCommandPayload extends CreateCommandPayload {
  old_name: string;
}

export interface ToggleFavoritePayload {
  name: string;
  favorite: boolean;
}

export interface RunResult {
  ok: boolean;
  message?: string;
}

// ── Marketplace ──────────────────────────────────────────

export interface CatalogPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  language: string;
  tags: string[];
  icon: string;
  command: string;
  download_url: string;
  min_toolbox_version: string;
}

export interface MarketplaceEntry extends CatalogPlugin {
  /** "available" | "installed" | "update_available" */
  status: "available" | "installed" | "update_available";
  installed_version?: string;
}

export interface InstalledPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  language: string;
  entry: string;
  path: string;
  icon?: string;
}

export interface UpdateCheckResult {
  available: boolean;
  current_version: string;
  version?: string | null;
  body?: string | null;
}

export interface RuntimeInfo {
  name: string;
  available: boolean;
  version?: string | null;
  is_embedded?: boolean;
  path?: string | null;
}

export interface BackupStatus {
  enabled: boolean;
  backup_path: string;
  destination_type: string;
  last_backup_time?: string | null;
  file_size_bytes?: number | null;
  backup_exists: boolean;
  backup_commands_count: number;
}

export interface SystemCommandItem {
  name: string;
  path: string;
  description?: string;
  is_elevated_required?: boolean;
}

export interface RunCommandOptions {
  run_as_admin?: boolean;
  args?: string;
}

// ─────────────────────── Bridge Tauri ────────────────────

export const api = {
  listCommands: () => invoke<CommandsMap>("list_commands"),
  getCommandsFile: () => invoke<CommandsFile>("get_commands_file"),
  getCommands: () => invoke<CommandsMap>("list_commands"),

  createCommand: (payload: CreateCommandPayload) =>
    invoke<CommandsFile>("create_command", { payload }),
  updateCommand: (payload: UpdateCommandPayload) =>
    invoke<CommandsFile>("update_command", { payload }),
  deleteCommand: (name: string) =>
    invoke<CommandsFile>("delete_command", { name }),
  toggleFavorite: (payload: ToggleFavoritePayload) =>
    invoke<CommandsFile>("toggle_favorite", { payload }),

  importCommands: (json: string) =>
    invoke<CommandsFile>("import_commands", { json }),
  exportCommands: () => invoke<string>("export_commands"),

  // ── Backup & Sincronização ──
  getBackupDir: () => invoke<string>("get_backup_dir"),
  getBackupStatus: () => invoke<BackupStatus>("get_backup_status"),
  triggerManualBackup: () => invoke<BackupStatus>("trigger_manual_backup"),
  restoreFromAutoBackup: () => invoke<CommandsFile>("restore_from_auto_backup"),
  checkAutoBackupAvailable: () => invoke<BackupStatus | null>("check_auto_backup_available"),

  listPlugins: () => invoke<PluginInfo[]>("list_plugins"),
  openPluginFolder: (path: string) =>
    invoke<void>("open_plugin_folder", { path }),

  runCommand: (name: string, options?: RunCommandOptions) =>
    invoke<RunResult>("run_command", {
      name,
      runAsAdmin: options?.run_as_admin,
      args: options?.args,
    }),
  executeCommand: (name: string, options?: RunCommandOptions) =>
    invoke<RunResult>("run_command", {
      name,
      runAsAdmin: options?.run_as_admin,
      args: options?.args,
    }),
  listSystemCommands: () => invoke<SystemCommandItem[]>("list_system_commands"),
  refreshSystemCommands: () => invoke<number>("refresh_system_commands"),

  listHistory: () => invoke<HistoryEntry[]>("list_history"),
  getHistory: () => invoke<HistoryEntry[]>("list_history"),
  clearHistory: () => invoke<void>("clear_history"),

  getTheme: () => invoke<string>("get_theme"),
  setTheme: (theme: "light" | "dark" | "system") => invoke<void>("set_theme", { theme }),

  getDataDir: () => invoke<string>("get_data_dir"),
  getPluginsDir: () => invoke<string>("get_plugins_dir"),
  getLogsDir: () => invoke<string>("get_logs_dir"),
  getWorkdir: () => invoke<string>("get_data_dir"),
  openPath: (path: string) => invoke<void>("open_path", { path }),
  checkUpdate: () => invoke<UpdateCheckResult>("check_update"),
  installUpdate: () => invoke<string>("install_update"),

  checkRuntimeStatus: (runtime: string) =>
    invoke<RuntimeInfo>("check_runtime_status", { runtime }),
  checkAllRuntimes: () => invoke<RuntimeInfo[]>("check_all_runtimes"),

  hideWindow: () => invoke<void>("hide_window"),
  showWindow: () => invoke<void>("show_window"),

  closeWindow: () => invoke<void>("close_window"),
  minimizeWindow: () => invoke<void>("minimize_window"),
  fetchFavicon: (url: string) => invoke<string>("fetch_favicon", { url }),
  extractExeIcon: (path: string) => invoke<string>("extract_exe_icon", { path }),
  importCustomIcon: (sourcePath: string) =>
    invoke<string>("import_custom_icon", { sourcePath }),
  getIconsDir: () => invoke<string>("get_icons_dir"),

  // ── Marketplace ──
  fetchCatalog: () => invoke<MarketplaceEntry[]>("fetch_catalog"),
  installPlugin: (pluginId: string, downloadUrl: string) =>
    invoke<string>("install_plugin", { pluginId, downloadUrl }),
  removePlugin: (pluginId: string) =>
    invoke<string>("remove_plugin", { pluginId }),
  listInstalledPlugins: () => invoke<InstalledPlugin[]>("list_installed_plugins"),

  // ── Logger ──
  logEvent: (level: string, target: string, message: string) =>
    invoke<void>("log_event", { level, target, message }),
};