#!/bin/bash

echo "🐳 Deploying Crys Garage with Docker"
echo "===================================="

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Create Dockerfile for frontend
echo "📝 Creating Dockerfile for frontend..."
cat > crysgarage-frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
EOF

# Create Dockerfile for backend
echo "📝 Creating Dockerfile for backend..."
cat > crysgarage-backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create Dockerfile for Ruby service
echo "📝 Creating Dockerfile for Ruby service..."
cat > crysgarage-ruby/Dockerfile << 'EOF'
FROM ruby:3.2-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Gemfile first for better caching
COPY Gemfile* ./
RUN bundle install

# Copy source code
COPY . .

# Expose port
EXPOSE 4567

# Start the application
CMD ["ruby", "app.rb", "-o", "0.0.0.0", "-p", "4567"]
EOF

# Create Docker Compose file
echo "📝 Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build: ./crysgarage-frontend
    container_name: crysgarage-frontend
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
    volumes:
      - ./crysgarage-frontend:/app
      - /app/node_modules
    networks:
      - crysgarage-network
    restart: unless-stopped
    depends_on:
      - backend

  backend:
    build: ./crysgarage-backend
    container_name: crysgarage-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./crysgarage.db
    volumes:
      - ./crysgarage-backend:/app
    networks:
      - crysgarage-network
    restart: unless-stopped

  ruby-service:
    build: ./crysgarage-ruby
    container_name: crysgarage-ruby
    ports:
      - "4567:4567"
    volumes:
      - ./crysgarage-ruby:/app
    networks:
      - crysgarage-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: crysgarage-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-docker.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - crysgarage-network
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
      - ruby-service

networks:
  crysgarage-network:
    driver: bridge
EOF

# Create Nginx configuration for Docker
echo "🌐 Creating Nginx configuration for Docker..."
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

        # Frontend
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

# Stop existing systemd services
echo "🛑 Stopping existing systemd services..."
systemctl stop crysgarage-frontend 2>/dev/null || true
systemctl stop crysgarage-backend 2>/dev/null || true
systemctl stop crysgarage-ruby 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

# Disable systemd services
echo "🔧 Disabling systemd services..."
systemctl disable crysgarage-frontend 2>/dev/null || true
systemctl disable crysgarage-backend 2>/dev/null || true
systemctl disable crysgarage-ruby 2>/dev/null || true

# Build and start Docker containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚀 Starting Docker containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 10

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test the application
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"

echo "✅ Docker deployment completed!"
echo "🌐 Your application: https://crysgarage.studio"
echo "🐳 Running in Docker containers" 