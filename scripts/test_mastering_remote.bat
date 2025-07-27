@echo off
echo ========================================
echo Crys Garage - Test Mastering on VPS
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking if Ruby service is running...
ssh crysgarage "systemctl status crysgarage-ruby 2>/dev/null || echo 'Ruby service not found'"
echo.

echo Step 2: Starting Ruby audio processor...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && nohup ruby mastering_server.rb > /var/log/crysgarage-ruby.log 2>&1 &"
echo ✅ Ruby processor started
echo.

echo Step 3: Checking if processor is listening...
ssh crysgarage "netstat -tlnp | grep :4567 || echo 'Processor not listening on port 4567'"
echo.

echo Step 4: Testing API endpoint...
ssh crysgarage "curl -I http://localhost:4567/health || echo 'Health check failed'"
echo.

echo Step 5: Checking logs...
ssh crysgarage "tail -10 /var/log/crysgarage-ruby.log"
echo.

echo ========================================
echo Remote mastering test complete!
echo ========================================
echo 🌐 Test at: https://crysgarage.studio
echo 📊 Check logs: ssh crysgarage "tail -f /var/log/crysgarage-ruby.log"
echo.
pause 
