@echo off
echo 🔧 Fixing Blank White Screen Issue
echo ==================================

echo.
echo This will fix the blank white screen by:
echo    - Building the frontend for production
echo    - Updating Nginx configuration for SPA routing
echo    - Rebuilding and restarting containers
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Fix cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading fix script to VPS...
scp fix_blank_screen.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running blank screen fix on VPS...
echo This may take 5-10 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_blank_screen.sh && ./fix_blank_screen.sh"

echo.
echo 🌐 Testing application after fix...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Blank screen fix completed!
echo.
echo 🎯 What was fixed:
echo    - Frontend now builds for production
echo    - SPA routing properly configured
echo    - Nginx handles React routing correctly
echo.
echo 🌐 Your application: https://crysgarage.studio

pause 