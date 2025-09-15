# Deploy ML Pipeline Integration to Production Server
# This script updates the server with the integrated ML pipeline system

param(
    [string]$ServerIP = "209.74.80.162",
    [string]$ServerUser = "root"
)

Write-Host "🚀 Deploying ML Pipeline Integration to Production Server..." -ForegroundColor Green

# Function to execute SSH commands
function Invoke-SSHCommand {
    param([string]$Command)
    ssh -o StrictHostKeyChecking=no "${ServerUser}@${ServerIP}" $Command
}

try {
    Write-Host "📋 Step 1: Pulling latest changes from GitHub..." -ForegroundColor Yellow
    Invoke-SSHCommand "cd /var/www/crysgarage-deploy; git pull origin master"
    
    Write-Host "📋 Step 2: Updating Laravel backend..." -ForegroundColor Yellow
    Invoke-SSHCommand "cd /var/www/crysgarage-deploy/crysgarage-backend/laravel; composer install --no-dev --optimize-autoloader"
    Invoke-SSHCommand "cd /var/www/crysgarage-deploy/crysgarage-backend/laravel; php artisan config:cache"
    Invoke-SSHCommand "cd /var/www/crysgarage-deploy/crysgarage-backend/laravel; php artisan route:cache"
    
    Write-Host "📋 Step 3: Updating Python microservice..." -ForegroundColor Yellow
    Invoke-SSHCommand "cd /opt/audio-mastering-service; git pull origin master"
    Invoke-SSHCommand "cd /opt/audio-mastering-service; source venv/bin/activate; pip install -r requirements.txt"
    
    Write-Host "📋 Step 4: Restarting services..." -ForegroundColor Yellow
    # Stop existing Python service
    Invoke-SSHCommand "pkill -f 'uvicorn main:app'"
    
    # Start Python microservice
    Invoke-SSHCommand "cd /opt/audio-mastering-service; source venv/bin/activate; nohup uvicorn main:app --host 0.0.0.0 --port 8002 > service.log 2>&1 &"
    
    # Restart Laravel (if using PHP-FPM)
    Invoke-SSHCommand "systemctl restart php-fpm"
    Invoke-SSHCommand "systemctl restart nginx"
    
    Write-Host "📋 Step 5: Testing services..." -ForegroundColor Yellow
    
    # Test Python microservice
    Write-Host "Testing Python microservice..." -ForegroundColor Cyan
    $pythonHealth = Invoke-SSHCommand "curl -s http://localhost:8002/health"
    Write-Host "Python Service: $pythonHealth" -ForegroundColor Green
    
    # Test Laravel backend
    Write-Host "Testing Laravel backend..." -ForegroundColor Cyan
    $laravelHealth = Invoke-SSHCommand "curl -s http://localhost:8000/api/health"
    Write-Host "Laravel Backend: $laravelHealth" -ForegroundColor Green
    
    # Test Python-Laravel integration
    Write-Host "Testing Python-Laravel integration..." -ForegroundColor Cyan
    $integrationTest = Invoke-SSHCommand "curl -s http://localhost:8000/api/python-service/health"
    Write-Host "Integration Test: $integrationTest" -ForegroundColor Green
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🎯 ML Pipeline Integration is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Yellow
    Write-Host "  • Python Microservice: http://${ServerIP}:8002" -ForegroundColor White
    Write-Host "  • Laravel Backend: http://${ServerIP}:8000" -ForegroundColor White
    Write-Host "  • Main Website: https://crysgarage.studio" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Test the ML pipeline through the frontend" -ForegroundColor White
    Write-Host "  2. Monitor service logs for any issues" -ForegroundColor White
    Write-Host "  3. Configure S3 storage for production files" -ForegroundColor White
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the server logs and try again." -ForegroundColor Red
    exit 1
}