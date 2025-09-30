# Fast Backend Deployment Script
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

Write-Host "Fast Backend Deployment..." -ForegroundColor Cyan

# Step 1: Create essential files only
Write-Host "Creating essential backend package..." -ForegroundColor Yellow
$essentialFiles = @(
  "crysgarage-backend/app",
  "crysgarage-backend/bootstrap",
  "crysgarage-backend/config", 
  "crysgarage-backend/routes",
  "crysgarage-backend/database/migrations",
  "crysgarage-backend/public/index.php",
  "crysgarage-backend/composer.json",
  "crysgarage-backend/artisan"
)

$tempDir = "temp_backend_$(Get-Date -Format 'HHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force

foreach ($file in $essentialFiles) {
  if (Test-Path $file) {
    $dest = $file -replace "crysgarage-backend/", "$tempDir/"
    $destDir = Split-Path $dest -Parent
    New-Item -ItemType Directory -Path $destDir -Force -ErrorAction SilentlyContinue
    Copy-Item $file $dest -Recurse -Force
  }
}

# Step 2: Upload essential files
Write-Host "Uploading essential files..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html/api"
scp $SSH_OPTS -r "$tempDir/*" "${VPS_USER}@${VPS_HOST}:/var/www/html/api/"

# Step 3: Install dependencies and setup
Write-Host "Setting up Laravel..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "cd /var/www/html/api && if [ -f composer.json ]; then composer install --no-dev --optimize-autoloader --no-interaction; fi && php artisan config:clear && php artisan route:clear && php artisan cache:clear && chown -R nginx:nginx /var/www/html/api/ && chmod -R 755 /var/www/html/api/"

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "Fast backend deployment completed!" -ForegroundColor Green
