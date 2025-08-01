@echo off
echo 🔒 Fixing SSL Certificate Issues
echo ================================

echo.
echo This will fix SSL certificate issues and ensure proper HTTPS support.
echo.

echo 📤 Uploading SSL fix script to VPS...
scp fix_ssl_proper.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running SSL fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_ssl_proper.sh && ./fix_ssl_proper.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ SSL certificate fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 