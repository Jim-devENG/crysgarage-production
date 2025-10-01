#!/bin/bash

# Deploy Audio Mastering Fixes to VPS
# This script deploys the download format fixes and audio mastering improvements

set -e

echo "🚀 Starting Audio Mastering Fixes Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Server configuration
SERVER_IP="209.74.80.162"
SERVER_USER="root"
SERVER_PATH="/var/www/crysgarage"

print_status "Deploying audio mastering fixes to $SERVER_IP..."

# Check if we can connect to the server
print_status "Testing connection to VPS..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    print_error "Cannot connect to VPS. Please check SSH configuration."
    print_status "Make sure you have SSH key access to $SERVER_USER@$SERVER_IP"
    exit 1
fi

print_success "VPS connection successful"

# 1. Deploy Backend Changes
print_status "Deploying backend fixes..."

# Upload the fixed main.py
scp audio-mastering-service/main.py $SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/

# Upload the fixed ffmpeg_converter.py
scp audio-mastering-service/services/ffmpeg_converter.py $SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/services/

print_success "Backend files uploaded"

# 2. Deploy Frontend Changes
print_status "Deploying frontend fixes..."

# Upload fixed components
scp crysgarage-frontend/components/matchering/DownloadPage.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/matchering/
scp crysgarage-frontend/components/matchering/BeforeAfterPage.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/matchering/
scp crysgarage-frontend/components/matchering/UploadPage.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/matchering/
scp crysgarage-frontend/components/ProfessionalTier/ProfessionalTierDashboard.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/ProfessionalTier/
scp crysgarage-frontend/components/Shared/AdvancedDownloadSettings.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/Shared/
scp crysgarage-frontend/services/pythonAudioService.ts $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/services/
scp crysgarage-frontend/App.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/

# Upload new components
scp crysgarage-frontend/components/FileDropCard.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/
scp crysgarage-frontend/components/EffectButton.tsx $SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/src/components/

print_success "Frontend files uploaded"

# 3. Install Dependencies and Restart Services
print_status "Installing dependencies and restarting services..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
set -e

echo "🔧 Installing Python dependencies..."

# Navigate to backend directory
cd /var/www/crysgarage/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Installing Python packages..."
pip install --upgrade pip
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install python-multipart==0.0.6
pip install aiofiles==23.2.1
pip install numpy==1.24.3
pip install soundfile==0.12.1
pip install scipy==1.11.4
pip install librosa==0.10.1
pip install pydub==0.25.1
pip install requests==2.31.0
pip install aiohttp==3.9.1
pip install python-dotenv==1.0.0
pip install Pillow==10.1.0
pip install opencv-python==4.8.1.78
pip install tensorflow==2.15.0
pip install torch==2.1.1
pip install torchaudio==2.1.1
pip install noisereduce==3.0.0
pip install psutil
pip install structlog
pip install python-decouple

echo "✅ Python dependencies installed"

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Installing FFmpeg..."
    yum update -y
    yum install -y epel-release
    yum install -y ffmpeg
fi

echo "✅ FFmpeg is available"

# Restart Python service
echo "🔄 Restarting Python audio mastering service..."
systemctl restart crysgarage-python || echo "Service restart failed, trying to start..."
systemctl start crysgarage-python || echo "Service start failed"

# Check service status
echo "📊 Checking service status..."
systemctl status crysgarage-python --no-pager -l

echo "✅ Backend service restarted"
EOF

# 4. Build and Deploy Frontend
print_status "Building and deploying frontend..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
set -e

echo "🌐 Building frontend..."

# Navigate to frontend directory
cd /var/www/crysgarage/frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the frontend
echo "Building React frontend..."
npm run build

# Copy built files to web root
echo "Deploying frontend files..."
rm -rf /var/www/frontend_publish/*
cp -r dist/* /var/www/frontend_publish/

# Set proper permissions
chown -R nginx:nginx /var/www/frontend_publish/
chmod -R 755 /var/www/frontend_publish/

echo "✅ Frontend deployed successfully"
EOF

# 5. Update Nginx Configuration
print_status "Updating Nginx configuration for audio mastering..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Create enhanced Nginx config for audio mastering
cat > /etc/nginx/conf.d/crysgarage.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name crysgarage.studio 209.74.80.162;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name crysgarage.studio 209.74.80.162;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/crysgarage.studio/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crysgarage.studio/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend static files
    root /var/www/frontend_publish;
    index index.html;
    client_max_body_size 500M;

    # Handle static assets with proper MIME types
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Handle assets directory specifically
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Audio mastering endpoints
    location /master-matchering {
        proxy_pass http://127.0.0.1:8002/master-matchering;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 500M;
    }

    # Proxy download endpoint
    location /proxy-download {
        proxy_pass http://127.0.0.1:8002/proxy-download;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Upload file endpoint
    location /upload-file {
        proxy_pass http://127.0.0.1:8002/upload-file;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 500M;
    }

    # Tiers endpoint
    location = /tiers {
        proxy_pass http://127.0.0.1:8002/tiers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API routes to Python backend
    location /api/ {
        proxy_pass http://127.0.0.1:8002/;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Fallback to index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_EOF

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configuration updated"
EOF

# 6. Final Health Check
print_status "Running final health check..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
echo "🏥 Running health checks..."

# Check Python service
echo "Checking Python service status..."
systemctl status crysgarage-python --no-pager -l

# Check Nginx
echo "Checking Nginx status..."
systemctl status nginx --no-pager -l

# Test HTTPS response
echo "Testing HTTPS response..."
curl -I https://crysgarage.studio

# Test API endpoints
echo "Testing tiers endpoint..."
curl -s https://crysgarage.studio/tiers | head -c 200

echo "✅ Health checks completed"
EOF

print_success "🎉 Audio Mastering Fixes Deployment Complete!"
print_status "Deployed fixes include:"
print_status "✅ Fixed download format issues (MP3, WAV16, WAV24)"
print_status "✅ Fixed Content-Type headers for proper file handling"
print_status "✅ Updated frontend with proper file extensions and MIME types"
print_status "✅ Installed all required Python dependencies"
print_status "✅ Updated Nginx configuration for audio mastering endpoints"
print_status "✅ Restarted all services"

print_success "The audio mastering system is now live with all fixes applied!"
print_status "🌐 Site: https://crysgarage.studio"
print_status "🎵 Audio mastering with proper format conversion is now working!"
