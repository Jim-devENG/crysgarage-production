#!/bin/bash
# Expert ML Pipeline Setup - Comprehensive Server Configuration
# This script will set up the complete ML audio processing pipeline

set -e  # Exit on any error

echo "🚀 Expert ML Pipeline Setup Starting..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Update system packages
echo "📦 Step 1: Updating system packages..."
yum update -y
print_status "System packages updated"

# Step 2: Install Redis
echo "📦 Step 2: Installing Redis..."
if ! command -v redis-server &> /dev/null; then
    yum install -y redis
    systemctl enable redis
    systemctl start redis
    print_status "Redis installed and started"
else
    systemctl start redis
    print_status "Redis already installed, started service"
fi

# Test Redis
if redis-cli ping | grep -q "PONG"; then
    print_status "Redis is responding correctly"
else
    print_error "Redis is not responding"
    exit 1
fi

# Step 3: Install Python 3 and pip
echo "🐍 Step 3: Installing Python 3 and pip..."
if ! command -v python3 &> /dev/null; then
    yum install -y python3 python3-pip
    print_status "Python 3 installed"
else
    print_status "Python 3 already installed"
fi

# Upgrade pip
python3 -m pip install --upgrade pip
print_status "Pip upgraded"

# Step 4: Install FFmpeg
echo "🎬 Step 4: Installing FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    yum install -y epel-release
    yum install -y ffmpeg
    print_status "FFmpeg installed"
else
    print_status "FFmpeg already installed"
fi

# Test FFmpeg
if ffmpeg -version | head -1 | grep -q "ffmpeg"; then
    print_status "FFmpeg is working correctly"
else
    print_error "FFmpeg installation failed"
    exit 1
fi

# Step 5: Navigate to backend directory
echo "📁 Step 5: Setting up backend directory..."
cd /var/www/html/api

# Step 6: Run database migrations
echo "🗄️ Step 6: Running database migrations..."
php artisan migrate --force
print_status "Database migrations completed"

# Step 7: Install ML service dependencies
echo "🤖 Step 7: Setting up ML service..."
cd ml-service

# Install Python dependencies
if [ -f requirements.txt ]; then
    pip3 install -r requirements.txt
    print_status "ML service dependencies installed"
else
    print_warning "requirements.txt not found, creating basic requirements"
    cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
librosa==0.10.1
soundfile==0.12.1
numpy==1.24.3
scipy==1.11.4
scikit-learn==1.3.2
httpx==0.25.2
requests==2.31.0
python-multipart==0.0.6
EOF
    pip3 install -r requirements.txt
    print_status "Basic ML dependencies installed"
fi

# Step 8: Create ML service systemd service
echo "⚙️ Step 8: Creating ML service systemd service..."
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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start ML service
systemctl daemon-reload
systemctl enable crysgarage-ml
systemctl start crysgarage-ml

# Wait a moment for service to start
sleep 5

if systemctl is-active --quiet crysgarage-ml; then
    print_status "ML service started successfully"
else
    print_warning "ML service failed to start, checking logs..."
    journalctl -u crysgarage-ml --no-pager -l
fi

# Step 9: Install Laravel Horizon
echo "📊 Step 9: Installing Laravel Horizon..."
cd /var/www/html/api

# Install Horizon
composer require laravel/horizon
php artisan horizon:install
print_status "Laravel Horizon installed"

# Step 10: Create Horizon systemd service
echo "⚙️ Step 10: Creating Horizon systemd service..."
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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start Horizon
systemctl daemon-reload
systemctl enable crysgarage-horizon
systemctl start crysgarage-horizon

# Wait a moment for service to start
sleep 5

if systemctl is-active --quiet crysgarage-horizon; then
    print_status "Laravel Horizon started successfully"
else
    print_warning "Horizon failed to start, checking logs..."
    journalctl -u crysgarage-horizon --no-pager -l
fi

# Step 11: Update environment configuration
echo "🔧 Step 11: Updating environment configuration..."
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
    
    print_status "Environment configuration updated"
else
    print_warning ".env file not found"
fi

# Step 12: Clear Laravel caches
echo "🧹 Step 12: Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan queue:restart
print_status "Laravel caches cleared"

# Step 13: Set proper permissions
echo "🔐 Step 13: Setting proper permissions..."
chown -R nginx:nginx /var/www/html/api
chmod -R 755 /var/www/html/api
print_status "Permissions set correctly"

# Step 14: Final status check
echo "📊 Step 14: Final status check..."
echo "=========================================="

# Check Redis
if systemctl is-active --quiet redis; then
    print_status "Redis: ACTIVE"
else
    print_error "Redis: INACTIVE"
fi

# Check ML service
if systemctl is-active --quiet crysgarage-ml; then
    print_status "ML Service: ACTIVE"
else
    print_error "ML Service: INACTIVE"
fi

# Check Horizon
if systemctl is-active --quiet crysgarage-horizon; then
    print_status "Horizon: ACTIVE"
else
    print_error "Horizon: INACTIVE"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_status "Nginx: ACTIVE"
else
    print_error "Nginx: INACTIVE"
fi

# Check PHP-FPM
if systemctl is-active --quiet php-fpm; then
    print_status "PHP-FPM: ACTIVE"
else
    print_error "PHP-FPM: INACTIVE"
fi

# Test ML service endpoint
echo "🧪 Testing ML service endpoint..."
sleep 3
if curl -f -s http://localhost:8001/health > /dev/null; then
    print_status "ML service endpoint: RESPONDING"
else
    print_warning "ML service endpoint: NOT RESPONDING"
fi

# Test Redis connection
if redis-cli ping | grep -q "PONG"; then
    print_status "Redis connection: WORKING"
else
    print_error "Redis connection: FAILED"
fi

echo "=========================================="
echo "🎉 Expert ML Pipeline Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Services Status:"
echo "  - Redis: $(systemctl is-active redis)"
echo "  - ML Service: $(systemctl is-active crysgarage-ml)"
echo "  - Horizon: $(systemctl is-active crysgarage-horizon)"
echo "  - Nginx: $(systemctl is-active nginx)"
echo "  - PHP-FPM: $(systemctl is-active php-fpm)"
echo ""
echo "🌐 Your ML audio processing pipeline is now ready!"
echo "🔗 Site: https://crysgarage.studio"
echo "📊 Horizon Dashboard: https://crysgarage.studio/horizon"
echo ""
echo "🎯 Next Steps:"
echo "  1. Test the new API endpoints"
echo "  2. Integrate frontend with new backend"
echo "  3. Monitor queue processing"
echo ""
