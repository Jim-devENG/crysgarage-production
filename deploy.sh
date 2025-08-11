#!/bin/bash

echo "🚀 Starting Crys Garage deployment from GitHub..."

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

# Pull latest changes
print_status "Pulling latest changes from GitHub..."
cd /var/www/crysgarage-deploy
git pull origin master

# Deploy Backend (Laravel)
print_status "Deploying Laravel backend..."
cp -r crysgarage-backend/* /var/www/crysgarage/crysgarage-backend/
cd /var/www/crysgarage/crysgarage-backend

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force

# Clear Laravel caches
print_status "Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Set proper permissions
chown -R www-data:www-data /var/www/crysgarage/crysgarage-backend/storage
chown -R www-data:www-data /var/www/crysgarage/crysgarage-backend/bootstrap/cache
chmod -R 775 /var/www/crysgarage/crysgarage-backend/storage
chmod -R 775 /var/www/crysgarage/crysgarage-backend/bootstrap/cache

# Restart backend service
print_status "Restarting Laravel backend service..."
systemctl restart crysgarage-backend
print_success "Backend deployed successfully!"

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
print_status "Copying built files..."
cp -r dist/* /var/www/crysgarage/crysgarage-frontend/dist/

# Set proper permissions for frontend
chown -R nginx:nginx /var/www/crysgarage/crysgarage-frontend/dist/
chmod -R 755 /var/www/crysgarage/crysgarage-frontend/dist/
print_success "Frontend deployed successfully!"

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

# Restart Ruby service
print_status "Restarting Ruby audio service..."
systemctl restart crysgarage-ruby
print_success "Ruby service deployed successfully!"

# Reload Nginx
print_status "Reloading Nginx configuration..."
nginx -s reload

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

# Test API endpoints
print_status "Testing API endpoints..."
if curl -f -s http://localhost:8000/api/health > /dev/null; then
    print_success "Backend API is responding"
else
    print_warning "Backend API health check failed"
fi

if curl -f -s http://localhost:4567/health > /dev/null; then
    print_success "Ruby audio service is responding"
else
    print_warning "Ruby audio service health check failed"
fi

print_success "🎉 Crys Garage deployment completed successfully!"
print_status "🌐 Frontend: https://crysgarage.studio"
print_status "🔧 API: https://api.crysgarage.studio"
print_status "🎵 Audio Service: http://localhost:4567"

echo ""
print_status "Deployment completed at $(date)" 