# Backend overwrite deploy (Laravel)
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$REMOTE_PATH = "/var/www/html/api",
  [string]$LOCAL_PATH = "crysgarage-backend/laravel",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

$ErrorActionPreference = 'Stop'
Write-Host "Packaging Laravel backend..." -ForegroundColor Yellow
$tarPath = Join-Path $env:TEMP ("laravel_" + [guid]::NewGuid().ToString() + ".zip")
if (-not (Test-Path $LOCAL_PATH)) { throw "Local Laravel path not found: $LOCAL_PATH" }

# Create tar.gz excluding vendor cache if needed
Compress-Archive -Path (Join-Path $LOCAL_PATH '*') -DestinationPath $tarPath -Force

Write-Host "Uploading package..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p $REMOTE_PATH" | Out-Null
scp $SSH_OPTS "$tarPath" "${VPS_USER}@${VPS_HOST}:/tmp/laravel_deploy.zip" | Out-Null

Write-Host "Extracting remotely..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "rm -rf $REMOTE_PATH/* && mkdir -p $REMOTE_PATH && unzip -o /tmp/laravel_deploy.zip -d $REMOTE_PATH && rm -f /tmp/laravel_deploy.zip" | Out-Null

Write-Host "Installing composer dependencies (if composer available)..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "cd $REMOTE_PATH && if command -v composer >/dev/null 2>&1; then COMPOSER_ALLOW_SUPERUSER=1 composer install -n --no-dev --optimize-autoloader; fi && php artisan config:clear && php artisan route:clear && php artisan cache:clear" | Out-Null

Write-Host "Reloading services..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "systemctl restart php-fpm || systemctl restart php8.2-fpm; nginx -t && systemctl reload nginx" | Out-Null

Write-Host "Backend overwrite deploy completed." -ForegroundColor Green
