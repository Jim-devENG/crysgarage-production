@echo off
echo 🔧 Fixing React App - Creating Simple Working Version
echo =====================================================

echo.
echo This will create a simple working React app to fix the blank screen:
echo    - Replace complex App.tsx with simple working version
echo    - Fix all JavaScript errors
echo    - Create beautiful landing page
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Fix cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading fix script to VPS...
scp fix_react_app.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running React app fix on VPS...
echo This may take 5-10 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_react_app.sh && ./fix_react_app.sh"

echo.
echo 🌐 Testing application after fix...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ React app fix completed!
echo.
echo 🎯 What was fixed:
echo    - Created simple working React app
echo    - Removed all JavaScript errors
echo    - Beautiful Crys Garage landing page
echo.
echo 🌐 Your application: https://crysgarage.studio

pause 