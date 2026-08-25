@echo off
title Launch POLARIS Antarctic Decision Support System
cd /d "%~dp0"
echo =====================================================================
echo  Launching POLARIS Antarctic Decision Support System...
echo =====================================================================
start "Antarctic Backend API (8000)" cmd /c "start_backend.bat"
timeout /t 3 /nobreak >nul
start "Antarctic Frontend ECDIS (5173)" cmd /c "start_frontend.bat"
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo System online at http://localhost:5173
echo Backend API at http://localhost:8000/docs
echo =====================================================================
pause
