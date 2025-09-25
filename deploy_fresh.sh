#!/bin/bash

# Fresh Deployment Script for CrysGarage
# This script will completely clean the VPS and deploy everything fresh

set -e  # Exit on any error

echo "🚀 Starting Fresh Deployment of CrysGarage"
echo "=========================================="

# Configuration
VPS_HOST="your-vps-host.com"  # Replace with your VPS host
VPS_USER="root"               # Replace with your VPS user
VPS_PATH="/var/www/crysgarage"  # Replace with your deployment path
BACKUP_PATH="/tmp/crysgarage-backup-$(date +%Y%m%d-%H%M%S)"

echo "📋 Deployment Configuration:"
echo "  VPS Host: $VPS_HOST"
echo "  VPS User: $VPS_USER"
echo "  Deployment Path: $VPS_PATH"
echo "  Backup Path: $BACKUP_PATH"
echo ""

# Function to run commands on VPS
run_on_vps() {
    echo "🔧 Running on VPS: $1"
    ssh $VPS_USER@$VPS_HOST "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    echo "📁 Copying to VPS: $1 -> $2"
    scp -r "$1" $VPS_USER@$VPS_HOST:"$2"
}

echo "🛑 Step 1: Stopping all services on VPS"
echo "======================================="
run_on_vps "systemctl stop nginx || true"
run_on_vps "systemctl stop php8.1-fpm || true"
run_on_vps "systemctl stop php8.2-fpm || true"
run_on_vps "systemctl stop php8.3-fpm || true"
run_on_vps "pkill -f 'python.*main.py' || true"
run_on_vps "pkill -f 'node.*vite' || true"
run_on_vps "pkill -f 'npm.*dev' || true"

echo ""
echo "💾 Step 2: Creating backup of current deployment"
echo "==============================================="
run_on_vps "mkdir -p $BACKUP_PATH"
run_on_vps "cp -r $VPS_PATH $BACKUP_PATH/ 2>/dev/null || echo 'No existing deployment to backup'"
run_on_vps "cp -r /etc/nginx/sites-available/crysgarage* $BACKUP_PATH/ 2>/dev/null || echo 'No nginx config to backup'"
run_on_vps "cp -r /etc/nginx/sites-enabled/crysgarage* $BACKUP_PATH/ 2>/dev/null || echo 'No nginx enabled config to backup'"

echo ""
echo "🗑️  Step 3: Completely cleaning VPS deployment directory"
echo "======================================================="
run_on_vps "rm -rf $VPS_PATH"
run_on_vps "mkdir -p $VPS_PATH"
run_on_vps "chown -R www-data:www-data $VPS_PATH"

echo ""
echo "📦 Step 4: Preparing local build"
echo "==============================="
echo "Building frontend..."
cd crysgarage-frontend
npm install
npm run build
cd ..

echo "Building Python service..."
cd audio-mastering-service
# Create requirements.txt if it doesn't exist
if [ ! -f requirements.txt ]; then
    echo "Creating requirements.txt..."
    cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
aiofiles==23.2.1
numpy==1.24.3
soundfile==0.12.1
scipy==1.11.4
librosa==0.10.1
pydub==0.25.1
requests==2.31.0
aiohttp==3.9.1
python-dotenv==1.0.0
Pillow==10.1.0
opencv-python==4.8.1.78
tensorflow==2.15.0
torch==2.1.1
torchaudio==2.1.1
noisereduce==3.0.0
EOF
fi
cd ..

echo ""
echo "📤 Step 5: Deploying to VPS"
echo "==========================="

# Copy frontend build
echo "Deploying frontend..."
copy_to_vps "crysgarage-frontend/dist" "$VPS_PATH/frontend"

# Copy Python service
echo "Deploying Python service..."
run_on_vps "mkdir -p $VPS_PATH/audio-mastering-service"
copy_to_vps "audio-mastering-service" "$VPS_PATH/"

# Copy backend (if exists)
if [ -d "crysgarage-backend" ]; then
    echo "Deploying backend..."
    copy_to_vps "crysgarage-backend" "$VPS_PATH/"
fi

# Copy deployment scripts
echo "Deploying configuration files..."
copy_to_vps "deployment" "$VPS_PATH/" 2>/dev/null || echo "No deployment directory found"

