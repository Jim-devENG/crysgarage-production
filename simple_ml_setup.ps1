# Simple ML Pipeline Setup - Working Version
param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY = "github_actions_key"
)

Write-Host "🚀 Simple ML Pipeline Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Set SSH key permissions
Write-Host "🔑 Setting SSH key permissions..." -ForegroundColor Yellow
icacls $SSH_KEY /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null

# Upload setup script
Write-Host "📤 Uploading setup script..." -ForegroundColor Yellow
scp -i $SSH_KEY -o StrictHostKeyChecking=no expert_ml_setup.sh "${VPS_USER}@${VPS_HOST}:/tmp/"

# Execute setup
Write-Host "🚀 Executing ML pipeline setup..." -ForegroundColor Yellow
Write-Host "This will take 5-10 minutes..." -ForegroundColor Cyan

ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "chmod +x /tmp/expert_ml_setup.sh && /tmp/expert_ml_setup.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ML Pipeline Setup Complete!" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Redis - Queue processing" -ForegroundColor White
    Write-Host "✅ Python ML Service - Intelligent mastering" -ForegroundColor White
    Write-Host "✅ Laravel Horizon - Queue monitoring" -ForegroundColor White
    Write-Host "✅ FFmpeg - Audio processing" -ForegroundColor White
    Write-Host "✅ Database - Updated with processing fields" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Your ML audio processing pipeline is ready!" -ForegroundColor Green
    Write-Host "🔗 Site: https://crysgarage.studio" -ForegroundColor Cyan
} else {
    Write-Host "❌ Setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Check status with:" -ForegroundColor Cyan
Write-Host "ssh -i $SSH_KEY $VPS_USER@$VPS_HOST systemctl status redis crysgarage-ml crysgarage-horizon" -ForegroundColor White
