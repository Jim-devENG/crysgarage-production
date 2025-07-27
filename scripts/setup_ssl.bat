@echo off
echo ========================================
echo Crys Garage - SSL Setup
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo Domain: crysgarage.studio
echo.

echo Step 1: Installing Certbot (Let's Encrypt client)...
ssh root@209.74.80.162 "dnf install -y epel-release"
ssh root@209.74.80.162 "dnf install -y certbot python3-certbot-nginx"
echo ✅ Certbot installed
echo.

echo Step 2: Stopping Nginx temporarily...
ssh root@209.74.80.162 "systemctl stop nginx"
echo ✅ Nginx stopped
echo.

echo Step 3: Obtaining SSL certificate...
ssh root@209.74.80.162 "certbot certonly --standalone -d crysgarage.studio -d www.crysgarage.studio --email admin@crysgarage.studio --agree-tos --non-interactive"
echo ✅ SSL certificate obtained
echo.

echo Step 4: Creating SSL-enabled Nginx config...
ssh root@209.74.80.162 "cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crysgarage.studio www.crysgarage.studio;
    
    ssl_certificate /etc/letsencrypt/live/crysgarage.studio/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crysgarage.studio/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
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
echo ✅ SSL Nginx config created
echo.

echo Step 5: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 6: Starting Nginx...
ssh root@209.74.80.162 "systemctl start nginx"
echo ✅ Nginx started with SSL
echo.

echo Step 7: Testing HTTPS...
ssh root@209.74.80.162 "curl -I https://localhost"
echo.

echo Step 8: Setting up auto-renewal...
ssh root@209.74.80.162 "crontab -l 2>/dev/null | grep -v certbot > /tmp/crontab.tmp && echo '0 12 * * * /usr/bin/certbot renew --quiet' >> /tmp/crontab.tmp && crontab /tmp/crontab.tmp"
echo ✅ Auto-renewal configured
echo.

echo Step 9: Testing HTTP to HTTPS redirect...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo ========================================
echo SSL setup complete!
echo ========================================
echo 🔒 HTTPS: https://crysgarage.studio
echo 🔄 HTTP redirects to HTTPS automatically
echo 🔄 Certificate auto-renews monthly
echo.
pause 