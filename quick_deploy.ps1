# Quick Deploy Script
# For immediate deployment without commit message prompt

Write-Host "⚡ Quick Deploy Script" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

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

# Auto commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Quick deploy: $timestamp"

Write-Host "💾 Committing: $commitMessage" -ForegroundColor Blue
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

Write-Host "`n✅ Quick deploy completed!" -ForegroundColor Green
Write-Host "🔄 GitHub Actions deploying to VPS..." -ForegroundColor Cyan
Write-Host "`n📊 Monitor: https://github.com/Jim-devENG/crysgarage-production/actions" -ForegroundColor Yellow
Write-Host "🌐 Live Site: https://crysgarage.studio" -ForegroundColor White