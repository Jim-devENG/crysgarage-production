# Sync Deployment Directory Script
# This script ensures the VPS deployment directory is always in sync with the latest code

Write-Host "🔄 Syncing VPS deployment directory with latest code..." -ForegroundColor Cyan

# SSH command to sync the deployment directory
$sshCommand = @"
export PATH="/usr/local/ruby-3.1.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
cd /var/www/crysgarage-deploy
git reset --hard HEAD
git clean -fd
git pull origin master
echo "✅ Deployment directory synced successfully"
"@

# Execute the SSH command
ssh root@209.74.80.162 $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VPS deployment directory synced successfully!" -ForegroundColor Green
    Write-Host "📝 Next GitHub Actions deployment will use the latest code" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to sync deployment directory" -ForegroundColor Red
    Write-Host "Please check your SSH connection and try again" -ForegroundColor Red
}

Write-Host "`n💡 Tip: Run this script whenever you want to ensure GitHub Actions uses the latest code" -ForegroundColor Cyan
