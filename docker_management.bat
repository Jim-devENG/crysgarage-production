@echo off
echo 🐳 Docker Management for Crys Garage
echo ===================================

echo.
echo Available commands:
echo   1. Start containers
echo   2. Stop containers
echo   3. Restart containers
echo   4. Check status
echo   5. View logs
echo   6. Rebuild containers
echo   7. Update and rebuild
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo 📤 Starting containers...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh start"
) else if "%choice%"=="2" (
    echo 📤 Stopping containers...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh stop"
) else if "%choice%"=="3" (
    echo 📤 Restarting containers...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh restart"
) else if "%choice%"=="4" (
    echo 📤 Checking status...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh status"
) else if "%choice%"=="5" (
    echo 📤 Viewing logs...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh logs"
) else if "%choice%"=="6" (
    echo 📤 Rebuilding containers...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh rebuild"
) else if "%choice%"=="7" (
    echo 📤 Updating and rebuilding...
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x docker_management.sh && ./docker_management.sh update"
) else (
    echo Invalid choice. Please run again.
)

echo.
echo ✅ Docker management operation completed!

pause 