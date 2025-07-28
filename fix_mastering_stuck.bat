@echo off
echo ========================================
echo Crys Garage - Fix Mastering Stuck
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Stopping Ruby service...
ssh crysgarage "systemctl stop crysgarage-ruby"
echo ✅ Service stopped
echo.

echo Step 2: Killing any stuck processes...
ssh crysgarage "pkill -f mastering_server || echo 'No processes to kill'"
ssh crysgarage "pkill -f ffmpeg || echo 'No ffmpeg processes to kill'"
echo ✅ Processes killed
echo.

echo Step 3: Cleaning temp files...
ssh crysgarage "rm -rf /var/www/crysgarage/crysgarage-ruby/temp/*"
ssh crysgarage "rm -rf /var/www/crysgarage/crysgarage-ruby/output/*"
echo ✅ Temp files cleaned
echo.

echo Step 4: Checking Ruby dependencies...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && bundle install"
echo ✅ Dependencies checked
echo.

echo Step 5: Setting proper permissions...
ssh crysgarage "chown -R nginx:nginx /var/www/crysgarage/crysgarage-ruby"
ssh crysgarage "chmod -R 755 /var/www/crysgarage/crysgarage-ruby"
echo ✅ Permissions set
echo.

echo Step 6: Starting Ruby service...
ssh crysgarage "systemctl start crysgarage-ruby"
echo ✅ Service started
echo.

echo Step 7: Waiting for service to stabilize...
timeout /t 5 /nobreak >nul
echo.

echo Step 8: Checking service status...
ssh crysgarage "systemctl status crysgarage-ruby --no-pager"
echo.

echo Step 9: Testing health endpoint...
ssh crysgarage "curl -s http://localhost:4567/health"
echo.

echo Step 10: Checking if listening...
ssh crysgarage "netstat -tlnp | grep :4567"
echo.

echo ========================================
echo Fix complete!
echo ========================================
echo 🌐 Test mastering at: https://crysgarage.studio
echo 📊 Monitor: .\monitor_mastering.bat
echo.
pause 
