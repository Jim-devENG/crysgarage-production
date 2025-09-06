# Automated Deployment Script
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

Write-Host "Automated Deployment Starting..." -ForegroundColor Cyan

# Step 1: Commit and push changes
Write-Host "Committing and pushing changes..." -ForegroundColor Yellow
git add .
try { git commit -m "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" } catch { Write-Host "No changes to commit" -ForegroundColor Yellow }
git push origin main

# Step 2: Deploy to VPS
Write-Host "Deploying to VPS..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
cd /var/www/crysgarage-deploy || mkdir -p /var/www/crysgarage-deploy
git pull origin main
"@

# Step 3: Build and deploy frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Push-Location "crysgarage-frontend"
npm run build
Pop-Location

# Copy frontend
Write-Host "Deploying frontend..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "rm -rf /var/www/html/*"
scp $SSH_OPTS -r "crysgarage-frontend/dist/*" "${VPS_USER}@${VPS_HOST}:/var/www/html/"

# Step 4: Deploy backend essentials
Write-Host "Deploying backend..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
cd /var/www/crysgarage-deploy/crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan route:clear
php artisan cache:clear
"@

# Step 5: Restart services
Write-Host "Restarting services..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "systemctl restart php8.2-fpm && systemctl reload nginx"

Write-Host "Automated deployment completed!" -ForegroundColor Green
Write-Host "Site: https://crysgarage.studio" -ForegroundColor Cyan
