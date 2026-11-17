# CampusConnect Dual Server Launcher for Windows PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  CampusConnect - Student Activity & Overlap System" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in new PowerShell window
Write-Host "[1/2] Launching Backend Server on http://127.0.0.1:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath'; .\venv\Scripts\Activate.ps1; python run_backend.py"

Start-Sleep -Seconds 2

# 2. Start Frontend in new PowerShell window
Write-Host "[2/2] Launching Frontend Server on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath\frontend'; npm run dev"

Write-Host "`nBoth Backend and Frontend servers launched successfully!" -ForegroundColor Cyan
Write-Host "Access CampusConnect at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Default Administrator Credentials: admin / admin123`n" -ForegroundColor White
