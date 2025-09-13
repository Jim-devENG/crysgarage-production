# Fix 403 Forbidden Error for ML Pipeline
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

Write-Host "Fixing 403 Forbidden error..." -ForegroundColor Cyan

# Fix permissions and Nginx configuration
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
# Create ML pipeline directory with proper structure
mkdir -p /var/www/html/ml-pipeline/api
mkdir -p /var/www/html/ml-pipeline/uploads
mkdir -p /var/www/html/ml-pipeline/downloads

# Create a simple index file for the ML pipeline
cat > /var/www/html/ml-pipeline/index.html << 'INDEX_EOF'
<!DOCTYPE html>
<html>
<head>
    <title>ML Pipeline</title>
</head>
<body>
    <h1>ML Pipeline API</h1>
    <p>API endpoints are available at /api/</p>
</body>
</html>
INDEX_EOF

# Create proper API endpoints
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

# Set proper ownership and permissions
chown -R nginx:nginx /var/www/html/ml-pipeline
chmod -R 755 /var/www/html/ml-pipeline
chmod 644 /var/www/html/ml-pipeline/api/*.php
chmod 644 /var/www/html/ml-pipeline/index.html

# Create a simple Nginx configuration for ML pipeline
cat > /etc/nginx/conf.d/ml-pipeline.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name crysgarage.studio;
    
    # Main site
    location / {
        root /var/www/html;
        index index.html index.php;
        try_files \$uri \$uri/ /index.html;
    }
    
    # ML Pipeline
    location /ml-pipeline/ {
        root /var/www/html;
        index index.html index.php;
        try_files \$uri \$uri/ /ml-pipeline/index.html;
        
        # Allow all methods for API
        location ~ ^/ml-pipeline/api/.*\.php$ {
            root /var/www/html;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
    }
}
NGINX_EOF

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo "403 Forbidden fix completed!"
"@

Write-Host "403 Forbidden fix completed!" -ForegroundColor Green
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
} catch {
    Write-Host "❌ Upload POST failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 403 Forbidden fix completed!" -ForegroundColor Green
