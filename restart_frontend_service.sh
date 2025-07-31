#!/bin/bash

echo "🔄 Restarting Frontend Service"
echo "=============================="

# Stop the frontend service
echo "🛑 Stopping frontend service..."
systemctl stop crysgarage-frontend

# Wait a moment
sleep 2

# Start the frontend service
echo "▶️ Starting frontend service..."
systemctl start crysgarage-frontend

# Wait for service to fully start
sleep 5

# Check service status
echo "📊 Checking service status..."
systemctl status crysgarage-frontend --no-pager -l

# Check if the service is running
if systemctl is-active --quiet crysgarage-frontend; then
    echo "✅ Frontend service restarted successfully!"
    
    # Test the frontend directly
    echo "🔍 Testing frontend directly..."
    sleep 3
    curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:5173/ 2>/dev/null || echo "Frontend test failed"
    
    # Test through Nginx
    echo "🔍 Testing through Nginx..."
    curl -s -o /dev/null -w "Nginx Status: %{http_code}\n" http://localhost/ 2>/dev/null || echo "Nginx test failed"
    
else
    echo "❌ Frontend service failed to start!"
    echo "📋 Checking logs..."
    journalctl -u crysgarage-frontend --no-pager -l -n 20
fi 