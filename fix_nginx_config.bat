@echo off
echo ========================================
echo Fixing Nginx Configuration
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Uploading proper Nginx configuration...
scp nginx_config.conf root@209.74.80.162:/etc/nginx/conf.d/crysgarage.conf

echo.
echo Step 2: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"

echo.
echo Step 3: Reloading Nginx...
ssh root@209.74.80.162 "systemctl reload nginx"

echo.
echo Step 4: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo ========================================
echo NGINX CONFIGURATION FIXED!
echo ========================================
echo.
echo Now visit: http://crysgarage.studio
echo You should see the Crys Garage frontend!
echo.
pause 