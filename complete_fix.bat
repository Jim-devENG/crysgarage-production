@echo off
echo ========================================
echo Crys Garage - Complete Fix
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Building frontend locally...
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

echo Step 2: Creating Nginx config file locally...
(
echo server {
echo     listen 80;
echo     server_name crysgarage.studio www.crysgarage.studio;
echo.    
echo     root /var/www/crysgarage-frontend;
echo     index index.html;
echo.    
echo     # Handle React routing
echo     location / {
echo         try_files $uri $uri/ /index.html;
echo     }
echo.    
echo     # API proxy
echo     location /api/ {
echo         proxy_pass http://localhost:8000/;
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo     }
echo.    
echo     # Audio processing proxy
echo     location /audio/ {
echo         proxy_pass http://localhost:4567/;
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo     }
echo.    
echo     # Static files
echo     location ~* \.(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^)$ {
echo         expires 1y;
echo         add_header Cache-Control "public, immutable";
echo     }
echo }
) > nginx_config.conf
echo ✅ Nginx config created locally
echo.

echo Step 3: Creating directory on server...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage-frontend"
echo.

echo Step 4: Uploading frontend files...
scp -r crysgarage-frontend\dist\* root@209.74.80.162:/var/www/crysgarage-frontend/
echo.

echo Step 5: Setting proper permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage-frontend && chmod -R 755 /var/www/crysgarage-frontend"
echo.

echo Step 6: Uploading Nginx config to server...
scp nginx_config.conf root@209.74.80.162:/etc/nginx/conf.d/crysgarage.studio.conf
echo.

echo Step 7: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 8: Restarting Nginx...
ssh root@209.74.80.162 "systemctl restart nginx"
echo.

echo Step 9: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 10: Checking if files are in place...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/"
echo.

echo Step 11: Checking Nginx status...
ssh root@209.74.80.162 "systemctl status nginx --no-pager"
echo.

echo ========================================
echo Complete fix deployment finished!
echo ========================================
echo.
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 