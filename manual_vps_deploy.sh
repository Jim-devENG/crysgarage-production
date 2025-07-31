#!/bin/bash

echo "🚀 Manual VPS Deployment Script"
echo "==============================="
echo "Date: $(date)"
echo ""

# Navigate to project directory
cd /var/www/crysgarage-deploy

echo "📊 Current git status:"
git status

echo ""
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/master

echo ""
echo "🌐 Updating Frontend..."
cd crysgarage-frontend
npm install --production
systemctl restart crysgarage-frontend.service

echo ""
echo "🔧 Updating Backend..."
cd ../crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
systemctl restart crysgarage-backend.service

echo ""
echo "💎 Updating Ruby Service..."
cd ../crysgarage-ruby
bundle install
systemctl restart crysgarage-ruby.service

echo ""
echo "🌐 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "🏥 Checking service status..."
echo "Frontend: $(systemctl is-active crysgarage-frontend.service)"
echo "Backend: $(systemctl is-active crysgarage-backend.service)"
echo "Ruby: $(systemctl is-active crysgarage-ruby.service)"
echo "Nginx: $(systemctl is-active nginx)"

echo ""
echo "✅ Manual deployment completed!"
echo "🌐 Application available at: https://crysgarage.studio" 