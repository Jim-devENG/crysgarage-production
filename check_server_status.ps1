# Check Server Status - Simple Diagnostic
# This script will check what's actually running on your VPS

Write-Host "=== CRYS GARAGE SERVER STATUS CHECK ===" -ForegroundColor Green
Write-Host ""

# VPS Connection Details
$VPS_HOST = "209.74.80.162"
$VPS_USER = "root"  # Adjust if different

Write-Host "Connecting to VPS: $VPS_HOST" -ForegroundColor Cyan

# Function to run SSH commands
function Invoke-SSHCommand {
    param($Command)
    Write-Host "Running: $Command" -ForegroundColor Gray
    ssh $VPS_USER@$VPS_HOST $Command
}

Write-Host "`n1. CHECKING IF DEPLOYMENT ACTUALLY HAPPENED" -ForegroundColor Yellow
Invoke-SSHCommand "ls -la /var/www/html/api/routes/api.php"

Write-Host "`n2. CHECKING FILE MODIFICATION TIME" -ForegroundColor Yellow
Invoke-SSHCommand "stat /var/www/html/api/routes/api.php"

Write-Host "`n3. CHECKING IF ML PIPELINE ROUTES EXIST" -ForegroundColor Yellow
Invoke-SSHCommand "grep -n 'upload-audio' /var/www/html/api/routes/api.php"

Write-Host "`n4. CHECKING IF CATCH-ALL ROUTE EXISTS" -ForegroundColor Yellow
Invoke-SSHCommand "grep -n 'Route::any' /var/www/html/api/routes/api.php"

Write-Host "`n5. CHECKING LARAVEL ROUTE LIST" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan route:list --path=api | grep -E '(upload-audio|ml-test)'"

Write-Host "`n6. TESTING ENDPOINT DIRECTLY" -ForegroundColor Yellow
Invoke-SSHCommand "curl -s 'http://localhost/api/ml-test/upload' -X POST -H 'Content-Type: application/json' -d '{\"test\": \"data\"}'"

Write-Host "`n7. CHECKING NGINX ERROR LOGS" -ForegroundColor Yellow
Invoke-SSHCommand "tail -20 /var/log/nginx/error.log"

Write-Host "`n8. CHECKING PHP ERROR LOGS" -ForegroundColor Yellow
Invoke-SSHCommand "tail -20 /var/log/php-fpm/error.log"

Write-Host "`n=== STATUS CHECK COMPLETE ===" -ForegroundColor Green