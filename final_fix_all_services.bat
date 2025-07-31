@echo off
echo 🔧 Final Fix - All Services
echo ==========================

echo 📤 Uploading final fix script to VPS...
scp final_fix_all_services.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running final fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x final_fix_all_services.sh && ./final_fix_all_services.sh"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://crysgarage.studio

echo.
echo ✅ Final fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 