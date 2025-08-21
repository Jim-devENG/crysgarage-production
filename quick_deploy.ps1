# Quick Deploy Script for Crys Garage
# For fast deployments when you just want to update the site

param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa"
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

# Copy files individually to exclude audio files
$distFiles = Get-ChildItem "crysgarage-frontend/dist/" -File | Where-Object { $_.Extension -notmatch '\.(wav|mp3|flac|aac|ogg|aiff|m4a|wma)$' }
foreach ($file in $distFiles) {
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no "crysgarage-frontend/dist/$($file.Name)" "${VPS_USER}@${VPS_HOST}:/tmp/frontend/"
}

# Copy directories (assets, etc.)
$distDirs = Get-ChildItem "crysgarage-frontend/dist/" -Directory
foreach ($dir in $distDirs) {
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -r "crysgarage-frontend/dist/$($dir.Name)" "${VPS_USER}@${VPS_HOST}:/tmp/frontend/"
}

Write-Host "Running remote deployment script..." -ForegroundColor Yellow
# Copy the script to VPS and execute it
scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $tempScriptPath "${VPS_USER}@${VPS_HOST}:/tmp/deploy_quick.sh"
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "chmod +x /tmp/deploy_quick.sh && /tmp/deploy_quick.sh && rm -f /tmp/deploy_quick.sh"

# Clean up temporary file
Remove-Item $tempScriptPath -ErrorAction SilentlyContinue

Write-Host "Quick deploy completed!" -ForegroundColor Green
Write-Host "Site: https://crysgarage.studio" -ForegroundColor Blue
