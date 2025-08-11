@echo off
echo 🐳 Waiting for Docker Desktop to be ready...
echo ==========================================

:check_docker
echo Checking Docker status...
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" info >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is ready!
    goto start_app
) else (
    echo ⏳ Docker Desktop is still starting...
    echo Please wait while Docker Desktop initializes...
    timeout /t 10 /nobreak >nul
    goto check_docker
)

:start_app
echo.
echo 🎵 Starting Crys Garage Audio Mastering Platform...
echo ================================================

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
