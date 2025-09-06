#!/bin/bash
# VPS Auto-Deploy Setup Script
# Run this once on your VPS to set up automated deployment

set -e

echo "Setting up automated deployment on VPS..."

# Create deployment directory
mkdir -p /var/www/crysgarage-deploy
cd /var/www/crysgarage-deploy

# Clone repository if not exists
if [ ! -d ".git" ]; then
    git clone https://github.com/Jim-devENG/crysgarage-production.git .
fi

# Create webhook script
cat > /var/www/auto-deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/crysgarage-deploy
git pull origin main

# Build frontend
cd crysgarage-frontend
npm run build
cd ..

# Deploy frontend
rm -rf /var/www/html/*
cp -r crysgarage-frontend/dist/* /var/www/html/

# Deploy backend
cd crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Restart services
systemctl restart php8.2-fpm
systemctl reload nginx

echo "Auto-deployment completed at $(date)"
EOF

chmod +x /var/www/auto-deploy.sh

# Set up cron job for auto-deployment every 5 minutes
echo "*/5 * * * * /var/www/auto-deploy.sh >> /var/log/auto-deploy.log 2>&1" | crontab -

echo "Automated deployment setup completed!"
echo "Repository will auto-update every 5 minutes"
echo "Manual trigger: /var/www/auto-deploy.sh"
