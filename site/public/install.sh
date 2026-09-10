#!/usr/bin/env bash
set -e

# ==============================================================================
# Toolbox — Instalador Oficial para Linux (Ubuntu / Debian / WSL2)
# Suporta instalação em Espaço de Usuário (User-Space) sem sudo com 1-Click Update
# ==============================================================================

REPO="rodrigolessadev/toolbox"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"
INSTALL_MODE="user" # "user" (padrão, AppImage em ~/.local/bin) ou "deb" (pacote de sistema via dpkg)

for arg in "$@"; do
    case "$arg" in
        --deb|--system)
            INSTALL_MODE="deb"
            ;;
        --user|--appimage)
            INSTALL_MODE="user"
            ;;
        --help|-h)
            echo "Uso: install.sh [opções]"
            echo "Opções:"
            echo "  --user       (Padrão) Instala em ~/.local/bin/toolbox via AppImage (sem necessidade de root/sudo)"
            echo "  --deb        Instala pacote de sistema .deb em /usr/bin via dpkg (requer privilégios sudo)"
            exit 0
            ;;
    esac
done

echo "⚡ [Toolbox] Verificando versão mais recente para Linux..."

RELEASE_JSON=$(curl -fsSL -H "Accept: application/vnd.github+json" "$API_URL" 2>/dev/null || true)

if [ -z "$RELEASE_JSON" ]; then
    echo "❌ Falha ao conectar à API de releases do GitHub."
    exit 1
fi

TAG_NAME=$(echo "$RELEASE_JSON" | grep -o '"tag_name": "[^"]*"' | head -n 1 | cut -d '"' -f 4 || true)

if [ "$INSTALL_MODE" = "deb" ]; then
    DEB_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": "[^"]*\.deb"' | head -n 1 | cut -d '"' -f 4 || true)
    if [ -z "$DEB_URL" ]; then
        echo "⚠️ Nenhum pacote .deb encontrado na release mais recente (${TAG_NAME})."
        exit 1
    fi

    TMP_DEB="/tmp/toolbox_${TAG_NAME}_amd64.deb"
    echo "⬇️ Baixando pacote Debian do Toolbox ${TAG_NAME}..."
    curl -fsSL -o "$TMP_DEB" "$DEB_URL"

    echo "📦 Instalando via dpkg (requer privilégios sudo)..."
    if command -v sudo >/dev/null 2>&1; then
        sudo dpkg -i "$TMP_DEB" || sudo apt-get install -f -y
    else
        dpkg -i "$TMP_DEB" || apt-get install -f -y
    fi

    rm -f "$TMP_DEB"
    echo "✅ Toolbox ${TAG_NAME} instalado com sucesso em /usr/bin/toolbox!"
    echo "Digite 'toolbox' no terminal para iniciar."
    exit 0
fi

# Modo Padrão: User-Space (AppImage)
APPIMAGE_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": "[^"]*amd64\.AppImage"' | head -n 1 | cut -d '"' -f 4 || true)

# Fallback se AppImage não estiver listado diretamente
if [ -z "$APPIMAGE_URL" ]; then
    APPIMAGE_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": "[^"]*\.AppImage"' | head -n 1 | cut -d '"' -f 4 || true)
fi

if [ -z "$APPIMAGE_URL" ]; then
    echo "⚠️ AppImage não localizado na release ${TAG_NAME}. Recorrendo ao pacote .deb..."
    TMP_DEB="/tmp/toolbox_${TAG_NAME}_amd64.deb"
    DEB_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": "[^"]*\.deb"' | head -n 1 | cut -d '"' -f 4 || true)
    curl -fsSL -o "$TMP_DEB" "$DEB_URL"
    sudo dpkg -i "$TMP_DEB" || sudo apt-get install -f -y
    rm -f "$TMP_DEB"
    exit 0
fi

BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
TARGET_BIN="$BIN_DIR/toolbox"

mkdir -p "$BIN_DIR" "$APP_DIR"

echo "⬇️ Baixando Toolbox ${TAG_NAME} (AppImage User-Space)..."
curl -fsSL -o "${TARGET_BIN}.tmp" "$APPIMAGE_URL"
chmod +x "${TARGET_BIN}.tmp"
mv -f "${TARGET_BIN}.tmp" "$TARGET_BIN"

# Cria lançador de desktop de usuário
cat <<EOF > "$APP_DIR/toolbox.desktop"
[Desktop Entry]
Name=Toolbox
Comment=Launcher inteligente com plugins
Exec=$TARGET_BIN %U
Icon=toolbox
Terminal=false
Type=Application
Categories=Utility;
StartupWMClass=Toolbox
EOF
chmod +x "$APP_DIR/toolbox.desktop"

# Assegura que ~/.local/bin está no PATH do usuário
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    if [ -f "$HOME/.bashrc" ] && ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$HOME/.bashrc"; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    fi
    if [ -f "$HOME/.zshrc" ] && ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$HOME/.zshrc"; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
    fi
    export PATH="$BIN_DIR:$PATH"
fi

echo ""
echo "🎉 Toolbox ${TAG_NAME} instalado com sucesso em: $TARGET_BIN"
echo "✨ Instalação 100% em espaço de usuário (sem root/sudo)."
echo "🔄 Atualizações futuras serão feitas em 1-clique diretamente pelo aplicativo."
echo "🚀 Digite 'toolbox' para iniciar ou procure pelo atalho no seu menu de aplicativos!"
