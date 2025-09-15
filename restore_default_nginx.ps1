#!/usr/bin/env pwsh

# Restore Default Nginx Configuration
# Remove ML pipeline configuration and restore clean setup

Write-Host "=== Restoring Default Nginx Configuration ===" -ForegroundColor Green

# Create a simple, clean Nginx configuration
$nginxConfig = @"
server {
    listen 80;
    listen 443 ssl;
    server_name crysgarage.studio;

    ssl_certificate /etc/nginx/ssl/crysgarage.studio.crt;
    ssl_certificate_key /etc/nginx/ssl/crysgarage.studio.key;

    root /var/www/html;
    index index.html index.htm index.php;

    # Main site
    location / {
        try_files `$uri `$uri/ /index.html;
    }

    # PHP support for any PHP files
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME `$document_root`$fastcgi_script_name;
    }

    # Error pages
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
$nginxConfig | Out-File -FilePath "nginx-default.conf" -Encoding UTF8

Write-Host "Created default Nginx configuration locally" -ForegroundColor Yellow

# Copy to server
Write-Host "Copying configuration to server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no nginx-default.conf root@209.74.80.162:/etc/nginx/conf.d/crysgarage.conf

# Remove ML pipeline directory to clean up
Write-Host "Removing ML pipeline directory..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "rm -rf /var/www/html/ml-pipeline"

# Test and reload Nginx
Write-Host "Testing and reloading Nginx..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "nginx -t && systemctl reload nginx"

# Check status
Write-Host "Checking Nginx status..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "systemctl status nginx --no-pager"

# Test the main site
Write-Host "Testing main site..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "curl -I http://localhost"

Write-Host "=== Default Nginx Configuration Restored ===" -ForegroundColor Green
Write-Host "Main site should now work at: https://crysgarage.studio" -ForegroundColor Cyan

