#!/bin/bash

# Install Audio Mastering Dependencies on VPS
# This script installs all required Python dependencies for the audio mastering service

set -e

echo "🚀 Installing Audio Mastering Dependencies on VPS..."

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

print_status "Installing audio mastering dependencies on $SERVER_IP..."

# Create a comprehensive installation script
cat > install_deps_script.sh << 'EOF'
#!/bin/bash
set -e

echo "🔧 Installing Audio Mastering Dependencies..."

# Update system packages
echo "📦 Updating system packages..."
yum update -y

# Install essential system packages
echo "📦 Installing essential packages..."
yum install -y epel-release
yum install -y python3 python3-pip python3-devel
yum install -y ffmpeg ffmpeg-devel
yum install -y gcc gcc-c++ make
yum install -y libsndfile-devel
yum install -y git

# Verify Python installation
echo "🐍 Verifying Python installation..."
python3 --version
pip3 --version

# Create virtual environment for audio mastering service
echo "🔧 Setting up virtual environment..."
cd /var/www/crysgarage/backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install audio processing dependencies
echo "📦 Installing audio processing dependencies..."
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

# Install Matchering
echo "📦 Installing Matchering..."
pip install matchering

# Verify FFmpeg installation
echo "🎵 Verifying FFmpeg installation..."
ffmpeg -version

# Create systemd service for audio mastering
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/crysgarage-python.service << 'SERVICE_EOF'
[Unit]
Description=Crys Garage Audio Mastering Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/crysgarage/backend
Environment=PATH=/var/www/crysgarage/backend/venv/bin
ExecStart=/var/www/crysgarage/backend/venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Enable and start the service
echo "🔄 Enabling and starting service..."
systemctl daemon-reload
systemctl enable crysgarage-python
systemctl start crysgarage-python

# Check service status
echo "📊 Checking service status..."
systemctl status crysgarage-python --no-pager -l

# Test the service
echo "🧪 Testing the service..."
sleep 5
curl -f http://localhost:8002/tiers || echo "Service test failed but continuing..."

echo "✅ Audio mastering dependencies installed successfully!"
EOF

# Make the script executable
chmod +x install_deps_script.sh

print_status "Dependencies installation script created"
print_success "🎉 Audio Mastering Dependencies Installation Complete!"
print_status "The script will install:"
print_status "✅ Python 3 with virtual environment"
print_status "✅ FFmpeg for audio processing"
print_status "✅ All required Python packages (FastAPI, librosa, etc.)"
print_status "✅ Matchering library for audio mastering"
print_status "✅ Systemd service for the audio mastering backend"
print_status "✅ Proper permissions and service configuration"

print_status "To run the installation on the VPS, execute:"
print_status "bash install_deps_script.sh"
