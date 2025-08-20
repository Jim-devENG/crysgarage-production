# Quick Deploy Script for Crys Garage
# For fast deployments when you just want to update the site

param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa"
)

Write-Host "Quick Deploy - Crys Garage" -ForegroundColor Cyan
Write-Host ""

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location crysgarage-frontend
npm run build
Set-Location ..

# Ensure remote temp directory exists
Write-Host "Preparing remote temp directory..." -ForegroundColor Yellow
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "rm -rf /tmp/frontend && mkdir -p /tmp/frontend"

# Deploy to VPS
Write-Host "Deploying to VPS..." -ForegroundColor Yellow
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -r "crysgarage-frontend/dist/*" "${VPS_USER}@${VPS_HOST}:/tmp/frontend/"

# Create and run deployment script on VPS
$remoteScript = @'
#!/usr/bin/env bash
set -e
rm -rf /var/www/html/*
cp -r /tmp/frontend/* /var/www/html/
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/
nginx -t
systemctl reload nginx
rm -rf /tmp/frontend
'@

Write-Host "Running remote deployment script..." -ForegroundColor Yellow
$remoteScript | ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "cat > /tmp/deploy_quick.sh && chmod +x /tmp/deploy_quick.sh && /tmp/deploy_quick.sh && rm -f /tmp/deploy_quick.sh"

Write-Host "Quick deploy completed!" -ForegroundColor Green
Write-Host "Site: https://crysgarage.studio" -ForegroundColor Blue
