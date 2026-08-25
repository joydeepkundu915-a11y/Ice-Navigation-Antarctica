@echo off
title Antarctic Navigation Frontend Bridge (Port 5173)
cd /d "%~dp0frontend"
echo =====================================================================
echo  POLARIS ECDIS - Tactical Polar Bridge Interface
echo =====================================================================
call npm.cmd run dev
pause
