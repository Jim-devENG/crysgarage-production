@echo off
echo 💎 Simple Ruby Service Fix
echo =========================

echo 📤 Uploading simple Ruby fix to VPS...
scp simple_ruby_fix.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running simple Ruby fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x simple_ruby_fix.sh && ./simple_ruby_fix.sh"

echo.
echo 🔍 Testing all services...
ssh root@209.74.80.162 "systemctl status crysgarage-frontend.service crysgarage-backend.service crysgarage-ruby.service nginx"

echo.
echo 🌐 Testing application...
timeout /t 5 /nobreak >nul
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://crysgarage.studio

echo.
echo ✅ Simple Ruby fix completed!
echo 🌐 Your application: https://crysgarage.studio

pause 