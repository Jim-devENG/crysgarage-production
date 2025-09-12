# Manual ML Pipeline Setup - Step by Step
# This script will guide you through setting up the ML pipeline manually

Write-Host "🚀 Manual ML Pipeline Setup" -ForegroundColor Cyan
Write-Host "This script will help you set up the ML audio processing pipeline step by step." -ForegroundColor Yellow
Write-Host ""

# Step 1: Check if we can access the server
Write-Host "Step 1: Testing server access..." -ForegroundColor Green
Write-Host "Please run this command manually on your server:" -ForegroundColor Yellow
Write-Host "ssh root@209.74.80.162" -ForegroundColor White
Write-Host ""

# Step 2: Install Redis
Write-Host "Step 2: Install Redis" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "yum install -y redis" -ForegroundColor White
Write-Host "systemctl enable redis" -ForegroundColor White
Write-Host "systemctl start redis" -ForegroundColor White
Write-Host "redis-cli ping  # Should return PONG" -ForegroundColor White
Write-Host ""

# Step 3: Install Python and FFmpeg
Write-Host "Step 3: Install Python and FFmpeg" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "yum install -y python3 python3-pip" -ForegroundColor White
Write-Host "yum install -y epel-release" -ForegroundColor White
Write-Host "yum install -y ffmpeg" -ForegroundColor White
Write-Host "python3 --version  # Should show Python 3.x" -ForegroundColor White
Write-Host "ffmpeg -version  # Should show FFmpeg version" -ForegroundColor White
Write-Host ""

# Step 4: Run database migrations
Write-Host "Step 4: Run database migrations" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "cd /var/www/html/api" -ForegroundColor White
Write-Host "php artisan migrate --force" -ForegroundColor White
Write-Host ""

# Step 5: Setup ML service
Write-Host "Step 5: Setup ML service" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "cd /var/www/html/api/ml-service" -ForegroundColor White
Write-Host "pip3 install -r requirements.txt" -ForegroundColor White
Write-Host ""

# Step 6: Create ML service systemd service
Write-Host "Step 6: Create ML service systemd service" -ForegroundColor Green
Write-Host "Create the service file:" -ForegroundColor Yellow
Write-Host "cat > /etc/systemd/system/crysgarage-ml.service << 'EOF'" -ForegroundColor White
Write-Host "[Unit]" -ForegroundColor White
Write-Host "Description=Crys Garage ML Audio Service" -ForegroundColor White
Write-Host "After=network.target" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "[Service]" -ForegroundColor White
Write-Host "Type=simple" -ForegroundColor White
Write-Host "User=nginx" -ForegroundColor White
Write-Host "WorkingDirectory=/var/www/html/api/ml-service" -ForegroundColor White
Write-Host "ExecStart=/usr/bin/python3 app.py" -ForegroundColor White
Write-Host "Restart=always" -ForegroundColor White
Write-Host "RestartSec=10" -ForegroundColor White
Write-Host "Environment=PYTHONPATH=/var/www/html/api/ml-service" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "[Install]" -ForegroundColor White
Write-Host "WantedBy=multi-user.target" -ForegroundColor White
Write-Host "EOF" -ForegroundColor White
Write-Host ""

# Step 7: Start ML service
Write-Host "Step 7: Start ML service" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "systemctl daemon-reload" -ForegroundColor White
Write-Host "systemctl enable crysgarage-ml" -ForegroundColor White
Write-Host "systemctl start crysgarage-ml" -ForegroundColor White
Write-Host "systemctl status crysgarage-ml  # Check if running" -ForegroundColor White
Write-Host ""

# Step 8: Install Laravel Horizon
Write-Host "Step 8: Install Laravel Horizon" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "cd /var/www/html/api" -ForegroundColor White
Write-Host "composer require laravel/horizon" -ForegroundColor White
Write-Host "php artisan horizon:install" -ForegroundColor White
Write-Host ""

# Step 9: Create Horizon systemd service
Write-Host "Step 9: Create Horizon systemd service" -ForegroundColor Green
Write-Host "Create the service file:" -ForegroundColor Yellow
Write-Host "cat > /etc/systemd/system/crysgarage-horizon.service << 'EOF'" -ForegroundColor White
Write-Host "[Unit]" -ForegroundColor White
Write-Host "Description=Crys Garage Horizon Queue Worker" -ForegroundColor White
Write-Host "After=network.target redis.service" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "[Service]" -ForegroundColor White
Write-Host "Type=simple" -ForegroundColor White
Write-Host "User=nginx" -ForegroundColor White
Write-Host "WorkingDirectory=/var/www/html/api" -ForegroundColor White
Write-Host "ExecStart=/usr/bin/php artisan horizon" -ForegroundColor White
Write-Host "Restart=always" -ForegroundColor White
Write-Host "RestartSec=10" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "[Install]" -ForegroundColor White
Write-Host "WantedBy=multi-user.target" -ForegroundColor White
Write-Host "EOF" -ForegroundColor White
Write-Host ""

# Step 10: Start Horizon
Write-Host "Step 10: Start Horizon" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "systemctl daemon-reload" -ForegroundColor White
Write-Host "systemctl enable crysgarage-horizon" -ForegroundColor White
Write-Host "systemctl start crysgarage-horizon" -ForegroundColor White
Write-Host "systemctl status crysgarage-horizon  # Check if running" -ForegroundColor White
Write-Host ""

# Step 11: Update environment
Write-Host "Step 11: Update environment configuration" -ForegroundColor Green
Write-Host "Add these lines to your .env file:" -ForegroundColor Yellow
Write-Host "ML_SERVICE_URL=http://localhost:8001" -ForegroundColor White
Write-Host "ML_SERVICE_TIMEOUT=30" -ForegroundColor White
Write-Host "QUEUE_CONNECTION=redis" -ForegroundColor White
Write-Host "FFMPEG_PATH=/usr/bin/ffmpeg" -ForegroundColor White
Write-Host ""

# Step 12: Clear caches
Write-Host "Step 12: Clear Laravel caches" -ForegroundColor Green
Write-Host "Run these commands on your server:" -ForegroundColor Yellow
Write-Host "cd /var/www/html/api" -ForegroundColor White
Write-Host "php artisan config:clear" -ForegroundColor White
Write-Host "php artisan route:clear" -ForegroundColor White
Write-Host "php artisan cache:clear" -ForegroundColor White
Write-Host "php artisan queue:restart" -ForegroundColor White
Write-Host ""

# Step 13: Test everything
Write-Host "Step 13: Test the setup" -ForegroundColor Green
Write-Host "Run these commands to test:" -ForegroundColor Yellow
Write-Host "redis-cli ping  # Should return PONG" -ForegroundColor White
Write-Host "curl http://localhost:8001/health  # Should return ML service health" -ForegroundColor White
Write-Host "systemctl status crysgarage-ml  # Should show active" -ForegroundColor White
Write-Host "systemctl status crysgarage-horizon  # Should show active" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "Your ML audio processing pipeline should now be running!" -ForegroundColor Cyan
Write-Host "Check the status of all services and test the new API endpoints." -ForegroundColor Yellow
