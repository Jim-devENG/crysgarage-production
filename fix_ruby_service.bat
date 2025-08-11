@echo off
echo 💎 Fix Ruby Service for Ruby 2.5.0
echo ==================================

echo 📤 Uploading Ruby fix script to VPS...
scp fix_ruby_service.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running Ruby service fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_ruby_service.sh && ./fix_ruby_service.sh"

echo.
echo 🔍 Testing all services...
ssh root@209.74.80.162 "systemctl status crysgarage-frontend.service crysgarage-backend.service crysgarage-ruby.service nginx"

echo.
echo ✅ Ruby service fix completed!
echo 🌐 Check your application at: https://crysgarage.studio

pause 