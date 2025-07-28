@echo off
echo ========================================
echo Crys Garage - Upload Fixed Nginx Config
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Stopping Nginx...
ssh root@209.74.80.162 "systemctl stop nginx"
echo ✅ Nginx stopped
echo.

echo Step 2: Removing old configs...
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/*"
echo ✅ Old configs removed
echo.

echo Step 3: Uploading fixed Nginx config...
scp $1 crysgarage:/etc/nginx/conf.d/default.conf
echo ✅ Config uploaded
echo.

echo Step 4: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 5: Starting Nginx...
ssh root@209.74.80.162 "systemctl start nginx"
echo ✅ Nginx started
echo.

echo Step 6: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 7: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -5"
echo.

echo Step 8: Verifying our files...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/"
echo.

echo ========================================
echo Fixed Nginx config uploaded!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 
