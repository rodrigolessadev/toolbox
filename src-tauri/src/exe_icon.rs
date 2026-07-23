use base64::Engine as _;

/// Extrai o primeiro ícone de um .exe do Windows e retorna
/// uma data URL "data:image/png;base64,..." para uso no frontend.
#[tauri::command]
pub fn extract_exe_icon(path: String) -> Result<String, String> {
    #[cfg(windows)]
    return extract_icon_windows(&path);

    #[cfg(not(windows))]
    {
        let _ = path;
        Err("Extração de ícone só é suportada no Windows.".to_string())
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Implementação Windows
// ──────────────────────────────────────────────────────────────────────────────
#[cfg(windows)]
fn extract_icon_windows(path: &str) -> Result<String, String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows::Win32::Graphics::Gdi::{
        CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, SelectObject, BITMAPINFO,
        BITMAPINFOHEADER, DIB_RGB_COLORS, RGBQUAD,
    };
    use windows::Win32::UI::Shell::ExtractIconExW;
    use windows::Win32::UI::WindowsAndMessaging::{DestroyIcon, GetIconInfo, HICON, ICONINFO};

    // Converte path para wide string (null-terminated)
    let wide: Vec<u16> = OsStr::new(path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    // Extrai o ícone grande (32×32), índice 0
    let mut large_icon: HICON = HICON::default();
    let count = unsafe {
        ExtractIconExW(
            windows::core::PCWSTR(wide.as_ptr()),
            0,
            Some(&mut large_icon),
            None,
            1,
        )
    };

    if count == 0 || large_icon.is_invalid() {
        return Err(format!("Nenhum ícone encontrado em \"{}\"", path));
    }

    // ── GetIconInfo → HBITMAP de cor ──────────────────────────────────────────
    let mut info = ICONINFO::default();
    let ok = unsafe { GetIconInfo(large_icon, &mut info) };
    if ok.is_err() {
        unsafe {
            let _ = DestroyIcon(large_icon);
        }
        return Err("GetIconInfo falhou".to_string());
    }

    let hbm_color = info.hbmColor;
    if hbm_color.is_invalid() {
        unsafe {
            let _ = DestroyIcon(large_icon);
        }
        return Err("Ícone sem bitmap de cor".to_string());
    }

    // ── GetDIBits → pixels BGRA 32-bit ───────────────────────────────────────
    const SIZE: i32 = 32;
    let mut bmi = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER {
            biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
            biWidth: SIZE,
            biHeight: -SIZE, // negativo = top-down
            biPlanes: 1,
            biBitCount: 32,
            biCompression: 0, // BI_RGB
            biSizeImage: 0,
            biXPelsPerMeter: 0,
            biYPelsPerMeter: 0,
            biClrUsed: 0,
            biClrImportant: 0,
        },
        bmiColors: [RGBQUAD::default(); 1],
    };

    let dc = unsafe { CreateCompatibleDC(None) };
    let old_obj = unsafe { SelectObject(dc, hbm_color) };

    let row_bytes = SIZE as usize * 4;
    let mut pixels = vec![0u8; row_bytes * SIZE as usize];

    let lines = unsafe {
        GetDIBits(
            dc,
            hbm_color,
            0,
            SIZE as u32,
            Some(pixels.as_mut_ptr() as *mut _),
            &mut bmi,
            DIB_RGB_COLORS,
        )
    };

    unsafe {
        SelectObject(dc, old_obj);
        let _ = DeleteDC(dc);
        let _ = DeleteObject(info.hbmColor);
        let _ = DeleteObject(info.hbmMask);
        let _ = DestroyIcon(large_icon);
    }

    if lines == 0 {
        return Err("GetDIBits retornou 0 linhas".to_string());
    }

    // Converte BGRA → RGBA (Win32 armazena como BGRA)
    for chunk in pixels.chunks_exact_mut(4) {
        chunk.swap(0, 2); // B↔R
    }

    // Codifica como PNG e converte para base64
    let png = encode_png_rgba(&pixels, SIZE as u32, SIZE as u32)?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&png);
    Ok(format!("data:image/png;base64,{}", b64))
}

// ──────────────────────────────────────────────────────────────────────────────
// Codificador PNG mínimo sem dependência externa
// RFC 2083: IHDR + IDAT (deflate stored) + IEND
// ──────────────────────────────────────────────────────────────────────────────
fn encode_png_rgba(pixels: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
    let mut out: Vec<u8> = Vec::new();
    out.extend_from_slice(b"\x89PNG\r\n\x1a\n"); // assinatura

    // IHDR
    let mut ihdr = Vec::new();
    ihdr.extend_from_slice(&width.to_be_bytes());
    ihdr.extend_from_slice(&height.to_be_bytes());
    ihdr.extend_from_slice(&[8, 6, 0, 0, 0]); // 8-bit RGBA, no filter, no interlace
    write_chunk(&mut out, b"IHDR", &ihdr);

    // IDAT: filtra cada linha com filtro None (0), depois deflate stored
    let row = (width * 4) as usize;
    let mut raw = Vec::with_capacity((row + 1) * height as usize);
    for r in 0..height as usize {
        raw.push(0); // filtro None
        raw.extend_from_slice(&pixels[r * row..(r + 1) * row]);
    }
    write_chunk(&mut out, b"IDAT", &deflate_store(&raw));

    // IEND
    write_chunk(&mut out, b"IEND", &[]);
    Ok(out)
}

fn write_chunk(out: &mut Vec<u8>, kind: &[u8; 4], data: &[u8]) {
    out.extend_from_slice(&(data.len() as u32).to_be_bytes());
    out.extend_from_slice(kind);
    out.extend_from_slice(data);
    out.extend_from_slice(&crc32(kind, data).to_be_bytes());
}

fn crc32(a: &[u8], b: &[u8]) -> u32 {
    let mut c = 0xFFFF_FFFFu32;
    for &byte in a.iter().chain(b.iter()) {
        c = CRC_TABLE[((c ^ byte as u32) & 0xFF) as usize] ^ (c >> 8);
    }
    c ^ 0xFFFF_FFFF
}

/// Deflate "stored" blocks (nível 0, sem compressão) — RFC 1951
fn deflate_store(data: &[u8]) -> Vec<u8> {
    let mut out = vec![0x78, 0x01]; // zlib header
    const BMAX: usize = 65535;
    let mut pos = 0;
    while pos < data.len() {
        let end = (pos + BMAX).min(data.len());
        let last = (end == data.len()) as u8;
        let len = (end - pos) as u16;
        out.push(last);
        out.extend_from_slice(&len.to_le_bytes());
        out.extend_from_slice(&(!len).to_le_bytes());
        out.extend_from_slice(&data[pos..end]);
        pos = end;
    }
    // Adler-32 checksum
    let (mut s1, mut s2) = (1u32, 0u32);
    for &b in data {
        s1 = (s1 + b as u32) % 65521;
        s2 = (s2 + s1) % 65521;
    }
    out.extend_from_slice(&((s2 << 16) | s1).to_be_bytes());
    out
}

static CRC_TABLE: [u32; 256] = {
    let mut t = [0u32; 256];
    let mut i = 0usize;
    while i < 256 {
        let mut c = i as u32;
        let mut k = 0;
        while k < 8 {
            if c & 1 != 0 {
                c = 0xEDB88320 ^ (c >> 1);
            } else {
                c >>= 1;
            }
            k += 1;
        }
        t[i] = c;
        i += 1;
    }
    t
};
