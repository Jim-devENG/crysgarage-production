#!/usr/bin/env pwsh

# Debug Nginx Issue

Write-Host "=== Debugging Nginx Issue ===" -ForegroundColor Green

# Check the current Nginx configuration
Write-Host "Checking current Nginx configuration..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cat /etc/nginx/conf.d/crysgarage.conf"

# Check Nginx error logs
Write-Host "Checking Nginx error logs..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "tail -10 /var/log/nginx/error.log"

# Check Nginx access logs
Write-Host "Checking Nginx access logs..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "tail -5 /var/log/nginx/access.log"

# Test with different URLs
Write-Host "Testing different URLs..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "curl -I http://localhost/index.html"
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "curl -I http://crysgarage.studio"

# Check if the server_name is matching
Write-Host "Testing server name resolution..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "curl -H 'Host: crysgarage.studio' http://localhost"

# Check file permissions
Write-Host "Checking file permissions..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ls -la /var/www/html/index.html"

Write-Host "=== Debug Complete ===" -ForegroundColor Green


