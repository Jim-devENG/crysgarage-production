#!/bin/bash

echo "🔧 Fixing Vite allowedHosts Configuration"
echo "========================================="

# Stop the frontend service
echo "🛑 Stopping frontend service..."
systemctl stop crysgarage-frontend

# Clear Vite cache
echo "🧹 Clearing Vite cache..."
cd /var/www/crysgarage-deploy/crysgarage-frontend
rm -rf node_modules/.vite
rm -rf .vite

# Verify the vite.config.ts has the correct allowedHosts
echo "📋 Checking Vite configuration..."
if grep -q "crysgarage.studio" vite.config.ts; then
    echo "✅ Vite config already has crysgarage.studio in allowedHosts"
else
    echo "❌ Vite config missing crysgarage.studio - updating..."
    # Backup original config
    cp vite.config.ts vite.config.ts.backup
    
    # Update the config to ensure allowedHosts includes crysgarage.studio
    cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['localhost', '127.0.0.1', 'crysgarage.studio', 'www.crysgarage.studio', '209.74.80.162'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
})
EOF
    echo "✅ Vite config updated"
fi

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies to ensure clean state
echo "📦 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Start the frontend service
echo "▶️ Starting frontend service..."
systemctl start crysgarage-frontend

# Wait for service to fully start
sleep 10

# Check service status
echo "📊 Checking service status..."
systemctl status crysgarage-frontend --no-pager -l

# Check if the service is running
if systemctl is-active --quiet crysgarage-frontend; then
    echo "✅ Frontend service started successfully!"
    
    # Test the frontend directly
    echo "🔍 Testing frontend directly..."
    sleep 5
    curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:5173/ 2>/dev/null || echo "Frontend test failed"
    
    # Test through Nginx
    echo "🔍 Testing through Nginx..."
    curl -s -o /dev/null -w "Nginx Status: %{http_code}\n" http://localhost/ 2>/dev/null || echo "Nginx test failed"
    
    # Check Vite logs for allowedHosts
    echo "📋 Checking Vite logs..."
    journalctl -u crysgarage-frontend --no-pager -l -n 10 | grep -i "allowed\|host" || echo "No host-related logs found"
    
else
    echo "❌ Frontend service failed to start!"
    echo "📋 Checking logs..."
    journalctl -u crysgarage-frontend --no-pager -l -n 20
fi

echo "🎯 Vite allowedHosts fix completed!" 