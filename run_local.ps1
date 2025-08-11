Write-Host "🎵 Starting Crys Garage Audio Mastering Platform..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Docker is available
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not found"
    }
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and start it first" -ForegroundColor Yellow
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🚀 Building and starting containers..." -ForegroundColor Yellow

# Build and start all services
try {
    docker-compose up --build -d
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start containers"
    }
} catch {
    Write-Host "❌ Failed to start containers" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Containers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app is now running at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8001" -ForegroundColor White
Write-Host "   Ruby Service: http://localhost:4568" -ForegroundColor White
Write-Host "   Nginx: http://localhost:80" -ForegroundColor White
Write-Host ""
Write-Host "📊 To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 To stop: docker-compose down" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎵 Enjoy your Crys Garage Audio Mastering Platform!" -ForegroundColor Green
Read-Host "Press Enter to continue"