echo ""
echo "🐍 Step 6: Setting up Python environment on VPS"
echo "=============================================="
run_on_vps "cd $VPS_PATH/audio-mastering-service && python3 -m venv venv"
run_on_vps "cd $VPS_PATH/audio-mastering-service && source venv/bin/activate && pip install --upgrade pip"
run_on_vps "cd $VPS_PATH/audio-mastering-service && source venv/bin/activate && pip install -r requirements.txt"

echo ""
echo "⚙️  Step 7: Setting up systemd services"
echo "======================================"

# Create Python service systemd file
run_on_vps "cat > /etc/systemd/system/crysgarage-python.service << 'EOF'
[Unit]
Description=CrysGarage Python Audio Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$VPS_PATH/audio-mastering-service
Environment=PATH=$VPS_PATH/audio-mastering-service/venv/bin
ExecStart=$VPS_PATH/audio-mastering-service/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

# Create frontend service systemd file (if using Node.js)
run_on_vps "cat > /etc/systemd/system/crysgarage-frontend.service << 'EOF'
[Unit]
Description=CrysGarage Frontend Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$VPS_PATH/frontend
ExecStart=/usr/bin/python3 -m http.server 5173
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

echo ""
echo "🌐 Step 8: Setting up Nginx configuration"
echo "========================================"

# Create Nginx configuration
run_on_vps "cat > /etc/nginx/sites-available/crysgarage << 'EOF'
server {
    listen 80;
    server_name $VPS_HOST;
    
    # Frontend
    location / {
        root $VPS_PATH/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options \"SAMEORIGIN\" always;
        add_header X-Content-Type-Options \"nosniff\" always;
        add_header X-XSS-Protection \"1; mode=block\" always;
    }
    
    # Python API
    location /api/ {
        proxy_pass http://localhost:8002/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin \"*\" always;
        add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" always;
        add_header Access-Control-Allow-Headers \"Content-Type, Authorization\" always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Direct Python service access
    location /proxy-download {
        proxy_pass http://localhost:8002/proxy-download;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # File serving
    location /files/ {
        alias $VPS_PATH/audio-mastering-service/;
        expires 1h;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Security
    location ~ /\\. {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF"

# Enable the site
run_on_vps "ln -sf /etc/nginx/sites-available/crysgarage /etc/nginx/sites-enabled/"
run_on_vps "rm -f /etc/nginx/sites-enabled/default"

echo ""
echo "🔧 Step 9: Setting up file permissions and directories"
echo "===================================================="
run_on_vps "chown -R www-data:www-data $VPS_PATH"
run_on_vps "chmod -R 755 $VPS_PATH"
run_on_vps "mkdir -p $VPS_PATH/audio-mastering-service/storage/app/public/mastered"
run_on_vps "chown -R www-data:www-data $VPS_PATH/audio-mastering-service/storage"
run_on_vps "chmod -R 755 $VPS_PATH/audio-mastering-service/storage"

echo ""
echo "🔄 Step 10: Reloading and starting services"
echo "=========================================="
run_on_vps "systemctl daemon-reload"
run_on_vps "systemctl enable crysgarage-python"
run_on_vps "systemctl enable crysgarage-frontend"
run_on_vps "systemctl start crysgarage-python"
run_on_vps "systemctl start crysgarage-frontend"

# Test Nginx configuration
run_on_vps "nginx -t"
run_on_vps "systemctl restart nginx"

echo ""
echo "✅ Step 11: Verifying deployment"
echo "==============================="
echo "Checking Python service..."
run_on_vps "curl -s http://localhost:8002/health || echo 'Python service not responding'"

echo "Checking frontend..."
run_on_vps "curl -s http://localhost:5173 || echo 'Frontend not responding'"

echo "Checking Nginx..."
run_on_vps "curl -s http://localhost || echo 'Nginx not responding'"

echo ""
echo "🎉 Fresh Deployment Complete!"
echo "============================"
echo "Your CrysGarage application has been deployed fresh to:"
echo "  🌐 Frontend: http://$VPS_HOST"
echo "  🐍 Python API: http://$VPS_HOST/api/"
echo "  📁 Files: http://$VPS_HOST/files/"
echo ""
echo "📋 Service Status:"
run_on_vps "systemctl status crysgarage-python --no-pager -l"
run_on_vps "systemctl status crysgarage-frontend --no-pager -l"
run_on_vps "systemctl status nginx --no-pager -l"
echo ""
echo "💾 Backup created at: $BACKUP_PATH"
echo "🔍 Logs: journalctl -u crysgarage-python -f"
echo "🔍 Logs: journalctl -u crysgarage-frontend -f"
echo ""
echo "🚀 Deployment completed successfully!"
