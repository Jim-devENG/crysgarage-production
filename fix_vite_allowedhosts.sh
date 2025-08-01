#!/bin/bash

echo "🔧 Fixing Vite allowedHosts Configuration"
echo "========================================="

# Navigate to the frontend directory
cd /var/www/crysgarage-deploy/crysgarage-frontend

echo "📝 Updating Vite configuration..."

# Create a backup of the current config
cp vite.config.ts vite.config.ts.backup

# Update the TypeScript config with more comprehensive allowedHosts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'crysgarage.studio',
      'www.crysgarage.studio',
      '209.74.80.162',
      '*.crysgarage.studio'
    ],
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

# Also create a JavaScript version
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'crysgarage.studio',
      'www.crysgarage.studio',
      '209.74.80.162',
      '*.crysgarage.studio'
    ],
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

echo "✅ Vite configuration updated"

# Stop the frontend service
echo "🛑 Stopping frontend service..."
systemctl stop crysgarage-frontend

# Wait a moment
sleep 3

# Clear any cached files
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf .vite 2>/dev/null || true

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
    echo "✅ Frontend service restarted successfully!"
    
    # Wait a bit more for Vite to fully initialize
    sleep 5
    
    # Test the frontend directly
    echo "🔍 Testing frontend directly..."
    curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:5173/ 2>/dev/null || echo "Frontend test failed"
    
    # Test through Nginx
    echo "🔍 Testing through Nginx..."
    curl -s -o /dev/null -w "Nginx Status: %{http_code}\n" http://localhost/ 2>/dev/null || echo "Nginx test failed"
    
    # Test with the domain
    echo "🔍 Testing with domain..."
    curl -s -o /dev/null -w "Domain Status: %{http_code}\n" http://crysgarage.studio/ 2>/dev/null || echo "Domain test failed"
    
else
    echo "❌ Frontend service failed to start!"
    echo "📋 Checking logs..."
    journalctl -u crysgarage-frontend --no-pager -l -n 20
fi

echo "🎯 Vite allowedHosts fix completed!" 