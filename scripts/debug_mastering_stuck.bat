@echo off
echo ========================================
echo Crys Garage - Debug Mastering Stuck
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking Ruby service status...
ssh crysgarage "systemctl status crysgarage-ruby --no-pager"
echo.

echo Step 2: Checking Ruby process...
ssh crysgarage "ps aux | grep mastering_server"
echo.

echo Step 3: Checking recent Ruby logs...
ssh crysgarage "journalctl -u crysgarage-ruby --no-pager -n 30"
echo.

echo Step 4: Checking if port 4567 is listening...
ssh crysgarage "netstat -tlnp | grep :4567"
echo.

echo Step 5: Testing health endpoint...
ssh crysgarage "curl -s http://localhost:4567/health"
echo.

echo Step 6: Checking output directory...
ssh crysgarage "ls -la /var/www/crysgarage/crysgarage-ruby/output/"
echo.

echo Step 7: Checking temp directory...
ssh crysgarage "ls -la /var/www/crysgarage/crysgarage-ruby/temp/"
echo.

echo Step 8: Checking disk space...
ssh crysgarage "df -h"
echo.

echo Step 9: Checking memory usage...
ssh crysgarage "free -h"
echo.

echo Step 10: Checking CPU usage...
ssh crysgarage "top -bn1 | head -20"
echo.

echo ========================================
echo Debug complete!
echo ========================================
echo 📊 Live logs: ssh crysgarage "journalctl -u crysgarage-ruby -f"
echo 🔧 Restart: ssh crysgarage "systemctl restart crysgarage-ruby"
echo.
pause 
