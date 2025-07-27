@echo off
echo ========================================
echo Crys Garage - Monitor Mastering
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Service status...
ssh crysgarage "systemctl status crysgarage-ruby --no-pager"
echo.

echo Step 2: Port status...
ssh crysgarage "netstat -tlnp | grep :4567"
echo.

echo Step 3: Recent logs...
ssh crysgarage "journalctl -u crysgarage-ruby --no-pager -n 20"
echo.

echo Step 4: Process status...
ssh crysgarage "ps aux | grep mastering_server"
echo.

echo Step 5: Test health endpoint...
ssh crysgarage "curl -s http://localhost:4567/health"
echo.

echo ========================================
echo Monitoring complete!
echo ========================================
echo 📊 Live logs: ssh crysgarage "journalctl -u crysgarage-ruby -f"
echo 🔧 Restart: ssh crysgarage "systemctl restart crysgarage-ruby"
echo 🌐 Test: https://crysgarage.studio
echo.
pause 
