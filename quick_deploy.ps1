# Quick Deploy Script for Crys Garage
# For fast deployments when you just want to update the site
# Now includes backend deployment for major changes

param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa",
    [switch]$IncludeBackend = $false
)

Write-Host "Quick Deploy - Crys Garage" -ForegroundColor Cyan
Write-Host ""

# Check for uncommitted changes and commit them
Write-Host "Checking for uncommitted changes..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto-commit: Quick deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "Changes committed successfully." -ForegroundColor Green
} else {
    Write-Host "No uncommitted changes found." -ForegroundColor Green
}

# Push to remote repository
Write-Host "Pushing to remote repository..." -ForegroundColor Yellow
git push
Write-Host "Changes pushed to repository." -ForegroundColor Green

# Deploy backend if requested or if there are backend changes
$backendChanges = $false
if ($IncludeBackend) {
    $backendChanges = $true
} else {
    # Check if there are backend-related changes
    $backendFiles = git diff --name-only HEAD~1 | Where-Object { $_ -like "crysgarage-backend/*" -or $_ -like "*.php" -or $_ -like "*.env*" }
    if ($backendFiles) {
        Write-Host "Backend changes detected. Including backend deployment..." -ForegroundColor Yellow
        $backendChanges = $true
    }
}

# Deploy backend if needed
if ($backendChanges) {
    Write-Host "Deploying backend changes..." -ForegroundColor Yellow
    
    # Pull changes on VPS
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "cd /var/www/crysgarage-deploy && git pull"
    
    # Copy CORS config if it exists locally
    if (Test-Path "cors_config.php") {
        Write-Host "Copying CORS configuration..." -ForegroundColor Yellow
        scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no "cors_config.php" "${VPS_USER}@${VPS_HOST}:/var/www/crysgarage-deploy/crysgarage-backend/laravel/config/cors.php"
    }
    
    # Copy bootstrap app config if it exists locally
    if (Test-Path "bootstrap_app_with_cors.php") {
        Write-Host "Copying bootstrap configuration..." -ForegroundColor Yellow
        scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no "bootstrap_app_with_cors.php" "${VPS_USER}@${VPS_HOST}:/var/www/crysgarage-deploy/crysgarage-backend/laravel/bootstrap/app.php"
    }
    
    # Run Laravel commands
    Write-Host "Running Laravel setup commands..." -ForegroundColor Yellow
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "cd /var/www/crysgarage-deploy/crysgarage-backend/laravel && php artisan config:clear && php artisan route:clear && php artisan cache:clear"
    
    # Restart PHP-FPM
    Write-Host "Restarting PHP-FPM..." -ForegroundColor Yellow
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "systemctl restart php-fpm"
    
    Write-Host "Backend deployment completed." -ForegroundColor Green
}

# Build frontend locally
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location crysgarage-frontend
npm run build
Set-Location ..

# Deploy to VPS by copying built files directly
Write-Host "Deploying to VPS..." -ForegroundColor Yellow

# Create a temporary script file with proper line endings
$tempScriptPath = "temp_deploy_script.sh"
$remoteDeployScript = @"
#!/bin/bash
set -e

# Clear the web directory
rm -rf /var/www/html/*

# Copy files from temp to web directory
cp -r /tmp/frontend/* /var/www/html/

# Set proper permissions
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/

# Test and reload nginx
nginx -t
systemctl reload nginx

echo "Deployment completed successfully"
"@

# Write script to temporary file and convert to Unix line endings
$remoteDeployScript -replace "`r`n", "`n" | Out-File -FilePath $tempScriptPath -Encoding UTF8 -NoNewline

Write-Host "Copying built files to VPS temp directory..." -ForegroundColor Yellow
# Copy the built frontend files to temp directory first (excluding audio files)
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "rm -rf /tmp/frontend && mkdir -p /tmp/frontend"

# Copy only essential files - exclude large images and audio files
Write-Host "Copying essential files only..." -ForegroundColor Yellow

# Copy index.html first
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no "crysgarage-frontend/dist/index.html" "${VPS_USER}@${VPS_HOST}:/tmp/frontend/"

# Copy assets directory (contains JS and CSS)
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -r "crysgarage-frontend/dist/assets" "${VPS_USER}@${VPS_HOST}:/tmp/frontend/"

# Copy only small essential images, exclude large ones
$smallImages = @("CRG_Logo_svg.svg", "studio.jpg")
foreach ($img in $smallImages) {
    if (Test-Path "crysgarage-frontend/dist/$img") {
        scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no "crysgarage-frontend/dist/$img" "${VPS_USER}@${VPS_HOST}:/tmp/frontend/"
    }
}

Write-Host "Running remote deployment script..." -ForegroundColor Yellow
# Copy the script to VPS and execute it
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $tempScriptPath "${VPS_USER}@${VPS_HOST}:/tmp/deploy_quick.sh"
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "chmod +x /tmp/deploy_quick.sh && /tmp/deploy_quick.sh && rm -f /tmp/deploy_quick.sh"

# Clean up temporary file
Remove-Item $tempScriptPath -ErrorAction SilentlyContinue

Write-Host "Quick deploy completed!" -ForegroundColor Green
Write-Host "Site: https://crysgarage.studio" -ForegroundColor Blue
