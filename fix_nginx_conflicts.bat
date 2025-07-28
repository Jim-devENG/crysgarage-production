@echo off
echo ========================================
echo Crys Garage - Fix Nginx Conflicts
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking existing Nginx configs...
ssh root@209.74.80.162 "ls -la /etc/nginx/conf.d/"
echo.

echo Step 2: Removing conflicting configs...
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/default.conf"
ssh root@209.74.80.162 "rm -f /etc/nginx/conf.d/autoindex.conf"
echo ✅ Removed conflicting configs
echo.

echo Step 3: Creating clean Nginx config...
ssh root@209.74.80.162 "cat > /etc/nginx/conf.d/crysgarage.studio.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    
    root /var/www/crysgarage-frontend;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /audio/ {
        proxy_pass http://localhost:4567/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF"
echo ✅ Clean config created
echo.

echo Step 4: Testing and restarting Nginx...
ssh root@209.74.80.162 "nginx -t && systemctl restart nginx"
echo ✅ Nginx restarted
echo.

echo Step 5: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 6: Checking what's being served...
ssh root@209.74.80.162 "curl -s http://localhost | head -10"
echo.

echo ========================================
echo Nginx conflicts fixed!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 