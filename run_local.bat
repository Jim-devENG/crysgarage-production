@echo off
echo 🎵 Starting Crys Garage Audio Mastering Platform...
echo ================================================

:: Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it first
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Docker is running
echo 🚀 Building and starting containers...

:: Build and start all services
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)

echo ✅ Containers started successfully!
echo.
echo 🌐 Your app is now running at:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:8001
echo    Ruby Service: http://localhost:4568
echo    Nginx: http://localhost:80
echo.
echo 📊 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo.
echo 🎵 Enjoy your Crys Garage Audio Mastering Platform!
pause
