Write-Host "🔥 Switching to Firebase Authentication..." -ForegroundColor Yellow

# Backup current files
Write-Host "📦 Creating backups..." -ForegroundColor Blue
Copy-Item "App.tsx" "App.backup.tsx"
Copy-Item "components/Header.tsx" "components/Header.backup.tsx"

# Switch to Firebase versions
Write-Host "🔄 Switching to Firebase versions..." -ForegroundColor Green
Copy-Item "AppFirebase.tsx" "App.tsx"
Copy-Item "components/HeaderFirebase.tsx" "components/Header.tsx"

Write-Host "✅ Successfully switched to Firebase Authentication!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure Google Authentication is enabled in Firebase Console" -ForegroundColor White
Write-Host "2. Add 'localhost' to authorized domains in Firebase" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to test" -ForegroundColor White
Write-Host ""
Write-Host "📋 To revert back:" -ForegroundColor Yellow
Write-Host "Copy-Item 'App.backup.tsx' 'App.tsx'" -ForegroundColor White
Write-Host "Copy-Item 'components/Header.backup.tsx' 'components/Header.tsx'" -ForegroundColor White

