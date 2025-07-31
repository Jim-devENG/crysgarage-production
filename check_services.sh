#!/bin/bash

# Crys Garage Service Health Check
# This script checks if all services are running properly

echo "🔍 Crys Garage Service Health Check"
echo "=================================="

# Check if services are running
echo "📊 Checking systemd services..."

FRONTEND_STATUS=$(systemctl is-active crysgarage-frontend.service)
BACKEND_STATUS=$(systemctl is-active crysgarage-backend.service)
RUBY_STATUS=$(systemctl is-active crysgarage-ruby.service)

echo "Frontend (React): $FRONTEND_STATUS"
echo "Backend (Laravel): $BACKEND_STATUS"
echo "Ruby Service: $RUBY_STATUS"

# Check if ports are listening
echo ""
echo "🔌 Checking if ports are listening..."

PORT_5173=$(netstat -tlnp | grep ":5173" | wc -l)
PORT_8000=$(netstat -tlnp | grep ":8000" | wc -l)
PORT_4567=$(netstat -tlnp | grep ":4567" | wc -l)

echo "Port 5173 (Frontend): $([ $PORT_5173 -gt 0 ] && echo "✅ LISTENING" || echo "❌ NOT LISTENING")"
echo "Port 8000 (Backend): $([ $PORT_8000 -gt 0 ] && echo "✅ LISTENING" || echo "❌ NOT LISTENING")"
echo "Port 4567 (Ruby): $([ $PORT_4567 -gt 0 ] && echo "✅ LISTENING" || echo "❌ NOT LISTENING")"

# Check Nginx status
echo ""
echo "🌐 Checking Nginx status..."
NGINX_STATUS=$(systemctl is-active nginx)
echo "Nginx: $NGINX_STATUS"

# Overall health check
echo ""
echo "🏥 Overall Health Status:"

if [ "$FRONTEND_STATUS" = "active" ] && [ "$BACKEND_STATUS" = "active" ] && [ "$RUBY_STATUS" = "active" ] && [ "$NGINX_STATUS" = "active" ] && [ $PORT_5173 -gt 0 ] && [ $PORT_8000 -gt 0 ] && [ $PORT_4567 -gt 0 ]; then
    echo "✅ ALL SERVICES HEALTHY - Your website should be working!"
    echo "🌐 Visit: https://crysgarage.studio"
else
    echo "❌ SOME SERVICES ARE DOWN - Running repair..."
    
    # Auto-repair
    echo "🔧 Attempting to restart failed services..."
    
    if [ "$FRONTEND_STATUS" != "active" ]; then
        echo "Restarting frontend..."
        systemctl restart crysgarage-frontend.service
    fi
    
    if [ "$BACKEND_STATUS" != "active" ]; then
        echo "Restarting backend..."
        systemctl restart crysgarage-backend.service
    fi
    
    if [ "$RUBY_STATUS" != "active" ]; then
        echo "Restarting ruby service..."
        systemctl restart crysgarage-ruby.service
    fi
    
    if [ "$NGINX_STATUS" != "active" ]; then
        echo "Restarting nginx..."
        systemctl restart nginx
    fi
    
    echo "🔄 Services restarted. Check again in 10 seconds..."
fi

echo ""
echo "📋 Manual Commands:"
echo "  systemctl status crysgarage-frontend.service"
echo "  systemctl status crysgarage-backend.service"
echo "  systemctl status crysgarage-ruby.service"
echo "  systemctl status nginx" 