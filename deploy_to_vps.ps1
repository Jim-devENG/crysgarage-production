# Crys Garage VPS Deployment Script (PowerShell)
# Customize the variables below with your VPS details

# VPS Connection Details
$VPS_USER = "root"
$VPS_HOST = "209.74.80.162"
$VPS_PORT = "22"
$VPS_PATH = "/var/www/crysgarage"

# Local project path
$LOCAL_PROJECT_PATH = Get-Location

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Crys Garage VPS Deployment" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

Write-Host "📤 Uploading deployment script to VPS..." -ForegroundColor Yellow
scp deploy_to_vps.sh root@209.74.80.162:/var/www/crysgarage-deploy/

Write-Host "🔧 Executing deployment on VPS..." -ForegroundColor Yellow
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x deploy_to_vps.sh && ./deploy_to_vps.sh"

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Check your application at: https://crysgarage.studio" -ForegroundColor Cyan
Read-Host "Press Enter to continue" 