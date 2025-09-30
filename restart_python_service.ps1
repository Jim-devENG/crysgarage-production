Write-Host "Stopping Python service on port 8002..." -ForegroundColor Yellow

# Find and kill processes using port 8002
$processes = Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        Write-Host "Killing process $pid" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process found on port 8002" -ForegroundColor Green
}

Write-Host "Waiting 2 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Please restart your Python service from your venv environment:" -ForegroundColor Green
Write-Host "python main.py" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
