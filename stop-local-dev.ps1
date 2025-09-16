# Stop Crys Garage Local Development Services
Write-Host "🛑 Stopping Crys Garage Local Development Services..." -ForegroundColor Red

# Kill processes by port
$ports = @(8000, 8002, 5173)

foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Stopped process on port $port (PID: $pid)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Could not stop process on port $port (PID: $pid)" -ForegroundColor Yellow
            }
        }
    }
}

# Kill any remaining Node.js processes (frontend)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" -or $_.CommandLine -like "*5173*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill any remaining PHP processes (Laravel)
Get-Process -Name "php" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*artisan serve*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill any remaining Python processes (uvicorn)
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n🎉 All services stopped!" -ForegroundColor Green
Write-Host "💡 You can now run .\start-local-dev.ps1 again to restart everything." -ForegroundColor Gray
