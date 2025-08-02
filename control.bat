@echo off
setlocal enabledelayedexpansion

echo 🎛️ Crys Garage Deployment Control
echo ================================

:menu
echo.
echo Choose an option:
echo 1. Deploy to VPS (Push to Git)
echo 2. Check VPS Status
echo 3. Restart VPS Services
echo 4. View VPS Logs
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto status
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto exit
echo Invalid choice. Please try again.
goto menu

:deploy
echo.
echo 🚀 Deploying to VPS...
call .\simple_deploy.bat
goto menu

:status
echo.
echo 📊 Checking VPS Status...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose ps"
echo.
pause
goto menu

:restart
echo.
echo 🔄 Restarting VPS Services...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose restart"
echo ✅ Services restarted!
echo.
pause
goto menu

:logs
echo.
echo 📋 Viewing VPS Logs...
echo Choose service:
echo 1. Frontend
echo 2. Backend
echo 3. Ruby Service
echo 4. Nginx
echo 5. All Services
echo.
set /p logchoice="Enter choice (1-5): "

if "%logchoice%"=="1" (
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose logs frontend --tail=20"
) else if "%logchoice%"=="2" (
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose logs backend --tail=20"
) else if "%logchoice%"=="3" (
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose logs ruby-service --tail=20"
) else if "%logchoice%"=="4" (
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose logs nginx --tail=20"
) else if "%logchoice%"=="5" (
    ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && docker-compose logs --tail=20"
) else (
    echo Invalid choice.
)
echo.
pause
goto menu

:exit
echo.
echo 👋 Goodbye!
pause
exit /b 0 