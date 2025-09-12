# Check Server Status - What's Actually Running
param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root"
)

Write-Host "🔍 Checking Current Server Status..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Please run these commands on your server to check what's actually running:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Check if Redis is installed and running:" -ForegroundColor Green
Write-Host "   systemctl status redis" -ForegroundColor White
Write-Host "   redis-cli ping" -ForegroundColor White
Write-Host ""

Write-Host "2. Check if Python ML service exists:" -ForegroundColor Green
Write-Host "   ls -la /var/www/html/api/ml-service/" -ForegroundColor White
Write-Host "   systemctl status crysgarage-ml" -ForegroundColor White
Write-Host ""

Write-Host "3. Check if Laravel Horizon is installed:" -ForegroundColor Green
Write-Host "   cd /var/www/html/api && composer show laravel/horizon" -ForegroundColor White
Write-Host "   systemctl status crysgarage-horizon" -ForegroundColor White
Write-Host ""

Write-Host "4. Check if FFmpeg is installed:" -ForegroundColor Green
Write-Host "   which ffmpeg" -ForegroundColor White
Write-Host "   ffmpeg -version" -ForegroundColor White
Write-Host ""

Write-Host "5. Check database migrations:" -ForegroundColor Green
Write-Host "   cd /var/www/html/api && php artisan migrate:status" -ForegroundColor White
Write-Host ""

Write-Host "6. Check environment configuration:" -ForegroundColor Green
Write-Host "   cd /var/www/html/api && grep -E 'ML_SERVICE|QUEUE_CONNECTION|FFMPEG' .env" -ForegroundColor White
Write-Host ""

Write-Host "7. Check what's actually running on ports:" -ForegroundColor Green
Write-Host "   netstat -tlnp | grep -E ':(6379|8001|8000)'" -ForegroundColor White
Write-Host ""

Write-Host "8. Check recent logs:" -ForegroundColor Green
Write-Host "   journalctl -u crysgarage-ml --since '1 hour ago'" -ForegroundColor White
Write-Host "   journalctl -u crysgarage-horizon --since '1 hour ago'" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Based on the results, we'll know:" -ForegroundColor Cyan
Write-Host "   - If the ML pipeline is actually set up" -ForegroundColor White
Write-Host "   - What services are missing" -ForegroundColor White
Write-Host "   - Why the browser is crashing" -ForegroundColor White
Write-Host "   - What needs to be fixed" -ForegroundColor White
