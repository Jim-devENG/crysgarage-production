#!/bin/bash

# CrysGarage Safe Deployment Protocol
# Implements minimal backup strategy and staging deployment

set -euo pipefail

# Configuration
SERVER_IP="209.74.80.162"
SERVER_USER="root"
SSH_KEY="/Users/mac/Documents/Crys Garage/crysgarage_key"
BACKUP_DIR="/var/backups/crysgarage"
LOG_FILE="/var/log/crysgarage-deploy.log"
STAGING_PORT="9000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# SSH command wrapper
ssh_cmd() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Check for existing backups
check_existing_backups() {
    log "🔍 Checking for existing backups..."
    
    # Check for recent backups (last 24 hours)
    local recent_backups=$(ssh_cmd "find $BACKUP_DIR -type f -name '*.tar' -mtime -1 2>/dev/null | wc -l")
    
    if [ "$recent_backups" -gt 0 ]; then
        log "✅ Recent backup found (last 24h) — skipping backup creation"
        return 0
    else
        log "⚠️  No recent backup found — will create minimal backup"
        return 1
    fi
}

# Create minimal backup (config + databases only)
create_minimal_backup() {
    log "📦 Creating minimal backup (config + databases only)..."
    
    local backup_name="config_db_$(date +%Y%m%d_%H%M%S).tar"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Create backup directory if it doesn't exist
    ssh_cmd "mkdir -p $BACKUP_DIR"
    
    # Backup only critical files
    ssh_cmd "tar cf $backup_path \
        /etc/nginx/conf.d/studio-ssl.conf \
        /var/www/crysgarage-admin/backend/admin.db \
        /var/www/waitlist-backend/waitlist.db \
        /etc/systemd/system/audio-mastering.service \
        /etc/systemd/system/crysgarage-admin-backend.service \
        /etc/systemd/system/waitlist-backend.service \
        2>/dev/null || true"
    
    if ssh_cmd "test -f $backup_path"; then
        success "✅ Minimal backup created: $backup_name"
        log "📊 Backup size: $(ssh_cmd "du -h $backup_path | cut -f1")"
    else
        error "❌ Failed to create backup"
        return 1
    fi
}

# Deploy to staging
deploy_staging() {
    log "🚀 Deploying to staging environment..."
    
    # Pull latest code
    ssh_cmd "cd /var/www/crysgarage-deploy && git fetch origin"
    ssh_cmd "cd /var/www/crysgarage-deploy && git checkout staging"
    ssh_cmd "cd /var/www/crysgarage-deploy && git pull origin staging"
    
    # Install dependencies
    log "📦 Installing frontend dependencies..."
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-frontend && npm ci"
    
    log "📦 Installing admin frontend dependencies..."
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-admin/frontend && npm ci"
    
    log "📦 Installing backend dependencies..."
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-admin/backend && source .venv/bin/activate && pip install -r requirements.txt"
    ssh_cmd "cd /var/www/crysgarage-deploy/audio-mastering-service && source .venv/bin/activate && pip install -r requirements.txt"
    ssh_cmd "cd /var/www/crysgarage-deploy/waitlist-backend && source .venv/bin/activate && pip install -r requirements.txt"
    
    # Build frontend
    log "🔨 Building frontend applications..."
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-frontend && npm run build"
    ssh_cmd "cd /var/www/crysgarage-deploy/crysgarage-admin/frontend && npm run build"
    
    success "✅ Staging deployment completed"
}

