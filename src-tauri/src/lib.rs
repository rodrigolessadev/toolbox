mod commands_store;
mod exe_icon;
mod executor;
mod favicon;
mod history;
mod logger;
mod marketplace;
mod paths;
pub mod plugin;
pub mod protocol;


use commands_store::CommandStore;
use history::HistoryStore;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_updater::UpdaterExt;

#[cfg(windows)]
fn launch_elevated_installer(installer_path: &std::path::Path) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::UI::Shell::ShellExecuteW;
    use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;
    use windows::Win32::Foundation::HWND;

    let path_wide: Vec<u16> = installer_path
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let verb_wide: Vec<u16> = std::ffi::OsStr::new("runas")
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    unsafe {
        let result = ShellExecuteW(
            HWND(std::ptr::null_mut()),
            PCWSTR(verb_wide.as_ptr()),
            PCWSTR(path_wide.as_ptr()),
            PCWSTR(std::ptr::null()),
            PCWSTR(std::ptr::null()),
            SW_SHOWNORMAL,
        );

        if (result.0 as usize) <= 32 {
            return Err(format!(
                "Falha ao executar instalador com privilégios de Administrador (código: {})",
                result.0 as usize
            ));
        }
    }

    Ok(())
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<String, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    let update = updater
        .check()
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Nenhuma atualização disponível.".to_string())?;

    log::info!("Iniciando atualização para v{}", update.version);

    #[cfg(windows)]
    {
        let bytes = update
            .download(|_chunk, _total| {}, || {})
            .await
            .map_err(|e| e.to_string())?;

        if let Err(err) = update.install(bytes.clone()) {
            log::warn!("Instalação padrão falhou ({err}), executando instalador como Administrador...");
            let temp_installer = std::env::temp_dir().join(format!("Toolbox_Update_{}.exe", update.version));
            std::fs::write(&temp_installer, &bytes)
                .map_err(|e| format!("Falha ao gravar instalador temporário: {e}"))?;
            launch_elevated_installer(&temp_installer)?;
        }
    }

    #[cfg(not(windows))]
    {
        update
            .download_and_install(|_chunk, _total| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok("Atualização iniciada. O instalador será executado em breve.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
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

            // Verifica atualizações em background (não bloqueia a inicialização)
            let update_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_updates(update_handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands_store::list_commands,
            commands_store::get_commands_file,
            commands_store::create_command,
            commands_store::update_command,
            commands_store::delete_command,
            commands_store::toggle_favorite,
            commands_store::import_commands,
            commands_store::export_commands,
            install_update,
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
            marketplace::fetch_catalog,
            marketplace::install_plugin,
            marketplace::remove_plugin,
            marketplace::list_installed_plugins,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Verifica se existe uma nova versão disponível e dispara a instalação.
/// Roda em background — erros de rede são silenciados para não atrapalhar o uso.
async fn check_for_updates(app: tauri::AppHandle) {
    let updater = match app.updater() {
        Ok(u) => u,
        Err(_) => return,
    };

    let update = match updater.check().await {
        Ok(Some(u)) => u,
        _ => return, // sem atualização ou sem conexão
    };

    log::info!(
        "Nova versão disponível: {} (atual: {})",
        update.version,
        update.current_version
    );

    // Emite evento para o frontend exibir o banner de atualização
    let _ = app.emit(
        "update-available",
        serde_json::json!({
            "version": update.version,
            "body": update.body,
        }),
    );
}
