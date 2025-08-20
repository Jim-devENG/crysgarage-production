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

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location crysgarage-frontend
npm run build
Set-Location ..

# Deploy to VPS using git pull (more reliable than direct file copy)
Write-Host "Deploying to VPS via git pull..." -ForegroundColor Yellow
$remoteDeployScript = @'
#!/usr/bin/env bash
set -e
cd /root/crysgarage-deploy
git pull origin master
cd crysgarage-frontend
npm run build
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/
nginx -t
systemctl reload nginx
echo "Deployment completed successfully"
'@

Write-Host "Running remote deployment script..." -ForegroundColor Yellow
$remoteDeployScript | ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "cat > /tmp/deploy_quick.sh && chmod +x /tmp/deploy_quick.sh && /tmp/deploy_quick.sh && rm -f /tmp/deploy_quick.sh"

Write-Host "Quick deploy completed!" -ForegroundColor Green
Write-Host "Site: https://crysgarage.studio" -ForegroundColor Blue
