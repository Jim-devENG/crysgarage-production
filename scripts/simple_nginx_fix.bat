@echo off
echo ========================================
echo Crys Garage - Simple Nginx Fix
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Creating Nginx config file locally...
(
echo server {
echo     listen 80 default_server;
echo     server_name _;
echo.    
echo     root /var/www/crysgarage-frontend;
echo     index index.html;
echo.    
echo     location / {
echo         try_files $uri $uri/ /index.html;
echo     }
echo.    
echo     location /api/ {
echo         proxy_pass http://localhost:8000/;
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo     }
echo.    
echo     location /audio/ {
echo         proxy_pass http://localhost:4567/;
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo     }
echo.    
echo     location ~* \.(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^)$ {
echo         expires 1y;
echo         add_header Cache-Control "public, immutable";
echo     }
echo }
) > nginx_fixed.conf
echo ✅ Nginx config created locally
echo.

echo Step 2: Removing conflicting configs...
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/default.conf"
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/autoindex.conf"
echo ✅ Removed conflicting configs
echo.

echo Step 3: Uploading new config...
scp nginx_fixed.conf root@209.74.80.162:/etc/nginx/conf.d/crysgarage.studio.conf
echo ✅ Config uploaded
echo.

echo Step 4: Testing and restarting Nginx...
ssh root@209.74.80.162 "nginx -t && systemctl restart nginx"
echo ✅ Nginx restarted
echo.

echo Step 5: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 6: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -5"
echo.

echo ========================================
echo Simple Nginx fix complete!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 