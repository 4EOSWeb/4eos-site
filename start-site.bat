@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "ARCH=amd64"
if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "ARCH=arm64"

call :findcaddy
if not defined CADDY (
  echo Caddy is not on PATH. Downloading caddy.exe into tools ...
  if not exist "%~dp0tools" mkdir "%~dp0tools"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing -Uri 'https://caddyserver.com/api/download?os=windows&arch=%ARCH%' -OutFile '%~dp0tools\caddy.exe'"
  if exist "%~dp0tools\caddy.exe" set "CADDY=%~dp0tools\caddy.exe"
)

if not exist "%CADDY%" if /I not "%CADDY%"=="caddy" (
  echo Could not find or download Caddy.
  echo Install it, then run this file again: winget install Caddy.Caddy
  pause
  exit /b 1
)

if /I "%CADDY%"=="caddy" (
  start "Caddy" cmd /k caddy run
) else (
  start "Caddy" cmd /k ""%CADDY%" run"
)
start "4EOS server" powershell -NoExit -Command "Set-Location -LiteralPath '%CD%'; npm run dev"
exit /b 0

:findcaddy
where caddy >nul 2>&1 && set "CADDY=caddy" && exit /b 0
if exist "%~dp0caddy.exe" set "CADDY=%~dp0caddy.exe" && exit /b 0
if exist "%~dp0tools\caddy.exe" set "CADDY=%~dp0tools\caddy.exe" && exit /b 0
if exist "%ProgramFiles%\Caddy\caddy.exe" set "CADDY=%ProgramFiles%\Caddy\caddy.exe" && exit /b 0
if exist "%LOCALAPPDATA%\Microsoft\WinGet\Links\caddy.exe" set "CADDY=%LOCALAPPDATA%\Microsoft\WinGet\Links\caddy.exe" && exit /b 0
if defined ChocolateyInstall if exist "%ChocolateyInstall%\bin\caddy.exe" set "CADDY=%ChocolateyInstall%\bin\caddy.exe" && exit /b 0
exit /b 0
