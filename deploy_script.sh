#!/bin/bash
set -e
echo "🚀 Starting local deployment..."

# Navigate to project directory
cd /root/crysgarage-deploy
echo "📁 Current directory: $(pwd)"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Frontend: Copy built files
echo "🌐 Deploying frontend..."
if [ -d "crysgarage-frontend/dist" ]; then
    echo "📁 Copying built files to web root..."
    rm -rf /var/www/html/*
    cp -r crysgarage-frontend/dist/* /var/www/html/
    
    # Fix permissions
    echo "🔐 Setting permissions..."
    chown -R nginx:nginx /var/www/html/
    chmod -R 755 /var/www/html/
    restorecon -Rv /var/www/html/
    
    echo "✅ Frontend deployed successfully!"
else
    echo "❌ Frontend dist directory not found"
    exit 1
fi

# Backend: Update and restart
echo "🔧 Updating backend..."
cd crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
systemctl restart crysgarage-backend
echo "✅ Backend updated successfully!"

# Ruby service: Update and restart
echo "💎 Updating Ruby service..."
cd ../crysgarage-ruby
gem install bundler:2.6.7 || echo "Bundler version issue - continuing..."
bundle install
systemctl restart crysgarage-ruby
echo "✅ Ruby service updated successfully!"

# Reload Nginx
echo "🌐 Reloading Nginx..."
nginx -t && systemctl reload nginx

# Health check
echo "🏥 Running health check..."
sleep 5
if curl -f -s https://crysgarage.studio > /dev/null; then
    echo "✅ Deployment successful!"
    echo "🌐 Site is live at: https://crysgarage.studio"
else
    echo "⚠️ Health check failed, but deployment may have succeeded"
fi

echo "🎉 Local deployment completed!"
