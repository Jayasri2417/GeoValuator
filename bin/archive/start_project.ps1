Write-Host "Starting GeoValuator Services..." -ForegroundColor Cyan

$root = "D:\GEOVALUVATOR"
$aiPath = Join-Path $root "ai_engine"
$serverPath = Join-Path $root "server"
$clientPath = Join-Path $root "client"

Write-Host "Starting AI Engine in $aiPath..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $aiPath; python main.py"

Write-Host "Starting Server in $serverPath..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $serverPath; npm run dev"

Write-Host "Starting Client in $clientPath..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $clientPath; npm run dev"

Write-Host "Services launched in separate windows."
