#!/bin/bash

echo "🚀 Crys Garage VPS Deployment Script"
echo "====================================="

# Set working directory
cd /var/www/crysgarage-deploy

echo "📥 Pulling latest changes from GitHub..."
git pull origin master

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull from GitHub"
    exit 1
fi

echo "✅ Successfully pulled latest changes"

# Update frontend dependencies and restart
echo "🌐 Updating Frontend..."
cd crysgarage-frontend
npm install
systemctl restart crysgarage-frontend.service

# Update backend dependencies and restart
echo "🔧 Updating Backend..."
cd ../crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
systemctl restart crysgarage-backend.service

# Update Ruby service
echo "💎 Updating Ruby Service..."
cd ../crysgarage-ruby
bundle install
systemctl restart crysgarage-ruby.service

# Reload Nginx configuration
echo "🌐 Reloading Nginx..."
systemctl reload nginx

# Health check
echo "🏥 Running health check..."
sleep 5
bash check_health.sh

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at: https://crysgarage.studio" 