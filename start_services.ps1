Write-Host "Starting Crys Garage Services..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Check if ports are already in use
Write-Host "Checking if ports are available..." -ForegroundColor Yellow
if (Test-Port 4567) { Write-Host "⚠️  Port 4567 (Ruby) is already in use" -ForegroundColor Yellow }
if (Test-Port 8000) { Write-Host "⚠️  Port 8000 (Laravel) is already in use" -ForegroundColor Yellow }
if (Test-Port 3000) { Write-Host "⚠️  Port 3000 (React) is already in use" -ForegroundColor Yellow }

Write-Host ""

# Start Ruby Service
Write-Host "1. Starting Ruby Mastering Service..." -ForegroundColor Cyan
$rubyJob = Start-Job -ScriptBlock {
    Set-Location "F:\applications\Crys Garage\crysgarage-ruby"
    & "C:\Ruby34-x64\bin\ruby.exe" mastering_server.rb
}

# Start Laravel Backend
Write-Host "2. Starting Laravel Backend..." -ForegroundColor Cyan
$laravelJob = Start-Job -ScriptBlock {
    Set-Location "F:\applications\Crys Garage\crysgarage-backend"
    php artisan serve --host=0.0.0.0 --port=8000
}

# Start React Frontend
Write-Host "3. Starting React Frontend..." -ForegroundColor Cyan
$reactJob = Start-Job -ScriptBlock {
    Set-Location "F:\applications\Crys Garage\crysgarage-frontend"
    npm run dev
}

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend: http://localhost:8000" -ForegroundColor White
Write-Host "- Ruby Service: http://localhost:4567" -ForegroundColor White
Write-Host ""
Write-Host "Wait for all services to fully start before testing." -ForegroundColor Yellow
Write-Host ""

# Wait a moment and check status
Start-Sleep -Seconds 5

Write-Host "Service Status:" -ForegroundColor Green
if (Test-Port 4567) { Write-Host "✅ Ruby Service (Port 4567) - Running" -ForegroundColor Green } else { Write-Host "❌ Ruby Service (Port 4567) - Not running" -ForegroundColor Red }
if (Test-Port 8000) { Write-Host "✅ Laravel Backend (Port 8000) - Running" -ForegroundColor Green } else { Write-Host "❌ Laravel Backend (Port 8000) - Not running" -ForegroundColor Red }
if (Test-Port 3000) { Write-Host "✅ React Frontend (Port 3000) - Running" -ForegroundColor Green } else { Write-Host "❌ React Frontend (Port 3000) - Not running" -ForegroundColor Red }

Write-Host ""
Write-Host "To stop all services, press Ctrl+C or close the terminal windows." -ForegroundColor Yellow
Write-Host ""

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
        Write-Host "Services are still running... (Press Ctrl+C to stop)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Stopping all services..." -ForegroundColor Red
    Stop-Job $rubyJob, $laravelJob, $reactJob -ErrorAction SilentlyContinue
    Remove-Job $rubyJob, $laravelJob, $reactJob -ErrorAction SilentlyContinue
} 