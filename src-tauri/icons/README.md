# Ícones do aplicativo

Para que o Tauri consiga buildar o instalador, são necessários arquivos
de ícone nesta pasta:

- `32x32.png` — usado na listagem de tarefas e em alguns menus
- `128x128.png` — usado no instalador MSI
- `128x128@2x.png` — versão retina do anterior
- `icon.icns` — macOS
- `icon.ico` — Windows (obrigatório para build em Windows)

## Como gerar

### Opção 1: usar um PNG próprio

Coloque um arquivo `app-icon.png` de pelo menos 1024x1024 e rode:

```bash
# com ImageMagick
magick app-icon.png -resize 32x32 32x32.png
magick app-icon.png -resize 128x128 128x128.png
magick app-icon.png -resize 256x256 128x128@2x.png
magick app-icon.png -define icon icon.ico

# com tauri-cli (a partir do projeto)
npm run tauri icon ./app-icon.png
```

### Opção 2: baixar da web

Pesquise por "app icon template" no seu gerador favorito (Figma, Canva,
IconKitchen, etc.) e exporte nos tamanhos listados.

### Opção 3: usar o ícone padrão

Para um teste rápido, copie o `app-icon.svg` desta pasta para um
conversor online como [convertio.co](https://convertio.co/png-converter/).

## Placeholder

O SVG abaixo pode servir como ponto de partida. Mostra um raio (simbolizando
"lançamento rápido") sobre fundo azul.
