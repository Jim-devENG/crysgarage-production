#!/bin/bash

echo "Complete VPS Setup for Crys Garage"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
yum update -y

# Install Docker
echo "🐳 Installing Docker..."
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Git
echo "📚 Installing Git..."
yum install -y git

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p /var/www/crysgarage-deploy
cd /var/www/crysgarage-deploy

# Clone repository (you'll need to replace with your actual repository URL)
echo "Cloning repository..."
# git clone https://github.com/your-username/crysgarage.git .

# Create Dockerfiles if they don't exist
echo "🔧 Creating Dockerfiles..."

# Frontend Dockerfile
cat > crysgarage-frontend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
EOF

# Backend Dockerfile
cat > crysgarage-backend/Dockerfile << 'EOF'
FROM php:8.2-fpm
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY composer*.json ./
RUN composer install --no-dev --optimize-autoloader
COPY . .
RUN chown -R www-data:www-data /var/www
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
EOF

# Ruby Dockerfile
cat > crysgarage-ruby/Dockerfile << 'EOF'
FROM ruby:3.2-slim
RUN apt-get update && apt-get install -y build-essential \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
EXPOSE 4567
CMD ["ruby", "simple_web_processor.rb", "-o", "0.0.0.0", "-p", "4567"]
EOF

# Nginx configuration
cat > nginx-docker.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend { server frontend:5173; }
    upstream backend { server backend:8000; }
    upstream ruby-service { server ruby-service:4567; }
    
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    server {
        listen 80;
        server_name crysgarage.studio www.crysgarage.studio;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name crysgarage.studio www.crysgarage.studio;
        
        ssl_certificate /etc/letsencrypt/live/crysgarage.studio/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/crysgarage.studio/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        location / {
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
            try_files $uri $uri/ /index.html;
        }
        
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        location /ruby/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://ruby-service;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/crysgarage-deploy
git pull origin master
docker-compose down
docker-compose build
docker-compose up -d
echo "Deployment completed at $(date)"
EOF

chmod +x deploy.sh

echo "✅ VPS setup completed!"
echo "Application should be available at: https://crysgarage.studio"
echo "To deploy updates, run: ./deploy.sh" 