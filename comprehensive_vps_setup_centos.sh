#!/bin/bash

echo "🚀 Comprehensive VPS Setup for Crys Garage (CentOS/RHEL)"
echo "========================================================"

# Update system
echo "📦 Updating system packages..."
yum update -y

# Install essential packages
echo "📦 Installing essential packages..."
yum install -y curl wget git unzip yum-utils device-mapper-persistent-data lvm2

# Install Docker
echo "🐳 Installing Docker..."
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install EPEL repository for additional packages
echo "📦 Installing EPEL repository..."
yum install -y epel-release

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL certificates..."
yum install -y certbot python3-certbot-nginx

# Install monitoring tools
echo "📊 Installing monitoring tools..."
yum install -y htop iotop nethogs fail2ban

# Configure fail2ban
echo "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create Docker network
echo "🌐 Creating Docker network..."
docker network create crysgarage-network 2>/dev/null || true

# Create Docker Compose file for the application
echo "📝 Creating Docker Compose configuration..."
cat > /var/www/crysgarage-deploy/docker-compose.yml << 'EOF'
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
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
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
    external: true
EOF

# Create optimized Nginx configuration
echo "🌐 Creating optimized Nginx configuration..."
cat > /var/www/crysgarage-deploy/nginx.conf << 'EOF'
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

# Create Dockerfile for frontend
echo "📝 Creating Dockerfile for frontend..."
cat > /var/www/crysgarage-deploy/crysgarage-frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
EOF

# Create Dockerfile for backend
echo "📝 Creating Dockerfile for backend..."
cat > /var/www/crysgarage-deploy/crysgarage-backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create Dockerfile for Ruby service
echo "📝 Creating Dockerfile for Ruby service..."
cat > /var/www/crysgarage-deploy/crysgarage-ruby/Dockerfile << 'EOF'
FROM ruby:3.2-slim

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 4567

CMD ["ruby", "app.rb", "-o", "0.0.0.0", "-p", "4567"]
EOF

# Create systemd service for Docker Compose
echo "🔧 Creating systemd service for Docker Compose..."
cat > /etc/systemd/system/crysgarage-docker.service << 'EOF'
[Unit]
Description=Crys Garage Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/crysgarage-deploy
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > /var/www/crysgarage-deploy/monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/crysgarage-monitor.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    log "Docker is not running. Starting Docker..."
    systemctl start docker
fi

# Check if containers are running
cd /var/www/crysgarage-deploy

if ! docker-compose ps | grep -q "Up"; then
    log "Containers are not running. Restarting..."
    docker-compose down
    docker-compose up -d
fi

# Check individual services
services=("frontend" "backend" "ruby-service" "nginx")
for service in "${services[@]}"; do
    if ! docker-compose ps | grep -q "$service.*Up"; then
        log "Service $service is down. Restarting..."
        docker-compose restart $service
    fi
done

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    log "WARNING: Memory usage is ${MEM_USAGE}%"
fi
EOF

chmod +x /var/www/crysgarage-deploy/monitor.sh

# Create systemd timer for monitoring
echo "⏰ Creating monitoring timer..."
cat > /etc/systemd/system/crysgarage-monitor.timer << 'EOF'
[Unit]
Description=Run Crys Garage monitoring every 5 minutes
Requires=crysgarage-docker.service

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Unit=crysgarage-monitor.service

[Install]
WantedBy=timers.target
EOF

cat > /etc/systemd/system/crysgarage-monitor.service << 'EOF'
[Unit]
Description=Crys Garage monitoring script
After=crysgarage-docker.service

[Service]
Type=oneshot
ExecStart=/var/www/crysgarage-deploy/monitor.sh
EOF

# Enable and start services
echo "🚀 Enabling and starting services..."
systemctl daemon-reload
systemctl enable crysgarage-docker
systemctl enable crysgarage-monitor.timer
systemctl start crysgarage-monitor.timer

# Get SSL certificate
echo "🔒 Obtaining SSL certificate..."
certbot certonly --standalone -d crysgarage.studio -d www.crysgarage.studio --non-interactive --agree-tos --email admin@crysgarage.studio --expand

# Start Docker Compose
echo "🐳 Starting Docker Compose..."
cd /var/www/crysgarage-deploy
docker-compose up -d

# Create backup script
echo "💾 Creating backup script..."
cat > /var/www/crysgarage-deploy/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/crysgarage"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www/crysgarage-deploy .

# Backup SSL certificates
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz -C /etc letsencrypt

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /var/www/crysgarage-deploy/backup.sh

# Add backup to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/crysgarage-deploy/backup.sh") | crontab -

echo "✅ Comprehensive VPS setup completed!"
echo "🌐 Your application: https://crysgarage.studio"
echo "📊 Monitoring: Active (checks every 5 minutes)"
echo "💾 Backups: Daily at 2 AM"
echo "🔒 SSL: Let's Encrypt certificate installed"
echo "🐳 Docker: All services containerized" 