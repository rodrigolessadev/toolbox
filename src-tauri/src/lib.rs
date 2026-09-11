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

#[derive(serde::Serialize, Clone, Debug)]
pub struct InstallUpdateResult {
    pub success: bool,
    pub message: String,
    pub platform: String, // "windows" | "linux_appimage" | "linux_deb" | "linux_generic"
    pub command_to_run: Option<String>,
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<InstallUpdateResult, String> {
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

        Ok(InstallUpdateResult {
            success: true,
            message: "Instalador iniciado. Conceda permissão de Administrador (UAC) para concluir a atualização.".to_string(),
            platform: "windows".to_string(),
            command_to_run: None,
        })
    }

    #[cfg(not(windows))]
    {
        let current_exe = std::env::current_exe().ok();
        let is_appimage_env = std::env::var("APPIMAGE").is_ok();
        let is_wsl_env = crate::wsl::is_wsl();

        // Verifica se o executável reside em espaço do usuário (ex: ~/.local/bin/toolbox)
        let is_user_space = if let Some(ref exe) = current_exe {
            if let Ok(home) = std::env::var("HOME") {
                exe.starts_with(&home)
            } else {
                false
            }
        } else {
            false
        };

        let can_self_update = is_appimage_env || is_user_space;

        if can_self_update {
            // Se estiver em user-space e a variável APPIMAGE não estiver definida,
            // aponta para o caminho do executável para permitir a substituição atômica pelo updater
            if !is_appimage_env {
                if let Some(ref exe) = current_exe {
                    std::env::set_var("APPIMAGE", exe);
                }
            }

            log::info!("Executando download_and_install nativo em modo user-space/AppImage...");
            update
                .download_and_install(|_chunk, _total| {}, || {})
                .await
                .map_err(|e| format!("Falha ao atualizar AppImage em user-space: {e}"))?;

            // Reinício automático em background após breve delay para retorno da resposta à UI
            let app_handle = app.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(1200));
                app_handle.restart();
            });

            Ok(InstallUpdateResult {
                success: true,
                message: "Toolbox atualizado com sucesso! Reiniciando a aplicação...".to_string(),
                platform: "linux_appimage".to_string(),
                command_to_run: None,
            })
        } else {
            // Ambiente Debian / Ubuntu / WSL2 instalado em nível de sistema (/usr/bin)
            // Baixa o artefato .deb autêntico da release via HTTP e valida a assinatura ar/Debian
            let deb_url = format!(
                "https://github.com/rodrigolessadev/toolbox/releases/download/v{}/Toolbox_{}_amd64.deb",
                update.version, update.version
            );

            log::info!("Baixando pacote .deb oficial de: {}", deb_url);
            let client = reqwest::Client::builder()
                .user_agent("Toolbox-Desktop-Updater")
                .redirect(reqwest::redirect::Policy::limited(10))
                .timeout(std::time::Duration::from_secs(60))
                .build()
                .map_err(|e| format!("Falha ao criar cliente HTTP: {e}"))?;

            let response = client
                .get(&deb_url)
                .send()
                .await
                .map_err(|e| format!("Falha ao baixar pacote .deb da release: {e}"))?;

            if !response.status().is_success() {
                return Err(format!(
                    "Falha ao baixar pacote .deb (HTTP {}): {}",
                    response.status(), deb_url
                ));
            }

            let bytes = response
                .bytes()
                .await
                .map_err(|e| format!("Falha ao ler dados do pacote .deb: {e}"))?;

            validate_debian_package_header(&bytes)?;

            let target_deb = std::env::temp_dir().join(format!("toolbox_{}_amd64.deb", update.version));
            std::fs::write(&target_deb, &bytes)
                .map_err(|e| format!("Falha ao gravar pacote .deb: {e}"))?;

            let deb_path_str = target_deb.to_string_lossy().to_string();
            let install_cmd = format!("sudo dpkg -i {}", deb_path_str);

            let platform_str = if is_wsl_env { "linux_wsl" } else { "linux_deb" };
            let msg = format!(
                "Pacote v{} baixado para {}. Execute o comando abaixo no terminal com permissão root para instalar.",
                update.version, deb_path_str
            );

            Ok(InstallUpdateResult {
                success: true,
                message: msg,
                platform: platform_str.to_string(),
                command_to_run: Some(install_cmd),
            })
        }
    }
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
            let err_msg = e.to_string();
            if err_msg.contains("None of the fallback platforms") || err_msg.contains("linux-x86_64") {
                let current = app.package_info().version.to_string();
                log::info!(
                    "Verificação de atualização no Linux: plataforma linux-x86_64 não encontrada no manifesto remoto latest.json. Aplicativo considerado atualizado."
                );
                return Ok(UpdateCheckResult {
                    available: false,
                    current_version: current.clone(),
                    version: None,
                    body: Some(format!(
                        "O Toolbox está rodando na versão v{}. No Linux, novas versões (.deb ou AppImage) são gerenciadas diretamente pela página oficial de Releases.",
                        current
                    )),
                });
            }
            log::error!("Falha ao verificar atualização manualmente: {err_msg}");
            Err(err_msg)
        }
    }
}


