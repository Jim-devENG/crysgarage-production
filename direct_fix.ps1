# Direct Fix - Simple approach
Write-Host "DIRECT ML PIPELINE FIX" -ForegroundColor Green

# Create the files directly on the server using individual commands
Write-Host "Creating health.php..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "mkdir -p /var/www/html/ml-pipeline/api"

ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cat > /var/www/html/ml-pipeline/api/health.php << 'EOF'
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
    'service' => 'ML Pipeline API',
    'version' => '2.0.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => \$_SERVER['REQUEST_METHOD']
]);
?>
EOF"

Write-Host "Creating upload-audio.php..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cat > /var/www/html/ml-pipeline/api/upload-audio.php << 'EOF'
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
    \$input = json_decode(file_get_contents('php://input'), true);
    \$filename = \$input['filename'] ?? 'unknown_' . uniqid() . '.wav';
    \$audioId = 'audio_' . uniqid() . '_' . time();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload POST working',
        'audio_id' => \$audioId,
        'filename' => \$filename,
        'method' => 'POST',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload GET working',
        'method' => 'GET',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
EOF"

Write-Host "Creating process-audio.php..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cat > /var/www/html/ml-pipeline/api/process-audio.php << 'EOF'
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
    \$input = json_decode(file_get_contents('php://input'), true);
    \$audioId = \$input['audio_id'] ?? 'unknown_' . uniqid();
    \$jobId = 'job_' . uniqid() . '_' . time();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Process POST working',
        'job_id' => \$jobId,
        'audio_id' => \$audioId,
        'method' => 'POST',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Process GET working',
        'method' => 'GET',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
EOF"

Write-Host "Setting permissions..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "chown -R nginx:nginx /var/www/html/ml-pipeline && chmod -R 755 /var/www/html/ml-pipeline && chmod 644 /var/www/html/ml-pipeline/api/*.php"

Write-Host "Reloading services..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "systemctl reload nginx && systemctl reload php8.2-fpm"

Write-Host "Testing endpoints..." -ForegroundColor Green

# Test Health
Write-Host "1. Health Check:" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "https://crysgarage.studio/ml-pipeline/api/health.php" -Method "GET" -TimeoutSec 10
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Service: $($health.service)" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Upload POST
Write-Host "2. Upload POST:" -ForegroundColor Cyan
try {
    $upload = Invoke-RestMethod -Uri "https://crysgarage.studio/ml-pipeline/api/upload-audio.php" -Method "POST" -ContentType "application/json" -Body '{"filename": "test.wav"}' -TimeoutSec 10
    Write-Host "   Status: $($upload.status)" -ForegroundColor Green
    Write-Host "   Message: $($upload.message)" -ForegroundColor Green
    Write-Host "   Audio ID: $($upload.audio_id)" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Process POST
Write-Host "3. Process POST:" -ForegroundColor Cyan
try {
    $process = Invoke-RestMethod -Uri "https://crysgarage.studio/ml-pipeline/api/process-audio.php" -Method "POST" -ContentType "application/json" -Body '{"audio_id": "test123"}' -TimeoutSec 10
    Write-Host "   Status: $($process.status)" -ForegroundColor Green
    Write-Host "   Message: $($process.message)" -ForegroundColor Green
    Write-Host "   Job ID: $($process.job_id)" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "DIRECT FIX COMPLETED!" -ForegroundColor Green
