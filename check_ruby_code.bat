@echo off
echo ========================================
echo Crys Garage - Check Ruby Code
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking Ruby file exists...
ssh crysgarage "ls -la /var/www/crysgarage/crysgarage-ruby/mastering_server.rb"
echo.

echo Step 2: Checking Ruby syntax...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && ruby -c mastering_server.rb"
echo.

echo Step 3: Checking Gemfile...
ssh crysgarage "cat /var/www/crysgarage/crysgarage-ruby/Gemfile"
echo.

echo Step 4: Checking if ffmpeg is installed...
ssh crysgarage "which ffmpeg || echo 'ffmpeg not found'"
echo.

echo Step 5: Checking ffmpeg version...
ssh crysgarage "ffmpeg -version | head -3"
echo.

echo Step 6: Checking Ruby version...
ssh crysgarage "ruby --version"
echo.

echo Step 7: Checking if required gems are installed...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && bundle list"
echo.

echo Step 8: Testing Ruby code manually...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-ruby && ruby -e \"require 'sinatra'; puts 'Sinatra loaded successfully'\""
echo.

echo Step 9: Checking for any error logs...
ssh crysgarage "find /var/www/crysgarage/crysgarage-ruby -name '*.log' -exec tail -10 {} \;"
echo.

echo Step 10: Checking system resources...
ssh crysgarage "ulimit -a"
echo.

echo ========================================
echo Ruby code check complete!
echo ========================================
echo 🔧 If issues found, run: .\fix_mastering_stuck.bat
echo.
pause 
