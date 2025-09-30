# Deploy Frontend Only Script
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

$ErrorActionPreference = 'Stop'

Write-Host "Deploying Frontend Only..." -ForegroundColor Cyan

# Step 1: Clean web directory
Write-Host "`nCleaning web directory..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "rm -rf /var/www/html/*"

# Step 2: Create web directory
Write-Host "`nCreating web directory..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html"

# Step 3: Copy frontend files
Write-Host "`nCopying frontend files..." -ForegroundColor Yellow
scp $SSH_OPTS -r "crysgarage-frontend/dist/*" "${VPS_USER}@${VPS_HOST}:/var/www/html/"

# Step 4: Set permissions
Write-Host "`nSetting permissions..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "chown -R nginx:nginx /var/www/html/; chmod -R 755 /var/www/html/"

# Step 5: Start nginx
Write-Host "`nStarting nginx..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "systemctl start nginx; systemctl status nginx --no-pager"

Write-Host "`nFrontend deployment complete!" -ForegroundColor Green
Write-Host "Site: http://$VPS_HOST" -ForegroundColor Cyan

