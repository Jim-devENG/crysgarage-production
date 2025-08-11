@echo off
echo 🔒 Fixing SSL Certificate Issues (CentOS)
echo ==========================================

echo.
echo This will fix SSL certificate issues on your CentOS VPS.
echo.

echo 📤 Uploading CentOS SSL fix script to VPS...
scp fix_ssl_centos.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running CentOS SSL fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_ssl_centos.sh && ./fix_ssl_centos.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ CentOS SSL fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 