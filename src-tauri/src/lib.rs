mod commands_store;
mod error;
mod executor;
mod history;
mod logger;
mod models;
mod paths;
mod plugins;

use commands_store::CommandsStore;
use error::AppResult;
use executor::CommandExecutor;
use history::HistoryStore;
use models::{
    CommandEntry, CommandsFile, CreateCommandPayload, HistoryEntry, PluginInfo, ToggleFavoritePayload,
};
use plugins::PluginManager;
use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
fn get_commands(store: tauri::State<CommandsStore>) -> Vec<(String, CommandEntry)> {
    store.list()
}

#[tauri::command]
fn get_command(name: String, store: tauri::State<CommandsStore>) -> Option<CommandEntry> {
    store.get(&name)
}

#[tauri::command]
fn create_command(
    payload: CreateCommandPayload,
    store: tauri::State<CommandsStore>,
) -> AppResult<CommandEntry> {
    log::info!("Criando comando: {}", payload.name);
    let entry = store.add(payload)?;
    // O frontend faz refetch via invoke('get_commands') após criar.
    Ok(entry)
}

#[tauri::command]
fn delete_command(name: String, store: tauri::State<CommandsStore>) -> AppResult<()> {
    log::info!("Removendo comando: {name}");
    store.remove(&name)
}

#[tauri::command]
fn toggle_favorite(
    payload: ToggleFavoritePayload,
    store: tauri::State<CommandsStore>,
) -> AppResult<()> {
    log::info!("Toggle favorito: {} -> {}", payload.name, payload.favorite);
    store.set_favorite(&payload.name, payload.favorite)
}

#[tauri::command]
async fn execute_command(
    name: String,
    app: tauri::AppHandle,
    executor: tauri::State<'_, CommandExecutor>,
    history: tauri::State<'_, HistoryStore>,
) -> AppResult<String> {
    log::info!("Executando comando: {name}");
    let result = executor.execute(&app, &name).await;
    if let Ok(ref _msg) = result {
        if let Some(entry) = executor.store.get(&name) {
            let _ = history.record(&name, entry.kind);
        }
    } else if let Err(ref e) = result {
        log::error!("Falha ao executar '{name}': {e}");
    }
    result
}

#[tauri::command]
fn get_history(history: tauri::State<HistoryStore>) -> Vec<HistoryEntry> {
    history.list()
}

#[tauri::command]
fn clear_history(history: tauri::State<HistoryStore>) -> AppResult<()> {
    history.clear()
}

#[tauri::command]
fn discover_plugins(plugins: tauri::State<PluginManager>) -> Vec<PluginInfo> {
    plugins.discover_all()
}

#[tauri::command]
fn export_commands(store: tauri::State<CommandsStore>) -> CommandsFile {
    store.export()
}

#[tauri::command]
fn import_commands(
    commands: CommandsFile,
    store: tauri::State<CommandsStore>,
) -> AppResult<()> {
    log::info!("Importando {} comandos", commands.len());
    store.replace_all(commands)
}

#[tauri::command]
fn get_workdir() -> String {
    paths::workdir().display().to_string()
}

#[tauri::command]
fn get_logs_dir() -> String {
    paths::logs_dir().display().to_string()
}

#[tauri::command]
fn open_path(path: String, app: tauri::AppHandle) -> AppResult<()> {
    app.opener()
        .open_path(path.clone(), None::<&str>)
        .map_err(|e| error::AppError::Generic(format!("Não foi possível abrir '{path}': {e}")))
}

#[tauri::command]
fn show_window(window: tauri::Window) -> AppResult<()> {
    window.show().map_err(|e| error::AppError::Generic(e.to_string()))?;
    window.set_focus().ok();
    Ok(())
}

#[tauri::command]
fn hide_window(window: tauri::Window) -> AppResult<()> {
    window.hide().map_err(|e| error::AppError::Generic(e.to_string()))?;
    Ok(())
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Garante diretórios essenciais.
    let _ = paths::ensure_dirs();
    logger::init();

    log::info!("Iniciando Toolbox...");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Estado compartilhado.
            let store = CommandsStore::load().expect("Falha ao carregar commands.json");
            let history = HistoryStore::load().expect("Falha ao carregar histórico");
            let plugins = PluginManager::new();
            let executor = CommandExecutor::new(store.clone(), plugins.clone());

            app.manage(store);
            app.manage(history);
            app.manage(plugins);
            app.manage(executor);

            // Atalho global: Ctrl+Space
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::Space);
            let app_handle = app.handle().clone();
            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |_app, sc, event| {
                        if sc == &shortcut && event.state == ShortcutState::Pressed {
                            if let Some(window) = app_handle.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    })
                    .build(),
            )?;

            // Registra o atalho.
            let gs = app.global_shortcut();
            match gs.register(shortcut) {
                Ok(_) => log::info!("Atalho global Ctrl+Space registrado."),
                Err(e) => log::warn!("Falha ao registrar atalho global: {e}"),
            }

            // Esconde a janela ao perder foco.
            if let Some(window) = app.get_webview_window("main") {
                let w = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::Focused(false) = event {
                        let _ = w.hide();
                    }
                });
            }

            let _ = app.emit("toolbox-ready", serde_json::json!({"ok": true}));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_commands,
            get_command,
            create_command,
            delete_command,
            toggle_favorite,
            execute_command,
            get_history,
            clear_history,
            discover_plugins,
            export_commands,
            import_commands,
            get_workdir,
            get_logs_dir,
            open_path,
            show_window,
            hide_window,
            quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("Falha ao iniciar o aplicativo Tauri");
}
