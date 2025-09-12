# Deploy Backend Fix - Complete Solution
# This script will properly deploy the backend and fix the API routing

Write-Host "=== CRYS GARAGE BACKEND DEPLOYMENT FIX ===" -ForegroundColor Green
Write-Host "This script will fix the backend deployment issue" -ForegroundColor Yellow
Write-Host ""

# VPS Connection Details
$VPS_HOST = "209.74.80.162"
$VPS_USER = "root"

Write-Host "Connecting to VPS: $VPS_HOST" -ForegroundColor Cyan

# Function to run SSH commands
function Invoke-SSHCommand {
    param($Command)
    Write-Host "Running: $Command" -ForegroundColor Gray
    ssh $VPS_USER@$VPS_HOST $Command
}

Write-Host "`n1. CREATING API DIRECTORY" -ForegroundColor Yellow
Invoke-SSHCommand "mkdir -p /var/www/html/api"

Write-Host "`n2. DEPLOYING BACKEND FILES" -ForegroundColor Yellow
Invoke-SSHCommand "cp -r /var/www/crysgarage-deploy/crysgarage-backend/* /var/www/html/api/"

Write-Host "`n3. SETTING PERMISSIONS" -ForegroundColor Yellow
Invoke-SSHCommand "chown -R nginx:nginx /var/www/html/api/"
Invoke-SSHCommand "chmod -R 755 /var/www/html/api/"

Write-Host "`n4. CHECKING NGINX CONFIGURATION" -ForegroundColor Yellow
Invoke-SSHCommand "find /etc/nginx -name '*.conf' | head -5"

Write-Host "`n5. CHECKING NGINX SITES" -ForegroundColor Yellow
Invoke-SSHCommand "ls -la /etc/nginx/sites-available/"

Write-Host "`n6. CHECKING NGINX SITES ENABLED" -ForegroundColor Yellow
Invoke-SSHCommand "ls -la /etc/nginx/sites-enabled/"

Write-Host "`n7. CHECKING MAIN NGINX CONFIG" -ForegroundColor Yellow
Invoke-SSHCommand "cat /etc/nginx/nginx.conf | grep -A 5 -B 5 'server {'"

Write-Host "`n8. INSTALLING BACKEND DEPENDENCIES" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && composer install --no-dev --optimize-autoloader"

Write-Host "`n9. CLEARING LARAVEL CACHES" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan config:clear"
Invoke-SSHCommand "cd /var/www/html/api && php artisan route:clear"
Invoke-SSHCommand "cd /var/www/html/api && php artisan cache:clear"

Write-Host "`n10. CHECKING ROUTES" -ForegroundColor Yellow
Invoke-SSHCommand "cd /var/www/html/api && php artisan route:list --path=api | head -10"

Write-Host "`n11. RESTARTING SERVICES" -ForegroundColor Yellow
Invoke-SSHCommand "systemctl restart php-fpm"
Invoke-SSHCommand "systemctl restart nginx"

Write-Host "`n12. TESTING API ENDPOINTS" -ForegroundColor Yellow
Invoke-SSHCommand "curl -s 'http://localhost/api/health' | head -100"

Write-Host "`n13. TESTING ML PIPELINE ENDPOINT" -ForegroundColor Yellow
Invoke-SSHCommand "curl -s -X POST 'http://localhost/api/ml-test/upload' -H 'Content-Type: application/json' -d '{\"test\": \"data\"}' | head -100"

Write-Host "`n=== BACKEND DEPLOYMENT FIX COMPLETE ===" -ForegroundColor Green
Write-Host "Check the output above to see if the deployment was successful." -ForegroundColor Yellow
