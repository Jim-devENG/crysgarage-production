#!/bin/bash

# CrysGarage Fix Deployment Script
# Fixes missing components and deploys current changes

set -euo pipefail

# Configuration
SERVER_IP="209.74.80.162"
SERVER_USER="root"
SSH_KEY="/Users/mac/Documents/Crys Garage/crysgarage_key"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

ssh_cmd() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Fix missing directories
fix_missing_directories() {
    log "🔧 Fixing missing directories..."
    
    # Create missing directories
    ssh_cmd "mkdir -p /var/www/admin-frontend"
    ssh_cmd "mkdir -p /var/www/audio-mastering-service"
    ssh_cmd "mkdir -p /var/www/frontend_publish"
    
    # Set proper permissions
    ssh_cmd "chown -R www-data:www-data /var/www/admin-frontend"
    ssh_cmd "chown -R www-data:www-data /var/www/audio-mastering-service"
    ssh_cmd "chown -R www-data:www-data /var/www/frontend_publish"
    
    success "✅ Missing directories created"
}

# Deploy frontend from local
deploy_frontend() {
    log "🚀 Deploying frontend from local..."
    
    # Build frontend locally
    log "🔨 Building frontend locally..."
    cd "/Users/mac/Documents/Crys Garage/crysgarage-frontend"
    npm run build
    
    # Deploy to server
    log "📁 Deploying to server..."
    rsync -avz --delete "/Users/mac/Documents/Crys Garage/crysgarage-frontend/dist/" root@209.74.80.162:/var/www/frontend_publish/
    
    success "✅ Frontend deployed"
}

# Deploy admin from local
deploy_admin() {
    log "🚀 Deploying admin from local..."
    
    # Build admin frontend locally
    log "🔨 Building admin frontend locally..."
    cd "/Users/mac/Documents/Crys Garage/crysgarage-admin/frontend"
    npm run build
    
    # Deploy admin frontend to server
    log "📁 Deploying admin frontend to server..."
    rsync -avz --delete "/Users/mac/Documents/Crys Garage/crysgarage-admin/frontend/dist/" root@209.74.80.162:/var/www/admin-frontend/
    
    # Deploy admin backend to server
    log "📁 Deploying admin backend to server..."
    rsync -avz --delete "/Users/mac/Documents/Crys Garage/crysgarage-admin/backend/" root@209.74.80.162:/var/www/crysgarage-admin/backend/
    
    success "✅ Admin deployed"
}

# Deploy audio service from local
deploy_audio_service() {
    log "🚀 Deploying audio service from local..."
    
    # Deploy audio service to server
    log "📁 Deploying audio service to server..."
    rsync -avz --delete "/Users/mac/Documents/Crys Garage/audio-mastering-service/" root@209.74.80.162:/var/www/audio-mastering-service/
    
    # Install dependencies on server
    log "📦 Installing audio service dependencies..."
    ssh_cmd "cd /var/www/audio-mastering-service && source .venv/bin/activate && pip install -r requirements.txt"
    
    success "✅ Audio service deployed"
}

# Fix Nginx configuration
fix_nginx_config() {
    log "🔧 Fixing Nginx configuration..."
    
    # Check current Nginx config
    ssh_cmd "nginx -t"
    
    # Reload Nginx
    ssh_cmd "systemctl reload nginx"
    
    success "✅ Nginx configuration fixed"
}

# Restart services
restart_services() {
    log "🔄 Restarting services..."
    
    # Stop services
    ssh_cmd "systemctl stop audio-mastering.service"
    ssh_cmd "systemctl stop crysgarage-admin-backend.service"
    ssh_cmd "systemctl stop waitlist-backend.service"
    ssh_cmd "systemctl stop crysgarage-analyzer.service"
    
    # Wait a moment
    sleep 5
    
    # Start services
    ssh_cmd "systemctl start audio-mastering.service"
    ssh_cmd "systemctl start crysgarage-admin-backend.service"
    ssh_cmd "systemctl start waitlist-backend.service"
    ssh_cmd "systemctl start crysgarage-analyzer.service"
    
    # Wait for services to start
    sleep 10
    
    success "✅ Services restarted"
}

# Quick health check
health_check() {
    log "🏥 Quick health check..."
    
    # Check services
    local services=("audio-mastering.service" "crysgarage-admin-backend.service" "waitlist-backend.service" "crysgarage-analyzer.service")
    for service in "${services[@]}"; do
        if ssh_cmd "systemctl is-active $service > /dev/null"; then
            success "✅ $service - Active"
        else
            error "❌ $service - Inactive"
            return 1
        fi
    done
    
    # Check main endpoints
    if curl -s -f "https://crysgarage.studio" > /dev/null; then
        success "✅ Main site - OK"
    else
        error "❌ Main site - FAILED"
        return 1
    fi
    
    if curl -s -f "https://crysgarage.studio/admin" > /dev/null; then
        success "✅ Admin panel - OK"
    else
        error "❌ Admin panel - FAILED"
        return 1
    fi
    
    success "✅ Health check passed"
}

# Main function
main() {
    log "🚀 Starting CrysGarage fix deployment..."
    
    # Fix missing directories
    fix_missing_directories
    
    # Deploy components
    deploy_frontend
    deploy_admin
    deploy_audio_service
    
    # Fix Nginx
    fix_nginx_config
    
    # Restart services
    restart_services
    
    # Health check
    if health_check; then
        success "🎉 Fix deployment completed successfully!"
    else
        error "❌ Health check failed - please investigate"
        exit 1
    fi
}

# Run main function
main "$@"
