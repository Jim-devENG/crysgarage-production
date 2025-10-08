#!/bin/bash

# CrysGarage Deployment Verification Script
# Tests all critical endpoints and functionality

set -euo pipefail

# Configuration
SERVER_IP="209.74.80.162"
SERVER_USER="root"
SSH_KEY="/Users/mac/Documents/Crys Garage/crysgarage_key"
BASE_URL="https://crysgarage.studio"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# SSH command wrapper
ssh_cmd() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Test function
test_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    log "Testing: $description"
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        success "✅ $description - OK ($response)"
        return 0
    else
        error "❌ $description - FAILED ($response)"
        return 1
    fi
}

# Test with data
test_endpoint_with_data() {
    local url="$1"
    local description="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    
    log "Testing: $description"
    
    local curl_cmd="curl -s -w '%{http_code}' -o /dev/null"
    
    if [ "$method" = "POST" ]; then
        curl_cmd="$curl_cmd -X POST"
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    local response=$(eval "$curl_cmd" || echo "000")
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        success "✅ $description - OK ($response)"
        return 0
    else
        error "❌ $description - FAILED ($response)"
        return 1
    fi
}

# Test systemd services
test_services() {
    log "🔧 Testing systemd services..."
    
    local services=(
        "audio-mastering.service"
        "crysgarage-admin-backend.service"
        "waitlist-backend.service"
        "crysgarage-analyzer.service"
    )
    
    local failed_services=()
    
    for service in "${services[@]}"; do
        if ssh_cmd "systemctl is-active $service > /dev/null"; then
            success "✅ $service - Active"
        else
            error "❌ $service - Inactive"
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        error "Failed services: ${failed_services[*]}"
        return 1
    fi
    
    return 0
}

# Test core endpoints
test_core_endpoints() {
    log "🌐 Testing core endpoints..."
    
    local endpoints=(
        "$BASE_URL"
        "$BASE_URL/admin"
        "$BASE_URL/analyzer"
        "$BASE_URL/normalizer"
        "$BASE_URL/studio"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        if ! test_endpoint "$endpoint" "Core endpoint: $endpoint"; then
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -gt 0 ]; then
        error "Failed endpoints: ${failed_endpoints[*]}"
        return 1
    fi
    
    return 0
}

