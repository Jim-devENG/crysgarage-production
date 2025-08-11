@echo off
echo 🛑 Stopping Crys Garage Audio Mastering Platform...
echo ================================================

:: Stop all containers
docker-compose down

if %errorlevel% neq 0 (
    echo ❌ Failed to stop containers
    pause
    exit /b 1
)

echo ✅ All containers stopped successfully!
echo.
echo 🧹 To remove all containers and volumes: docker-compose down -v
echo 🏗️ To rebuild and start again: run_local.bat
pause
