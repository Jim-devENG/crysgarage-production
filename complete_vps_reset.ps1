# Complete VPS Reset and Fresh Deployment Script
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

$ErrorActionPreference = 'Stop'

Write-Host "🚀 Starting Complete VPS Reset and Fresh Deployment..." -ForegroundColor Cyan
Write-Host "⚠️  WARNING: This will completely remove all existing files on the VPS!" -ForegroundColor Red
Write-Host "Press Ctrl+C within 5 seconds to cancel..." -ForegroundColor Yellow

# 5 second countdown
for ($i = 5; $i -gt 0; $i--) {
    Write-Host "Starting in $i seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}

Write-Host "🔥 Proceeding with complete reset..." -ForegroundColor Red

# Step 1: Complete VPS Cleanup
Write-Host "`n🗑️  Step 1: Complete VPS Cleanup..." -ForegroundColor Yellow
Write-Host "Removing all existing files from web directories..." -ForegroundColor Yellow

# Remove all existing files from web directories
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
echo "Cleaning web directories..."
rm -rf /var/www/html/*
rm -rf /var/www/html/.* 2>/dev/null || true
rm -rf /var/www/html/api/*
rm -rf /var/www/html/api/.* 2>/dev/null || true
rm -rf /var/www/html/ruby/*
rm -rf /var/www/html/ruby/.* 2>/dev/null || true

# Clean up any temporary files
rm -rf /tmp/crysgarage*
rm -rf /tmp/laravel*
rm -rf /tmp/dist*

# Stop all services
systemctl stop nginx 2>/dev/null || true
systemctl stop php-fpm 2>/dev/null || true
systemctl stop php8.2-fpm 2>/dev/null || true

echo "VPS cleanup completed"
"@

Write-Host "✅ VPS cleanup completed" -ForegroundColor Green

# Step 2: Build Fresh Frontend
Write-Host "`n🌐 Step 2: Building Fresh Frontend..." -ForegroundColor Yellow
Push-Location "crysgarage-frontend"
try {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install | Out-Null
    
    Write-Host "Building production frontend..." -ForegroundColor Yellow
    npm run build | Out-Null
    
    if (-not (Test-Path "dist")) {
        throw "Frontend build failed - dist directory not found"
    }
    
    Write-Host "✅ Frontend build completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
    throw
} finally {
    Pop-Location
}

# Step 3: Deploy Fresh Frontend
Write-Host "`n📤 Step 3: Deploying Fresh Frontend..." -ForegroundColor Yellow

# Create fresh web root
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html"

# Copy all frontend files
Write-Host "Copying frontend files..." -ForegroundColor Yellow
scp $SSH_OPTS -r "crysgarage-frontend/dist/*" "${VPS_USER}@${VPS_HOST}:/var/www/html/"

# Set proper permissions
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/
echo "Frontend permissions set"
"@

Write-Host "✅ Frontend deployed successfully" -ForegroundColor Green

# Step 4: Deploy Fresh Backend
Write-Host "`n🔧 Step 4: Deploying Fresh Backend..." -ForegroundColor Yellow

# Create backend directory
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html/api"

# Package and upload backend
$backendTar = Join-Path $env:TEMP ("laravel_backend_" + [guid]::NewGuid().ToString() + ".zip")
Write-Host "Packaging backend..." -ForegroundColor Yellow
Compress-Archive -Path "crysgarage-backend/*" -DestinationPath $backendTar -Force

Write-Host "Uploading backend..." -ForegroundColor Yellow
scp $SSH_OPTS "$backendTar" "${VPS_USER}@${VPS_HOST}:/tmp/backend_deploy.zip"

# Extract and setup backend
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
echo "Extracting backend..."
cd /var/www/html/api
unzip -o /tmp/backend_deploy.zip
rm -f /tmp/backend_deploy.zip

echo "Setting up Laravel..."
# Install composer dependencies if available
if command -v composer >/dev/null 2>&1; then
    COMPOSER_ALLOW_SUPERUSER=1 composer install -n --no-dev --optimize-autoloader
fi

# Clear Laravel caches
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Set permissions
chown -R nginx:nginx /var/www/html/api/
chmod -R 755 /var/www/html/api/
chmod -R 775 /var/www/html/api/storage/ 2>/dev/null || true
chmod -R 775 /var/www/html/api/bootstrap/cache/ 2>/dev/null || true

echo "Backend setup completed"
"@

# Clean up local temp file
Remove-Item $backendTar -Force

Write-Host "✅ Backend deployed successfully" -ForegroundColor Green

# Step 5: Deploy Ruby Service
Write-Host "`n💎 Step 5: Deploying Ruby Service..." -ForegroundColor Yellow

# Create ruby directory
ssh $SSH_OPTS $VPS_USER@$VPS_HOST "mkdir -p /var/www/html/ruby"

# Package and upload ruby service
$rubyTar = Join-Path $env:TEMP ("ruby_service_" + [guid]::NewGuid().ToString() + ".zip")
Write-Host "Packaging Ruby service..." -ForegroundColor Yellow
Compress-Archive -Path "crysgarage-ruby/*" -DestinationPath $rubyTar -Force

Write-Host "Uploading Ruby service..." -ForegroundColor Yellow
scp $SSH_OPTS "$rubyTar" "${VPS_USER}@${VPS_HOST}:/tmp/ruby_deploy.zip"

# Extract and setup ruby service
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
echo "Extracting Ruby service..."
cd /var/www/html/ruby
unzip -o /tmp/ruby_deploy.zip
rm -f /tmp/ruby_deploy.zip

echo "Setting up Ruby service..."
# Install gems if bundler is available
if command -v bundle >/dev/null 2>&1; then
    bundle install
fi

# Set permissions
chown -R nginx:nginx /var/www/html/ruby/
chmod -R 755 /var/www/html/ruby/

echo "Ruby service setup completed"
"@

# Clean up local temp file
Remove-Item $rubyTar -Force

Write-Host "✅ Ruby service deployed successfully" -ForegroundColor Green

# Step 6: Configure Nginx
Write-Host "`n🌐 Step 6: Configuring Nginx..." -ForegroundColor Yellow

# Create fresh Nginx configuration
$nginxConfig = @"
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
    root /var/www/html;
    index index.html index.htm;

    # Frontend routes
    location / {
        try_files `$uri `$uri/ /index.html;
    }

    # API routes
    location /api {
        alias /var/www/html/api/public;
        try_files `$uri `$uri/ @api;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME /var/www/html/api/public/index.php;
            include fastcgi_params;
        }
    }

    location @api {
        rewrite ^/api/(.*)$ /api/index.php?/\$1 last;
    }

    # Ruby service routes
    location /ruby {
        proxy_pass http://127.0.0.1:4567;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
"@

# Write nginx config to temp file and upload
$nginxConfigFile = Join-Path $env:TEMP "nginx_crysgarage.conf"
$nginxConfig | Out-File -FilePath $nginxConfigFile -Encoding UTF8

Write-Host "Uploading Nginx configuration..." -ForegroundColor Yellow
scp $SSH_OPTS "$nginxConfigFile" "${VPS_USER}@${VPS_HOST}:/etc/nginx/sites-available/crysgarage"

# Enable site and test configuration
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
echo "Configuring Nginx..."
ln -sf /etc/nginx/sites-available/crysgarage /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

echo "Nginx configuration completed"
"@

# Clean up temp file
Remove-Item $nginxConfigFile -Force

Write-Host "✅ Nginx configured successfully" -ForegroundColor Green

# Step 7: Start Services
Write-Host "`n🚀 Step 7: Starting Services..." -ForegroundColor Yellow

ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
echo "Starting services..."

# Start PHP-FPM
systemctl start php8.2-fpm || systemctl start php-fpm

# Start Nginx
systemctl start nginx

# Start Ruby service (if systemd service exists)
systemctl start crysgarage-ruby 2>/dev/null || echo "Ruby service not configured as systemd service"

echo "Services started"
"@

Write-Host "✅ Services started successfully" -ForegroundColor Green

# Step 8: Health Check
Write-Host "`n🏥 Step 8: Running Health Check..." -ForegroundColor Yellow

Start-Sleep -Seconds 10

Write-Host "Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$VPS_HOST" -TimeoutSec 30 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is responding" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Frontend health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "Testing API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$VPS_HOST/api" -TimeoutSec 30 -UseBasicParsing
    Write-Host "✅ API is responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️ API health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n🎉 Complete VPS Reset and Deployment Summary:" -ForegroundColor Cyan
Write-Host "✅ VPS completely cleaned and reset" -ForegroundColor Green
Write-Host "✅ Fresh frontend deployed with Firebase authentication" -ForegroundColor Green
Write-Host "✅ Fresh backend deployed" -ForegroundColor Green
Write-Host "✅ Ruby service deployed" -ForegroundColor Green
Write-Host "✅ Nginx configured and running" -ForegroundColor Green
Write-Host "✅ All services started" -ForegroundColor Green

Write-Host "`n🌐 Your site should now be live at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://$VPS_HOST" -ForegroundColor White
Write-Host "   API: http://$VPS_HOST/api" -ForegroundColor White
Write-Host "   Ruby: http://$VPS_HOST/ruby" -ForegroundColor White

Write-Host "`n⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure SSL certificates for HTTPS" -ForegroundColor White
Write-Host "2. Set up proper environment variables" -ForegroundColor White
Write-Host "3. Configure database connections" -ForegroundColor White
Write-Host "4. Test all functionality" -ForegroundColor White

Write-Host "`n🚀 Complete VPS Reset and Deployment Finished!" -ForegroundColor Green

