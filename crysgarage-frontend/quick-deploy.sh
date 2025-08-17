#!/bin/bash

# Quick Deploy Script for Crys Garage Frontend
# Copy and paste this entire script to your VPS and run it

echo "🚀 Quick Deploy - Crys Garage Authentication System"
echo "=================================================="

# Configuration - Update these paths for your VPS
PROJECT_DIR="/var/www/crysgarage-frontend"
WEB_SERVER_DIR="/var/www/html"

# Navigate to project directory
echo "📁 Navigating to: $PROJECT_DIR"
cd $PROJECT_DIR

# Pull latest changes
echo "⬇️  Pulling latest changes..."
git pull origin master

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Deploy to web server
echo "🚀 Deploying to web server..."
cp -r dist/* $WEB_SERVER_DIR/

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 $WEB_SERVER_DIR
chown -R www-data:www-data $WEB_SERVER_DIR

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Visit: https://crysgarage.studio"
echo "🔐 Look for 'Sign In' and 'Get Started' buttons"
