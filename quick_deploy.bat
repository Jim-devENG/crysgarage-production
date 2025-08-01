@echo off
echo ⚡ Quick Deploy - Crys Garage
echo =============================

echo.
echo This is a faster deployment for small changes.
echo.
echo 📋 What will happen:
echo    1. Push changes to Git
echo    2. Pull and restart containers (no rebuild)
echo    3. Test the application
echo.

set /p confirm="Continue with quick deploy? (y/N): "
if /i not "%confirm%"=="y" (
    echo Quick deploy cancelled.
    pause
    exit /b
)

echo.
echo 📤 Pushing changes to Git...
git add .
git commit -m "Quick update: $(date /t) $(time /t)"
git push origin master

echo.
echo 🚀 Quick deploy on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && git pull origin master && docker-compose restart"

echo.
echo ⏳ Waiting for services to restart...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Quick deploy completed!
echo 🌐 Your application: https://crysgarage.studio

pause 
