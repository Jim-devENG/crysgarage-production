#!/bin/bash

# Crys Garage Frontend Deployment Script
# Run this on your VPS to deploy the authentication system

echo "🚀 Starting Crys Garage Frontend Deployment..."
echo "=============================================="

# Configuration - Update these paths for your VPS
PROJECT_DIR="/var/www/crysgarage-frontend"  # Update this path
WEB_SERVER_DIR="/var/www/html"              # Update this path
BACKUP_DIR="/var/www/backups"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Navigate to project directory
echo "📁 Navigating to project directory: $PROJECT_DIR"
cd $PROJECT_DIR

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory not found: $PROJECT_DIR"
    echo "Please update PROJECT_DIR in this script"
    exit 1
fi

# Check git status
echo "🔍 Checking git status..."
git status

# Pull latest changes
echo "⬇️  Pulling latest changes from repository..."
git pull origin master

# Check if pull was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull from repository"
    exit 1
fi

# Check latest commit
echo "📝 Latest commit:"
git log --oneline -1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

# Create backup of current web files
echo "💾 Creating backup of current web files..."
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
cp -r $WEB_SERVER_DIR $BACKUP_DIR/$BACKUP_NAME

# Deploy to web server
echo "🚀 Deploying to web server: $WEB_SERVER_DIR"
cp -r dist/* $WEB_SERVER_DIR/

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod -R 755 $WEB_SERVER_DIR
chown -R www-data:www-data $WEB_SERVER_DIR

# Verify deployment
echo "✅ Verifying deployment..."
if [ -f "$WEB_SERVER_DIR/index.html" ]; then
    echo "✅ index.html deployed successfully"
else
    echo "❌ Error: index.html not found in web server directory"
    exit 1
fi

if [ -d "$WEB_SERVER_DIR/assets" ]; then
    echo "✅ Assets directory deployed successfully"
else
    echo "❌ Error: Assets directory not found in web server directory"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "====================================="
echo "🌐 Your site should now be live at: https://crysgarage.studio"
echo "🔐 Authentication system is now active"
echo "📱 Look for 'Sign In' and 'Get Started' buttons in the header"
echo ""
echo "📋 What's been deployed:"
echo "   ✅ Complete authentication system"
echo "   ✅ Sign In/Sign Up forms"
echo "   ✅ Tier-based access control"
echo "   ✅ Live server API integration"
echo "   ✅ Protected routes"
echo ""
echo "🔧 If you need to rollback, backup is available at: $BACKUP_DIR/$BACKUP_NAME"
