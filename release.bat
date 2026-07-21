@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

REM ============================================================
REM  Toolbox - Script de Release
REM
REM  Pre-requisitos:
REM    - commits\<versao>.txt    (mensagem do commit)
REM    - releases\<versao>.md     (notas do release)
REM
REM  O script:
REM    1. Detecta a versao atual em src-tauri\tauri.conf.json
REM    2. Pede a nova versao
REM    3. Le os arquivos commits\<versao>.txt e releases\<versao>.md
REM    4. Pede confirmacao
REM    5. Atualiza versao apenas no tauri.conf.json
REM    6. Faz commit da mudanca de versao usando o .txt
REM    7. Roda npm run tauri:build
REM    8. Copia o instalador para releases\
REM    9. Insere a entrada do release em releases.md com link para o instalador
REM   10. Faz commit final de releases.md
REM   11. Envia as alteracoes para o GitHub
REM ============================================================

cd /d "%~dp0"

set "REPO_ROOT=%CD%"
set "RELEASES_DIR=%REPO_ROOT%\releases"
set "COMMITS_DIR=%REPO_ROOT%\commits"
set "RELEASE_MD=%REPO_ROOT%\releases.md"
set "TAURI_CONF=%REPO_ROOT%\src-tauri\tauri.conf.json"

if not exist "%RELEASES_DIR%" mkdir "%RELEASES_DIR%"
if not exist "%COMMITS_DIR%" mkdir "%COMMITS_DIR%"

echo.
echo ============================================================
echo   Toolbox - Script de Release
echo ============================================================
echo.

REM ============================================================
REM  Detecta a versao atual via PowerShell (evita o bug
REM  de \t e \b em caminhos do Windows no node -e)
REM ============================================================
echo [1/8] Detectando versao atual em tauri.conf.json...
for /f "usebackq delims=" %%v in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content -LiteralPath 'src-tauri\tauri.conf.json' -Raw | ConvertFrom-Json).version"`) do (
    set "CURRENT_VERSION=%%v"
)
if "!CURRENT_VERSION!"=="" (
    echo ERRO: nao foi possivel detectar a versao atual em src-tauri\tauri.conf.json
    exit /b 1
)
echo   Versao atual: !CURRENT_VERSION!
echo.

REM ============================================================
REM  Pede a nova versao
REM ============================================================
:ASK_VERSION
set "NEW_VERSION="
set /p "NEW_VERSION=Digite a nova versao (ex: 1.5.0): "
if "!NEW_VERSION!"=="" goto ASK_VERSION

REM Remove espacos
set "NEW_VERSION=!NEW_VERSION: =!"

echo.
echo Nova versao: !NEW_VERSION!
echo.

REM ============================================================
REM  Le a mensagem do commit em commits\<versao>.txt
REM ============================================================
set "COMMIT_FILE=!COMMITS_DIR!\!NEW_VERSION!.txt"
if not exist "!COMMIT_FILE!" (
    echo ERRO: arquivo de mensagem do commit nao encontrado.
    echo        Esperado: !COMMIT_FILE!
    echo        Crie o arquivo com a mensagem do commit e execute o script novamente.
    exit /b 1
)

echo Mensagem do commit (!COMMIT_FILE!):
echo ----------------------------------------
type "!COMMIT_FILE!"
echo ----------------------------------------
echo.

REM ============================================================
REM  Le as notas do release em releases\<versao>.md
REM ============================================================
set "NOTES_FILE=!RELEASES_DIR!\!NEW_VERSION!.md"
if not exist "!NOTES_FILE!" (
    echo ERRO: arquivo de notas do release nao encontrado.
    echo        Esperado: !NOTES_FILE!
    echo        Crie o arquivo markdown com as notas do release e execute o script novamente.
    exit /b 1
)

echo Notas do release (!NOTES_FILE!):
echo ----------------------------------------
type "!NOTES_FILE!"
echo ----------------------------------------
echo.

