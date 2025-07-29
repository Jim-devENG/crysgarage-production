#!/bin/bash

# Crys Garage VPS Deployment Script
# This script builds and deploys the application to your VPS

set -e  # Exit on any error

# Configuration
VPS_HOST="209.74.80.162"
VPS_USER="root"
VPS_PATH="/var/www/crysgarage"
BACKUP_PATH="/var/www/crysgarage_backup_$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
        exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "crysgarage-frontend" ] || [ ! -d "crysgarage-backend" ]; then
    error "Please run this script from the Crys Garage project root directory"
fi

log "🚀 Starting Crys Garage deployment to VPS..."

# Step 1: Test SSH connection
log "🔍 Testing SSH connection to VPS..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_HOST "echo 'SSH connection successful'" 2>/dev/null; then
    error "Cannot connect to VPS. Please check your SSH configuration."
fi
success "SSH connection established"

# Step 2: Create backup on VPS
log "💾 Creating backup of current installation..."
ssh $VPS_USER@$VPS_HOST "if [ -d '$VPS_PATH' ]; then cp -r $VPS_PATH $BACKUP_PATH; fi"
success "Backup created at $BACKUP_PATH"

# Step 3: Build frontend
log "📦 Building frontend application..."
    cd crysgarage-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log "📥 Installing frontend dependencies..."
    npm install
fi

# Build the application
npm run build
if [ $? -ne 0 ]; then
    error "Frontend build failed"
fi
success "Frontend built successfully"

# Step 4: Upload frontend
log "📤 Uploading frontend to VPS..."
scp -r dist/* $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-frontend/dist/
if [ $? -ne 0 ]; then
    error "Frontend upload failed"
fi
success "Frontend uploaded successfully"

# Step 5: Upload backend
log "📤 Uploading backend to VPS..."
cd ../crysgarage-backend
scp -r . $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-backend/
if [ $? -ne 0 ]; then
    error "Backend upload failed"
fi
success "Backend uploaded successfully"

# Step 6: Configure server
log "🔧 Configuring server..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
set -e

cd /var/www/crysgarage/crysgarage-backend

# Install/update dependencies
echo "Installing PHP dependencies..."
        composer install --no-dev --optimize-autoloader
        
        # Set proper permissions
echo "Setting permissions..."
chown -R nginx:nginx /var/www/crysgarage
chmod -R 755 /var/www/crysgarage
chmod -R 664 /var/www/crysgarage/crysgarage-backend/database/database.sqlite

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed demo users
echo "Seeding demo users..."
php artisan db:seed --class=DemoUserSeeder --force

# Clear and cache configurations
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
echo "Restarting services..."
systemctl restart crysgarage-backend
systemctl restart nginx

# Check service status
echo "Checking service status..."
systemctl is-active --quiet crysgarage-backend && echo "Backend service is running" || echo "Backend service failed to start"
systemctl is-active --quiet nginx && echo "Nginx service is running" || echo "Nginx service failed to start"
EOF

if [ $? -ne 0 ]; then
    error "Server configuration failed"
fi

# Step 7: Test deployment
log "🧪 Testing deployment..."
sleep 5  # Wait for services to start

# Test if the site is accessible
if curl -s -o /dev/null -w "%{http_code}" https://crysgarage.studio | grep -q "200\|301\|302"; then
    success "Frontend is accessible"
else
    warning "Frontend might not be accessible yet (check DNS propagation)"
fi

# Test API endpoint
if curl -s -o /dev/null -w "%{http_code}" https://api.crysgarage.studio/api/auth/signin | grep -q "200\|405"; then
    success "API is accessible"
else
    warning "API might not be accessible yet"
fi

# Step 8: Cleanup old backups (keep last 3)
log "🧹 Cleaning up old backups..."
ssh $VPS_USER@$VPS_HOST "cd /var/www && ls -dt crysgarage_backup_* | tail -n +4 | xargs -r rm -rf"

success "🎉 Deployment completed successfully!"

log "📋 Post-deployment checklist:"
echo "1. ✅ Frontend built and uploaded"
echo "2. ✅ Backend uploaded and configured"
echo "3. ✅ Database migrated and seeded"
echo "4. ✅ Services restarted"
echo "5. ✅ Basic connectivity tested"

log "🔗 Your application should be available at:"
echo "   Frontend: https://crysgarage.studio"
echo "   API: https://api.crysgarage.studio"

log "🧪 Test the login modal with:"
echo "   Email: demo.free@crysgarage.com"
echo "   Password: password"

log "📊 Monitor your application:"
echo "   Check logs: ssh $VPS_USER@$VPS_HOST 'journalctl -u crysgarage-backend -f'"
echo "   Check status: ssh $VPS_USER@$VPS_HOST 'systemctl status crysgarage-backend'"

if [ -n "$BACKUP_PATH" ]; then
    log "💾 Backup available at: $BACKUP_PATH"
fi 