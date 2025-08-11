@echo off
echo 🐳 Waiting for Docker Desktop to be ready...
echo ==========================================

:wait_loop
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is ready!
    goto start_app
) else (
    echo ⏳ Docker Desktop is still starting...
    echo Please wait while Docker Desktop initializes...
    timeout /t 15 /nobreak >nul
    goto wait_loop
)

:start_app
echo.
echo 🎵 Starting Crys Garage Audio Mastering Platform...
echo ================================================

docker-compose up --build -d

if %errorlevel% equ 0 (
    echo ✅ App started successfully!
    echo.
    echo 🌐 Your app is now running at:
    echo    Frontend: http://localhost:5173
    echo    Backend API: http://localhost:8001
    echo    Ruby Service: http://localhost:4568
    echo    Nginx: http://localhost:80
    echo.
    echo 🎵 Enjoy your Crys Garage Audio Mastering Platform!
) else (
    echo ❌ Failed to start app
)

pause
