mod commands_store;
mod executor;
mod favicon;
mod history;
mod paths;

use commands_store::CommandStore;
use history::HistoryStore;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let data_dir = paths::data_dir(app.handle());
            std::fs::create_dir_all(&data_dir).ok();

            let commands_path = data_dir.join("commands.json");
            let history_path = data_dir.join("data").join("history.json");
            if let Some(parent) = history_path.parent() {
                std::fs::create_dir_all(parent).ok();
            }

            app.manage(CommandStore::new(commands_path));
            app.manage(HistoryStore::new(history_path));

            // Atalho global: Ctrl+Space → traz o app para o primeiro plano
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::Space);

            let app_handle = app.handle().clone();
            app.global_shortcut()
                .on_shortcut(shortcut, move |_app, _scut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            // Se estiver minimizado, restaura
                            let _ = window.unminimize();
                            // Mostra a janela (não faz nada se já estiver visível)
                            let _ = window.show();
                            // Traz para o primeiro plano e foca
                            let _ = window.set_focus();
                        }
                    }
                })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands_store::list_commands,
            commands_store::get_commands_file,
            commands_store::create_command,
            commands_store::delete_command,
            commands_store::toggle_favorite,
            commands_store::import_commands,
            commands_store::export_commands,
            executor::run_command,
            executor::list_plugins,
            executor::open_plugin_folder,
            history::list_history,
            history::clear_history,
            paths::get_data_dir,
            paths::get_plugins_dir,
            paths::get_logs_dir,
            paths::open_path,
            paths::hide_window,
            paths::show_window,
            paths::close_window,
            paths::minimize_window,
            paths::get_theme,
            paths::set_theme,
            favicon::fetch_favicon,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
