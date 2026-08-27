use chrono::{Datelike, Duration, Local, NaiveDate};
use log::{Level, LevelFilter, Metadata, Record};
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

/// Dias padrão para expurgo de logs antigos
pub const LOG_RETENTION_DAYS: i64 = 7;

static LOGS_DIR: Mutex<Option<PathBuf>> = Mutex::new(None);
static CURRENT_LOG_DATE: Mutex<Option<NaiveDate>> = Mutex::new(None);
static LOG_FILE: Mutex<Option<File>> = Mutex::new(None);
static FILE_LOGGER: FileLogger = FileLogger;

/// Formata o nome do arquivo de log baseado na data: `toolbox-DD-MM-YYYY.log`
pub fn get_log_filename(date: &NaiveDate) -> String {
    format!(
        "toolbox-{:02}-{:02}-{:04}.log",
        date.day(),
        date.month(),
        date.year()
    )
}

/// Extrai a data a partir do nome do arquivo no formato `toolbox-DD-MM-YYYY.log`
pub fn parse_log_date(filename: &str) -> Option<NaiveDate> {
    if !filename.starts_with("toolbox-") || !filename.ends_with(".log") {
        return None;
    }
    let core = filename.strip_prefix("toolbox-")?.strip_suffix(".log")?;
    let parts: Vec<&str> = core.split('-').collect();
    if parts.len() != 3 {
        return None;
    }
    let day: u32 = parts[0].parse().ok()?;
    let month: u32 = parts[1].parse().ok()?;
    let year: i32 = parts[2].parse().ok()?;
    NaiveDate::from_ymd_opt(year, month, day)
}

