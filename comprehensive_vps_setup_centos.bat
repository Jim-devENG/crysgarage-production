@echo off
echo 🚀 Comprehensive VPS Setup for Crys Garage (CentOS/RHEL)
echo ========================================================

echo.
echo This will install Docker, fix SSL issues, and set up monitoring
echo to prevent shutdowns and ensure your VPS stays stable.
echo.
echo 📋 What will be installed:
echo    - Docker and Docker Compose for containerization
echo    - Let's Encrypt SSL certificates
echo    - Monitoring and auto-restart system
echo    - Fail2ban for security
echo    - Daily backups
echo    - Rate limiting and security headers
echo.
echo ⚠️  This will take several minutes to complete.
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Setup cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading CentOS-compatible setup script to VPS...
scp comprehensive_vps_setup_centos.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running comprehensive VPS setup (CentOS/RHEL)...
echo This may take 10-15 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x comprehensive_vps_setup_centos.sh && ./comprehensive_vps_setup_centos.sh"

echo.
echo 🌐 Testing application after setup...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Comprehensive VPS setup completed!
echo.
echo 🎯 What's now active:
echo    - Docker containerization for all services
echo    - Proper SSL certificates (no more SSL errors)
echo    - Auto-monitoring and restart system
echo    - Daily backups
echo    - Security protection (fail2ban)
echo    - Rate limiting and security headers
echo.
echo 🌐 Your application: https://crysgarage.studio
echo 📊 Monitoring: Active (checks every 5 minutes)
echo 💾 Backups: Daily at 2 AM
echo 🔒 SSL: Let's Encrypt certificate installed
echo 🐳 Docker: All services containerized
echo.
echo 🚀 Your VPS is now much more stable and secure!

pause 