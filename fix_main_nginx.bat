@echo off
echo ========================================
echo Crys Garage - Fix Main Nginx Config
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking main Nginx config...
ssh root@209.74.80.162 "grep -n 'default_server' /etc/nginx/nginx.conf"
echo.

echo Step 2: Checking line 39 of nginx.conf...
ssh root@209.74.80.162 "sed -n '39p' /etc/nginx/nginx.conf"
echo.

echo Step 3: Commenting out the default server in main config...
ssh root@209.74.80.162 "sed -i 's/listen.*default_server/# &/' /etc/nginx/nginx.conf"
echo ✅ Default server commented out
echo.

echo Step 4: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 5: Restarting Nginx...
ssh root@209.74.80.162 "systemctl restart nginx"
echo ✅ Nginx restarted
echo.

echo Step 6: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 7: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -5"
echo.

echo ========================================
echo Main Nginx fix complete!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 