use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::path::PathBuf;

pub type DbPool = Pool<SqliteConnectionManager>;

#[derive(Clone)]
pub struct DatabaseManager {
    pub pool: DbPool,
    pub db_path: PathBuf,
}

impl DatabaseManager {
    pub fn new(db_path: PathBuf) -> Result<Self, String> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let manager = SqliteConnectionManager::file(&db_path)
            .with_init(|conn| {
                conn.execute_batch("
                    PRAGMA journal_mode = WAL;
                    PRAGMA synchronous = NORMAL;
                    PRAGMA foreign_keys = ON;
                    PRAGMA busy_timeout = 5000;
                ")
            });

        let pool = Pool::builder()
            .max_size(8)
            .build(manager)
            .map_err(|e| e.to_string())?;

        let db = Self { pool, db_path };
        db.init_schema()?;
        Ok(db)
    }

    pub fn get_connection(&self) -> Result<r2d2::PooledConnection<SqliteConnectionManager>, String> {
        self.pool.get().map_err(|e| e.to_string())
    }

    pub fn init_schema(&self) -> Result<(), String> {
        let conn = self.get_connection()?;
        conn.execute_batch("
            -- Comandos Cadastrados
            CREATE TABLE IF NOT EXISTS commands (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                type TEXT NOT NULL,
                path TEXT,
                args TEXT,
                run_as_admin INTEGER DEFAULT 0,
                script_type TEXT,
                script_content TEXT,
                text_content TEXT,
                description TEXT,
                url TEXT,
                icon TEXT,
                favorite INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_commands_type ON commands(type);
            CREATE INDEX IF NOT EXISTS idx_commands_favorite ON commands(favorite);

            -- Histórico de Execuções Ilimitado
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command_name TEXT NOT NULL,
                command_type TEXT NOT NULL,
                timestamp TEXT DEFAULT (datetime('now')),
                success INTEGER NOT NULL,
                duration_ms INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC);

            -- Preferências e Configurações Globais
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now'))
            );

            -- Cache de Comandos do Sistema Operacional
            CREATE TABLE IF NOT EXISTS system_commands_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                path TEXT NOT NULL,
                description TEXT,
                is_elevated_required INTEGER DEFAULT 0,
                source TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_sys_cmd_name ON system_commands_cache(name);
        ").map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Retorna todos os comandos do sistema cacheados no SQLite ordenados por nome
    pub fn get_cached_system_commands(&self) -> Result<Vec<crate::system_commands::SystemCommandItem>, String> {
        let conn = self.get_connection()?;
        let mut stmt = conn.prepare("
            SELECT name, path, description, is_elevated_required
            FROM system_commands_cache
            ORDER BY name ASC
        ").map_err(|e| e.to_string())?;

        let rows = stmt.query_map([], |row| {
            let name: String = row.get(0)?;
            let path: String = row.get(1)?;
            let description: Option<String> = row.get(2)?;
            let is_elevated_int: i32 = row.get(3)?;
            Ok(crate::system_commands::SystemCommandItem {
                name,
                path,
                description,
                is_elevated_required: is_elevated_int != 0,
            })
        }).map_err(|e| e.to_string())?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(item) = r {
                list.push(item);
            }
        }
        Ok(list)
    }

    /// Salva em lote a lista de comandos escaneados de forma idempotente
    pub fn save_system_commands(&self, items: &[crate::system_commands::SystemCommandItem]) -> Result<(), String> {
        let mut conn = self.get_connection()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        {
            let mut stmt = tx.prepare("
                INSERT INTO system_commands_cache (name, path, description, is_elevated_required, source, updated_at)
                VALUES (?1, ?2, ?3, ?4, 'scan', datetime('now'))
                ON CONFLICT(name) DO UPDATE SET
                    path = excluded.path,
                    description = excluded.description,
                    is_elevated_required = excluded.is_elevated_required,
                    updated_at = datetime('now')
            ").map_err(|e| e.to_string())?;

            for it in items {
                stmt.execute(rusqlite::params![
                    it.name,
                    it.path,
                    it.description,
                    if it.is_elevated_required { 1 } else { 0 }
                ]).map_err(|e| e.to_string())?;
            }
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Retorna o total de comandos registrados no cache
    pub fn count_cached_system_commands(&self) -> Result<usize, String> {
        let conn = self.get_connection()?;
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM system_commands_cache",
            [],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;
        Ok(count as usize)
    }

    /// Limpa todos os comandos cacheados do sistema
    pub fn clear_cached_system_commands(&self) -> Result<(), String> {
        let conn = self.get_connection()?;
        conn.execute("DELETE FROM system_commands_cache", []).map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Helper para verificar integridade e versão do banco
    pub fn ping(&self) -> Result<bool, String> {
        let conn = self.get_connection()?;
        let result: i64 = conn
            .query_row("SELECT 1", [], |row| row.get(0))
            .map_err(|e| e.to_string())?;
        Ok(result == 1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::params;

    fn create_test_db() -> DatabaseManager {
        let temp_dir = std::env::temp_dir().join(format!("toolbox_test_{}", paths_now()));
        let db_path = temp_dir.join("test_toolbox.db");
        DatabaseManager::new(db_path).expect("Falha ao criar banco de teste")
    }

    fn paths_now() -> u128 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    }

    #[test]
    fn test_database_init_and_ping() {
        let db = create_test_db();
        assert!(db.ping().unwrap());
        assert!(db.db_path.exists());
    }

    #[test]
    fn test_commands_table_operations() {
        let db = create_test_db();
        let conn = db.get_connection().unwrap();

        // Inserção
        conn.execute(
            "INSERT INTO commands (name, type, favorite) VALUES (?, ?, ?)",
            params!["Meu Comando", "script", 1],
        ).unwrap();

        // Consulta
        let (name, kind, fav): (String, String, i32) = conn
            .query_row(
                "SELECT name, type, favorite FROM commands WHERE name = ?",
                params!["Meu Comando"],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .unwrap();

        assert_eq!(name, "Meu Comando");
        assert_eq!(kind, "script");
        assert_eq!(fav, 1);
    }

    #[test]
    fn test_history_table_operations() {
        let db = create_test_db();
        let conn = db.get_connection().unwrap();

        conn.execute(
            "INSERT INTO history (command_name, command_type, success, duration_ms) VALUES (?, ?, ?, ?)",
            params!["Comando Teste", "plugin", 1, 150],
        ).unwrap();

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM history WHERE success = 1", [], |row| row.get(0))
            .unwrap();

        assert_eq!(count, 1);
    }

    #[test]
    fn test_settings_table_operations() {
        let db = create_test_db();
        let conn = db.get_connection().unwrap();

        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            params!["theme", "dark"],
        ).unwrap();

        let val: String = conn
            .query_row("SELECT value FROM settings WHERE key = ?", params!["theme"], |row| row.get(0))
            .unwrap();

        assert_eq!(val, "dark");
    }

    #[test]
    fn test_system_commands_cache_operations() {
        let db = create_test_db();
        assert_eq!(db.count_cached_system_commands().unwrap(), 0);

        let items = vec![
            crate::system_commands::SystemCommandItem {
                name: "notepad".to_string(),
                path: "notepad.exe".to_string(),
                description: Some("Bloco de Notas".to_string()),
                is_elevated_required: false,
            },
            crate::system_commands::SystemCommandItem {
                name: "regedit".to_string(),
                path: "regedit.exe".to_string(),
                description: Some("Editor do Registro".to_string()),
                is_elevated_required: true,
            },
        ];

        db.save_system_commands(&items).unwrap();
        assert_eq!(db.count_cached_system_commands().unwrap(), 2);

        let cached = db.get_cached_system_commands().unwrap();
        assert_eq!(cached.len(), 2);
        assert_eq!(cached[0].name, "notepad");
        assert!(!cached[0].is_elevated_required);
        assert_eq!(cached[1].name, "regedit");
        assert!(cached[1].is_elevated_required);

        // Idempotência (atualização)
        let updated_items = vec![
            crate::system_commands::SystemCommandItem {
                name: "notepad".to_string(),
                path: r"C:\Windows\notepad.exe".to_string(),
                description: Some("Bloco de Notas Atualizado".to_string()),
                is_elevated_required: false,
            },
        ];
        db.save_system_commands(&updated_items).unwrap();
        assert_eq!(db.count_cached_system_commands().unwrap(), 2);

        let updated_cached = db.get_cached_system_commands().unwrap();
        let notepad = updated_cached.iter().find(|i| i.name == "notepad").unwrap();
        assert_eq!(notepad.path, r"C:\Windows\notepad.exe");
        assert_eq!(notepad.description, Some("Bloco de Notas Atualizado".to_string()));

        // Limpeza
        db.clear_cached_system_commands().unwrap();
        assert_eq!(db.count_cached_system_commands().unwrap(), 0);
    }
}
