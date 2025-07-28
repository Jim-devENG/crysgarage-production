#!/bin/bash

# Crys Garage VPS Deployment Script
# Customize the variables below with your VPS details

# VPS Connection Details
VPS_USER="root"
VPS_HOST="209.74.80.162"
VPS_PORT="22"
VPS_PATH="/var/www/crysgarage"

# Local project path
LOCAL_PROJECT_PATH="$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Crys Garage VPS Deployment${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    if ! command -v rsync &> /dev/null; then
        echo -e "${RED}❌ rsync is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        echo -e "${RED}❌ ssh is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Requirements check passed${NC}"
}

# Test SSH connection
test_connection() {
    echo -e "${YELLOW}Testing SSH connection to VPS...${NC}"
    
    if ssh -p $VPS_PORT -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_HOST exit 2>/dev/null; then
        echo -e "${GREEN}✅ SSH connection successful${NC}"
    else
        echo -e "${RED}❌ SSH connection failed. Please check your VPS details.${NC}"
        echo -e "${YELLOW}Make sure to:${NC}"
        echo -e "  1. Update VPS_USER, VPS_HOST, and VPS_PORT variables in this script"
        echo -e "  2. Set up SSH key authentication or have password ready"
        echo -e "  3. Ensure the VPS is accessible"
        exit 1
    fi
}

# Create remote directory structure
setup_remote_dirs() {
    echo -e "${YELLOW}Setting up remote directory structure...${NC}"
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
        mkdir -p /var/www/crysgarage
        mkdir -p /var/www/crysgarage/crysgarage-backend
        mkdir -p /var/www/crysgarage/crysgarage-frontend
        mkdir -p /var/www/crysgarage/crysgarage-ruby
        mkdir -p /var/www/crysgarage/logs
        mkdir -p /var/www/crysgarage/backups
EOF
    
    echo -e "${GREEN}✅ Remote directories created${NC}"
}

# Deploy backend
deploy_backend() {
    echo -e "${YELLOW}Deploying Laravel backend...${NC}"
    
    # Exclude unnecessary files for production
    rsync -avz --progress \
        --exclude='vendor/' \
        --exclude='node_modules/' \
        --exclude='.env' \
        --exclude='storage/logs/' \
        --exclude='storage/framework/cache/' \
        --exclude='storage/framework/sessions/' \
        --exclude='storage/framework/views/' \
        --exclude='bootstrap/cache/' \
        --exclude='*.sqlite' \
        --exclude='.git/' \
        --exclude='tests/' \
        -e "ssh -p $VPS_PORT" \
        $LOCAL_PROJECT_PATH/crysgarage-backend/ \
        $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-backend/
    
    echo -e "${GREEN}✅ Backend deployed${NC}"
}

# Deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}Deploying React frontend...${NC}"
    
    # Build the frontend for production
    echo -e "${YELLOW}Building frontend for production...${NC}"
    cd crysgarage-frontend
    npm run build
    
    # Deploy built files
    rsync -avz --progress \
        --exclude='node_modules/' \
        --exclude='.git/' \
        --exclude='src/' \
        --exclude='*.tsx' \
        --exclude='*.ts' \
        --exclude='*.js' \
        --exclude='*.jsx' \
        --exclude='package*.json' \
        --exclude='vite.config.ts' \
        --exclude='tailwind.config.js' \
        --exclude='postcss.config.js' \
        --exclude='tsconfig.json' \
        -e "ssh -p $VPS_PORT" \
        $LOCAL_PROJECT_PATH/crysgarage-frontend/dist/ \
        $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-frontend/
    
    echo -e "${GREEN}✅ Frontend deployed${NC}"
}

# Deploy Ruby audio processor
deploy_ruby() {
    echo -e "${YELLOW}Deploying Ruby audio processor...${NC}"
    
    rsync -avz --progress \
        --exclude='*.gem' \
        --exclude='*.rbc' \
        --exclude='/.config' \
        --exclude='/coverage/' \
        --exclude='/InstalledFiles' \
        --exclude='/pkg/' \
        --exclude='/spec/reports/' \
        --exclude='/spec/examples.txt' \
        --exclude='/test/tmp/' \
        --exclude='/test/version_tmp/' \
        --exclude='/tmp/' \
        --exclude='output/' \
        --exclude='logs/' \
        --exclude='temp/' \
        -e "ssh -p $VPS_PORT" \
        $LOCAL_PROJECT_PATH/crysgarage-ruby/ \
        $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-ruby/
    
    echo -e "${GREEN}✅ Ruby audio processor deployed${NC}"
}

# Deploy configuration files
deploy_config() {
    echo -e "${YELLOW}Deploying configuration files...${NC}"
    
    rsync -avz --progress \
        -e "ssh -p $VPS_PORT" \
        $LOCAL_PROJECT_PATH/README.md \
        $LOCAL_PROJECT_PATH/.gitignore \
        $VPS_USER@$VPS_HOST:$VPS_PATH/
    
    echo -e "${GREEN}✅ Configuration files deployed${NC}"
}

# Setup services on VPS
setup_services() {
    echo -e "${YELLOW}Setting up services on VPS...${NC}"
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
        cd /var/www/crysgarage
        
        # Install backend dependencies
        echo "Installing Laravel dependencies..."
        cd crysgarage-backend
        composer install --no-dev --optimize-autoloader
        
        # Set proper permissions
        chmod -R 755 storage/
        chmod -R 755 bootstrap/cache/
        
        # Install frontend dependencies and build
        echo "Installing frontend dependencies..."
        cd ../crysgarage-frontend
        npm install
        npm run build
        
        # Install Ruby dependencies
        echo "Installing Ruby dependencies..."
        cd ../crysgarage-ruby
        bundle install
        
        echo "✅ Services setup completed"
EOF
    
    echo -e "${GREEN}✅ Services setup completed${NC}"
}

# Create systemd service files
create_service_files() {
    echo -e "${YELLOW}Creating systemd service files...${NC}"
    
    # Create Laravel service
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
        sudo tee /etc/systemd/system/crysgarage-backend.service > /dev/null << 'SERVICE'
[Unit]
Description=Crys Garage Laravel Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/crysgarage/crysgarage-backend
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

        # Create Ruby audio processor service
        sudo tee /etc/systemd/system/crysgarage-ruby.service > /dev/null << 'SERVICE'
[Unit]
Description=Crys Garage Ruby Audio Processor
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/crysgarage/crysgarage-ruby
ExecStart=/usr/bin/ruby mastering_server.rb
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

        # Reload systemd and enable services
        sudo systemctl daemon-reload
        sudo systemctl enable crysgarage-backend
        sudo systemctl enable crysgarage-ruby
        sudo systemctl start crysgarage-backend
        sudo systemctl start crysgarage-ruby
        
        echo "✅ Systemd services created and started"
EOF
    
    echo -e "${GREEN}✅ Systemd services created and started${NC}"
}

# Main deployment function
main() {
    check_requirements
    test_connection
    setup_remote_dirs
    deploy_backend
    deploy_frontend
    deploy_ruby
    deploy_config
    setup_services
    create_service_files
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Configure your web server (nginx/apache) to serve the frontend"
    echo -e "  2. Set up environment variables in /var/www/crysgarage/crysgarage-backend/.env"
    echo -e "  3. Run database migrations: php artisan migrate"
    echo -e "  4. Configure SSL certificates"
    echo -e "  5. Set up monitoring and logging"
}

# Run main function
main 