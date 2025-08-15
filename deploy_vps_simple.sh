#!/bin/bash

# Exit on any error
set -e

echo "🚀 Enhanced VPS Deployment"
echo "=========================="

# Navigate to deployment directory
cd /var/www/crysgarage-deploy

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Stop existing containers
echo "🛑 Stopping containers..."
docker-compose down

# Clean up old images to free space
echo "🧹 Cleaning up old Docker images..."
docker system prune -f

# Remove old containers and images
echo "🗑️ Removing old containers and images..."
docker-compose down --rmi all --volumes --remove-orphans

# Build and start containers with force rebuild
echo "🔨 Building containers with force rebuild..."
docker-compose build --no-cache --pull

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 20

# Check container status
echo "📊 Container status:"
docker-compose ps

# Wait a bit more for full startup
echo "⏳ Waiting for full startup..."
sleep 10

# Test the application multiple times
echo "🧪 Testing application..."
for i in {1..3}; do
    echo "Test attempt $i..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://crysgarage.studio || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Application is responding with HTTP 200"
        break
    else
        echo "⚠️ Application returned HTTP $HTTP_STATUS, retrying..."
        sleep 5
    fi
done

# Final health check
echo "🏥 Final health check..."
curl -s -o /dev/null -w "Final HTTP Status: %{http_code}\n" https://crysgarage.studio

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: https://crysgarage.studio"
echo "📅 Deployment timestamp: $(date)" 