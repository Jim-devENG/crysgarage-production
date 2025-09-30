# Fix API Routing Issue on VPS
# This script will diagnose and fix the API routing problem

Write-Host "=== CRYS GARAGE API ROUTING FIX ===" -ForegroundColor Green
Write-Host "This script will fix the API routing issue on your VPS" -ForegroundColor Yellow
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

Write-Host "`n1. CHECKING CURRENT DIRECTORY STRUCTURE" -ForegroundColor Yellow
Invoke-SSHCommand "ls -la /var/www/html/"

Write-Host "`n2. CHECKING API DIRECTORY" -ForegroundColor Yellow
Invoke-SSHCommand "ls -la /var/www/html/api/"

Write-Host "`n3. LOOKING FOR LARAVEL INSTALLATIONS" -ForegroundColor Yellow
Invoke-SSHCommand "find /var/www/html -name 'artisan' -exec echo 'Found Laravel at: {}' \;"

Write-Host "`n4. CHECKING NGINX CONFIGURATION" -ForegroundColor Yellow
Invoke-SSHCommand "cat /etc/nginx/sites-available/default | grep -A 10 -B 5 'location /api'"

Write-Host "`n5. CHECKING FOR API REDIRECTS" -ForegroundColor Yellow
Invoke-SSHCommand "grep -r 'return.*api' /etc/nginx/ || echo 'No API redirects found'"

Write-Host "`n6. CHECKING PHP CONFIGURATION" -ForegroundColor Yellow
Invoke-SSHCommand "php -v"

Write-Host "`n7. CHECKING LARAVEL CONFIGURATION" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan --version"

Write-Host "`n8. CHECKING CURRENT ROUTES" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan route:list --path=api | head -20"

Write-Host "`n9. CLEARING ALL LARAVEL CACHES" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan config:clear"
Invoke-SSHCommand "cd /var/www/html/api && php artisan route:clear"
Invoke-SSHCommand "cd /var/www/html/api && php artisan cache:clear"
Invoke-SSHCommand "cd /var/www/html/api && php artisan view:clear"
Invoke-SSHCommand "cd /var/www/html/api && php artisan optimize:clear"

Write-Host "`n10. CHECKING ROUTES AFTER CACHE CLEAR" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan route:list --path=api | head -20"

Write-Host "`n11. TESTING LOCAL ENDPOINT" -ForegroundColor Yellow
Invoke-SSHCommand "curl -s 'http://localhost/api/health' | head -100"

Write-Host "`n12. RESTARTING SERVICES" -ForegroundColor Yellow
Invoke-SSHCommand "systemctl restart php-fpm"
Invoke-SSHCommand "systemctl restart nginx"

Write-Host "`n13. TESTING AFTER RESTART" -ForegroundColor Yellow
Invoke-SSHCommand "sleep 5 && curl -s 'http://localhost/api/health' | head -100"

Write-Host "`n14. TESTING ML PIPELINE ENDPOINT" -ForegroundColor Yellow
Invoke-SSHCommand "curl -s -X POST 'http://localhost/api/ml-test/upload' -H 'Content-Type: application/json' -d '{\"test\": \"data\"}' | head -100"

Write-Host "`n=== FIX COMPLETE ===" -ForegroundColor Green
Write-Host "Check the output above to see what was found and fixed." -ForegroundColor Yellow
Write-Host "If the issue persists, we may need to check the Nginx configuration more thoroughly." -ForegroundColor Yellow
