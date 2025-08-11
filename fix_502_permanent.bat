@echo off
echo 🔧 Fix 502 Bad Gateway - Permanent Solution
echo ===========================================

echo 📤 Uploading fix script to VPS...
scp fix_502_permanent.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running permanent fix on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x fix_502_permanent.sh && ./fix_502_permanent.sh"

echo.
echo ✅ Fix completed!
echo 🌐 Check your application at: https://crysgarage.studio

pause 