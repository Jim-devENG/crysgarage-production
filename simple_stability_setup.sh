#!/bin/bash

echo "🚀 Simple Stability Setup for Crys Garage"
echo "========================================="

# Update system
echo "📦 Updating system packages..."
yum update -y

# Install essential packages
echo "📦 Installing essential packages..."
yum install -y curl wget git unzip epel-release

# Install monitoring tools
echo "📊 Installing monitoring tools..."
yum install -y htop iotop nethogs fail2ban

# Configure fail2ban
echo "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL certificates..."
yum install -y certbot python3-certbot-nginx

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > /var/www/crysgarage-deploy/monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/crysgarage-monitor.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check if services are running
services=("crysgarage-frontend" "crysgarage-backend" "crysgarage-ruby" "nginx")
for service in "${services[@]}"; do
    if ! systemctl is-active --quiet $service; then
        log "Service $service is down. Restarting..."
        systemctl restart $service
        sleep 5
    fi
done

# Check if services are responding
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ | grep -q "200\|404"; then
    log "Frontend not responding. Restarting..."
    systemctl restart crysgarage-frontend
fi

if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200\|404"; then
    log "Backend not responding. Restarting..."
    systemctl restart crysgarage-backend
fi

if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:4567/ | grep -q "200\|404"; then
    log "Ruby service not responding. Restarting..."
    systemctl restart crysgarage-ruby
fi

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

# Check SSL certificate expiry
if [ -f /etc/letsencrypt/live/crysgarage.studio/fullchain.pem ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/crysgarage.studio/fullchain.pem | cut -d= -f2)
    EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))
    
    if [ $DAYS_LEFT -lt 30 ]; then
        log "SSL certificate expires in $DAYS_LEFT days. Renewing..."
        certbot renew --quiet
        systemctl reload nginx
    fi
fi
EOF

chmod +x /var/www/crysgarage-deploy/monitor.sh

# Create systemd timer for monitoring
echo "⏰ Creating monitoring timer..."
cat > /etc/systemd/system/crysgarage-monitor.timer << 'EOF'
[Unit]
Description=Run Crys Garage monitoring every 5 minutes

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

[Service]
Type=oneshot
ExecStart=/var/www/crysgarage-deploy/monitor.sh
EOF

# Enable and start monitoring
echo "🚀 Enabling and starting monitoring..."
systemctl daemon-reload
systemctl enable crysgarage-monitor.timer
systemctl start crysgarage-monitor.timer

# Get SSL certificate
echo "🔒 Obtaining SSL certificate..."
certbot certonly --standalone -d crysgarage.studio -d www.crysgarage.studio --non-interactive --agree-tos --email admin@crysgarage.studio --expand

# Update Nginx configuration with SSL
echo "🌐 Updating Nginx configuration with SSL..."
cat > /etc/nginx/sites-available/crysgarage.studio << 'EOF'
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
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
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
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
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    # Ruby service
    location /ruby/ {
        proxy_pass http://localhost:4567;
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
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/crysgarage.studio /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo "🔧 Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx configuration updated"
else
    echo "❌ Nginx configuration test failed"
fi

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

# Restart all services to ensure they're running
echo "🔄 Restarting all services..."
systemctl restart crysgarage-frontend
systemctl restart crysgarage-backend
systemctl restart crysgarage-ruby
systemctl restart nginx

# Test the application
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"

echo "✅ Simple stability setup completed!"
echo "🌐 Your application: https://crysgarage.studio"
echo "📊 Monitoring: Active (checks every 5 minutes)"
echo "💾 Backups: Daily at 2 AM"
echo "🔒 SSL: Let's Encrypt certificate installed"
echo "🛡️ Security: Fail2ban protection active" 