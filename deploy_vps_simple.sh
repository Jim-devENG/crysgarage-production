#!/bin/bash

echo "🚀 Simple VPS Deployment"
echo "========================"

# Navigate to deployment directory
cd /var/www/crysgarage-deploy

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Stop existing containers
echo "🛑 Stopping containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check container status
echo "📊 Container status:"
docker-compose ps

# Test the application
echo "🧪 Testing application..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://crysgarage.studio/health

echo "✅ Deployment completed!"
echo "🌐 Application URL: https://crysgarage.studio" 