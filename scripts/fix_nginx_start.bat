@echo off
echo ========================================
echo Crys Garage - Fix Nginx Start
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking the PHP-FPM config issue...
ssh root@209.74.80.162 "cat /etc/nginx/default.d/php.conf"
echo.

echo Step 2: Removing problematic PHP config...
ssh root@209.74.80.162 "rm -f /etc/nginx/default.d/php.conf"
echo ✅ PHP config removed
echo.

echo Step 3: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 4: Starting Nginx...
ssh root@209.74.80.162 "systemctl start nginx"
echo ✅ Nginx started
echo.

echo Step 5: Checking Nginx status...
ssh root@209.74.80.162 "systemctl status nginx --no-pager"
echo.

echo Step 6: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 7: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -5"
echo.

echo ========================================
echo Nginx start fix complete!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 