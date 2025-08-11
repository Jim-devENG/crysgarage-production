#!/bin/bash

echo "🔧 Fix 502 Bad Gateway - Permanent Solution"
echo "=========================================="
echo "Date: $(date)"
echo ""

# Stop all services first
echo "🛑 Stopping all services..."
systemctl stop crysgarage-frontend.service
systemctl stop crysgarage-backend.service
systemctl stop crysgarage-ruby.service
systemctl stop nginx

# Navigate to project directory
cd /var/www/crysgarage-deploy

echo ""
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/master

echo ""
echo "🔧 Fixing Frontend..."
cd crysgarage-frontend

# Clear npm cache and node_modules
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies
npm install --production

# Fix frontend service file
cat > /etc/systemd/system/crysgarage-frontend.service << 'EOF'
[Unit]
Description=Crys Garage Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-frontend
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "🔧 Fixing Backend..."
cd ../crysgarage-backend

# Clear composer cache
composer clear-cache

# Install dependencies
composer install --no-dev --optimize-autoloader

# Clear Laravel caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Regenerate caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix backend service file
cat > /etc/systemd/system/crysgarage-backend.service << 'EOF'
[Unit]
Description=Crys Garage Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-backend
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=10
Environment=APP_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "💎 Fixing Ruby Service..."
cd ../crysgarage-ruby

# Fix bundler version issue
gem install bundler:2.6.7

# Clear and reinstall gems
rm -rf vendor/
bundle install

# Fix Ruby service file
cat > /etc/systemd/system/crysgarage-ruby.service << 'EOF'
[Unit]
Description=Crys Garage Ruby Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-ruby
ExecStart=/usr/bin/ruby simple_ruby_service.rb
Restart=always
RestartSec=10
Environment=RUBY_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "🌐 Fixing Nginx Configuration..."
cat > /etc/nginx/conf.d/crysgarage.studio.conf << 'EOF'
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Ruby Service
    location /ruby/ {
        proxy_pass http://127.0.0.1:4567/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

echo ""
echo "🔄 Reloading systemd and starting services..."
systemctl daemon-reload

# Enable services to start on boot
systemctl enable crysgarage-frontend.service
systemctl enable crysgarage-backend.service
systemctl enable crysgarage-ruby.service
systemctl enable nginx

# Start services in order
echo "Starting Backend..."
systemctl start crysgarage-backend.service
sleep 5

echo "Starting Ruby Service..."
systemctl start crysgarage-ruby.service
sleep 5

echo "Starting Frontend..."
systemctl start crysgarage-frontend.service
sleep 10

echo "Starting Nginx..."
systemctl start nginx

echo ""
echo "🏥 Checking service status..."
echo "Backend: $(systemctl is-active crysgarage-backend.service)"
echo "Ruby: $(systemctl is-active crysgarage-ruby.service)"
echo "Frontend: $(systemctl is-active crysgarage-frontend.service)"
echo "Nginx: $(systemctl is-active nginx)"

echo ""
echo "📊 Checking ports..."
netstat -tlnp | grep -E ':(5173|8000|4567|80|443)'

echo ""
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:5173

echo ""
echo "✅ Permanent fix completed!"
echo "🌐 Application available at: https://crysgarage.studio"
echo ""
echo "💡 If you still see issues, check logs with:"
echo "   journalctl -u crysgarage-frontend.service -f"
echo "   journalctl -u crysgarage-backend.service -f"
echo "   journalctl -u crysgarage-ruby.service -f" 