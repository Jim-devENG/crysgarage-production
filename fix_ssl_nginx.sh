#!/bin/bash

echo "🔒 Fixing SSL/HTTPS Configuration"
echo "================================="

# Create a comprehensive Nginx configuration that handles both HTTP and HTTPS
cat > /etc/nginx/conf.d/crysgarage.studio.conf << 'EOF'
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio 209.74.80.162;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS - main configuration
server {
    listen 443 ssl http2;
    server_name crysgarage.studio www.crysgarage.studio;

    # SSL Configuration (self-signed for now)
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend - React app
    location / {
        proxy_pass http://127.0.0.1:5173;
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
        proxy_pass http://127.0.0.1:8000/;
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

    # Ruby Service
    location /ruby/ {
        proxy_pass http://127.0.0.1:4567/;
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

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create self-signed SSL certificate if it doesn't exist
if [ ! -f /etc/ssl/certs/nginx-selfsigned.crt ]; then
    echo "🔐 Creating self-signed SSL certificate..."
    mkdir -p /etc/ssl/private
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/nginx-selfsigned.key \
        -out /etc/ssl/certs/nginx-selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=crysgarage.studio"
fi

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo "✅ SSL/HTTPS configuration updated and reloaded!"
    
    # Test both HTTP and HTTPS
    echo "🔍 Testing the fix..."
    sleep 2
    echo "HTTP test:"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/ 2>/dev/null || echo "HTTP test failed"
    echo "HTTPS test:"
    curl -s -k -o /dev/null -w "HTTPS Status: %{http_code}\n" https://localhost/ 2>/dev/null || echo "HTTPS test failed"
    
else
    echo "❌ Nginx configuration is invalid"
    exit 1
fi 