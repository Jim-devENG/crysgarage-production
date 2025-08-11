@echo off
echo 🐳 Deploying Crys Garage with Docker
echo ====================================

echo.
echo This will deploy your application using Docker containers
echo on your VPS. You don't need Docker installed locally!
echo.
echo 📋 What will happen:
echo    - Convert your application to Docker containers
echo    - Stop existing systemd services
echo    - Deploy everything in Docker
echo    - Keep SSL certificates and monitoring
echo.
echo ⚠️  This will take 5-10 minutes to complete.
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading Docker deployment script to VPS...
scp deploy_with_docker.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🐳 Running Docker deployment on VPS...
echo This may take 5-10 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x deploy_with_docker.sh && ./deploy_with_docker.sh"

echo.
echo 🌐 Testing application after Docker deployment...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Docker deployment completed!
echo.
echo 🎯 What's now active:
echo    - All services running in Docker containers
echo    - SSL certificates working
echo    - Monitoring still active
echo    - Better isolation and stability
echo.
echo 🌐 Your application: https://crysgarage.studio
echo 🐳 Running in Docker containers
echo.
echo 🚀 Your application is now containerized and more stable!

pause 