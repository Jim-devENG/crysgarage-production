#!/usr/bin/env pwsh

# Check Nginx Structure and Fix Configuration

Write-Host "=== Checking Nginx Structure ===" -ForegroundColor Green

# Check the main nginx.conf file
Write-Host "Checking main nginx.conf..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "head -20 /etc/nginx/nginx.conf"

# Check if there's an include directive for conf.d
Write-Host "Checking for include directive..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "grep -n 'include.*conf.d' /etc/nginx/nginx.conf"

# Check what's in the current crysgarage.conf
Write-Host "Checking current crysgarage.conf..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cat /etc/nginx/conf.d/crysgarage.conf"

# Let's use one of the working backup configurations
Write-Host "Checking backup configurations..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "head -10 /etc/nginx/conf.d/crysgarage.studio.conf.backup"

# Copy a working backup configuration
Write-Host "Restoring from working backup..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cp /etc/nginx/conf.d/crysgarage.studio.conf.backup /etc/nginx/conf.d/crysgarage.conf"

# Test and reload
Write-Host "Testing and reloading Nginx..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "nginx -t && systemctl reload nginx"

# Test the site
Write-Host "Testing main site..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "curl -I http://localhost"

Write-Host "=== Nginx Structure Check Complete ===" -ForegroundColor Green

