#!/bin/bash

echo "🌐 Final Frontend Fix"
echo "===================="

cd /var/www/crysgarage-deploy/crysgarage-frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Check npm and node versions
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Clear npm cache and reinstall
echo "🧹 Clearing npm cache..."
npm cache clean --force

echo "📦 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Check if the dev script exists
if grep -q '"dev"' package.json; then
    echo "✅ Dev script found in package.json"
else
    echo "❌ Dev script not found in package.json"
    echo "Adding dev script..."
    # Add dev script if it doesn't exist
    sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/' package.json
fi

# Create a simple frontend service that uses npm directly
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
Environment=PATH=/usr/bin:/usr/local/bin:/usr/sbin

[Install]
WantedBy=multi-user.target
EOF

# Reload and restart
systemctl daemon-reload
systemctl restart crysgarage-frontend.service

echo "✅ Frontend service fixed!"
echo "Status: $(systemctl is-active crysgarage-frontend.service)"

# Wait a moment and test
sleep 5
echo "🔍 Testing frontend..."
curl -s -o /dev/null -w "Frontend HTTP Status: %{http_code}\n" http://localhost:5173 2>/dev/null || echo "Frontend not responding yet" 