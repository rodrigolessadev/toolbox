// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    {
        // Garante compatibilidade do WebKitGTK com WSLg, drivers virtuais e Wayland
        if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
        if std::env::var("WEBKIT_DISABLE_COMPOSITING_MODE").is_err() {
            std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        }
        if std::env::var("WEBKIT_FORCE_SANDBOX").is_err() {
            std::env::set_var("WEBKIT_FORCE_SANDBOX", "0");
        }
    }

    toolbox_lib::run()
}
