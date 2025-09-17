#!/bin/bash

# Clean VPS Deployment Script
# This script will clean and reinstall all dependencies on the VPS

set -e  # Exit on any error

echo "🚀 Starting Clean VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="crysgarage.studio"
VPS_USER="root"
DEPLOY_DIR="/var/www/crysgarage-deploy"
PYTHON_SERVICE_DIR="$DEPLOY_DIR/audio-mastering-service"

echo -e "${BLUE}📋 VPS Clean Deployment Plan:${NC}"
echo "1. Stop all services"
echo "2. Clean Python virtual environment"
echo "3. Pull latest code from GitHub"
echo "4. Reinstall Python dependencies"
echo "5. Reinstall system dependencies"
echo "6. Restart all services"
echo "7. Verify deployment"
echo ""

# Function to run commands on VPS
run_vps_command() {
    echo -e "${YELLOW}🔧 Running: $1${NC}"
    ssh $VPS_USER@$VPS_HOST "$1"
}

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        exit 1
    fi
}

echo -e "${BLUE}🛑 Step 1: Stopping all services...${NC}"
run_vps_command "systemctl stop uvicorn-audio-mastering || true"
run_vps_command "pkill -f uvicorn || true"
run_vps_command "pkill -f python.*main.py || true"
check_success

echo -e "${BLUE}🧹 Step 2: Cleaning Python virtual environment...${NC}"
run_vps_command "cd $PYTHON_SERVICE_DIR && rm -rf venv"
run_vps_command "cd $PYTHON_SERVICE_DIR && python3 -m venv venv"
check_success

echo -e "${BLUE}📥 Step 3: Pulling latest code from GitHub...${NC}"
run_vps_command "cd $DEPLOY_DIR && git pull origin master"
check_success

echo -e "${BLUE}🐍 Step 4: Installing Python dependencies...${NC}"
run_vps_command "cd $PYTHON_SERVICE_DIR && source venv/bin/activate && pip install --upgrade pip"
run_vps_command "cd $PYTHON_SERVICE_DIR && source venv/bin/activate && pip install -r requirements.txt"
check_success

echo -e "${BLUE}🔧 Step 5: Installing system dependencies...${NC}"
run_vps_command "apt update"
run_vps_command "apt install -y ffmpeg libsndfile1"
check_success

echo -e "${BLUE}🔄 Step 6: Restarting services...${NC}"
run_vps_command "systemctl daemon-reload"
run_vps_command "systemctl enable uvicorn-audio-mastering"
run_vps_command "systemctl start uvicorn-audio-mastering"
check_success

echo -e "${BLUE}🔍 Step 7: Verifying deployment...${NC}"
echo "Waiting 10 seconds for services to start..."
sleep 10

# Test Python service health
echo "Testing Python service health..."
run_vps_command "curl -f http://127.0.0.1:8002/health || echo 'Health check failed'"

# Test genre presets endpoint
echo "Testing genre presets endpoint..."
run_vps_command "curl -f http://127.0.0.1:8002/genre-presets || echo 'Genre presets failed'"

# Test public endpoint through Nginx
echo "Testing public endpoint through Nginx..."
run_vps_command "curl -f https://crysgarage.studio/api/python/health || echo 'Public health check failed'"

echo -e "${GREEN}🎉 Clean VPS deployment completed!${NC}"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
run_vps_command "systemctl status uvicorn-audio-mastering --no-pager -l"

echo ""
echo -e "${BLUE}📝 Recent logs:${NC}"
run_vps_command "journalctl -u uvicorn-audio-mastering --no-pager -n 20"

echo ""
echo -e "${GREEN}✅ VPS cleanup and deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 You can now test your application at: https://crysgarage.studio${NC}"
