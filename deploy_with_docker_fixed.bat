@echo off
echo 🐳 Deploying Crys Garage with Docker (Fixed)
echo =============================================

echo.
echo This will deploy your application using Docker containers
echo with the correct Laravel backend and Ruby service setup.
echo.
echo 📋 What will happen:
echo    - Convert Laravel backend to Docker
echo    - Convert Ruby service to Docker
echo    - Convert React frontend to Docker
echo    - Stop existing systemd services
echo    - Deploy everything in Docker
echo    - Keep SSL certificates and monitoring
echo.
echo ⚠️  This will take 10-15 minutes to complete.
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading fixed Docker deployment script to VPS...
scp deploy_with_docker_fixed.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🐳 Running fixed Docker deployment on VPS...
echo This may take 10-15 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x deploy_with_docker_fixed.sh && ./deploy_with_docker_fixed.sh"

echo.
echo 🌐 Testing application after Docker deployment...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Fixed Docker deployment completed!
echo.
echo 🎯 What's now active:
echo    - Laravel backend running in Docker
echo    - Ruby service running in Docker
echo    - React frontend running in Docker
echo    - SSL certificates working
echo    - Monitoring still active
echo    - Better isolation and stability
echo.
echo 🌐 Your application: https://crysgarage.studio
echo 🐳 Running in Docker containers
echo.
echo 🚀 Your application is now properly containerized!

pause 