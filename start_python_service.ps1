Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting CrysGarage Python Audio Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/3] Stopping any existing Python service on port 8002..." -ForegroundColor Yellow

# Find and kill processes using port 8002
$processes = Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        Write-Host "  Killing existing process $pid" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "  No existing process found on port 8002" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Activating Python virtual environment..." -ForegroundColor Yellow

# Check if venv exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "  ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "  Make sure you're in the audio-mastering-service directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Activate the virtual environment
try {
    & "venv\Scripts\Activate.ps1"
    Write-Host "  Virtual environment activated successfully!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to activate virtual environment!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[3/3] Starting Python audio mastering service..." -ForegroundColor Yellow
Write-Host "  Service will be available at: http://localhost:8002" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop the service" -ForegroundColor Cyan
Write-Host ""

# Start the Python service
try {
    python main.py
} catch {
    Write-Host ""
    Write-Host "Service stopped with error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Service stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
