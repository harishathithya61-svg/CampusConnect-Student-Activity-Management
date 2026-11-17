@echo off
echo ========================================================
echo Starting CampusConnect Backend Server (Flask REST API)
echo ========================================================
cd /d %~dp0
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found. Please run:
    echo python -m venv venv
    echo .\venv\Scripts\pip install -r backend\requirements.txt
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
python run_backend.py
pause
