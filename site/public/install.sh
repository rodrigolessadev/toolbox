#!/usr/bin/env bash
set -e

# ==============================================================================
# Toolbox — Instalador Oficial para Linux (Debian / Ubuntu / WSL2)
# ==============================================================================

REPO="rodrigolessadev/toolbox"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"

echo "⚡ [Toolbox] Verificando versão mais recente para Linux..."

RELEASE_JSON=$(curl -fsSL -H "Accept: application/vnd.github+json" "$API_URL" 2>/dev/null || true)

if [ -z "$RELEASE_JSON" ]; then
    echo "❌ Falha ao conectar à API de releases do GitHub."
    exit 1
fi

DEB_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": "[^"]*\.deb"' | head -n 1 | cut -d '"' -f 4 || true)
TAG_NAME=$(echo "$RELEASE_JSON" | grep -o '"tag_name": "[^"]*"' | head -n 1 | cut -d '"' -f 4 || true)

if [ -z "$DEB_URL" ]; then
    echo "⚠️ Nenhum pacote .deb encontrado na release mais recente (${TAG_NAME})."
    echo "Visite https://github.com/${REPO}/releases para mais opções de download."
    exit 1
fi

TMP_DEB="/tmp/toolbox_${TAG_NAME}_amd64.deb"
echo "⬇️ Baixando Toolbox ${TAG_NAME}..."
curl -fsSL -o "$TMP_DEB" "$DEB_URL"

echo "📦 Instalando via dpkg (requer privilégios sudo)..."
if command -v sudo >/dev/null 2>&1; then
    sudo dpkg -i "$TMP_DEB" || sudo apt-get install -f -y
else
    dpkg -i "$TMP_DEB" || apt-get install -f -y
fi

rm -f "$TMP_DEB"
echo "✅ Toolbox ${TAG_NAME} instalado com sucesso!"
echo "Digite 'toolbox' no terminal para iniciar ou acerte o atalho no seu lançador de aplicativos."
