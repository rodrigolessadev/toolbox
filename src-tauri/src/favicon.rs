use base64::Engine;
use reqwest::header::CONTENT_TYPE;
use std::time::Duration;
use url::Url;

#[tauri::command]
pub async fn fetch_favicon(url: String) -> Result<String, String> {
    let parsed = Url::parse(&url).map_err(|e| format!("URL inválida: {}", e))?;
    let host = parsed.host_str().ok_or("URL sem domínio")?.to_string();
    let base = format!("{}://{}", parsed.scheme(), host);

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (compatible; Toolbox-Favicon/1.0)")
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    // 1) Tenta encontrar <link rel="icon"> no HTML
    if let Some(icon_href) = find_icon_in_html(&client, &url).await {
        let resolved = resolve_url(&icon_href, &parsed.scheme(), &host);
        if let Some(data_url) = try_download(&client, &resolved).await {
            return Ok(data_url);
        }
    }

    // 2) Fallback para /favicon.ico e /favicon.png
    for path in &["/favicon.ico", "/favicon.png"] {
        let candidate = format!("{}{}", base, path);
        if let Some(data_url) = try_download(&client, &candidate).await {
            return Ok(data_url);
        }
    }

    Err("Não foi possível obter o ícone do site".to_string())
}

async fn find_icon_in_html(client: &reqwest::Client, url: &str) -> Option<String> {
    let resp = client.get(url).send().await.ok()?;
    let html = resp.text().await.ok()?;
    let html_lower = html.to_lowercase();

    for pattern in &["rel=\"icon\"", "rel='icon'", "rel=icon"] {
        let pos = match html_lower.find(pattern) {
            Some(p) => p,
            None => continue,
        };
        let before = &html[..pos];
        let link_start = before.rfind("<link")?;
        let link_end_abs = html_lower[pos..]
            .find('>')
            .map(|p| pos + p + 1)
            .unwrap_or(html.len());
        let link_tag = &html[link_start..link_end_abs];
        let link_lower = link_tag.to_lowercase();

        for attr in &["href=\"", "href='"] {
            let hp = match link_lower.find(attr) {
                Some(p) => p,
                None => continue,
            };
            let after = &link_tag[hp + attr.len()..];
            let quote = attr.chars().last()?;
            let end = after.find(quote)?;
            return Some(after[..end].to_string());
        }
    }
    None
}

async fn try_download(client: &reqwest::Client, url: &str) -> Option<String> {
    let resp = client.get(url).send().await.ok()?;
    if !resp.status().is_success() {
        return None;
    }

    // ✅ Captura o content-type ANTES de mover resp para bytes()
    let content_type = resp
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/x-icon")
        .to_string();

    let bytes = resp.bytes().await.ok()?;
    if bytes.is_empty() || bytes.len() > 200_000 {
        return None;
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Some(format!("data:{};base64,{}", content_type, b64))
}

fn resolve_url(href: &str, scheme: &str, host: &str) -> String {
    if href.starts_with("http://") || href.starts_with("https://") {
        href.to_string()
    } else if let Some(stripped) = href.strip_prefix("//") {
        format!("{}://{}", scheme, stripped)
    } else if href.starts_with('/') {
        format!("{}://{}{}", scheme, host, href)
    } else {
        format!("{}://{}/{}", scheme, host, href)
    }
}