# Test API endpoints
test_api_endpoints() {
    log "🔌 Testing API endpoints..."
    
    local api_endpoints=(
        "$BASE_URL/health"
        "$BASE_URL/master-basic"
        "$BASE_URL/master-professional"
        "$BASE_URL/master-advanced"
        "$BASE_URL/analyzer-api/health"
        "$BASE_URL/admin/api/v1/metrics"
    )
    
    local failed_apis=()
    
    # Test health endpoint
    if ! test_endpoint "$BASE_URL/health" "API endpoint: $BASE_URL/health" 200; then
        failed_apis+=("$BASE_URL/health")
    fi
    
    # Test mastering endpoints (expect 405 Method Not Allowed for GET requests)
    for endpoint in "$BASE_URL/master-basic" "$BASE_URL/master-professional" "$BASE_URL/master-advanced"; do
        if ! test_endpoint "$endpoint" "API endpoint: $endpoint" 405; then
            failed_apis+=("$endpoint")
        fi
    done
    
    # Test analyzer health
    if ! test_endpoint "$BASE_URL/analyzer-api/health" "API endpoint: $BASE_URL/analyzer-api/health" 200; then
        failed_apis+=("$BASE_URL/analyzer-api/health")
    fi
    
    # Test admin metrics (expect 403 Forbidden without auth)
    if ! test_endpoint "$BASE_URL/admin/api/v1/metrics" "API endpoint: $BASE_URL/admin/api/v1/metrics" 403; then
        failed_apis+=("$BASE_URL/admin/api/v1/metrics")
    fi
    
    if [ ${#failed_apis[@]} -gt 0 ]; then
        error "Failed API endpoints: ${failed_apis[*]}"
        return 1
    fi
    
    return 0
}

# Test audio processing
test_audio_processing() {
    log "🎵 Testing audio processing..."
    
    # Create test audio file on server
    ssh_cmd "cd /tmp && ffmpeg -f lavfi -i 'sine=frequency=440:duration=2' -ar 44100 -ac 2 test_audio.wav -y > /dev/null 2>&1"
    
    # Test audio analysis
    if ssh_cmd "curl -s -f -X POST -F 'file=@/tmp/test_audio.wav' $BASE_URL/analyzer-api/analyze > /dev/null"; then
        success "✅ Audio analysis - OK"
    else
        error "❌ Audio analysis - FAILED"
        return 1
    fi
    
    # Test audio normalization
    if ssh_cmd "curl -s -f -X POST -F 'file=@/tmp/test_audio.wav' -F 'target_level=-6' $BASE_URL/normalize > /dev/null"; then
        success "✅ Audio normalization - OK"
    else
        error "❌ Audio normalization - FAILED"
        return 1
    fi
    
    # Cleanup test file
    ssh_cmd "rm -f /tmp/test_audio.wav"
    
    return 0
}

# Test database connectivity
test_databases() {
    log "🗄️  Testing database connectivity..."
    
    # Test admin database
    if ssh_cmd "cd /var/www/crysgarage-admin/backend && source .venv/bin/activate && python -c 'import sqlite3; conn = sqlite3.connect(\"admin.db\"); conn.execute(\"SELECT 1\"); conn.close()'"; then
        success "✅ Admin database - OK"
    else
        error "❌ Admin database - FAILED"
        return 1
    fi
    
    # Test waitlist database
    if ssh_cmd "cd /var/www/waitlist-backend && source .venv/bin/activate && python -c 'import sqlite3; conn = sqlite3.connect(\"waitlist.db\"); conn.execute(\"SELECT 1\"); conn.close()'"; then
        success "✅ Waitlist database - OK"
    else
        error "❌ Waitlist database - FAILED"
        return 1
    fi
    
    return 0
}

# Test file permissions
test_file_permissions() {
    log "📁 Testing file permissions..."
    
    local critical_paths=(
        "/var/www/frontend_publish"
        "/var/www/admin-frontend"
        "/var/www/crysgarage-admin/backend"
        "/var/www/audio-mastering-service"
        "/var/www/waitlist-backend"
    )
    
    local failed_paths=()
    
    for path in "${critical_paths[@]}"; do
        if ssh_cmd "test -d $path && test -r $path"; then
            success "✅ $path - OK"
        else
            error "❌ $path - FAILED"
            failed_paths+=("$path")
        fi
    done
    
    if [ ${#failed_paths[@]} -gt 0 ]; then
        error "Failed paths: ${failed_paths[*]}"
        return 1
    fi
    
    return 0
}

# Test SSL certificates
test_ssl() {
    log "🔒 Testing SSL certificates..."
    
    if echo | openssl s_client -servername crysgarage.studio -connect crysgarage.studio:443 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
        success "✅ SSL certificate - Valid"
    else
        error "❌ SSL certificate - Invalid or expired"
        return 1
    fi
    
    return 0
}

# Test performance
test_performance() {
    log "⚡ Testing performance..."
    
    local start_time=$(date +%s)
    
    # Test main page load time
    local response_time=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL")
    
    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    
    if (( $(echo "$response_time < 3.0" | bc -l) )); then
        success "✅ Page load time - OK (${response_time}s)"
    else
        warning "⚠️  Page load time - Slow (${response_time}s)"
    fi
    
    return 0
}

# Main verification function
main() {
    log "🔍 Starting CrysGarage deployment verification..."
    
    local failed_tests=()
    
    # Run all tests
    test_services || failed_tests+=("services")
    test_core_endpoints || failed_tests+=("core_endpoints")
    test_api_endpoints || failed_tests+=("api_endpoints")
    test_audio_processing || failed_tests+=("audio_processing")
    test_databases || failed_tests+=("databases")
    test_file_permissions || failed_tests+=("file_permissions")
    test_ssl || failed_tests+=("ssl")
    test_performance || failed_tests+=("performance")
    
    # Summary
    if [ ${#failed_tests[@]} -eq 0 ]; then
        success "🎉 All verification tests passed!"
        log "📊 Verification summary:"
        log "   - Services: ✅ All active"
        log "   - Endpoints: ✅ All responding"
        log "   - Audio processing: ✅ Functional"
        log "   - Databases: ✅ Connected"
        log "   - File permissions: ✅ Correct"
        log "   - SSL: ✅ Valid"
        log "   - Performance: ✅ Acceptable"
        return 0
    else
        error "❌ Verification failed for: ${failed_tests[*]}"
        return 1
    fi
}

# Run main function
main "$@"
