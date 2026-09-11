@echo off
setlocal
echo Instalando Toolbox WSL2 Focus Bridge na Inicializacao do Windows...

set "TARGET_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET_FILE=%TARGET_DIR%\toolbox-focus-bridge.cmd"
set "SOURCE_FILE=%~dp0start-focus-bridge.cmd"

echo call "%SOURCE_FILE%" > "%TARGET_FILE%"

if exist "%TARGET_FILE%" (
    echo [SUCESSO] O Focus Bridge foi configurado para iniciar automaticamente com o Windows.
    echo Arquivo criado em: "%TARGET_FILE%"
    echo Iniciando o Focus Bridge agora em segundo plano...
    call "%SOURCE_FILE%"
) else (
    echo [ERRO] Nao foi possivel criar o arquivo de inicializacao em "%TARGET_FILE%".
)

pause
