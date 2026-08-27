use crate::commands_store::{CommandType, CommandsFile};
use crate::db::DatabaseManager;
use crate::history::HistoryFile;
use rusqlite::params;
use std::path::Path;

/// Realiza a auto-migração de arquivos legados (commands.json, history.json, theme.txt) para o SQLite.
/// A operação é atômica (transacional) e idempotente (executa apenas se a tabela commands estiver vazia).
pub fn migrate_legacy_files_if_needed(db: &DatabaseManager, data_dir: &Path) -> Result<(), String> {
    let mut conn = db.get_connection()?;

    // 1. Verifica se já existem registros na tabela commands
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM commands", [], |row| row.get(0))
        .unwrap_or(0);

    if count > 0 {
        // Já migrado ou já possui dados no banco
        return Ok(());
    }

    let commands_json_path = data_dir.join("commands.json");
    if !commands_json_path.exists() {
        return Ok(());
    }

    log::info!("Iniciando migração automática de dados legados para SQLite...");

    let content = match std::fs::read_to_string(&commands_json_path) {
        Ok(c) => c,
        Err(e) => {
            log::warn!("Não foi possível ler commands.json para migração: {e}");
            return Ok(());
        }
    };

    let legacy_commands: CommandsFile = match serde_json::from_str(&content) {
        Ok(data) => data,
        Err(e) => {
            log::warn!("Formato inválido em commands.json para migração: {e}");
            return Ok(());
        }
    };

    let tx = conn.transaction().map_err(|e| format!("Erro ao iniciar transação: {e}"))?;

    // 2. Migração dos Comandos
    for (name, entry) in legacy_commands.commands {
        let kind_str = match entry.kind {
            CommandType::Link => "link",
            CommandType::Plugin => "plugin",
            CommandType::Application => "application",
            CommandType::Script => "script",
            CommandType::Clipboard => "clipboard",
        };

        tx.execute(
            "INSERT OR REPLACE INTO commands (
                name, type, path, args, run_as_admin, script_type, script_content, 
                text_content, description, url, icon, favorite, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), datetime('now'))",
            params![
                name,
                kind_str,
                entry.path,
                entry.args,
                entry.run_as_admin.unwrap_or(false) as i32,
                entry.script_type,
                entry.script_content,
                entry.text_content,
                entry.description,
                entry.url,
                entry.icon,
                entry.favorite as i32,
                entry.created_at,
            ],
        ).map_err(|e| format!("Erro ao migrar comando '{name}': {e}"))?;
    }

    // 3. Migração do Histórico Legado (se existir)
    let history_paths = [
        data_dir.join("data").join("history.json"),
        data_dir.join("history.json"),
    ];

    for hpath in &history_paths {
        if hpath.exists() {
            if let Ok(hcontent) = std::fs::read_to_string(hpath) {
                if let Ok(hfile) = serde_json::from_str::<HistoryFile>(&hcontent) {
                    for hentry in hfile.entries {
                        let hkind = match hentry.command_type {
                            CommandType::Link => "link",
                            CommandType::Plugin => "plugin",
                            CommandType::Application => "application",
                            CommandType::Script => "script",
                            CommandType::Clipboard => "clipboard",
                        };
                        tx.execute(
                            "INSERT INTO history (command_name, command_type, timestamp, success, duration_ms)
                             VALUES (?, ?, ?, ?, NULL)",
                            params![
                                hentry.command,
                                hkind,
                                hentry.timestamp,
                                hentry.success as i32
                            ],
                        ).ok();
                    }
                }
            }
            break;
        }
    }

    // 4. Migração de Tema/Preferências
    let theme_path = data_dir.join("theme.txt");
    if theme_path.exists() {
        if let Ok(theme_content) = std::fs::read_to_string(&theme_path) {
            let theme_val = theme_content.trim();
            if !theme_val.is_empty() {
                tx.execute(
                    "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('theme', ?, datetime('now'))",
                    params![theme_val],
                ).ok();
            }
        }
    }

    // Confirma a transação
    tx.commit().map_err(|e| format!("Erro ao confirmar transação de migração: {e}"))?;

    // 5. Gera snapshot/backup de segurança
    let backup_path = data_dir.join("commands.json.migrated.bak");
    if let Err(e) = std::fs::copy(&commands_json_path, &backup_path) {
        log::warn!("Aviso: Falha ao gerar backup 'commands.json.migrated.bak': {e}");
    }

    log::info!("Migração transparente para SQLite concluída com sucesso!");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn temp_test_dir(prefix: &str) -> std::path::PathBuf {
        use std::time::{SystemTime, UNIX_EPOCH};
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0);
        let path = std::env::temp_dir().join(format!("{}_{}", prefix, nanos));
        let _ = fs::create_dir_all(&path);
        path
    }

    #[test]
    fn test_migration_from_legacy_files_success() {
        let data_dir = temp_test_dir("toolbox_migration_test");
        let db_path = data_dir.join("toolbox.db");
        let db = DatabaseManager::new(db_path).unwrap();

        // Cria commands.json mock
        let commands_json = r#"{
            "commands": {
                "Google": {
                    "type": "link",
                    "url": "https://google.com",
                    "favorite": true,
                    "created_at": "2026-08-27T10:00:00Z"
                },
                "Notepad": {
                    "type": "application",
                    "path": "notepad.exe",
                    "favorite": false
                }
            }
        }"#;
        fs::write(data_dir.join("commands.json"), commands_json).unwrap();

        // Cria theme.txt
        fs::write(data_dir.join("theme.txt"), "dark").unwrap();

        // Executa migração
        let res = migrate_legacy_files_if_needed(&db, &data_dir);
        assert!(res.is_ok());

        // Valida comandos no banco
        let conn = db.get_connection().unwrap();
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM commands", [], |r| r.get(0)).unwrap();
        assert_eq!(count, 2);

        let google_url: String = conn.query_row("SELECT url FROM commands WHERE name = 'Google'", [], |r| r.get(0)).unwrap();
        assert_eq!(google_url, "https://google.com");

        let google_fav: i32 = conn.query_row("SELECT favorite FROM commands WHERE name = 'Google'", [], |r| r.get(0)).unwrap();
        assert_eq!(google_fav, 1);

        // Valida tema no banco
        let theme: String = conn.query_row("SELECT value FROM settings WHERE key = 'theme'", [], |r| r.get(0)).unwrap();
        assert_eq!(theme, "dark");

        // Valida criação do backup
        assert!(data_dir.join("commands.json.migrated.bak").exists());
    }

    #[test]
    fn test_migration_is_idempotent() {
        let data_dir = temp_test_dir("toolbox_idempotent_test");
        let db_path = data_dir.join("toolbox.db");
        let db = DatabaseManager::new(db_path).unwrap();

        // Insere um registro prévio no banco
        {
            let conn = db.get_connection().unwrap();
            conn.execute(
                "INSERT INTO commands (name, type) VALUES ('Existente', 'link')",
                [],
            ).unwrap();
        }

        // Cria commands.json com outro comando
        let commands_json = r#"{
            "commands": {
                "Novo": { "type": "link", "url": "https://exemplo.com", "favorite": false }
            }
        }"#;
        fs::write(data_dir.join("commands.json"), commands_json).unwrap();

        // Executa migração
        let res = migrate_legacy_files_if_needed(&db, &data_dir);
        assert!(res.is_ok());

        // Como o banco já tinha registros, a migração não sobrescreve
        let conn = db.get_connection().unwrap();
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM commands", [], |r| r.get(0)).unwrap();
        assert_eq!(count, 1);
    }
}
