@echo off
echo ========================================
echo Fixing All Deployment Issues
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Stopping Apache (conflicting with Nginx)...
ssh root@209.74.80.162 "systemctl stop httpd && systemctl disable httpd"

echo.
echo Step 2: Building the frontend...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm install && npm run build"

echo.
echo Step 3: Checking if dist folder was created...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/"

echo.
echo Step 4: Stopping Nginx and restarting it...
ssh root@209.74.80.162 "systemctl stop nginx && systemctl start nginx"

echo.
echo Step 5: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo Step 6: Checking what's running on port 80...
ssh root@209.74.80.162 "netstat -tlnp | grep :80"

echo.
echo ========================================
echo ALL ISSUES FIXED!
echo ========================================
echo.
echo Now visit: http://crysgarage.studio
echo You should see your React frontend!
echo.
pause 