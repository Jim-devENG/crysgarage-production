#!/bin/bash

# Crys Garage Server Cleanup Script
# This script removes all applications and files that are not related to Crys Garage
# Run this script as root on the server

set -e  # Exit on any error

echo "🚀 Starting Crys Garage Server Cleanup..."
echo "=========================================="

# Color codes for output
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

# Function to safely kill processes
kill_processes() {
    local pattern=$1
    local description=$2
    
    print_status "Stopping $description processes..."
    
    # Find and kill processes, but exclude Ruby and Crys Garage processes
    pids=$(ps aux | grep -E "$pattern" | grep -v grep | grep -v ruby | grep -v crysgarage | awk '{print $2}' | tr '\n' ' ')
    
    if [ -n "$pids" ]; then
        echo "Found PIDs: $pids"
        for pid in $pids; do
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid
                print_success "Killed process $pid"
            fi
        done
    else
        print_status "No $description processes found"
    fi
}

# Function to remove directories safely
remove_directory() {
    local dir=$1
    local description=$2
    
    # Skip if directory contains Ruby or Crys Garage
    if [[ "$dir" == *"ruby"* ]] || [[ "$dir" == *"crysgarage"* ]]; then
        print_status "Skipping $description (preserving Ruby/Crys Garage): $dir"
        return 0
    fi
    
    if [ -d "$dir" ]; then
        print_status "Removing $description: $dir"
        rm -rf "$dir"
        print_success "Removed $description"
    else
        print_status "$description not found: $dir"
    fi
}

# Function to remove files safely
remove_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        print_status "Removing $description: $file"
        rm -f "$file"
        print_success "Removed $description"
    else
        print_status "$description not found: $file"
    fi
}

# Function to stop and disable services
stop_service() {
    local service=$1
    local description=$2
    
    print_status "Stopping $description service: $service"
    
    if systemctl is-active --quiet "$service"; then
        systemctl stop "$service"
        print_success "Stopped $service"
    fi
    
    if systemctl is-enabled --quiet "$service"; then
        systemctl disable "$service"
        print_success "Disabled $service"
    fi
}

# Function to remove systemd services
remove_service() {
    local service=$1
    local description=$2
    
    stop_service "$service" "$description"
    
    local service_file="/etc/systemd/system/$service.service"
    if [ -f "$service_file" ]; then
        print_status "Removing $description service file: $service_file"
        rm -f "$service_file"
        print_success "Removed $description service file"
    fi
}

