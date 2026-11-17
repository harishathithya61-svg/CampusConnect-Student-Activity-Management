@echo off
echo ========================================================
echo Starting CampusConnect Frontend Client (Vite React)
echo ========================================================
cd /d %~dp0\frontend
if not exist "node_modules" (
    echo [INFO] Installing frontend npm packages...
    call npm install
)
echo Starting development server on http://localhost:5173
call npm run dev
pause
