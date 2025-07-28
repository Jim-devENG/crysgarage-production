#!/bin/bash

# Setup GitHub-based deployment for Crys Garage
# This script sets up the VPS to pull from GitHub instead of manual uploads

echo "Setting up GitHub-based deployment..."

# Create deployment directory
mkdir -p /var/www/crysgarage-deploy

# Install git if not already installed
if ! command -v git &> /dev/null; then
    echo "Installing git..."
    apt update && apt install -y git
fi

# Clone the repository (replace with your actual GitHub repo URL)
echo "Cloning repository..."
cd /var/www/crysgarage-deploy
git clone https://github.com/Jim-devENG/crys-garage.git .

# Set up deployment script
cat > /var/www/crysgarage-deploy/deploy.sh << 'EOF'
#!/bin/bash

echo "Starting deployment from GitHub..."

# Pull latest changes
cd /var/www/crysgarage-deploy
git pull origin master

# Deploy backend
echo "Deploying backend..."
cp -r crysgarage-backend/* /var/www/crysgarage/crysgarage-backend/
cd /var/www/crysgarage/crysgarage-backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Restart backend service
systemctl restart crysgarage-backend

# Deploy frontend
echo "Deploying frontend..."
cd /var/www/crysgarage-deploy/crysgarage-frontend

# Install dependencies
npm install

# Build frontend
npm run build

# Copy built files
cp -r dist/* /var/www/crysgarage/crysgarage-frontend/dist/

# Set proper permissions
chown -R nginx:nginx /var/www/crysgarage/crysgarage-frontend/dist/
chmod -R 755 /var/www/crysgarage/crysgarage-frontend/dist/

# Reload nginx
nginx -s reload

echo "Deployment completed successfully!"
EOF

# Make deployment script executable
chmod +x /var/www/crysgarage-deploy/deploy.sh

# Create a simple update script
cat > /var/www/crysgarage-deploy/update.sh << 'EOF'
#!/bin/bash
cd /var/www/crysgarage-deploy
git pull origin master
./deploy.sh
EOF

chmod +x /var/www/crysgarage-deploy/update.sh

echo "GitHub deployment setup complete!"
echo ""
echo "To deploy updates:"
echo "1. Push changes to GitHub: git push origin master"
echo "2. Run on VPS: /var/www/crysgarage-deploy/update.sh"
echo ""
echo "Or set up automatic deployment with webhooks!" 