@echo off
echo ========================================
echo Crys Garage - Quick Fix Deployment
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

echo Step 2: Creating deployment directory on server...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage-frontend"
echo.

echo Step 3: Uploading built frontend files...
scp -r crysgarage-frontend/dist/* root@209.74.80.162:/var/www/crysgarage-frontend/
echo.

echo Step 4: Setting proper permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage-frontend && chmod -R 755 /var/www/crysgarage-frontend"
echo.

echo Step 5: Creating proper Nginx configuration...
ssh root@209.74.80.162 "cat > /etc/nginx/conf.d/crysgarage.studio.conf << 'EOF'
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
    
    root /var/www/crysgarage-frontend;
    index index.html;
    
    # Handle React routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Audio processing proxy
    location /audio/ {
        proxy_pass http://localhost:4567/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF"
echo.

echo Step 6: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 7: Restarting Nginx...
ssh root@209.74.80.162 "systemctl restart nginx"
echo.

echo Step 8: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo Step 9: Checking if files are in place...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/"
echo.

echo ========================================
echo Quick fix deployment complete!
echo ========================================
echo.
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 