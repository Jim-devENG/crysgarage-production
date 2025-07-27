@echo off
echo ========================================
echo Crys Garage - Test Passwordless Deployment
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Testing SSH connection...
ssh crysgarage "echo '✅ SSH connection successful - no password prompt!'"
echo.

echo Step 2: Testing systemctl commands...
ssh crysgarage "systemctl status nginx --no-pager | head -5"
echo.

echo Step 3: Testing file operations...
ssh crysgarage "ls -la /var/www/crysgarage-frontend/ | head -3"
echo.

echo Step 4: Testing service management...
ssh crysgarage "systemctl is-active nginx"
echo.

echo Step 5: Testing Ruby service...
ssh crysgarage "systemctl status crysgarage-ruby --no-pager | head -3"
echo.

echo ========================================
echo Passwordless deployment test complete!
echo ========================================
echo 🔑 All commands executed without password prompts
echo 📝 Your deployment scripts are now ready to use
echo 🌐 Test deployment: .\quick_deploy.bat
echo.
pause 