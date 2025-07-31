@echo off
echo 🔄 Restarting Frontend Service
echo =============================

echo 🔧 Restarting frontend service on VPS...
ssh root@209.74.80.162 "systemctl restart crysgarage-frontend.service"

echo.
echo ⏳ Waiting for frontend to start...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Checking frontend status...
ssh root@209.74.80.162 "systemctl status crysgarage-frontend.service"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Frontend restart completed!
echo 🌐 Your application: https://crysgarage.studio

pause 