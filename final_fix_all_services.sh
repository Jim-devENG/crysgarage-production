#!/bin/bash

echo "🔧 Final Fix - All Services"
echo "=========================="
echo "Date: $(date)"
echo ""

# Stop all services
echo "🛑 Stopping all services..."
systemctl stop crysgarage-frontend.service
systemctl stop crysgarage-backend.service
systemctl stop crysgarage-ruby.service

cd /var/www/crysgarage-deploy

echo ""
echo "🔧 Fixing Frontend Service..."
cd crysgarage-frontend

# Find npm path
NPM_PATH=$(which npm)
echo "NPM path: $NPM_PATH"

# Fix frontend service file with correct npm path
cat > /etc/systemd/system/crysgarage-frontend.service << EOF
[Unit]
Description=Crys Garage Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-frontend
ExecStart=$NPM_PATH run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin:/usr/sbin

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "🔧 Fixing Backend Service..."
cd ../crysgarage-backend

# Find php path
PHP_PATH=$(which php)
echo "PHP path: $PHP_PATH"

# Fix backend service file with correct php path
cat > /etc/systemd/system/crysgarage-backend.service << EOF
[Unit]
Description=Crys Garage Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-backend
ExecStart=$PHP_PATH artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=10
Environment=APP_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin:/usr/sbin

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "💎 Fixing Ruby Service..."
cd ../crysgarage-ruby

# Find ruby path
RUBY_PATH=$(which ruby)
echo "Ruby path: $RUBY_PATH"

# Fix Ruby service file with correct ruby path
cat > /etc/systemd/system/crysgarage-ruby.service << EOF
[Unit]
Description=Crys Garage Ruby Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/crysgarage-deploy/crysgarage-ruby
ExecStart=$RUBY_PATH simple_ruby_service.rb
Restart=always
RestartSec=10
Environment=RUBY_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin:/usr/sbin

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "🔄 Reloading systemd..."
systemctl daemon-reload

echo ""
echo "🚀 Starting services in order..."

echo "Starting Backend..."
systemctl start crysgarage-backend.service
sleep 5

echo "Starting Ruby Service..."
systemctl start crysgarage-ruby.service
sleep 5

echo "Starting Frontend..."
systemctl start crysgarage-frontend.service
sleep 10

echo ""
echo "🏥 Final service status check..."
echo "Backend: $(systemctl is-active crysgarage-backend.service)"
echo "Ruby: $(systemctl is-active crysgarage-ruby.service)"
echo "Frontend: $(systemctl is-active crysgarage-frontend.service)"
echo "Nginx: $(systemctl is-active nginx)"

echo ""
echo "📊 Checking ports..."
netstat -tlnp | grep -E ':(5173|8000|4567|80|443)'

echo ""
echo "🔍 Testing application endpoints..."
echo "Backend API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health 2>/dev/null || echo 'FAILED')"
echo "Ruby Service: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4567/health 2>/dev/null || echo 'FAILED')"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo 'FAILED')"

echo ""
echo "✅ Final fix completed!"
echo "🌐 Application available at: https://crysgarage.studio"

# Show recent logs for any failed services
echo ""
echo "📋 Recent logs for troubleshooting:"
if [ "$(systemctl is-active crysgarage-frontend.service)" != "active" ]; then
    echo "Frontend logs:"
    journalctl -u crysgarage-frontend.service -n 5
fi

if [ "$(systemctl is-active crysgarage-ruby.service)" != "active" ]; then
    echo "Ruby service logs:"
    journalctl -u crysgarage-ruby.service -n 5
fi 