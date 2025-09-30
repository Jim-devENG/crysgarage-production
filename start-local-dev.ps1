# Crys Garage Local Development Setup Script
# This script automatically sets up and starts all services

Write-Host "Starting Crys Garage Local Development Environment..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "php")) {
    Write-Host "PHP not found. Please install PHP and add it to PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "composer")) {
    Write-Host "Composer not found. Please install Composer and add it to PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "node")) {
    Write-Host "Node.js not found. Please install Node.js and add it to PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "npm not found. Please install npm and add it to PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "python")) {
    Write-Host "Python not found. Please install Python and add it to PATH." -ForegroundColor Red
    exit 1
}

Write-Host "All prerequisites found!" -ForegroundColor Green

# Set up Laravel Backend
Write-Host "`nSetting up Laravel Backend..." -ForegroundColor Yellow
Set-Location "crysgarage-backend-fresh"

# Install dependencies (ignore PHP extension warnings)
Write-Host "Installing Composer dependencies..."
composer install --ignore-platform-reqs 2>$null

# Generate app key if .env doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    Copy-Item ".env.example" ".env"
    php artisan key:generate --quiet
}

Write-Host "Laravel backend ready!" -ForegroundColor Green

# Set up Python Audio Service
Write-Host "`nSetting up Python Audio Service..." -ForegroundColor Yellow
Set-Location "../audio-mastering-service"

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..."
& "venv\Scripts\Activate.ps1"
pip install -r requirements.txt --quiet

Write-Host "Python service ready!" -ForegroundColor Green

# Set up Frontend
Write-Host "`nSetting up Frontend..." -ForegroundColor Yellow
Set-Location "../crysgarage-frontend"

# Install npm dependencies
Write-Host "Installing npm dependencies..."
npm install --silent

# Update Python service URL for local development
Write-Host "Configuring frontend for local development..."
$pythonServiceFile = "services/pythonAudioService.ts"
if (Test-Path $pythonServiceFile) {
    $content = Get-Content $pythonServiceFile -Raw
    $content = $content -replace "const PYTHON_SERVICE_URL = 'https://crysgarage\.studio/api/python';", "const PYTHON_SERVICE_URL = 'http://localhost:8002';"
    Set-Content $pythonServiceFile $content
}

Write-Host "Frontend ready!" -ForegroundColor Green

# Start all services
Write-Host "`nStarting all services..." -ForegroundColor Green

# Start Laravel (in background)
Write-Host "Starting Laravel server on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\..\crysgarage-backend-fresh'; php artisan serve"

# Wait a moment for Laravel to start
Start-Sleep -Seconds 3

# Start Python service (in background)
Write-Host "Starting Python service on http://localhost:8002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\..\audio-mastering-service'; .\venv\Scripts\Activate.ps1; uvicorn main:app --host 0.0.0.0 --port 8002 --reload"

# Wait a moment for Python to start
Start-Sleep -Seconds 3

# Start Frontend (in current window)
Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Cyan
Write-Host "`nAll services starting! The frontend will open in your browser." -ForegroundColor Green
Write-Host "`nServices:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Laravel:   http://localhost:8000" -ForegroundColor White
Write-Host "   Python:    http://localhost:8002" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop the frontend when you are done." -ForegroundColor Gray

# Start the frontend dev server
npm run dev
