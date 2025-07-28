@echo off
echo ========================================
echo Crys Garage - Quick Upload
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Uploading frontend files...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage-frontend"
scp -r crysgarage-frontend\dist\* root@209.74.80.162:/var/www/crysgarage-frontend/
echo ✅ Files uploaded
echo.

echo Step 2: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage-frontend && chmod -R 755 /var/www/crysgarage-frontend"
echo ✅ Permissions set
echo.

echo Step 3: Creating Nginx config...
ssh root@209.74.80.162 "cat > /etc/nginx/conf.d/crysgarage.studio.conf << 'EOF'
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
    
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
echo ✅ Nginx config created
echo.

echo Step 4: Restarting Nginx...
ssh root@209.74.80.162 "nginx -t && systemctl restart nginx"
echo ✅ Nginx restarted
echo.

echo Step 5: Testing...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo ========================================
echo Quick upload complete!
echo ========================================
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 