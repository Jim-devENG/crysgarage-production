@echo off
echo ========================================
echo Crys Garage - Fix 500 Internal Server Error
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Testing SSH connection...
ssh -o ConnectTimeout=10 root@209.74.80.162 "echo 'SSH connection successful'" || (
    echo ❌ SSH connection failed
    pause
    exit /b 1
)
echo ✅ SSH connection successful
echo.

echo Step 2: Checking Nginx status and configuration...
ssh root@209.74.80.162 "systemctl status nginx --no-pager"
echo.

echo Step 3: Checking Nginx error logs...
ssh root@209.74.80.162 "tail -20 /var/log/nginx/error.log"
echo.

echo Step 4: Checking if the frontend files exist...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/dist/"
echo.

echo Step 5: Checking Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 6: Checking if the application is running...
ssh root@209.74.80.162 "ps aux | grep -E '(nginx|apache|php)'"
echo.

echo Step 7: Checking port usage...
ssh root@209.74.80.162 "netstat -tlnp | grep :80"
echo.

echo Step 8: Testing the website directly...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 9: Checking file permissions...
ssh root@209.74.80.162 "ls -la /var/www/"
echo.

echo Step 10: Restarting Nginx...
ssh root@209.74.80.162 "systemctl restart nginx"
echo.

echo Step 11: Final test...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo ========================================
echo Diagnosis complete!
echo ========================================
pause 