/// Configura flags e variaveis de ambiente de renderizacao para Linux
pub fn configure_linux_rendering_environment() {
    #[cfg(target_os = "linux")]
    {
        // Desativa o renderizador DMABUF do WebKitGTK para evitar artefatos visuais (linhas em X)
        if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    configure_linux_rendering_environment();

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

            let app_handle_ctrl = app_handle.clone();
            if let Err(e) = app.global_shortcut().on_shortcut(
                shortcut,
                move |_app, _scut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(window) = app_handle_ctrl.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                },
            ) {
                eprintln!(
                    "Aviso: nao foi possivel registrar Ctrl+Space ({e}). No Linux/Wayland ou sob IBus, este atalho pode estar reservado pelo sistema. Tentando registrar fallback Alt+Space..."
                );

                let shortcut_alt = Shortcut::new(Some(Modifiers::ALT), Code::Space);
                let app_handle_alt = app_handle.clone();
                if let Err(e_alt) = app.global_shortcut().on_shortcut(
                    shortcut_alt,
                    move |_app, _scut, event| {
                        if event.state == ShortcutState::Pressed {
                            if let Some(window) = app_handle_alt.get_webview_window("main") {
                                let _ = window.unminimize();
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    },
                ) {
                    eprintln!("Aviso: nao foi possivel registrar fallback Alt+Space ({e_alt}). O app continua funcionando.");
                } else {
                    eprintln!("Atalho fallback Alt+Space registrado com sucesso!");
                }
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
            wsl::get_wsl_focus_bridge_status,
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

/// Valida o cabeçalho de um pacote Debian (.deb).
/// Pacotes Debian são arquivos no formato Unix ar e obrigatoriamente iniciam com os 8 bytes `!<arch>\n`.
pub fn validate_debian_package_header(bytes: &[u8]) -> Result<(), String> {
    if bytes.len() < 8 {
        return Err("Arquivo incompleto ou corrompido (menos de 8 bytes).".to_string());
    }
    if bytes.starts_with(&[0x1f, 0x8b]) {
        return Err("Arquivo baixado é um arquivo compactado (gzip) e não um pacote Debian (.deb).".to_string());
    }
    if !bytes.starts_with(b"!<arch>\n") {
        return Err("O arquivo baixado não possui formato Debian válido (assinatura '!<arch>\\n' ausente).".to_string());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_debian_package_header_valid() {
        let valid_deb = b"!<arch>\ndebian-binary   0           0     0     644     4         `\n2.0\n";
        assert!(validate_debian_package_header(valid_deb).is_ok());
    }

    #[test]
    fn test_validate_debian_package_header_gzip_error() {
        let gzip_data = [0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00];
        let res = validate_debian_package_header(&gzip_data);
        assert!(res.is_err());
        assert!(res.unwrap_err().contains("gzip"));
    }

    #[test]
    fn test_validate_debian_package_header_invalid_signature() {
        let invalid_data = b"<!DOCTYPE html><html><body>Error</body></html>";
        let res = validate_debian_package_header(invalid_data);
        assert!(res.is_err());
        assert!(res.unwrap_err().contains("assinatura '!<arch>\\n' ausente"));
    }

    #[test]
    fn test_validate_debian_package_header_too_short() {
        let short_data = b"!<arch";
        let res = validate_debian_package_header(short_data);
        assert!(res.is_err());
        assert!(res.unwrap_err().contains("menos de 8 bytes"));
    }

    #[test]
    #[cfg(target_os = "linux")]
    fn test_configure_linux_rendering_environment() {
        configure_linux_rendering_environment();
        assert_eq!(
            std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").unwrap(),
            "1"
        );
    }
}
