@echo off
echo ========================================
echo Crys Garage - Deployment Check
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking SSH connection...
ssh root@209.74.80.162 "echo 'SSH connection: OK'"

echo.
echo Step 2: Checking if services are running...
ssh root@209.74.80.162 "systemctl status crysgarage-backend --no-pager -l"
echo.
ssh root@209.74.80.162 "systemctl status crysgarage-ruby --no-pager -l"
echo.
ssh root@209.74.80.162 "systemctl status nginx --no-pager -l"

echo.
echo Step 3: Checking if files exist...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/"
echo.
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/dist/"

echo.
echo Step 4: Checking if ports are listening...
ssh root@209.74.80.162 "netstat -tlnp | grep -E ':(80|8000|4567)'"

echo.
echo Step 5: Testing website access...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.
ssh root@209.74.80.162 "curl -I http://localhost:8000"

echo.
echo Step 6: Checking firewall status...
ssh root@209.74.80.162 "firewall-cmd --list-all"

echo.
echo ========================================
echo DEPLOYMENT CHECK COMPLETED!
echo ========================================
echo.
echo If everything shows "OK" or "active", your deployment is working!
echo.
echo You can now test:
echo - Website: http://crysgarage.studio
echo - API: http://crysgarage.studio/api
echo - Audio: http://crysgarage.studio/audio
echo.
echo If there are errors, run the deployment script again.
echo.
pause 