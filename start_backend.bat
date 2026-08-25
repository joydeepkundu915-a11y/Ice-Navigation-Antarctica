@echo off
title Antarctic Navigation Backend Server (Port 8000)
cd /d "%~dp0backend"
echo =====================================================================
echo  POLARIS ECDIS - Antarctic Sea-Ice & Iceberg Decision Support Backend
echo =====================================================================
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
