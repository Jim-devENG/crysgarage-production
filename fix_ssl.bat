@echo off
echo ========================================
echo Crys Garage - Fix SSL Setup
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo Domain: crysgarage.studio
echo.

echo Step 1: Stopping Nginx temporarily...
ssh root@209.74.80.162 "systemctl stop nginx"
echo ✅ Nginx stopped
echo.

echo Step 2: Obtaining SSL certificate for main domain only...
ssh root@209.74.80.162 "certbot certonly --standalone -d crysgarage.studio --email admin@crysgarage.studio --agree-tos --non-interactive"
echo ✅ SSL certificate obtained
echo.

echo Step 3: Uploading SSL Nginx config...
scp ssl_config.conf root@209.74.80.162:/etc/nginx/conf.d/default.conf
echo ✅ SSL config uploaded
echo.

echo Step 4: Testing Nginx configuration...
ssh root@209.74.80.162 "nginx -t"
echo.

echo Step 5: Starting Nginx...
ssh root@209.74.80.162 "systemctl start nginx"
echo ✅ Nginx started with SSL
echo.

echo Step 6: Testing HTTPS...
ssh root@209.74.80.162 "curl -I https://localhost"
echo.

echo Step 7: Setting up auto-renewal...
ssh root@209.74.80.162 "crontab -l 2>/dev/null | grep -v certbot > /tmp/crontab.tmp && echo '0 12 * * * /usr/bin/certbot renew --quiet' >> /tmp/crontab.tmp && crontab /tmp/crontab.tmp"
echo ✅ Auto-renewal configured
echo.

echo Step 8: Testing HTTP to HTTPS redirect...
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