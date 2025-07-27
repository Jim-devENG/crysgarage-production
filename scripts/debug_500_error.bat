@echo off
echo ========================================
echo Debugging 500 Internal Server Error
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking Nginx error logs...
ssh root@209.74.80.162 "tail -20 /var/log/nginx/error.log"

echo.
echo Step 2: Checking Nginx access logs...
ssh root@209.74.80.162 "tail -10 /var/log/nginx/access.log"

echo.
echo Step 3: Checking if frontend files exist...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/dist/"

echo.
echo Step 4: Checking Nginx configuration...
ssh root@209.74.80.162 "cat /etc/nginx/conf.d/crysgarage.conf"

echo.
echo Step 5: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"

echo.
echo Step 6: Checking Nginx status...
ssh root@209.74.80.162 "systemctl status nginx --no-pager -l"

echo.
echo Step 7: Checking what's actually being served...
ssh root@209.74.80.162 "curl -v http://localhost"

echo.
echo ========================================
echo DEBUG COMPLETE
echo ========================================
pause 