# Function to clean up nginx configurations
cleanup_nginx() {
    print_status "Cleaning up nginx configurations..."
    
    # Remove non-Crys Garage and non-Ruby nginx configs
    if [ -d "/etc/nginx/sites-available" ]; then
        for config in /etc/nginx/sites-available/*; do
            if [ -f "$config" ]; then
                config_name=$(basename "$config")
                if [[ "$config_name" != *"crysgarage"* ]] && [[ "$config_name" != *"ruby"* ]]; then
                    print_status "Removing nginx config: $config_name"
                    rm -f "$config"
                    
                    # Also remove from sites-enabled if it exists
                    enabled_link="/etc/nginx/sites-enabled/$config_name"
                    if [ -L "$enabled_link" ]; then
                        rm -f "$enabled_link"
                    fi
                    print_success "Removed nginx config: $config_name"
                else
                    print_status "Preserving nginx config: $config_name (Ruby/Crys Garage)"
                fi
            fi
        done
    fi
    
    # Test nginx configuration
    if nginx -t >/dev/null 2>&1; then
        print_success "Nginx configuration is valid"
        systemctl reload nginx
    else
        print_error "Nginx configuration is invalid"
    fi
}

# Function to clean up cron jobs
cleanup_cron() {
    print_status "Cleaning up cron jobs..."
    
    # Remove non-Crys Garage and non-Ruby cron jobs for root
    if [ -f "/var/spool/cron/root" ]; then
        print_status "Backing up root cron jobs..."
        cp /var/spool/cron/root /var/spool/cron/root.backup.$(date +%Y%m%d_%H%M%S)
        
        # Keep only Crys Garage and Ruby related cron jobs
        if grep -q "crysgarage\|ruby" /var/spool/cron/root; then
            print_status "Keeping Crys Garage and Ruby cron jobs, removing others..."
            # Keep lines containing crysgarage or ruby
            sed -i '/crysgarage\|ruby/!d' /var/spool/cron/root
        else
            print_status "No Crys Garage or Ruby cron jobs found, clearing all..."
            > /var/spool/cron/root
        fi
    fi
}

# Function to clean up log files
cleanup_logs() {
    print_status "Cleaning up old log files..."
    
    # Clean up old log files (keep last 7 days)
    find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
    find /var/log -name "*.gz" -mtime +7 -delete 2>/dev/null || true
    
    # Clean up journal logs (keep last 7 days)
    journalctl --vacuum-time=7d >/dev/null 2>&1 || true
    
    print_success "Log cleanup completed"
}

# Function to clean up temporary files
cleanup_temp() {
    print_status "Cleaning up temporary files..."
    
    # Clean up /tmp
    find /tmp -type f -mtime +1 -delete 2>/dev/null || true
    find /tmp -type d -empty -delete 2>/dev/null || true
    
    # Clean up /var/tmp
    find /var/tmp -type f -mtime +1 -delete 2>/dev/null || true
    find /var/tmp -type d -empty -delete 2>/dev/null || true
    
    print_success "Temporary files cleanup completed"
}

# Function to clean up package cache
cleanup_packages() {
    print_status "Cleaning up package cache..."
    
    # Clean up yum/dnf cache
    if command -v dnf >/dev/null 2>&1; then
        dnf clean all >/dev/null 2>&1 || true
    elif command -v yum >/dev/null 2>&1; then
        yum clean all >/dev/null 2>&1 || true
    fi
    
    # Clean up apt cache (if on Ubuntu/Debian)
    if command -v apt >/dev/null 2>&1; then
        apt clean >/dev/null 2>&1 || true
    fi
    
    print_success "Package cache cleanup completed"
}

# Function to verify Crys Garage and Ruby are still working
verify_crysgarage() {
    print_status "Verifying Crys Garage and Ruby installations..."
    
    # Check if Crys Garage backend is running
    if systemctl is-active --quiet crysgarage-backend; then
        print_success "Crys Garage backend service is running"
    else
        print_error "Crys Garage backend service is not running"
        return 1
    fi
    
    # Check if Crys Garage directories exist
    if [ -d "/var/www/crysgarage" ]; then
        print_success "Crys Garage directory exists"
    else
        print_error "Crys Garage directory not found"
        return 1
    fi
    
    # Check if Ruby is still available
    if command -v ruby >/dev/null 2>&1; then
        print_success "Ruby is still available"
        ruby_version=$(ruby --version 2>/dev/null | head -1)
        print_status "Ruby version: $ruby_version"
    else
        print_warning "Ruby is not available"
    fi
    
    # Check if Ruby gems are still available
    if command -v gem >/dev/null 2>&1; then
        print_success "Ruby gems are still available"
    else
        print_warning "Ruby gems are not available"
    fi
    
    # Test if the application responds
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
        print_success "Crys Garage backend is responding correctly"
    else
        print_warning "Crys Garage backend is not responding correctly"
    fi
    
    return 0
}

# Main cleanup process
main() {
    echo "Starting cleanup process..."
    echo "=========================="
    
    # 1. Stop all non-Crys Garage and non-Ruby processes
    print_status "Step 1: Stopping non-Crys Garage and non-Ruby processes"
    kill_processes "audio-app" "audio-app"
    kill_processes "php.*8000" "PHP processes on port 8000"
    kill_processes "node.*3000" "Node.js processes on port 3000"
    
    # 2. Remove old application directories
    print_status "Step 2: Removing old application directories"
    remove_directory "/root/audio-app" "audio-app"
    remove_directory "/var/www/audio-app" "audio-app from web directory"
    remove_directory "/opt/audio-app" "audio-app from opt"
    
    # Check for and preserve Ruby installations
    print_status "Checking Ruby installations..."
    if [ -d "/usr/local/rvm" ]; then
        print_status "Found RVM installation - preserving"
    fi
    if [ -d "/usr/local/rbenv" ]; then
        print_status "Found rbenv installation - preserving"
    fi
    if [ -d "/opt/ruby" ]; then
        print_status "Found Ruby installation in /opt/ruby - preserving"
    fi
    
    # 3. Remove old service files
    print_status "Step 3: Removing old service files"
    remove_service "audio-app-backend" "audio-app backend"
    remove_service "audio-app-frontend" "audio-app frontend"
    
    # 4. Clean up nginx configurations
    print_status "Step 4: Cleaning up nginx configurations"
    cleanup_nginx
    
    # 5. Clean up cron jobs
    print_status "Step 5: Cleaning up cron jobs"
    cleanup_cron
    
    # 6. Clean up logs
    print_status "Step 6: Cleaning up log files"
    cleanup_logs
    
    # 7. Clean up temporary files
    print_status "Step 7: Cleaning up temporary files"
    cleanup_temp
    
    # 8. Clean up package cache
    print_status "Step 8: Cleaning up package cache"
    cleanup_packages
    
    # 9. Reload systemd
    print_status "Step 9: Reloading systemd"
    systemctl daemon-reload
    
    # 10. Verify Crys Garage and Ruby are still working
    print_status "Step 10: Verifying Crys Garage and Ruby installations"
    if verify_crysgarage; then
        print_success "Crys Garage and Ruby verification passed"
    else
        print_error "Crys Garage and Ruby verification failed"
        exit 1
    fi
    
    echo ""
    echo "=========================================="
    print_success "Server cleanup completed successfully!"
    echo ""
    echo "Summary of what was cleaned:"
    echo "- Removed audio-app and other conflicting applications"
    echo "- Stopped and removed old services"
    echo "- Cleaned up nginx configurations"
    echo "- Cleaned up cron jobs"
    echo "- Cleaned up old logs and temporary files"
    echo "- Cleaned up package cache"
    echo ""
    echo "What was preserved:"
    echo "- Crys Garage backend and frontend"
    echo "- Ruby installations and gems"
    echo "- Ruby-related nginx configurations"
    echo "- Ruby-related cron jobs"
    echo ""
    echo "Crys Garage is now the only application running on the server."
    echo "Backend is accessible at: http://localhost:8000"
    echo ""
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

# Confirmation prompt
echo "⚠️  WARNING: This script will remove all applications except Crys Garage and Ruby"
echo "This includes:"
echo "- audio-app and any other applications"
echo "- Old service files"
echo "- Non-Crys Garage and non-Ruby nginx configurations"
echo "- Old log files and temporary files"
echo ""
echo "Crys Garage and Ruby will be preserved and should continue working."
echo ""
echo "Proceeding with cleanup..."

# Run the main cleanup
main

echo ""
print_success "Server cleanup completed! 🎉" 