REM ============================================================
REM  Confirmacao
REM ============================================================
set "CONFIRM="
set /p "CONFIRM=Confirma o release de v!NEW_VERSION!? (S/N): "
if /i not "!CONFIRM!"=="S" (
    echo Operacao cancelada.
    exit /b 0
)
echo.

REM ============================================================
REM  Atualiza a versao no tauri.conf.json via PowerShell
REM  (Get-Content -LiteralPath evita o bug de \t e \b em caminhos)
REM ============================================================
echo [2/8] Atualizando versao em tauri.conf.json para !NEW_VERSION!...
set "UPDATE_VERSION_SCRIPT=%TEMP%\update-tauri-version.ps1"
> "%UPDATE_VERSION_SCRIPT%" echo $ErrorActionPreference = 'Stop'
>> "%UPDATE_VERSION_SCRIPT%" echo $f = '!TAURI_CONF!'
>> "%UPDATE_VERSION_SCRIPT%" echo $lines = Get-Content -LiteralPath $f
>> "%UPDATE_VERSION_SCRIPT%" echo $updated = $false
>> "%UPDATE_VERSION_SCRIPT%" echo for ($i = 0; $i -lt $lines.Count; $i++) {
>> "%UPDATE_VERSION_SCRIPT%" echo   if ($lines[$i] -match '^(?<indent>\s*)"version"\s*:') {
>> "%UPDATE_VERSION_SCRIPT%" echo     $lines[$i] = $matches.indent + '"version": "!NEW_VERSION!",'
>> "%UPDATE_VERSION_SCRIPT%" echo     $updated = $true
>> "%UPDATE_VERSION_SCRIPT%" echo     break
>> "%UPDATE_VERSION_SCRIPT%" echo   }
>> "%UPDATE_VERSION_SCRIPT%" echo }
>> "%UPDATE_VERSION_SCRIPT%" echo if (-not $updated) { throw 'Version line not found' }
>> "%UPDATE_VERSION_SCRIPT%" echo [System.IO.File]::WriteAllLines($f, $lines, [System.Text.UTF8Encoding]::new($false))
powershell -NoProfile -ExecutionPolicy Bypass -File "%UPDATE_VERSION_SCRIPT%"
if errorlevel 1 (
    echo ERRO: nao foi possivel atualizar !TAURI_CONF!
    exit /b 1
)
echo   Concluido.
echo.

REM ============================================================
REM  Commit da mudanca de versao usando o .txt
REM ============================================================
echo [3/8] Fazendo commit da mudanca de versao...
git add "!TAURI_CONF!"
git add .
git commit -F "!COMMIT_FILE!"
if errorlevel 1 (
    echo ERRO: git commit falhou. Verifique se ha alteracoes e se o git esta configurado.
    exit /b 1
)
echo.

REM ============================================================
REM  Build do instalador
REM ============================================================
echo [4/8] Rodando npm run tauri:build...
echo      (isso pode demorar alguns minutos)
echo.
call npm run tauri:build
if errorlevel 1 (
    echo ERRO: build falhou. Verifique a saida acima.
    exit /b 1
)
echo.

REM ============================================================
REM  Copia o instalador para releases\
REM ============================================================
echo [5/8] Copiando instalador para !RELEASES_DIR!\

set "INSTALLER_PATH="
set "INSTALLER_NAME="

REM Procura primeiro por .msi
for /f "delims=" %%i in ('dir /s /b /a-d "!REPO_ROOT!\src-tauri\target\release\bundle\msi\*.msi" 2^>nul') do (
    if not defined INSTALLER_PATH set "INSTALLER_PATH=%%i"
)

REM Se nao achou .msi, procura por .exe (NSIS)
if not defined INSTALLER_PATH (
    for /f "delims=" %%i in ('dir /s /b /a-d "!REPO_ROOT!\src-tauri\target\release\bundle\nsis\*.exe" 2^>nul') do (
        if not defined INSTALLER_PATH set "INSTALLER_PATH=%%i"
    )
)

if not defined INSTALLER_PATH (
    echo ERRO: instalador nao encontrado em src-tauri\target\release\bundle\
    exit /b 1
)

