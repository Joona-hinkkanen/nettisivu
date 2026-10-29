@echo off
rem Kaynnistaa automaattisen commit+push -seurannan.
rem Lopeta sulkemalla ikkuna tai painamalla Ctrl+C.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\auto-commit.ps1" %*
pause
