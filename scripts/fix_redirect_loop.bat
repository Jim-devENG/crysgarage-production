@echo off
echo ========================================
echo Crys Garage - Fix Redirect Loop
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Stopping Nginx...
ssh root@209.74.80.162 "systemctl stop nginx"
echo ✅ Nginx stopped
echo.

echo Step 2: Creating proper Nginx config without redirect loop...
ssh root@209.74.80.162 "cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    
    root /var/www/crysgarage-frontend;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    location = / {
        try_files /index.html =404;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF"
echo ✅ Proper config created
echo.

echo Step 3: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 4: Starting Nginx...
ssh root@209.74.80.162 "systemctl start nginx"
echo ✅ Nginx started
echo.

echo Step 5: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 6: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -5"
echo.

echo Step 7: Verifying our files...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/"
echo.

echo ========================================
echo Redirect loop fix complete!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 