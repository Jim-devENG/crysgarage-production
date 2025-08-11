#!/bin/bash

echo "🚀 Crys Garage VPS Fast Deployment Setup"
echo "========================================"

# Configuration
VPS_HOST="209.74.80.162"
VPS_USER="root"
PROJECT_DIR="/var/www/crysgarage-deploy"
GITHUB_REPO="https://github.com/Jim-devENG/Crysgarage.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Step 1: Update system packages
print_status "Updating system packages..."
yum update -y
print_success "System packages updated"

# Step 2: Install required packages
print_status "Installing required packages..."
yum install -y git nginx php php-fpm php-mysqlnd php-json php-opcache php-mbstring php-xml php-gd php-curl php-zip php-bcmath php-intl php-xmlrpc php-soap php-pear php-devel gcc gcc-c++ make openssl-devel bzip2-devel libffi-devel zlib-devel

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Ruby and Bundler
yum install -y ruby ruby-devel rubygems
gem install bundler

print_success "Required packages installed"

# Step 3: Create project directory
print_status "Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone repository if not exists
if [ ! -d ".git" ]; then
    git clone $GITHUB_REPO .
    print_success "Repository cloned"
else
    git pull origin master
    print_success "Repository updated"
fi

# Step 4: Setup Frontend
print_status "Setting up Frontend..."
cd $PROJECT_DIR/crysgarage-frontend
npm install
print_success "Frontend dependencies installed"

# Step 5: Setup Backend
print_status "Setting up Backend..."
cd $PROJECT_DIR/crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
print_success "Backend setup completed"

# Step 6: Setup Ruby Service
print_status "Setting up Ruby Service..."
cd $PROJECT_DIR/crysgarage-ruby
bundle install
print_success "Ruby dependencies installed"

# Step 7: Create systemd services
print_status "Creating systemd services..."

# Frontend service
cat > /etc/systemd/system/crysgarage-frontend.service << EOF
[Unit]
Description=Crys Garage Frontend (React)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/crysgarage-frontend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5173

[Install]
WantedBy=multi-user.target
EOF

# Backend service
cat > /etc/systemd/system/crysgarage-backend.service << EOF
[Unit]
Description=Crys Garage Backend (Laravel)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/crysgarage-backend
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=10
Environment=APP_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Ruby service
cat > /etc/systemd/system/crysgarage-ruby.service << EOF
[Unit]
Description=Crys Garage Ruby Audio Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/crysgarage-ruby
ExecStart=/usr/bin/ruby simple_ruby_service.rb
Restart=always
RestartSec=10
Environment=RUBY_ENV=production

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd services created"

