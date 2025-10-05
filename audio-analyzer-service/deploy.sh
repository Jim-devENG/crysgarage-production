#!/bin/bash
set -e

echo "🚀 Deploying CrysGarage Audio Analyzer Service..."

# Server details
SERVER="209.74.80.162"
KEY="/Users/mac/Documents/Crys Garage/crysgarage_key"
SERVICE_DIR="/var/www/crysgarage/audio-analyzer-service"

echo "📦 Installing Python dependencies on server..."

# Create service directory
ssh -i "$KEY" root@$SERVER "mkdir -p $SERVICE_DIR"

# Copy service files
echo "📁 Copying service files..."
scp -i "$KEY" main.py root@$SERVER:$SERVICE_DIR/
scp -i "$KEY" requirements.txt root@$SERVER:$SERVICE_DIR/
scp -i "$KEY" crysgarage-analyzer.service root@$SERVER:/etc/systemd/system/

# Install Python dependencies
echo "🐍 Setting up Python environment..."
ssh -i "$KEY" root@$SERVER << 'EOF'
cd /var/www/crysgarage/audio-analyzer-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install FFmpeg (required for pydub)
yum install -y ffmpeg ffmpeg-devel

# Set permissions
chown -R root:root /var/www/crysgarage/audio-analyzer-service
chmod +x main.py
EOF

# Setup systemd service
echo "⚙️ Setting up systemd service..."
ssh -i "$KEY" root@$SERVER << 'EOF'
systemctl daemon-reload
systemctl enable crysgarage-analyzer.service
systemctl start crysgarage-analyzer.service
systemctl status crysgarage-analyzer.service
EOF

echo "✅ Audio Analyzer Service deployed successfully!"
echo "🔗 Service running on: http://209.74.80.162:8003"
echo "📊 Health check: http://209.74.80.162:8003/health"
