@echo off
echo 🐳 Checking Docker Installation Status
echo =====================================

echo.
echo 📤 Uploading Docker status check script to VPS...
scp check_docker_status.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔍 Running Docker status check on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x check_docker_status.sh && ./check_docker_status.sh"

echo.
echo ✅ Docker status check completed!

pause 