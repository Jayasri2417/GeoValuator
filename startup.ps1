# GeoValuator Startup Script
# Run with: powershell -ExecutionPolicy Bypass -File startup.ps1

$baseDir = "c:\Users\karthik\Downloads\Karthik\B.tech\8thsem\final\3\GEOVALUVATOR\GEOVALUVATOR\GEOVALUVATOR"
$pythonPath = "$baseDir\.venv\Scripts\python.exe"
$aiEngineDir = "$baseDir\ai_engine"
$serverDir = "$baseDir\server"
$clientDir = "$baseDir\client"

Write-Host "🚀 Starting GeoValuator..." -ForegroundColor Cyan

# Check Python
if (-not (Test-Path $pythonPath)) {
    Write-Error "Python executable not found at $pythonPath`nPlease run: python -m venv .venv`nAnd install requirements."
    exit 1
}

# Start AI Engine
Write-Host "Starting AI Engine..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd '$aiEngineDir'; & '$pythonPath' main.py"

# Start Server
Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$serverDir'; npm start"

# Start Client
Write-Host "Starting Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit -Command cd '$clientDir'; npm run dev"

Start-Sleep -Seconds 5
Write-Host "✅ Services launched!" -ForegroundColor Green
Write-Host "frontend: http://localhost:5173"
Start-Process "http://localhost:5173"
