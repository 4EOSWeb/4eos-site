@echo off
cd /d "%~dp0"

start "Caddy" cmd /k caddy run
start "4EOS server" powershell -NoExit -Command "npm run dev"
