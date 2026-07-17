use crate::paths::logs_dir;
use log::{Level, LevelFilter, Metadata, Record};
use std::fs::OpenOptions;
use std::io::Write;
use std::sync::Mutex;

static LOG_FILE: Mutex<Option<std::fs::File>> = Mutex::new(None);

/// Inicializa o logger com sink em arquivo + console.
pub fn init() {
    let _ = env_logger::Builder::from_env(
        env_logger::Env::default().default_filter_or("info"),
    )
    .format(|buf, record| {
        writeln!(
            buf,
            "[{}] [{}] [{}] {}",
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
            record.level(),
            record.target(),
            record.args()
        )
    })
    .target(env_logger::Target::Stderr)
    .filter_level(LevelFilter::Info)
    .try_init();

    // Abre o arquivo de log.
    let path = logs_dir().join("toolbox.log");
    let _ = std::fs::create_dir_all(logs_dir());
    if let Ok(file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
    {
        let mut guard = LOG_FILE.lock().unwrap();
        *guard = Some(file);
    }
}

/// Escreve uma linha adicional no arquivo de log.
pub fn write_line(level: Level, target: &str, message: &str) {
    let line = format!(
        "[{}] [{}] [{}] {}\n",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
        level,
        target,
        message
    );
    if let Ok(mut guard) = LOG_FILE.lock() {
        if let Some(file) = guard.as_mut() {
            let _ = file.write_all(line.as_bytes());
        }
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
