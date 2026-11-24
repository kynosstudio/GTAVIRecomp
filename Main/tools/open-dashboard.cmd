@echo off
rem Opens the private PortWatch VI dashboard: starts the local server (if needed) and the browser.
cd /d "%~dp0.."
powershell -NoProfile -Command "if (-not (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)) { Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%~dp0serve.ps1','-Port','8080' ; Start-Sleep -Seconds 2 }"
start "" "http://localhost:8080/dashboard/"
