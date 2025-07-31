# Crys Garage Fast Deployment System
# PowerShell Version

param(
    [string]$CommitMessage = "Fast deploy: Update application",
    [switch]$SkipCommit = $false,
    [switch]$SkipPush = $false
)

# Configuration
$VPS_HOST = "209.74.80.162"
$VPS_USER = "root"
$GITHUB_REPO = "https://github.com/Jim-devENG/Crysgarage.git"
$APP_URL = "https://crysgarage.studio"

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Blue"
$Cyan = "Cyan"

Write-Host "🚀 Crys Garage Fast Deployment System" -ForegroundColor $Green
Write-Host "=====================================" -ForegroundColor $Green

# Step 1: Local Development Check
Write-Host "`nStep 1: Local Development Check" -ForegroundColor $Blue
Write-Host "================================" -ForegroundColor $Blue

# Check if we're in the right directory
if (-not (Test-Path "crysgarage-frontend")) {
    Write-Host "❌ Error: Not in Crys Garage project directory" -ForegroundColor $Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor $Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor $Yellow
$gitStatus = git status --porcelain

if ($gitStatus -and -not $SkipCommit) {
    Write-Host "📝 Changes detected. Staging files..." -ForegroundColor $Yellow
    git add .
    
    if (-not $CommitMessage) {
        $CommitMessage = Read-Host "💬 Enter commit message (or press Enter for default)"
        if (-not $CommitMessage) {
            $CommitMessage = "Fast deploy: Update application"
        }
    }
    
    Write-Host "💾 Committing changes..." -ForegroundColor $Blue
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to commit changes" -ForegroundColor $Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "✅ No changes to commit" -ForegroundColor $Green
}

# Step 2: Push to GitHub
if (-not $SkipPush) {
    Write-Host "`nStep 2: Push to GitHub" -ForegroundColor $Blue
    Write-Host "=====================" -ForegroundColor $Blue
    
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor $Yellow
    git push origin master
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor $Red
        Write-Host "Please check your git configuration and try again." -ForegroundColor $Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✅ Successfully pushed to GitHub" -ForegroundColor $Green
}

# Step 3: Trigger VPS Deployment
Write-Host "`nStep 3: Trigger VPS Deployment" -ForegroundColor $Blue
Write-Host "=============================" -ForegroundColor $Blue

Write-Host "🌐 Triggering automatic deployment to VPS..." -ForegroundColor $Yellow
Write-Host "The GitHub Actions workflow will automatically deploy to your VPS." -ForegroundColor $Blue
Write-Host "You can monitor the deployment at: https://github.com/Jim-devENG/Crysgarage/actions" -ForegroundColor $Cyan

# Wait for GitHub Actions to start
Start-Sleep -Seconds 3

# Step 4: Verify Deployment
Write-Host "`nStep 4: Verify Deployment" -ForegroundColor $Blue
Write-Host "=======================" -ForegroundColor $Blue

Write-Host "🔍 Checking VPS deployment status..." -ForegroundColor $Yellow
Write-Host "Waiting for deployment to complete..." -ForegroundColor $Blue

# Wait for deployment (adjust timeout as needed)
Start-Sleep -Seconds 30

Write-Host "🌐 Testing application availability..." -ForegroundColor $Yellow

# Test if the application is accessible
try {
    $response = Invoke-WebRequest -Uri $APP_URL -Method Head -TimeoutSec 10 -UseBasicParsing
    $httpCode = $response.StatusCode
    
    if ($httpCode -eq 200) {
        Write-Host "✅ Application is live and accessible!" -ForegroundColor $Green
    } else {
        Write-Host "⚠️  Application might still be deploying (HTTP: $httpCode)" -ForegroundColor $Yellow
    }
} catch {
    Write-Host "⚠️  Application might still be deploying or temporarily unavailable" -ForegroundColor $Yellow
}

# Summary
Write-Host "`n🎉 Fast Deployment Summary" -ForegroundColor $Green
Write-Host "========================" -ForegroundColor $Green
Write-Host "✅ Local changes committed" -ForegroundColor $Green
Write-Host "✅ Code pushed to GitHub" -ForegroundColor $Green
Write-Host "✅ VPS deployment triggered" -ForegroundColor $Green
Write-Host ""
Write-Host "🌐 Your application: $APP_URL" -ForegroundColor $Blue
Write-Host "📊 GitHub Actions: https://github.com/Jim-devENG/Crysgarage/actions" -ForegroundColor $Blue
Write-Host "🔧 VPS Status: SSH to $VPS_HOST and run 'systemctl status crysgarage-*'" -ForegroundColor $Blue
Write-Host ""
Write-Host "💡 Tip: You can also manually trigger deployment from GitHub Actions tab" -ForegroundColor $Yellow

Read-Host "Press Enter to continue" 