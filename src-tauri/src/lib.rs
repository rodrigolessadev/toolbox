mod commands_store;
pub mod db;
mod exe_icon;
mod executor;
mod favicon;
mod history;
mod icon_importer;
mod logger;
mod marketplace;
pub mod migration;
mod paths;
pub mod plugin;
pub mod protocol;
pub mod runtimes;
pub mod system_commands;
pub mod wsl;


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

        let code = result.0 as usize;
        if code <= 32 {
            if code == 5 || code == 0 {
                return Err("A solicitação de permissão de Administrador (UAC) foi cancelada ou negada.".to_string());
            }
            return Err(format!(
                "Falha ao executar instalador com privilégios de Administrador (código: {})",
                code
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

    // Snapshot pré-atualização para garantir que os dados não sejam perdidos no instalador
    let data_dir = paths::data_dir(&app);
    let backup_dir = paths::backup_dir();
    let source = data_dir.join("commands.json");
    if source.exists() {
        let target = backup_dir.join(format!("commands_snapshot_pre_v{}.json", update.version));
        let _ = std::fs::copy(&source, &target);
    }

    #[cfg(windows)]
    {
        let bytes = update
            .download(|_chunk, _total| {}, || {})
            .await
            .map_err(|e| e.to_string())?;

        let temp_installer = std::env::temp_dir().join(format!("Toolbox_Update_{}.exe", update.version));
        std::fs::write(&temp_installer, &bytes)
            .map_err(|e| format!("Falha ao gravar instalador temporário: {e}"))?;

        log::info!("Executando instalador como Administrador: {:?}", temp_installer);
        launch_elevated_installer(&temp_installer)?;

        // Fecha o aplicativo após disparar o instalador elevado para liberar os arquivos em Program Files
        let app_handle = app.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(1500));
            app_handle.exit(0);
        });
    }

    #[cfg(not(windows))]
    {
        update
            .download_and_install(|_chunk, _total| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok("Atualização iniciada. O instalador será executado como Administrador em breve.".to_string())
}

#[derive(serde::Serialize)]
pub struct UpdateCheckResult {
    pub available: bool,
    pub current_version: String,
    pub version: Option<String>,
    pub body: Option<String>,
}

#[tauri::command]
async fn check_update(app: tauri::AppHandle) -> Result<UpdateCheckResult, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    match updater.check().await {
        Ok(Some(update)) => {
            log::info!(
                "Verificação manual: Nova versão disponível: {} (atual: {})",
                update.version,
                update.current_version
            );
            let _ = app.emit(
                "update-available",
                serde_json::json!({
                    "version": update.version,
                    "body": update.body,
                }),
            );
            Ok(UpdateCheckResult {
                available: true,
                current_version: update.current_version.clone(),
                version: Some(update.version),
                body: update.body,
            })
        }
        Ok(None) => {
            let current = app.package_info().version.to_string();
            log::info!("Verificação manual: Aplicativo atualizado na versão {}", current);
            Ok(UpdateCheckResult {
                available: false,
                current_version: current,
                version: None,
                body: None,
            })
        }
        Err(e) => {
            log::error!("Falha ao verificar atualização manualmente: {e}");
            Err(e.to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Inicializa o logger de arquivo com o diretório resolvido pelo AppHandle
            let logs_path = paths::logs_dir(app.handle());
            logger::init(logs_path);

            // Garante que o diretório de dados existe
            let data_dir = paths::data_dir(app.handle());
            std::fs::create_dir_all(&data_dir).ok();

            // Garante que o diretório de ícones personalizados existe
            let icons_dir = paths::icons_dir(app.handle());
            std::fs::create_dir_all(&icons_dir).ok();

            // Caminhos dos arquivos de dados
            let commands_path = data_dir.join("commands.json");
            let history_dir = data_dir.join("data");
            std::fs::create_dir_all(&history_dir).ok();
            let history_path = history_dir.join("history.json");

            // Inicializa banco de dados SQLite central e executa auto-migração de dados legados
            let db_path = data_dir.join("toolbox.db");
            if let Ok(db_manager) = db::DatabaseManager::new(db_path) {
                let _ = migration::migrate_legacy_files_if_needed(&db_manager, &data_dir);
                let command_store = CommandStore::new(commands_path);
                let _ = command_store.sync_from_db(&db_manager);
                app.manage(command_store);
                
                // Pré-carrega/atualiza cache de comandos do sistema em background se estiver vazio
                let db_clone = db_manager.clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(count) = db_clone.count_cached_system_commands() {
                        if count == 0 {
                            let _ = tauri::async_runtime::spawn_blocking(move || {
                                let items = system_commands::scan_optimized_system_commands();
                                let _ = db_clone.save_system_commands(&items);
                            }).await;
                        }
                    }
                });

                app.manage(db_manager);
            } else {
                app.manage(CommandStore::new(commands_path));
            }

            // Registra HistoryStore como fallback gerenciado
            app.manage(HistoryStore::new(history_path));

            // Atalho global: Ctrl+Space traz a janela para o primeiro plano
            let shortcut = Shortcut::new(
                Some(Modifiers::CONTROL),
                Code::Space,
            );

            let app_handle = app.handle().clone();
            crate::wsl::start_wsl_focus_listener(app_handle.clone());

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
            commands_store::get_backup_status,
            commands_store::trigger_manual_backup,
            commands_store::restore_from_auto_backup,
            commands_store::check_auto_backup_available,
            check_update,
            install_update,
            executor::run_command,
            executor::list_plugins,
            executor::open_plugin_folder,
            system_commands::list_system_commands,
            system_commands::refresh_system_commands,
            history::list_history,
            history::clear_history,
            favicon::fetch_favicon,
            exe_icon::extract_exe_icon,
            icon_importer::import_custom_icon,
            paths::get_data_dir,
            paths::get_plugins_dir,
            paths::get_logs_dir,
            paths::get_icons_dir,
            paths::get_backup_dir,
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
            runtimes::check_runtime_status,
            runtimes::check_all_runtimes,
            logger::log_event,
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
