Write-Host "Starting fast frontend deployment..." -ForegroundColor Green

$LOCAL_BUILD_PATH = "crysgarage-frontend/dist"

if (-not (Test-Path $LOCAL_BUILD_PATH)) {
    Write-Host "Build directory not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "Deploying frontend files..." -ForegroundColor Yellow

scp -o BatchMode=yes -o StrictHostKeyChecking=no -r "$LOCAL_BUILD_PATH/*" "root@209.74.80.162:/var/www/html/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend deployment completed successfully!" -ForegroundColor Green
    Write-Host "Your updated site should be live at: https://crysgarage.studio" -ForegroundColor Cyan
    Write-Host "Please test the authentication flow on the live server." -ForegroundColor Yellow
} else {
    Write-Host "Deployment failed. Please check your SSH key setup." -ForegroundColor Red
}

Write-Host "Deployment script completed!" -ForegroundColor Green
