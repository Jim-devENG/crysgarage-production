@echo off
echo ========================================
echo Debugging Nginx Configuration
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking current Nginx config...
ssh root@209.74.80.162 "cat /etc/nginx/conf.d/crysgarage.conf"

echo.
echo Step 2: Checking if frontend directory exists...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/"

echo.
echo Step 3: Checking if frontend dist folder exists...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/"

echo.
echo Step 4: Checking if frontend files are built...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/dist/"

echo.
echo Step 5: Checking what Nginx is actually serving...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo Step 6: Checking Nginx error logs...
ssh root@209.74.80.162 "tail -10 /var/log/nginx/error.log"

echo.
echo Step 7: Checking Nginx access logs...
ssh root@209.74.80.162 "tail -5 /var/log/nginx/access.log"

echo.
echo ========================================
echo DEBUG COMPLETED!
echo ========================================
echo.
pause 