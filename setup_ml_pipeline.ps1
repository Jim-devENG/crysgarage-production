# ML Pipeline Setup Script - Passwordless VPS Deployment
param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY = "github_actions_key"
)

Write-Host "🚀 Setting up ML Audio Pipeline on VPS..." -ForegroundColor Cyan

# Set SSH key permissions
Write-Host "🔑 Setting SSH key permissions..." -ForegroundColor Yellow
icacls $SSH_KEY /inheritance:r /grant:r "$env:USERNAME`:F"

# Test SSH connection
Write-Host "🔌 Testing SSH connection..." -ForegroundColor Yellow
$sshTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SSH connection failed. Please check your SSH key and VPS access." -ForegroundColor Red
    exit 1
}
Write-Host "✅ SSH connection successful" -ForegroundColor Green

# Step 1: Install Redis
Write-Host "📦 Installing Redis..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    yum install -y redis
    systemctl enable redis
    systemctl start redis
    echo "✅ Redis installed and started"
else
    echo "✅ Redis already installed"
    systemctl start redis
fi
"@

# Step 2: Install Python and FFmpeg
Write-Host "🐍 Installing Python and FFmpeg..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
# Install Python 3
if ! command -v python3 &> /dev/null; then
    echo "Installing Python 3..."
    yum install -y python3 python3-pip
    echo "✅ Python 3 installed"
else
    echo "✅ Python 3 already installed"
fi

# Install FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "Installing FFmpeg..."
    yum install -y epel-release
    yum install -y ffmpeg
    echo "✅ FFmpeg installed"
else
    echo "✅ FFmpeg already installed"
fi
"@

# Step 3: Navigate to backend and run migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
cd /var/www/html/api
php artisan migrate --force
echo "✅ Database migrations completed"
"@

# Step 4: Setup ML service
Write-Host "🤖 Setting up ML service..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
cd /var/www/html/api/ml-service

# Install ML service dependencies
if [ -f requirements.txt ]; then
    pip3 install -r requirements.txt
    echo "✅ ML service dependencies installed"
else
    echo "⚠️ requirements.txt not found"
fi

# Create ML service systemd service
cat > /etc/systemd/system/crysgarage-ml.service << 'EOF'
[Unit]
Description=Crys Garage ML Audio Service
After=network.target

[Service]
Type=simple
User=nginx
WorkingDirectory=/var/www/html/api/ml-service
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=10
Environment=PYTHONPATH=/var/www/html/api/ml-service

[Install]
WantedBy=multi-user.target
EOF

# Start ML service
systemctl daemon-reload
systemctl enable crysgarage-ml
systemctl start crysgarage-ml
echo "✅ ML service started"
"@

# Step 5: Install and setup Laravel Horizon
Write-Host "📊 Setting up Laravel Horizon..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
cd /var/www/html/api

# Install Laravel Horizon
composer require laravel/horizon
php artisan horizon:install

# Create Horizon systemd service
cat > /etc/systemd/system/crysgarage-horizon.service << 'EOF'
[Unit]
Description=Crys Garage Horizon Queue Worker
After=network.target redis.service

[Service]
Type=simple
User=nginx
WorkingDirectory=/var/www/html/api
ExecStart=/usr/bin/php artisan horizon
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start Horizon
systemctl daemon-reload
systemctl enable crysgarage-horizon
systemctl start crysgarage-horizon
echo "✅ Laravel Horizon started"
"@

# Step 6: Update environment configuration
Write-Host "🔧 Updating environment configuration..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
cd /var/www/html/api

# Add ML service configuration to .env
if [ -f .env ]; then
    # Add ML service configuration
    if ! grep -q "ML_SERVICE_URL" .env; then
        echo "ML_SERVICE_URL=http://localhost:8001" >> .env
        echo "ML_SERVICE_TIMEOUT=30" >> .env
    fi
    
    # Add queue configuration
    if ! grep -q "QUEUE_CONNECTION" .env; then
        echo "QUEUE_CONNECTION=redis" >> .env
    fi
    
    # Add FFmpeg configuration
    if ! grep -q "FFMPEG_PATH" .env; then
        echo "FFMPEG_PATH=/usr/bin/ffmpeg" >> .env
    fi
    
    echo "✅ Environment configuration updated"
fi

# Clear Laravel caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan queue:restart
echo "✅ Laravel caches cleared"
"@

# Step 7: Check service status
Write-Host "📊 Checking service status..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST @"
echo "=== Service Status ==="
echo "Redis: \$(systemctl is-active redis)"
echo "ML Service: \$(systemctl is-active crysgarage-ml)"
echo "Horizon: \$(systemctl is-active crysgarage-horizon)"
echo "Nginx: \$(systemctl is-active nginx)"
echo "PHP-FPM: \$(systemctl is-active php-fpm)"

# Test ML service endpoint
echo "=== Testing ML Service ==="
sleep 5
curl -f http://localhost:8001/health || echo "⚠️ ML service health check failed"
"@

Write-Host "🎉 ML Audio Pipeline setup completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the new API endpoints" -ForegroundColor White
Write-Host "  2. Monitor queue processing with Horizon dashboard" -ForegroundColor White
Write-Host "  3. Check ML service logs if needed" -ForegroundColor White
Write-Host "🌐 Site: https://crysgarage.studio" -ForegroundColor Cyan
