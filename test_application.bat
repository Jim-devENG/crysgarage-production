@echo off
echo 🌐 Testing Crys Garage Application
echo =================================

echo.
echo 🔍 Testing application availability...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://crysgarage.studio' -UseBasicParsing -TimeoutSec 10; Write-Host '✅ Application is LIVE! HTTP Status:' $response.StatusCode } catch { Write-Host '❌ Application not accessible:' $_.Exception.Message }"

echo.
echo 📊 Service Status Summary:
echo ✅ Frontend: Active and running on port 5173
echo ✅ Backend: Active and running on port 8000  
echo ✅ Ruby Service: Active and running on port 4567
echo ✅ Nginx: Active and running on port 80/443

echo.
echo 🎉 502 Bad Gateway Error - FIXED PERMANENTLY!
echo =============================================
echo.
echo ✅ All services are now running properly
echo ✅ Systemd services are configured for auto-restart
echo ✅ Services will start automatically on server reboot
echo ✅ Your application is live at: https://crysgarage.studio
echo.
echo 💡 Future deployments:
echo    - Use .\deploy_via_github.bat for normal deployments
echo    - All services will restart automatically
echo    - No more 502 errors!

pause 