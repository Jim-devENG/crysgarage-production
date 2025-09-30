# Fast Frontend Deploy Script for Crys Garage (PowerShell Version)
# This script deploys the updated frontend to the live server

Write-Host "🚀 Starting fast frontend deployment..." -ForegroundColor Green

# Set variables
$SERVER_IP = "209.74.80.162"
$SERVER_USER = "root"
$SERVER_PATH = "/var/www/html"
$LOCAL_BUILD_PATH = "crysgarage-frontend/dist"

# Check if build directory exists
if (-not (Test-Path $LOCAL_BUILD_PATH)) {
    Write-Host "❌ Build directory not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Deploying frontend files to ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}" -ForegroundColor Yellow

# Deploy using scp with SSH key authentication
$scpCommand = "scp -o BatchMode=yes -o StrictHostKeyChecking=no -r `"${LOCAL_BUILD_PATH}/*`" `"${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/`""
Write-Host "Running: $scpCommand" -ForegroundColor Gray

Invoke-Expression $scpCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your updated site should be live at: https://crysgarage.studio" -ForegroundColor Cyan
    Write-Host "🔄 Please test the authentication flow on the live server." -ForegroundColor Yellow
    Write-Host "💡 Tip: If you don't see changes, try hard refresh (Ctrl+F5) or clear browser cache" -ForegroundColor Magenta
} else {
    Write-Host "❌ Deployment failed. Please check your SSH key setup and try again." -ForegroundColor Red
    Write-Host "🔑 Make sure your SSH key is added to the server's authorized_keys" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment script completed!" -ForegroundColor Green