/// Executa a limpeza de arquivos de log antigos com base na data de referência e janela de retenção (em dias).
/// Retorna a quantidade de arquivos removidos.
pub fn cleanup_old_logs(logs_dir: &Path, reference_date: NaiveDate, retention_days: i64) -> usize {
    let mut removed_count = 0;
    let cutoff_date = reference_date - Duration::days(retention_days);

    if let Ok(entries) = fs::read_dir(logs_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                // 1. Arquivos no padrão toolbox-DD-MM-YYYY.log
                if let Some(log_date) = parse_log_date(file_name) {
                    if log_date <= cutoff_date {
                        if let Err(e) = fs::remove_file(&path) {
                            eprintln!("Aviso: Falha ao remover log antigo {:?}: {}", path, e);
                        } else {
                            removed_count += 1;
                        }
                    }
                } 
                // 2. Arquivo legado toolbox.log
                else if file_name == "toolbox.log" {
                    if let Ok(meta) = entry.metadata() {
                        if let Ok(modified) = meta.modified() {
                            if let Ok(dur) = modified.elapsed() {
                                if dur.as_secs() >= (retention_days as u64 * 86400) {
                                    let _ = fs::remove_file(&path);
                                    removed_count += 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    removed_count
}

/// Abre ou rotaciona o arquivo de log para a data especificada.
fn ensure_log_file_for_date(dir: &Path, date: NaiveDate) -> Option<File> {
    let filename = get_log_filename(&date);
    let log_path = dir.join(filename);
    OpenOptions::new().create(true).append(true).open(log_path).ok()
}

/// Inicializa o logger com sink em arquivo diário e executa o expurgo de retenção.
pub fn init(logs_path: PathBuf) {
    let _ = fs::create_dir_all(&logs_path);

    let today = Local::now().date_naive();
    let file = ensure_log_file_for_date(&logs_path, today);

    {
        let mut dir_guard = LOGS_DIR.lock().unwrap();
        *dir_guard = Some(logs_path.clone());
    }
    {
        let mut date_guard = CURRENT_LOG_DATE.lock().unwrap();
        *date_guard = Some(today);
    }
    {
        let mut file_guard = LOG_FILE.lock().unwrap();
        *file_guard = file;
    }

    // Executa a limpeza inicial de arquivos com 7 dias ou mais
    let removed = cleanup_old_logs(&logs_path, today, LOG_RETENTION_DAYS);
    if removed > 0 {
        log::info!("Limpeza de logs antigos: {} arquivo(s) expurgado(s)", removed);
    }

    let _ = log::set_logger(&FILE_LOGGER);
    log::set_max_level(LevelFilter::Info);
}

/// Escreve uma linha adicional no arquivo de log, garantindo a rotação diária transparente.
pub fn write_line(level: Level, target: &str, message: &str) {
    let now = Local::now();
    let today = now.date_naive();

    let mut file_guard = LOG_FILE.lock().unwrap();
    let mut date_guard = CURRENT_LOG_DATE.lock().unwrap();

    // Rotação diária se a data mudou
    if *date_guard != Some(today) {
        if let Ok(dir_guard) = LOGS_DIR.lock() {
            if let Some(ref dir) = *dir_guard {
                *file_guard = ensure_log_file_for_date(dir, today);
                *date_guard = Some(today);
                let _ = cleanup_old_logs(dir, today, LOG_RETENTION_DAYS);
            }
        }
    }

    let line = format!(
        "[{}] [{}] [{}] {}\n",
        now.format("%Y-%m-%d %H:%M:%S%.3f"),
        level,
        target,
        message
    );

    if let Some(file) = file_guard.as_mut() {
        let _ = file.write_all(line.as_bytes());
        let _ = file.flush();
    }
}

/// Logger customizado que escreve somente no arquivo (para registro estruturado de ações).
pub struct FileLogger;

impl log::Log for FileLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            write_line(record.level(), record.target(), &record.args().to_string());
        }
    }

    fn flush(&self) {}
}

/// Comando Tauri para registrar eventos diretamente do frontend no arquivo de log diário.
#[tauri::command]
pub fn log_event(level: String, target: String, message: String) {
    let lvl = match level.to_lowercase().as_str() {
        "error" => Level::Error,
        "warn" | "warning" => Level::Warn,
        "debug" => Level::Debug,
        "trace" => Level::Trace,
        _ => Level::Info,
    };
    write_line(lvl, &target, &message);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_test_dir(prefix: &str) -> PathBuf {
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
    fn test_log_filename_formatting() {
        let date = NaiveDate::from_ymd_opt(2026, 8, 27).unwrap();
        assert_eq!(get_log_filename(&date), "toolbox-27-08-2026.log");

        let date2 = NaiveDate::from_ymd_opt(2026, 1, 5).unwrap();
        assert_eq!(get_log_filename(&date2), "toolbox-05-01-2026.log");
    }

    #[test]
    fn test_parse_log_date() {
        let date = parse_log_date("toolbox-27-08-2026.log");
        assert_eq!(date, Some(NaiveDate::from_ymd_opt(2026, 8, 27).unwrap()));

        assert_eq!(parse_log_date("invalid-file.log"), None);
        assert_eq!(parse_log_date("toolbox-99-99-9999.log"), None);
    }

    #[test]
    fn test_cleanup_old_logs_retention_policy() {
        let dir = temp_test_dir("toolbox_log_retention_test");
        let today = NaiveDate::from_ymd_opt(2026, 8, 27).unwrap();

        // 1. Arquivo de hoje (deve ser mantido)
        let file_today = dir.join(get_log_filename(&today));
        fs::write(&file_today, "log de hoje").unwrap();

        // 2. Arquivo de 3 dias atrás (deve ser mantido)
        let date_3d = today - Duration::days(3);
        let file_3d = dir.join(get_log_filename(&date_3d));
        fs::write(&file_3d, "log de 3 dias").unwrap();

        // 3. Arquivo de 6 dias atrás (deve ser mantido)
        let date_6d = today - Duration::days(6);
        let file_6d = dir.join(get_log_filename(&date_6d));
        fs::write(&file_6d, "log de 6 dias").unwrap();

        // 4. Arquivo de 7 dias atrás (deve ser excluído por completar 1 semana)
        let date_7d = today - Duration::days(7);
        let file_7d = dir.join(get_log_filename(&date_7d));
        fs::write(&file_7d, "log de 7 dias").unwrap();

        // 5. Arquivo de 15 dias atrás (deve ser excluído)
        let date_15d = today - Duration::days(15);
        let file_15d = dir.join(get_log_filename(&date_15d));
        fs::write(&file_15d, "log de 15 dias").unwrap();

        // Executa limpeza com retenção de 7 dias
        let removed = cleanup_old_logs(&dir, today, 7);
        assert_eq!(removed, 2);

        // Valida que os arquivos recentes continuam existindo
        assert!(file_today.exists());
        assert!(file_3d.exists());
        assert!(file_6d.exists());

        // Valida que os arquivos com >= 7 dias foram excluídos
        assert!(!file_7d.exists());
        assert!(!file_15d.exists());
    }
}
