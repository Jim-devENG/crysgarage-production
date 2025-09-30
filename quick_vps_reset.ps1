# Quick VPS Reset and Deploy Script
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

$ErrorActionPreference = 'Stop'

Write-Host "🚀 Quick VPS Reset and Deploy..." -ForegroundColor Cyan

# Step 1: Clean VPS
Write-Host "`n🗑️  Cleaning VPS..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
rm -rf /var/www/html/*
rm -rf /var/www/html/api/*
rm -rf /var/www/html/ruby/*
systemctl stop nginx
"@

# Step 2: Build and Deploy Frontend
Write-Host "`n🌐 Building and Deploying Frontend..." -ForegroundColor Yellow
Push-Location "crysgarage-frontend"
try {
    npm run build | Out-Null
    ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html"
    scp $SSH_OPTS -r "dist/*" "${VPS_USER}@${VPS_HOST}:/var/www/html/"
} finally {
    Pop-Location
}

# Step 3: Deploy Backend
Write-Host "`n🔧 Deploying Backend..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html/api"
$backendTar = Join-Path $env:TEMP "backend_$(Get-Date -Format 'yyyyMMddHHmmss').zip"
Compress-Archive -Path "crysgarage-backend/*" -DestinationPath $backendTar -Force
scp $SSH_OPTS "$backendTar" "${VPS_USER}@${VPS_HOST}:/tmp/backend.zip"

ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
cd /var/www/html/api
unzip -o /tmp/backend.zip
rm -f /tmp/backend.zip
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/
"@

Remove-Item $backendTar -Force

# Step 4: Start Services
Write-Host "`n🚀 Starting Services..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
systemctl start php8.2-fpm || systemctl start php-fpm
systemctl start nginx
"@

Write-Host "`n✅ Quick Deploy Complete!" -ForegroundColor Green
Write-Host "🌐 Site: http://$VPS_HOST" -ForegroundColor Cyan