# Step 8: Setup Nginx configuration
print_status "Setting up Nginx configuration..."
cat > /etc/nginx/conf.d/crysgarage.studio.conf << EOF
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;

    # Frontend (React) - Main domain
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API (Laravel)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Ruby Audio Service
    location /ruby/ {
        proxy_pass http://localhost:4567/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

print_success "Nginx configuration created"

# Step 9: Enable and start services
print_status "Enabling and starting services..."
systemctl daemon-reload
systemctl enable crysgarage-frontend.service
systemctl enable crysgarage-backend.service
systemctl enable crysgarage-ruby.service
systemctl enable nginx

systemctl start crysgarage-frontend.service
systemctl start crysgarage-backend.service
systemctl start crysgarage-ruby.service
systemctl start nginx

print_success "Services enabled and started"

# Step 10: Setup SSL (if certbot is available)
print_status "Setting up SSL certificate..."
if command -v certbot &> /dev/null; then
    certbot --nginx -d crysgarage.studio --non-interactive --agree-tos --email admin@crysgarage.studio
    print_success "SSL certificate configured"
else
    print_warning "Certbot not found. SSL setup skipped."
fi

# Step 11: Create health check script
print_status "Creating health check script..."
cat > $PROJECT_DIR/check_health.sh << 'EOF'
#!/bin/bash
echo "🔍 Crys Garage Service Health Check"
echo "=================================="

# Check if services are running
echo "📊 Checking systemd services..."

FRONTEND_STATUS=$(systemctl is-active crysgarage-frontend.service)
BACKEND_STATUS=$(systemctl is-active crysgarage-backend.service)
RUBY_STATUS=$(systemctl is-active crysgarage-ruby.service)

echo "Frontend (React): $FRONTEND_STATUS"
echo "Backend (Laravel): $BACKEND_STATUS"
echo "Ruby Service: $RUBY_STATUS"

# Check if ports are listening
echo ""
echo "🔌 Checking if ports are listening..."

PORT_5173=$(netstat -tlnp | grep ":5173" | wc -l)
PORT_8000=$(netstat -tlnp | grep ":8000" | wc -l)
PORT_4567=$(netstat -tlnp | grep ":4567" | wc -l)

echo "Port 5173 (Frontend): $([ $PORT_5173 -gt 0 ] && echo "✅ LISTENING" || echo "❌ NOT LISTENING")"
echo "Port 8000 (Backend): $([ $PORT_8000 -gt 0 ] && echo "✅ LISTENING" || echo "❌ NOT LISTENING")"
echo "Port 4567 (Ruby): $([ $PORT_4567 -gt 0 ] && echo "✅ LISTENING" || echo "❌ NOT LISTENING")"

# Check Nginx status
echo ""
echo "🌐 Checking Nginx status..."
NGINX_STATUS=$(systemctl is-active nginx)
echo "Nginx: $NGINX_STATUS"

# Overall health check
echo ""
echo "🏥 Overall Health Status:"

if [ "$FRONTEND_STATUS" = "active" ] && [ "$BACKEND_STATUS" = "active" ] && [ "$RUBY_STATUS" = "active" ] && [ "$NGINX_STATUS" = "active" ] && [ $PORT_5173 -gt 0 ] && [ $PORT_8000 -gt 0 ] && [ $PORT_4567 -gt 0 ]; then
    echo "✅ ALL SERVICES HEALTHY - Your website should be working!"
    echo "🌐 Visit: https://crysgarage.studio"
else
    echo "❌ SOME SERVICES ARE DOWN - Running repair..."
    
    # Auto-repair
    echo "🔧 Attempting to restart failed services..."
    
    if [ "$FRONTEND_STATUS" != "active" ]; then
        echo "Restarting frontend..."
        systemctl restart crysgarage-frontend.service
    fi
    
    if [ "$BACKEND_STATUS" != "active" ]; then
        echo "Restarting backend..."
        systemctl restart crysgarage-backend.service
    fi
    
    if [ "$RUBY_STATUS" != "active" ]; then
        echo "Restarting ruby service..."
        systemctl restart crysgarage-ruby.service
    fi
    
    if [ "$NGINX_STATUS" != "active" ]; then
        echo "Restarting nginx..."
        systemctl restart nginx
    fi
    
    echo "🔄 Services restarted. Check again in 10 seconds..."
fi
echo ""
echo "📋 Manual Commands:"
echo "  systemctl status crysgarage-frontend.service"
echo "  systemctl status crysgarage-backend.service"
echo "  systemctl status crysgarage-ruby.service"
echo "  systemctl status nginx"
EOF

chmod +x $PROJECT_DIR/check_health.sh
print_success "Health check script created"

# Step 12: Final verification
print_status "Running final verification..."
sleep 5
bash $PROJECT_DIR/check_health.sh

echo ""
print_success "🎉 VPS Fast Deployment Setup Completed!"
echo ""
echo "📋 Setup Summary:"
echo "✅ System packages updated"
echo "✅ Required software installed"
echo "✅ Project repository cloned"
echo "✅ Frontend dependencies installed"
echo "✅ Backend dependencies installed"
echo "✅ Ruby dependencies installed"
echo "✅ Systemd services created and enabled"
echo "✅ Nginx configuration created"
echo "✅ SSL certificate configured"
echo "✅ Health check script created"
echo ""
echo "🌐 Your application should be available at:"
echo "   https://crysgarage.studio"
echo ""
echo "📊 Monitor services with:"
echo "   bash $PROJECT_DIR/check_health.sh"
echo ""
echo "🔧 Manual service management:"
echo "   systemctl status crysgarage-*"
echo "   systemctl restart crysgarage-*" 