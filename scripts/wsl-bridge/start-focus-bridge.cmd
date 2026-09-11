@echo off
rem Inicia o Toolbox WSL2 Focus Bridge em segundo plano (sem janela)
start "" powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0focus-bridge.ps1"
