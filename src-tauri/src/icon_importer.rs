use base64::Engine;
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use crate::paths;

pub const MAX_ICON_SIZE_BYTES: u64 = 5 * 1024 * 1024; // 5 MB

pub fn simple_hash(bytes: &[u8]) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325;
    for &b in bytes {
        h = (h ^ (b as u64)).wrapping_mul(0x100000001b3);
    }
    h
}

#[tauri::command]
pub fn import_custom_icon(source_path: String, app: AppHandle) -> Result<String, String> {
    let src = PathBuf::from(&source_path);
    if !src.exists() || !src.is_file() {
        return Err("O arquivo de ícone selecionado não existe.".to_string());
    }

    let meta = fs::metadata(&src).map_err(|e| e.to_string())?;
    if meta.len() > MAX_ICON_SIZE_BYTES {
        return Err("O tamanho do ícone não pode exceder 5 MB.".to_string());
    }

    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    let mime_type = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "ico" => "image/x-icon",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        _ => return Err("Formato não suportado. Use PNG, ICO, SVG, JPG ou WEBP.".to_string()),
    };

    let icons_dir = paths::icons_dir(&app);
    fs::create_dir_all(&icons_dir).map_err(|e| format!("Falha ao criar diretório de ícones: {e}"))?;

    let bytes = fs::read(&src).map_err(|e| format!("Falha ao ler arquivo de origem: {e}"))?;

    let hash = format!("{:016x}", simple_hash(&bytes));
    let timestamp = paths::now();
    let dest_filename = format!("custom_icon_{}_{}.{}", timestamp, &hash[..8], ext);
    let dest_path = icons_dir.join(dest_filename);

    fs::write(&dest_path, &bytes).map_err(|e| format!("Falha ao salvar ícone no Toolbox: {e}"))?;

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime_type, b64))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_hash() {
        let h1 = simple_hash(b"hello world");
        let h2 = simple_hash(b"hello world");
        assert_eq!(h1, h2);
        assert_ne!(h1, simple_hash(b"other"));
    }

    #[test]
    fn test_max_icon_size() {
        assert_eq!(MAX_ICON_SIZE_BYTES, 5 * 1024 * 1024);
    }
}
