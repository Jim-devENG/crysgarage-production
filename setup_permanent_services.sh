#!/bin/bash

# Crys Garage Permanent Services Setup
# This script creates systemd services for automatic startup and restart

echo "🚀 Setting up permanent services for Crys Garage..."

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node"
pkill -f "php"
pkill -f "ruby"

# Copy service files to systemd directory
echo "📁 Installing systemd services..."
cp crysgarage-frontend.service /etc/systemd/system/
cp crysgarage-backend.service /etc/systemd/system/
cp crysgarage-ruby.service /etc/systemd/system/

# Reload systemd
echo "🔄 Reloading systemd..."
systemctl daemon-reload

# Enable services to start on boot
echo "✅ Enabling services to start on boot..."
systemctl enable crysgarage-frontend.service
systemctl enable crysgarage-backend.service
systemctl enable crysgarage-ruby.service

# Start services
echo "🚀 Starting services..."
systemctl start crysgarage-frontend.service
systemctl start crysgarage-backend.service
systemctl start crysgarage-ruby.service

# Check service status
echo "📊 Checking service status..."
echo "Frontend Status:"
systemctl status crysgarage-frontend.service --no-pager -l

echo "Backend Status:"
systemctl status crysgarage-backend.service --no-pager -l

echo "Ruby Service Status:"
systemctl status crysgarage-ruby.service --no-pager -l

# Check if ports are listening
echo "🔍 Checking if ports are listening..."
netstat -tlnp | grep -E "(5173|8000|4567)"

echo "✅ Permanent services setup complete!"
echo "🎯 Your services will now:"
echo "   - Start automatically on server reboot"
echo "   - Restart automatically if they crash"
echo "   - Be managed by systemd"

echo "📋 Useful commands:"
echo "   systemctl status crysgarage-frontend.service"
echo "   systemctl status crysgarage-backend.service"
echo "   systemctl status crysgarage-ruby.service"
echo "   systemctl restart crysgarage-frontend.service"
echo "   systemctl restart crysgarage-backend.service"
echo "   systemctl restart crysgarage-ruby.service" 