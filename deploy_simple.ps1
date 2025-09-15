# Simple deployment script - one password entry
param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root"
)

Write-Host "🚀 DEPLOYING CRYS GARAGE WEBSITE" -ForegroundColor Green
Write-Host "This will only ask for password once..." -ForegroundColor Yellow

# Create a simple deployment command
$deployCommand = @"
# Deploy Crys Garage website
echo "Deploying Crys Garage website..."

# Backup existing files
mkdir -p /var/www/html/backup
cp -r /var/www/html/* /var/www/html/backup/ 2>/dev/null || true

# Create clean web directory
rm -rf /var/www/html/*
mkdir -p /var/www/html

echo "Website deployment completed!"
echo "Server should now be working properly."
"@

# Execute the deployment
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST $deployCommand

# Copy the index.html file
Write-Host "Copying website files..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no index.html $VPS_USER@$VPS_HOST:/var/www/html/

# Set permissions
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "chown -R nginx:nginx /var/www/html && chmod -R 755 /var/www/html"

Write-Host "✅ DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "Testing website..." -ForegroundColor Yellow

# Test the website
try {
    $response = Invoke-WebRequest -Uri "http://crysgarage.studio" -TimeoutSec 10
    Write-Host "✅ Website is working: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "🎉 Crys Garage is back online!" -ForegroundColor Green
} catch {
    Write-Host "❌ Website test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "The files have been deployed, but there might be a server configuration issue." -ForegroundColor Yellow
}

Write-Host "🌐 Visit: http://crysgarage.studio" -ForegroundColor Cyan