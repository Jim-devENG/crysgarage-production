#!/usr/bin/env pwsh

# Fix Nginx Configuration Properly
# Create a working default configuration

Write-Host "=== Fixing Nginx Configuration ===" -ForegroundColor Green

# First, let's check what's currently in the conf.d directory
Write-Host "Checking current Nginx configuration..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ls -la /etc/nginx/conf.d/"

# Remove any problematic configuration files
Write-Host "Removing problematic configuration..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "rm -f /etc/nginx/conf.d/crysgarage.conf"

# Create a simple working configuration
$nginxConfig = @"
server {
    listen 80;
    listen 443 ssl;
    server_name crysgarage.studio;

    ssl_certificate /etc/nginx/ssl/crysgarage.studio.crt;
    ssl_certificate_key /etc/nginx/ssl/crysgarage.studio.key;

    root /var/www/html;
    index index.html index.htm;

    location / {
        try_files `$uri `$uri/ /index.html;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        internal;
    }
}
"@

# Write the configuration to a local file
$nginxConfig | Out-File -FilePath "nginx-simple.conf" -Encoding UTF8

Write-Host "Created simple Nginx configuration locally" -ForegroundColor Yellow

# Copy to server
Write-Host "Copying configuration to server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no nginx-simple.conf root@209.74.80.162:/etc/nginx/conf.d/crysgarage.conf

# Test and reload Nginx
Write-Host "Testing and reloading Nginx..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "nginx -t && systemctl reload nginx"

# Check status
Write-Host "Checking Nginx status..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "systemctl status nginx --no-pager"

# Test the main site
Write-Host "Testing main site..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "curl -I http://localhost"

Write-Host "=== Nginx Configuration Fixed ===" -ForegroundColor Green

