# Expert ML Pipeline Setup - PowerShell Execution Script
param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY = "github_actions_key"
)

Write-Host "🚀 Expert ML Pipeline Setup - PowerShell Execution" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Set SSH key permissions
Write-Host "🔑 Setting SSH key permissions..." -ForegroundColor Yellow
try {
    icacls $SSH_KEY /inheritance:r /grant:r "$env:USERNAME`:F" | Out-Null
    Write-Host "✅ SSH key permissions set" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not set SSH key permissions, continuing..." -ForegroundColor Yellow
}

# Upload the expert setup script to server
Write-Host "📤 Uploading expert setup script to server..." -ForegroundColor Yellow
try {
    scp -i $SSH_KEY -o StrictHostKeyChecking=no expert_ml_setup.sh "${VPS_USER}@${VPS_HOST}:/tmp/expert_ml_setup.sh"
    Write-Host "✅ Setup script uploaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to upload setup script" -ForegroundColor Red
    Write-Host "Please upload the expert_ml_setup.sh file manually to your server" -ForegroundColor Yellow
    exit 1
}

# Make script executable and run it
Write-Host "🚀 Executing expert ML pipeline setup..." -ForegroundColor Yellow
Write-Host "This will take 5-10 minutes to complete..." -ForegroundColor Cyan
Write-Host ""

try {
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "chmod +x /tmp/expert_ml_setup.sh && /tmp/expert_ml_setup.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Expert ML Pipeline Setup Completed Successfully!" -ForegroundColor Green
        Write-Host "=================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 What's Now Running:" -ForegroundColor Cyan
        Write-Host "  ✅ Redis - Queue processing" -ForegroundColor White
        Write-Host "  ✅ Python ML Service - Intelligent mastering" -ForegroundColor White
        Write-Host "  ✅ Laravel Horizon - Queue monitoring" -ForegroundColor White
        Write-Host "  ✅ FFmpeg - Audio processing" -ForegroundColor White
        Write-Host "  ✅ Database - Updated with processing fields" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Test new API endpoints" -ForegroundColor White
        Write-Host "  2. Integrate frontend with new backend" -ForegroundColor White
        Write-Host "  3. Monitor queue processing" -ForegroundColor White
        Write-Host ""
        Write-Host "🌐 Your ML audio processing pipeline is ready!" -ForegroundColor Green
        Write-Host "🔗 Site: https://crysgarage.studio" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Check the server logs for details" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to execute setup script" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 To check service status manually, run:" -ForegroundColor Cyan
Write-Host "ssh -i $SSH_KEY $VPS_USER@$VPS_HOST 'systemctl status redis crysgarage-ml crysgarage-horizon'" -ForegroundColor White
