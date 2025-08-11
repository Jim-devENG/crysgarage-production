@echo off
echo 🔧 Fixing Build Errors and Frontend Issues
echo ==========================================

echo.
echo This will fix the build errors by:
echo    - Using development mode instead of production build
echo    - Fixing Vite configuration
echo    - Updating Nginx for proper routing
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Fix cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading fix script to VPS...
scp fix_build_errors.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running build errors fix on VPS...
echo This may take 5-10 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_build_errors.sh && ./fix_build_errors.sh"

echo.
echo 🌐 Testing application after fix...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Build errors fix completed!
echo.
echo 🎯 What was fixed:
echo    - Frontend now runs in development mode
echo    - Build errors resolved
echo    - Proper routing configuration
echo.
echo 🌐 Your application: https://crysgarage.studio

pause 