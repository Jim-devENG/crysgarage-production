# Frontend overwrite deploy
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$WEB_ROOT = "/var/www/html",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

$ErrorActionPreference = 'Stop'
Write-Host "Building frontend..." -ForegroundColor Yellow
Push-Location "crysgarage-frontend"
try {
  npm run build | Out-Null
} finally {
  Pop-Location
}

Write-Host "Overwriting $WEB_ROOT with new dist..." -ForegroundColor Yellow
# Clean remote web root then copy minimal dist
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "rm -rf $WEB_ROOT/* && mkdir -p $WEB_ROOT/assets" | Out-Null
scp $SSH_OPTS "crysgarage-frontend/dist/index.html" "${VPS_USER}@${VPS_HOST}:${WEB_ROOT}/" | Out-Null
scp $SSH_OPTS -r "crysgarage-frontend/dist/assets" "${VPS_USER}@${VPS_HOST}:${WEB_ROOT}/" | Out-Null

Write-Host "Reloading nginx..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "nginx -t && systemctl reload nginx" | Out-Null

Write-Host "Frontend overwrite deploy completed." -ForegroundColor Green
