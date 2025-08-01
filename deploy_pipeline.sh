#!/bin/bash

echo "🚀 Crys Garage Deployment Pipeline"
echo "=================================="

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Backup current state
echo "📦 Creating backup..."
cp -r crysgarage-frontend crysgarage-frontend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp -r crysgarage-backend crysgarage-backend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp -r crysgarage-ruby crysgarage-ruby.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Stop Docker containers
echo "🛑 Stopping Docker containers..."
docker-compose down

# Pull latest changes from Git
echo "📥 Pulling latest changes from Git..."
git pull origin master

# Rebuild and restart containers
echo "🔨 Rebuilding Docker containers..."
docker-compose build --no-cache

echo "🚀 Starting Docker containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 15

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test the application
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"

echo "✅ Deployment completed!"
echo "🌐 Your application: https://crysgarage.studio" 