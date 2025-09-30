Write-Host "Starting Python Audio Service..." -ForegroundColor Green

# Change to the script directory
Set-Location $PSScriptRoot

# Check if venv exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the audio-mastering-service directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
try {
    & "venv\Scripts\Activate.ps1"
    Write-Host "Virtual environment activated!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to activate virtual environment!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the service
Write-Host "Starting Python service on port 8002..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host ""

try {
    python main.py
} catch {
    Write-Host ""
    Write-Host "Service stopped with error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Service stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
