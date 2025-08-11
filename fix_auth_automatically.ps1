Write-Host "========================================" -ForegroundColor Green
Write-Host "Crys Garage - Automatic Auth Fix" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Starting Laravel backend..." -ForegroundColor Yellow
Set-Location "crysgarage-backend"
Start-Process -FilePath "cmd" -ArgumentList "/k", "php artisan serve --host=127.0.0.1 --port=8000" -WindowStyle Normal

Write-Host ""
Write-Host "Starting React frontend..." -ForegroundColor Yellow
Set-Location "..\crysgarage-frontend"
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173 (or check terminal)" -ForegroundColor White
Write-Host ""
Write-Host "The app will automatically detect and fix" -ForegroundColor Cyan
Write-Host "authentication issues when you try to upload audio." -ForegroundColor Cyan
Write-Host ""
Write-Host "If you still get 401 errors:" -ForegroundColor Yellow
Write-Host "1. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "2. Go to Console tab" -ForegroundColor White
Write-Host "3. Look for authentication fix messages" -ForegroundColor White
Write-Host "4. Try uploading audio again" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 