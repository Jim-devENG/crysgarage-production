@echo off
echo ========================================
echo Crys Garage - Check Nginx Errors
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking Nginx error logs...
ssh root@209.74.80.162 "tail -20 /var/log/nginx/error.log"
echo.

echo Step 2: Checking Nginx configuration...
ssh root@209.74.80.162 "nginx -T | grep -i php"
echo.

echo Step 3: Checking all Nginx config files...
ssh root@209.74.80.162 "find /etc/nginx -name '*.conf' -exec grep -l 'php' {} \;"
echo.

echo Step 4: Checking main nginx.conf...
ssh root@209.74.80.162 "grep -n 'php' /etc/nginx/nginx.conf"
echo.

echo Step 5: Checking if php-fpm is running...
ssh root@209.74.80.162 "systemctl status php-fpm 2>/dev/null || echo 'php-fpm not found'"
echo.

echo Step 6: Checking Nginx status...
ssh root@209.74.80.162 "systemctl status nginx --no-pager"
echo.

echo ========================================
echo Error diagnosis complete!
echo ========================================
pause 