#!/bin/bash

echo "🔧 Fixing Blank White Screen Issue"
echo "=================================="

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Update the frontend Dockerfile to build for production
echo "📝 Updating frontend Dockerfile for production build..."
cat > crysgarage-frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to serve the built files
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "5173", "--host", "0.0.0.0"]
EOF

# Update the vite config to handle routing properly
echo "📝 Updating Vite configuration..."
cat > crysgarage-frontend/vite.config.ts << 'EOF'
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
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
})
EOF

# Update Nginx configuration to handle SPA routing
echo "🌐 Updating Nginx configuration for SPA routing..."
cat > nginx-docker.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:5173;
    }

    upstream backend {
        server backend:8000;
    }

    upstream ruby-service {
        server ruby-service:4567;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    server {
        listen 80;
        server_name crysgarage.studio www.crysgarage.studio;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name crysgarage.studio www.crysgarage.studio;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/crysgarage.studio/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/crysgarage.studio/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend - SPA routing support
        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
            
            # Handle SPA routing - serve index.html for all routes
            try_files $uri $uri/ /index.html;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300;
        }

        # Ruby service
        location /ruby/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://ruby-service;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Rebuild frontend container
echo "🔨 Rebuilding frontend container..."
docker-compose build frontend

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 15

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test the application
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"

echo "✅ Blank screen fix completed!"
echo "🌐 Your application: https://crysgarage.studio" 