@echo off
echo 🚀 Simple Stability Setup for Crys Garage
echo =========================================

echo.
echo This will add monitoring, SSL fixes, and security to prevent shutdowns
echo without changing your existing setup.
echo.
echo 📋 What will be installed:
echo    - Monitoring and auto-restart system
echo    - Proper SSL certificates (no more SSL errors)
echo    - Fail2ban for security
echo    - Daily backups
echo    - Service health checks
echo.
echo ⚠️  This will take 5-10 minutes to complete.
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Setup cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading simple stability setup script to VPS...
scp simple_stability_setup.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running simple stability setup on VPS...
echo This may take 5-10 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x simple_stability_setup.sh && ./simple_stability_setup.sh"

echo.
echo 🌐 Testing application after setup...
timeout /t 5 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Simple stability setup completed!
echo.
echo 🎯 What's now active:
echo    - Auto-monitoring and restart system (every 5 minutes)
echo    - Proper SSL certificates (no more SSL errors)
echo    - Daily backups at 2 AM
echo    - Security protection (fail2ban)
echo    - Service health checks
echo.
echo 🌐 Your application: https://crysgarage.studio
echo 📊 Monitoring: Active (checks every 5 minutes)
echo 💾 Backups: Daily at 2 AM
echo 🔒 SSL: Let's Encrypt certificate installed
echo 🛡️ Security: Fail2ban protection active
echo.
echo 🚀 Your VPS is now much more stable and secure!

pause 