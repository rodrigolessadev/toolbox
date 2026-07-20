mod commands_store;
mod exe_icon;
mod executor;
mod favicon;
mod history;
mod logger;
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
            // Inicializa o logger de arquivo com o diretório resolvido pelo AppHandle
            let logs_path = paths::logs_dir(app.handle());
            logger::init(logs_path);

            // Garante que o diretório de dados existe
            let data_dir = paths::data_dir(app.handle());
            std::fs::create_dir_all(&data_dir).ok();

            // Caminhos dos arquivos de dados
            let commands_path = data_dir.join("commands.json");
            let history_dir = data_dir.join("data");
            std::fs::create_dir_all(&history_dir).ok();
            let history_path = history_dir.join("history.json");

            // Registra os stores como estado gerenciado
            app.manage(CommandStore::new(commands_path));
            app.manage(HistoryStore::new(history_path));

            // Atalho global: Ctrl+Space traz a janela para o primeiro plano
            let shortcut = Shortcut::new(
                Some(Modifiers::CONTROL),
                Code::Space,
            );

            let app_handle = app.handle().clone();
            if let Err(e) = app.global_shortcut().on_shortcut(
                shortcut,
                move |_app, _scut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                },
            ) {
                eprintln!(
                    "Aviso: nao foi possivel registrar Ctrl+Space ({e}). O app continua funcionando."
                );
            }

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
            favicon::fetch_favicon,
            exe_icon::extract_exe_icon,
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
