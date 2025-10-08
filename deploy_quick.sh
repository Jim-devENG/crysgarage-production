#!/bin/bash

# CrysGarage Quick Deployment Script
# For immediate deployments with minimal backup strategy

set -euo pipefail

# Configuration
SERVER_IP="209.74.80.162"
SERVER_USER="root"
SSH_KEY="/Users/mac/Documents/Crys Garage/crysgarage_key"
BACKUP_DIR="/var/backups/crysgarage"

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

# Check for recent backups
check_backups() {
    log "🔍 Checking for recent backups..."
    local recent=$(ssh_cmd "find $BACKUP_DIR -name '*.tar' -mtime -1 2>/dev/null | wc -l")
    if [ "$recent" -gt 0 ]; then
        log "✅ Recent backup found - skipping backup creation"
        return 0
    else
        log "⚠️  No recent backup - creating minimal backup"
        return 1
    fi
}

# Create minimal backup
create_backup() {
    log "📦 Creating minimal backup..."
    ssh_cmd "mkdir -p $BACKUP_DIR"
    local backup_name="config_db_$(date +%Y%m%d_%H%M%S).tar"
    ssh_cmd "tar cf $BACKUP_DIR/$backup_name \
        /etc/nginx/conf.d/studio-ssl.conf \
        /var/www/crysgarage-admin/backend/admin.db \
        /var/www/waitlist-backend/waitlist.db \
        2>/dev/null || true"
    success "✅ Backup created: $backup_name"
}

# Deploy frontend
deploy_frontend() {
    log "🚀 Deploying frontend..."
    
    # Build frontend
    log "🔨 Building frontend..."
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-frontend && npm ci && npm run build"
    
    # Deploy to production
    log "📁 Deploying to production..."
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-frontend/dist/ /var/www/frontend_publish/"
    
    success "✅ Frontend deployed"
}

# Deploy admin
deploy_admin() {
    log "🚀 Deploying admin..."
    
    # Build admin frontend
    log "🔨 Building admin frontend..."
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-admin/frontend && npm ci && npm run build"
    
    # Deploy admin backend
    log "📁 Deploying admin backend..."
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-admin/backend/ /var/www/crysgarage-admin/backend/"
    
    # Deploy admin frontend
    log "📁 Deploying admin frontend..."
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-admin/frontend/dist/ /var/www/admin-frontend/"
    
    success "✅ Admin deployed"
}

# Deploy audio service
deploy_audio_service() {
    log "🚀 Deploying audio service..."
    
    # Update dependencies
    log "📦 Installing dependencies..."
    ssh_cmd "cd /var/www/crysgarage-deploy/audio-mastering-service && source .venv/bin/activate && pip install -r requirements.txt"
    
    # Deploy service
    log "📁 Deploying service..."
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/audio-mastering-service/ /var/www/audio-mastering-service/"
    
    success "✅ Audio service deployed"
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
    log "🚀 Starting quick deployment..."
    
    # Check for backups
    if ! check_backups; then
        create_backup
    fi
    
    # Deploy components
    deploy_frontend
    deploy_admin
    deploy_audio_service
    
    # Restart services
    restart_services
    
    # Health check
    if health_check; then
        success "🎉 Quick deployment completed successfully!"
    else
        error "❌ Health check failed - please investigate"
        exit 1
    fi
}

# Run main function
main "$@"
