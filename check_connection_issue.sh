#!/bin/bash

echo "🔍 Diagnosing Connection Refused Issue"
echo "====================================="

echo ""
echo "📊 Checking all service statuses..."
echo "Frontend: $(systemctl is-active crysgarage-frontend.service)"
echo "Backend: $(systemctl is-active crysgarage-backend.service)"
echo "Ruby: $(systemctl is-active crysgarage-ruby.service)"
echo "Nginx: $(systemctl is-active nginx)"

echo ""
echo "🌐 Checking listening ports..."
netstat -tlnp | grep -E ':(80|443|5173|8000|4567)'

echo ""
echo "🔧 Testing local connectivity..."
echo "Frontend (localhost:5173): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo 'FAILED')"
echo "Backend (localhost:8000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null || echo 'FAILED')"
echo "Ruby (localhost:4567): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4567 2>/dev/null || echo 'FAILED')"

echo ""
echo "🌐 Checking Nginx configuration..."
nginx -t

echo ""
echo "📋 Nginx error logs (last 10 lines):"
tail -10 /var/log/nginx/error.log

echo ""
echo "📋 Nginx access logs (last 5 lines):"
tail -5 /var/log/nginx/access.log

echo ""
echo "🔧 Checking firewall status..."
systemctl status firewalld

echo ""
echo "🌐 Testing external connectivity..."
curl -s -o /dev/null -w "External test: %{http_code}\n" https://crysgarage.studio 2>/dev/null || echo "External test: FAILED"

echo ""
echo "✅ Diagnosis completed!" 