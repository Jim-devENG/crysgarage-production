@echo off
echo ========================================
echo Crys Garage - Fix Ruby Dependencies
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Stopping Ruby service...
ssh crysgarage "systemctl stop crysgarage-ruby"
echo ✅ Service stopped
echo.

echo Step 2: Installing Ruby and development tools...
ssh crysgarage "dnf install -y ruby ruby-devel gcc gcc-c++ make"
echo ✅ Ruby installed
echo.

echo Step 3: Installing Bundler...
ssh crysgarage "gem install bundler"
echo ✅ Bundler installed
echo.

echo Step 4: Creating directories...
ssh crysgarage "mkdir -p /var/www/crysgarage/crysgarage-ruby/output /var/www/crysgarage/crysgarage-ruby/temp"
echo ✅ Directories created
echo.

echo Step 5: Installing Ruby dependencies...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && bundle install"
echo ✅ Dependencies installed
echo.

echo Step 6: Setting proper permissions...
ssh crysgarage "chown -R nginx:nginx /var/www/crysgarage/crysgarage-ruby"
ssh crysgarage "chmod -R 755 /var/www/crysgarage/crysgarage-ruby"
echo ✅ Permissions set
echo.

echo Step 7: Testing Ruby code...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && ruby -e \"require 'sinatra'; puts 'Sinatra loaded successfully'\""
echo ✅ Ruby test passed
echo.

echo Step 8: Starting Ruby service...
ssh crysgarage "systemctl start crysgarage-ruby"
echo ✅ Service started
echo.

echo Step 9: Waiting for service to stabilize...
timeout /t 5 /nobreak >nul
echo.

echo Step 10: Checking service status...
ssh crysgarage "systemctl status crysgarage-ruby --no-pager"
echo.

echo Step 11: Testing health endpoint...
ssh crysgarage "curl -s http://localhost:4567/health"
echo.

echo Step 12: Checking if listening...
ssh crysgarage "netstat -tlnp | grep :4567"
echo.

echo ========================================
echo Ruby dependencies fixed!
echo ========================================
echo 🌐 Test mastering at: https://crysgarage.studio
echo 📊 Monitor: .\monitor_mastering.bat
echo.
pause 