for %%I in ("!INSTALLER_PATH!") do set "INSTALLER_NAME=%%~nxI"

copy /Y "!INSTALLER_PATH!" "!RELEASES_DIR!\!INSTALLER_NAME!" >nul
if errorlevel 1 (
    echo ERRO: nao foi possivel copiar o instalador
    exit /b 1
)
echo   Instalador copiado: releases\!INSTALLER_NAME!
echo.

REM ============================================================
REM  Insere entrada no releases.md
REM ============================================================
echo [6/8] Atualizando releases.md...

if not exist "!RELEASE_MD!" (
    REM Cria o arquivo com o cabecalho padrao
    >  "!RELEASE_MD!" echo # Releases
    >> "!RELEASE_MD!" echo.
)

REM Pega a data atual no formato YYYY-MM-DD via PowerShell
for /f "delims=" %%d in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Date -Format yyyy-MM-dd"') do set "RELEASE_DATE=%%d"

REM Monta o bloco de release em arquivo temporario
set "TMP_RELEASE=%TEMP%\toolbox-release-!NEW_VERSION!.tmp"

>  "!TMP_RELEASE!" echo ## v!NEW_VERSION! - !RELEASE_DATE!
>> "!TMP_RELEASE!" echo.
REM Insere o conteudo do arquivo de notas
type "!NOTES_FILE!" >> "!TMP_RELEASE!"
>> "!TMP_RELEASE!" echo.
>> "!TMP_RELEASE!" echo **Instalador:** [!INSTALLER_NAME!](./releases/!INSTALLER_NAME!)
>> "!TMP_RELEASE!" echo.
>> "!TMP_RELEASE!" echo ---
>> "!TMP_RELEASE!" echo.

REM Verifica se ja existe o cabecalho # Releases
findstr /b /c:"# Releases" "!RELEASE_MD!" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    REM Existe cabecalho - insere o bloco logo apos "# Releases" + linha em branco
    set "TMP_OUT=%TEMP%\toolbox-release-md-!NEW_VERSION!.tmp"
    (
        for /f "usebackq delims=" %%a in ("!RELEASE_MD!") do (
            echo %%a
            if /i "%%a"=="# Releases" (
                echo.
                type "!TMP_RELEASE!"
            )
        )
    ) > "!TMP_OUT!"
    move /Y "!TMP_OUT!" "!RELEASE_MD!" >nul
) else (
    REM Nao existe cabecalho - adiciona o cabecalho e o bloco no topo
    set "TMP_OUT=%TEMP%\toolbox-release-md-!NEW_VERSION!.tmp"
    >  "!TMP_OUT!" echo # Releases
    >> "!TMP_OUT!" echo.
    type "!TMP_RELEASE!" >> "!TMP_OUT!"
    type "!RELEASE_MD!" >> "!TMP_OUT!"
    move /Y "!TMP_OUT!" "!RELEASE_MD!" >nul
)

del /Q "!TMP_RELEASE!" >nul 2>&1

echo   releases.md atualizado com a entrada de v!NEW_VERSION!
echo.

REM ============================================================
REM  Commit final e push
REM ============================================================
echo [7/8] Fazendo commit do release...
git add "!RELEASE_MD!" "!RELEASES_DIR!\!INSTALLER_NAME!"
git commit -m "docs: release v!NEW_VERSION!"
if errorlevel 1 (
    echo Aviso: git commit do release falhou (pode nao haver mudancas).
)

echo [8/8] Enviando alteracoes para o GitHub...
git push origin HEAD
if errorlevel 1 (
    echo ERRO: git push falhou. Verifique as configuracoes remotas e credenciais.
    exit /b 1
)

echo.
echo [9/9] Concluido.
echo.
echo ============================================================
echo   Release v!NEW_VERSION! concluido com sucesso!
echo   Instalador: !RELEASES_DIR!\!INSTALLER_NAME!
echo   Entrada:    !RELEASE_MD!
echo ============================================================
echo.

endlocal
exit /b 0
