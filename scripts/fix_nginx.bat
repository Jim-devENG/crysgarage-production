@echo off
echo ========================================
echo Fixing Nginx Configuration (No Password)
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking current Nginx config...
ssh root@209.74.80.162 "cat /etc/nginx/conf.d/crysgarage.conf"

echo.
echo Step 2: Fixing Nginx configuration...
ssh root@209.74.80.162 "echo 'server { listen 80; server_name crysgarage.studio www.crysgarage.studio; root /var/www/crysgarage/crysgarage-frontend/dist; index index.html; location / { try_files \$uri \$uri/ /index.html; } location /api { proxy_pass http://127.0.0.1:8000; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$scheme; } location /audio { proxy_pass http://127.0.0.1:4567; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto \$scheme; } }' > /etc/nginx/conf.d/crysgarage.conf"

echo.
echo Step 3: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"

echo.
echo Step 4: Reloading Nginx...
ssh root@209.74.80.162 "systemctl reload nginx"

echo.
echo Step 5: Checking if frontend files exist...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/dist/"

echo.
echo Step 6: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo ========================================
echo NGINX FIX COMPLETED!
echo ========================================
echo.
echo Now visit: http://crysgarage.studio
echo You should see your React frontend instead of Laravel.
echo.
pause 