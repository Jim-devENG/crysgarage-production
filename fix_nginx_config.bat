@echo off
echo 🌐 Fixing Nginx Configuration
echo ============================

echo 📤 Uploading Nginx fix script to VPS...
scp fix_nginx_config.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running Nginx configuration fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_nginx_config.sh && ./fix_nginx_config.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Nginx configuration fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 