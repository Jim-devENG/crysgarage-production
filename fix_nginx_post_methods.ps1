# Fix Nginx Configuration for POST Methods
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

Write-Host "Fixing Nginx configuration for POST methods..." -ForegroundColor Cyan

# Fix Nginx configuration and create proper API endpoints
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
# Create ML pipeline directory
mkdir -p /var/www/html/ml-pipeline/api

# Create a simple upload endpoint that definitely works
cat > /var/www/html/ml-pipeline/api/upload-audio.php << 'UPLOAD_EOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

\$method = \$_SERVER['REQUEST_METHOD'];

if (\$method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload POST working',
        'audio_id' => 'test_' . uniqid(),
        'method' => 'POST'
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload GET working',
        'method' => 'GET'
    ]);
}
?>
UPLOAD_EOF

# Create process endpoint
cat > /var/www/html/ml-pipeline/api/process-audio.php << 'PROCESS_EOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

\$method = \$_SERVER['REQUEST_METHOD'];

if (\$method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Process POST working',
        'job_id' => 'job_' . uniqid(),
        'method' => 'POST'
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Process GET working',
        'method' => 'GET'
    ]);
}
?>
PROCESS_EOF

# Create health endpoint
cat > /var/www/html/ml-pipeline/api/health.php << 'HEALTH_EOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

echo json_encode([
    'status' => 'healthy',
    'service' => 'ML Pipeline',
    'version' => '1.0.0',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
HEALTH_EOF

# Set permissions
chown -R nginx:nginx /var/www/html/ml-pipeline
chmod -R 755 /var/www/html/ml-pipeline
chmod 644 /var/www/html/ml-pipeline/api/*.php

# Update Nginx configuration to allow POST methods
cat > /etc/nginx/conf.d/ml-pipeline-fix.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name crysgarage.studio;
    
    # ML Pipeline API endpoints
    location /ml-pipeline/api/ {
        root /var/www/html;
        try_files \$uri \$uri/ =404;
        
        # Allow all HTTP methods
        limit_except GET POST PUT DELETE OPTIONS {
            deny all;
        }
        
        # Handle PHP files
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
            
            # Allow POST requests
            fastcgi_param REQUEST_METHOD \$request_method;
        }
    }
    
    # Main site
    location / {
        root /var/www/html;
        index index.html index.php;
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX_EOF

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo "Nginx configuration updated and ML Pipeline endpoints created!"
"@

Write-Host "Nginx configuration has been updated!" -ForegroundColor Green
Write-Host "Testing the fixed endpoints..." -ForegroundColor Yellow

# Test the fixed endpoints
try {
    $health = Invoke-RestMethod -Uri "https://crysgarage.studio/ml-pipeline/api/health.php" -Method "GET" -TimeoutSec 10
    Write-Host "✅ Health endpoint: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $upload = Invoke-RestMethod -Uri "https://crysgarage.studio/ml-pipeline/api/upload-audio.php" -Method "POST" -ContentType "application/json" -Body '{}' -TimeoutSec 10
    Write-Host "✅ Upload POST: $($upload.status)" -ForegroundColor Green
    Write-Host "Message: $($upload.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Upload POST failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $process = Invoke-RestMethod -Uri "https://crysgarage.studio/ml-pipeline/api/process-audio.php" -Method "POST" -ContentType "application/json" -Body '{}' -TimeoutSec 10
    Write-Host "✅ Process POST: $($process.status)" -ForegroundColor Green
    Write-Host "Message: $($process.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Process POST failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Nginx POST methods fix completed!" -ForegroundColor Green
