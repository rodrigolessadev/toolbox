@echo off
setlocal
echo Removendo Toolbox WSL2 Focus Bridge da Inicializacao do Windows...

set "TARGET_FILE=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\toolbox-focus-bridge.cmd"

if exist "%TARGET_FILE%" (
    del /f /q "%TARGET_FILE%"
    echo [SUCESSO] O Focus Bridge foi removido da inicializacao do Windows.
) else (
    echo [INFO] O arquivo de inicializacao nao foi encontrado. Nada a remover.
)

pause
