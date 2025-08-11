@echo off
echo 🌐 Final Frontend Fix
echo ====================

echo 📤 Uploading frontend fix to VPS...
scp fix_frontend_final.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running frontend fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_frontend_final.sh && ./fix_frontend_final.sh"

echo.
echo 🔍 Testing all services...
ssh root@209.74.80.162 "systemctl status crysgarage-frontend.service crysgarage-backend.service crysgarage-ruby.service nginx"

echo.
echo 🌐 Testing application...
timeout /t 10 /nobreak >nul
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://crysgarage.studio

echo.
echo ✅ Frontend fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 