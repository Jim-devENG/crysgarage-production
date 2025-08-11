#!/bin/bash

echo "🔒 Fixing SSL Certificate Issues (CentOS)"
echo "=========================================="

# Stop Nginx temporarily to free port 80
echo "🛑 Stopping Nginx temporarily..."
systemctl stop nginx

# Get SSL certificate
echo "🔒 Obtaining SSL certificate..."
certbot certonly --standalone -d crysgarage.studio -d www.crysgarage.studio --non-interactive --agree-tos --email admin@crysgarage.studio --expand

# Create Nginx configuration for CentOS
echo "🌐 Creating Nginx configuration for CentOS..."
cat > /etc/nginx/conf.d/crysgarage.studio.conf << 'EOF'
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

# Remove default configuration
rm -f /etc/nginx/conf.d/default.conf

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Start Nginx
    echo "▶️ Starting Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    # Test SSL certificate
    echo "🔍 Testing SSL certificate..."
    sleep 3
    curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"
    
    echo "✅ SSL certificate fix completed!"
    echo "🌐 Your application: https://crysgarage.studio"
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration manually."
fi 