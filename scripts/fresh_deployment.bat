@echo off
echo ========================================
echo Crys Garage - Fresh Deployment
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Stopping all services...
ssh root@209.74.80.162 "systemctl stop nginx apache2 httpd 2>/dev/null || true"
echo ✅ Services stopped
echo.

echo Step 2: Removing old installations...
ssh root@209.74.80.162 "rm -rf /var/www/*"
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage*"
echo ✅ Old installations removed
echo.

echo Step 3: Cleaning Nginx configuration...
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/*"
ssh root@209.74.80.162 "rm -f /etc/nginx/sites-enabled/*"
echo ✅ Nginx configs cleaned
echo.

echo Step 4: Building frontend locally...
cd crysgarage-frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
cd ..
echo.

echo Step 5: Creating fresh directory and uploading files...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage-frontend"
scp -r crysgarage-frontend\dist\* root@209.74.80.162:/var/www/crysgarage-frontend/
echo ✅ Files uploaded
echo.

echo Step 6: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage-frontend && chmod -R 755 /var/www/crysgarage-frontend"
echo ✅ Permissions set
echo.

echo Step 7: Creating clean Nginx config...
ssh root@209.74.80.162 "echo 'server { listen 80; root /var/www/crysgarage-frontend; index index.html; location / { try_files \$uri \$uri/ /index.html; } }' > /etc/nginx/conf.d/crysgarage.studio.conf"
echo ✅ Clean config created
echo.

echo Step 8: Starting Nginx...
ssh root@209.74.80.162 "nginx -t && systemctl start nginx"
echo ✅ Nginx started
echo.

echo Step 9: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 10: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -5"
echo.

echo Step 11: Verifying our files...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/"
echo.

echo ========================================
echo Fresh deployment complete!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 