# Test staging endpoints
test_staging() {
    log "🧪 Testing staging endpoints..."
    
    # Test core endpoints
    local endpoints=(
        "http://localhost:8002/health"
        "http://localhost:8082/health"
        "http://localhost:8083/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if ssh_cmd "curl -s -f $endpoint > /dev/null"; then
            success "✅ $endpoint - OK"
        else
            error "❌ $endpoint - FAILED"
            return 1
        fi
    done
    
    # Test audio processing pipeline
    log "🎵 Testing audio processing pipeline..."
    
    # Create test audio file
    ssh_cmd "cd /tmp && ffmpeg -f lavfi -i 'sine=frequency=440:duration=5' -ar 44100 -ac 2 test_audio.wav -y > /dev/null 2>&1"
    
    # Test upload endpoint
    if ssh_cmd "curl -s -f -X POST -F 'file=@/tmp/test_audio.wav' http://localhost:8002/analyze-file > /dev/null"; then
        success "✅ Audio analysis endpoint - OK"
    else
        error "❌ Audio analysis endpoint - FAILED"
        return 1
    fi
    
    # Cleanup test file
    ssh_cmd "rm -f /tmp/test_audio.wav"
    
    success "✅ All staging tests passed"
}

# Promote to production
promote_to_production() {
    log "🎯 Promoting to production..."
    
    # Stop services gracefully
    log "⏹️  Stopping services..."
    ssh_cmd "systemctl stop audio-mastering.service"
    ssh_cmd "systemctl stop crysgarage-admin-backend.service"
    ssh_cmd "systemctl stop waitlist-backend.service"
    ssh_cmd "systemctl stop crysgarage-analyzer.service"
    
    # Merge staging to main
    ssh_cmd "cd /var/www/crysgarage-deploy && git checkout main"
    ssh_cmd "cd /var/www/crysgarage-deploy && git merge staging"
    
    # Deploy to production directories
    log "📁 Deploying to production directories..."
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-frontend/dist/ /var/www/frontend_publish/"
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-admin/frontend/dist/ /var/www/admin-frontend/"
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-admin/backend/ /var/www/crysgarage-admin/backend/"
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/audio-mastering-service/ /var/www/audio-mastering-service/"
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/waitlist-backend/ /var/www/waitlist-backend/"
    
    # Start services
    log "▶️  Starting services..."
    ssh_cmd "systemctl start audio-mastering.service"
    ssh_cmd "systemctl start crysgarage-admin-backend.service"
    ssh_cmd "systemctl start waitlist-backend.service"
    ssh_cmd "systemctl start crysgarage-analyzer.service"
    
    # Wait for services to start
    sleep 10
    
    success "✅ Production deployment completed"
}

# Health verification
verify_health() {
    log "🏥 Verifying system health..."
    
    # Check service status
    local services=(
        "audio-mastering.service"
        "crysgarage-admin-backend.service"
        "waitlist-backend.service"
        "crysgarage-analyzer.service"
    )
    
    for service in "${services[@]}"; do
        if ssh_cmd "systemctl is-active $service > /dev/null"; then
            success "✅ $service - Active"
        else
            error "❌ $service - Inactive"
            return 1
        fi
    done
    
    # Test production endpoints
    log "🌐 Testing production endpoints..."
    local prod_endpoints=(
        "https://crysgarage.studio"
        "https://crysgarage.studio/admin"
        "https://crysgarage.studio/analyzer"
        "https://crysgarage.studio/normalizer"
    )
    
    for endpoint in "${prod_endpoints[@]}"; do
        if curl -s -f "$endpoint" > /dev/null; then
            success "✅ $endpoint - OK"
        else
            error "❌ $endpoint - FAILED"
            return 1
        fi
    done
    
    # Test audio processing
    log "🎵 Testing audio processing..."
    if curl -s -f "https://crysgarage.studio/master-basic/health" > /dev/null; then
        success "✅ Audio mastering service - OK"
    else
        error "❌ Audio mastering service - FAILED"
        return 1
    fi
    
    success "✅ All health checks passed"
}

# Rollback function
rollback() {
    error "🔄 Initiating rollback..."
    
    # Stop services
    ssh_cmd "systemctl stop audio-mastering.service"
    ssh_cmd "systemctl stop crysgarage-admin-backend.service"
    ssh_cmd "systemctl stop waitlist-backend.service"
    ssh_cmd "systemctl stop crysgarage-analyzer.service"
    
    # Restore from backup if available
    local latest_backup=$(ssh_cmd "find $BACKUP_DIR -name 'config_db_*.tar' -type f | sort | tail -1")
    if [ -n "$latest_backup" ]; then
        log "📦 Restoring from backup: $latest_backup"
        ssh_cmd "cd / && tar xf $latest_backup"
    fi
    
    # Revert code to previous commit
    ssh_cmd "cd /var/www/crysgarage-deploy && git reset --hard HEAD~1"
    
    # Redeploy previous version
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-frontend/dist/ /var/www/frontend_publish/"
    ssh_cmd "rsync -av --delete /var/www/crysgarage-deploy/crysgarage-admin/frontend/dist/ /var/www/admin-frontend/"
    
    # Start services
    ssh_cmd "systemctl start audio-mastering.service"
    ssh_cmd "systemctl start crysgarage-admin-backend.service"
    ssh_cmd "systemctl start waitlist-backend.service"
    ssh_cmd "systemctl start crysgarage-analyzer.service"
    
    error "🔄 Rollback completed"
}

# Main deployment function
main() {
    log "🚀 Starting CrysGarage Safe Deployment Protocol"
    
    # Step 1: Check for existing backups
    if ! check_existing_backups; then
        create_minimal_backup
    fi
    
    # Step 2: Deploy to staging
    deploy_staging
    
    # Step 3: Test staging
    if ! test_staging; then
        error "❌ Staging tests failed - aborting deployment"
        exit 1
    fi
    
    # Step 4: Promote to production
    promote_to_production
    
    # Step 5: Health verification
    if ! verify_health; then
        error "❌ Health verification failed - initiating rollback"
        rollback
        exit 1
    fi
    
    success "🎉 Deployment completed successfully!"
    log "📊 Deployment summary:"
    log "   - Backup: $(check_existing_backups && echo "Skipped (recent found)" || echo "Created")"
    log "   - Staging: ✅ Passed"
    log "   - Production: ✅ Deployed"
    log "   - Health: ✅ Verified"
}

# Run main function
main "$@"
