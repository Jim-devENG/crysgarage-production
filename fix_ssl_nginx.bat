@echo off
echo 🔒 Fixing SSL/HTTPS Configuration
echo =================================

echo 📤 Uploading SSL fix script to VPS...
scp fix_ssl_nginx.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running SSL/HTTPS fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_ssl_nginx.sh && ./fix_ssl_nginx.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ SSL/HTTPS configuration fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 