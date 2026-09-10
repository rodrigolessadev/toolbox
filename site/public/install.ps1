# ==============================================================================
# Toolbox — Instalador Oficial para Windows (PowerShell One-Liner)
# Baixa e executa o instalador oficial mais recente (.exe)
# ==============================================================================

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo = "rodrigolessadev/toolbox"
$ApiUrl = "https://api.github.com/repos/$Repo/releases/latest"

Write-Host "⚡ [Toolbox] Verificando versão mais recente para Windows..." -ForegroundColor Cyan

try {
    $Release = Invoke-RestMethod -Uri $ApiUrl -Headers @{ "Accept" = "application/vnd.github+json" } -ErrorAction Stop
} catch {
    Write-Host "❌ Falha ao consultar a API de releases do GitHub: $_" -ForegroundColor Red
    exit 1
}

$Tag = $Release.tag_name
$Asset = $Release.assets | Where-Object { $_.name -like "Toolbox_*_x64-setup.exe" } | Select-Object -First 1

if (-not $Asset) {
    # Fallback para qualquer setup .exe
    $Asset = $Release.assets | Where-Object { $_.name -like "*setup*.exe" } | Select-Object -First 1
}

if (-not $Asset) {
    Write-Host "⚠️ Instalador .exe não encontrado na release $Tag." -ForegroundColor Yellow
    Write-Host "Visite https://github.com/$Repo/releases para download manual."
    exit 1
}

$DownloadUrl = $Asset.browser_download_url
$TempInstaller = Join-Path $env:TEMP $Asset.name

Write-Host "⬇️ Baixando Toolbox $Tag ($($Asset.name))..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempInstaller -UseBasicParsing
} catch {
    Write-Host "❌ Falha no download: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Iniciando instalador oficial do Toolbox..." -ForegroundColor Green
Start-Process -FilePath $TempInstaller
Write-Host "✅ Instalador iniciado com sucesso!" -ForegroundColor Cyan
