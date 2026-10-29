@echo off
setlocal
cd /d "%~dp0"

set "NODE_BIN="
where node >nul 2>nul && set "NODE_BIN=node"
if not defined NODE_BIN if exist "%~dp0tools\node\node.exe" set "NODE_BIN=%~dp0tools\node\node.exe"
if not defined NODE_BIN if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_BIN=%ProgramFiles%\nodejs\node.exe"

if not defined NODE_BIN (
  echo.
  echo Node.js puuttuu. Asenna se kerran jommallakummalla tavalla:
  echo   1^) winget install OpenJS.NodeJS.LTS
  echo   2^) https://nodejs.org/  ^(LTS-versio^)
  echo.
  pause
  exit /b 1
)

"%NODE_BIN%" server.js
if errorlevel 1 pause
