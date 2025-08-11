@echo off
echo 🔧 Fixing Vite allowedHosts Configuration
echo =========================================

echo 📤 Uploading Vite fix script to VPS...
scp fix_vite_allowedhosts.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running Vite allowedHosts fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_vite_allowedhosts.sh && ./fix_vite_allowedhosts.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Vite allowedHosts fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 