use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager};

pub fn handle_plugin_invoke(app: &AppHandle, plugin_id: &str, payload: &str) {
    let req: Value = serde_json::from_str(payload).unwrap_or(Value::Null);
    let (cmd, args) = (
        req.get("cmd").and_then(|v| v.as_str()).unwrap_or(""),
        req.get("args").cloned().unwrap_or(Value::Null),
    );
    let response = match cmd {
        "getDataDir" => json!({ "ok": true, "data": app.path().app_data_dir().ok() }),
        "getCommandsFile" => json!({ "ok": true, "data": crate::paths::commands_file() }),
        "toast" => {
            let _ = app.emit_to(format!("plugin-{plugin_id}"), "toolbox:toast", &args);
            json!({ "ok": true })
        }
        "openFileDialog" => {
            /* tauri-plugin-dialog */
            json!({ "ok": true })
        }
        "saveFileDialog" => {
            /* tauri-plugin-dialog */
            json!({ "ok": true })
        }
        "setTheme" => {
            let _ = app.emit("toolbox:theme-changed", &args);
            json!({ "ok": true })
        }
        _ => json!({ "ok": false, "error": format!("Comando desconhecido: {cmd}") }),
    };
    let _ = app.emit_to(format!("plugin-{plugin_id}"), "toolbox:response", &response);
}
