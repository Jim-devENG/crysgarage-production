@echo off
echo 🔄 Restarting Frontend Service
echo ==============================

echo 📤 Uploading restart script to VPS...
scp restart_frontend_service.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running frontend restart on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x restart_frontend_service.sh && ./restart_frontend_service.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Frontend service restart completed!
echo 🌐 Your application: https://crysgarage.studio

pause 