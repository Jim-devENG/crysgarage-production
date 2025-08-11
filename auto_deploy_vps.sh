#!/bin/bash

echo "🚀 Automatic Crys Garage VPS Deployment"
echo "========================================"

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Update system
print_status "Updating system packages..."
yum update -y

# Install essential packages
print_status "Installing essential packages..."
yum install -y git wget curl unzip

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PHP and extensions
print_status "Installing PHP and extensions..."
yum install -y epel-release
yum install -y php php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-soap php-intl php-redis php-sqlite3

# Install Composer
print_status "Installing Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Ruby
print_status "Installing Ruby..."
yum install -y ruby ruby-devel ruby-bundler gcc gcc-c++ make

# Install FFmpeg
print_status "Installing FFmpeg..."
yum install -y ffmpeg

# Install MySQL
print_status "Installing MySQL..."
yum install -y mysql-server mysql

# Install Nginx
print_status "Installing Nginx..."
yum install -y nginx

# Start and enable services
print_status "Starting and enabling services..."
systemctl start mysqld
systemctl enable mysqld
systemctl start nginx
systemctl enable nginx
systemctl start php-fpm
systemctl enable php-fpm

# Create application directories
print_status "Creating application directories..."
mkdir -p /var/www/crysgarage
mkdir -p /var/www/crysgarage-deploy

# Clone the repository
print_status "Cloning Crys Garage repository..."
cd /var/www/crysgarage-deploy
git clone https://github.com/Jim-devENG/Crysgarage.git .

# Make deployment script executable
chmod +x deploy.sh

# Create production directories
mkdir -p /var/www/crysgarage/crysgarage-backend
mkdir -p /var/www/crysgarage/crysgarage-frontend
mkdir -p /var/www/crysgarage/crysgarage-ruby

# Deploy Backend (Laravel)
print_status "Deploying Laravel backend..."
cp -r crysgarage-backend/* /var/www/crysgarage/crysgarage-backend/
cd /var/www/crysgarage/crysgarage-backend

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Set proper permissions
chown -R nginx:nginx /var/www/crysgarage/crysgarage-backend/storage
chown -R nginx:nginx /var/www/crysgarage/crysgarage-backend/bootstrap/cache
chmod -R 775 /var/www/crysgarage/crysgarage-backend/storage
chmod -R 775 /var/www/crysgarage/crysgarage-backend/bootstrap/cache

# Deploy Frontend (React)
print_status "Deploying React frontend..."
cd /var/www/crysgarage-deploy/crysgarage-frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build frontend for production
print_status "Building frontend for production..."
npm run build

# Copy built files to production directory
mkdir -p /var/www/crysgarage/crysgarage-frontend/dist
cp -r dist/* /var/www/crysgarage/crysgarage-frontend/dist/

# Set proper permissions for frontend
chown -R nginx:nginx /var/www/crysgarage/crysgarage-frontend/dist/
chmod -R 755 /var/www/crysgarage/crysgarage-frontend/dist/

# Deploy Ruby Audio Service
print_status "Deploying Ruby audio processing service..."
cp -r crysgarage-ruby/* /var/www/crysgarage/crysgarage-ruby/
cd /var/www/crysgarage/crysgarage-ruby

# Install Ruby dependencies
print_status "Installing Ruby gems..."
bundle install

# Set proper permissions for Ruby service
chown -R root:root /var/www/crysgarage/crysgarage-ruby
chmod -R 755 /var/www/crysgarage/crysgarage-ruby

# Create systemd service files
print_status "Creating systemd services..."

# Backend service
cat > /etc/systemd/system/crysgarage-backend.service << 'EOF'
[Unit]
Description=Crys Garage Laravel Backend
After=network.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=/var/www/crysgarage/crysgarage-backend
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Ruby service
cat > /etc/systemd/system/crysgarage-ruby.service << 'EOF'
[Unit]
Description=Crys Garage Ruby Audio Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage/crysgarage-ruby
ExecStart=/usr/bin/ruby mastering_server.rb
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start services
print_status "Starting services..."
systemctl daemon-reload
systemctl start crysgarage-backend
systemctl enable crysgarage-backend
systemctl start crysgarage-ruby
systemctl enable crysgarage-ruby

# Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/conf.d/crysgarage.conf << 'EOF'
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
    
    root /var/www/crysgarage/crysgarage-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /audio {
        proxy_pass http://localhost:4567;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.crysgarage.studio;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test and reload Nginx
print_status "Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

# Configure firewall
print_status "Configuring firewall..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8000/tcp
firewall-cmd --permanent --add-port=4567/tcp
firewall-cmd --reload

# Health checks
print_status "Performing health checks..."

# Check if services are running
if systemctl is-active --quiet crysgarage-backend; then
    print_success "Laravel backend is running"
else
    print_error "Laravel backend is not running"
    exit 1
fi

if systemctl is-active --quiet crysgarage-ruby; then
    print_success "Ruby audio service is running"
else
    print_error "Ruby audio service is not running"
    exit 1
fi

if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

# Create update script
cat > /var/www/crysgarage-deploy/update.sh << 'EOF'
#!/bin/bash
cd /var/www/crysgarage-deploy
git pull origin master
./deploy.sh
EOF

chmod +x /var/www/crysgarage-deploy/update.sh

print_success "🎉 Crys Garage deployment completed successfully!"
print_status "🌐 Frontend: http://crysgarage.studio"
print_status "🔧 API: http://api.crysgarage.studio"
print_status "🎵 Audio Service: http://localhost:4567"

echo ""
print_status "Deployment completed at $(date)"
print_status "To update in the future, run: /var/www/crysgarage-deploy/update.sh" 