# Auto Push and Deploy Script
# This script automatically commits changes and pushes to GitHub to trigger VPS deployment

Write-Host "🚀 Auto Push and Deploy Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow

# Check for changes
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

Write-Host "📝 Changes detected:" -ForegroundColor Yellow
git status --short

# Add all changes
Write-Host "`n📦 Adding all changes..." -ForegroundColor Blue
git add .

# Get commit message from user or use default
$commitMessage = Read-Host "`n💬 Enter commit message (or press Enter for auto message)"
if (-not $commitMessage) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Auto-deploy: Updated at $timestamp"
}

# Commit changes
Write-Host "`n💾 Committing changes..." -ForegroundColor Blue
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Blue
git push origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "🔄 GitHub Actions will now automatically deploy to VPS..." -ForegroundColor Cyan
Write-Host "`n📊 You can monitor the deployment at:" -ForegroundColor Yellow
Write-Host "   https://github.com/Jim-devENG/crysgarage-production/actions" -ForegroundColor White

Write-Host "`n🎯 Deployment Status:" -ForegroundColor Cyan
Write-Host "   • Frontend: Will be built and deployed to VPS" -ForegroundColor White
Write-Host "   • Backend: Will be updated if changes detected" -ForegroundColor White
Write-Host "   • Live Site: https://crysgarage.studio" -ForegroundColor White

Write-Host "`n⏱️  Deployment typically takes 2-3 minutes" -ForegroundColor Yellow
Write-Host "   Check the GitHub Actions tab for real-time progress" -ForegroundColor Gray
