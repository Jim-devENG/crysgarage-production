# ML Pipeline Deployment Script for VPS
param(
  [string]$VPS_HOST = "209.74.80.162",
  [string]$VPS_USER = "root",
  [string]$SSH_OPTS = "-o StrictHostKeyChecking=no"
)

Write-Host "🚀 ML Pipeline Deployment Starting..." -ForegroundColor Cyan
Write-Host "Target: $VPS_HOST" -ForegroundColor Yellow

# Step 1: Prepare ML Pipeline files
Write-Host "📦 Preparing ML Pipeline files..." -ForegroundColor Yellow

# Create a temporary deployment directory
$deployDir = "ml-pipeline-deploy"
if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy essential ML pipeline files
$mlFiles = @(
  "crysgarage-backend-fresh/simple_ml_pipeline.php",
  "crysgarage-backend-fresh/router.php", 
  "crysgarage-backend-fresh/queue_worker.php",
  "crysgarage-backend-fresh/download.php",
  "crysgarage-backend-fresh/payment_integration.php",
  "crysgarage-backend-fresh/app/Http/Controllers/AudioController.php",
  "crysgarage-backend-fresh/app/Jobs/ProcessAudioJob.php",
  "crysgarage-backend-fresh/app/Models/Audio.php",
  "crysgarage-backend-fresh/config/queue.php",
  "crysgarage-backend-fresh/database/migrations/2024_01_01_000000_create_jobs_table.php",
  "crysgarage-backend-fresh/database/migrations/2024_01_01_000001_create_failed_jobs_table.php",
  "crysgarage-backend-fresh/database/migrations/2024_01_01_000002_create_job_batches_table.php",
  "crysgarage-backend-fresh/routes/api.php"
)

foreach ($file in $mlFiles) {
  if (Test-Path $file) {
    $destPath = Join-Path $deployDir (Split-Path $file -Leaf)
    Copy-Item $file $destPath
    Write-Host "  ✅ Copied: $(Split-Path $file -Leaf)" -ForegroundColor Green
  } else {
    Write-Host "  ⚠️  Missing: $file" -ForegroundColor Yellow
  }
}

# Copy frontend ML pipeline components
$frontendFiles = @(
  "crysgarage-frontend/services/mlPipelineAPI.ts",
  "crysgarage-frontend/components/MLPipelineUpload.tsx",
  "crysgarage-frontend/components/MLPipelineTestPage.tsx"
)

$frontendDir = Join-Path $deployDir "frontend"
New-Item -ItemType Directory -Path $frontendDir | Out-Null

foreach ($file in $frontendFiles) {
  if (Test-Path $file) {
    $destPath = Join-Path $frontendDir (Split-Path $file -Leaf)
    Copy-Item $file $destPath
    Write-Host "  ✅ Copied frontend: $(Split-Path $file -Leaf)" -ForegroundColor Green
  }
}

# Step 2: Deploy to VPS
Write-Host "🌐 Deploying to VPS..." -ForegroundColor Yellow

# Create ML pipeline directory on VPS
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
# Create ML pipeline directory
mkdir -p /var/www/ml-pipeline
cd /var/www/ml-pipeline

# Create necessary subdirectories
mkdir -p api
mkdir -p storage
mkdir -p download
mkdir -p logs

# Set permissions
chown -R nginx:nginx /var/www/ml-pipeline
chmod -R 755 /var/www/ml-pipeline
"@

# Upload ML pipeline files
Write-Host "📤 Uploading ML pipeline files..." -ForegroundColor Yellow
scp $SSH_OPTS -r "$deployDir/*" "${VPS_USER}@${VPS_HOST}:/var/www/ml-pipeline/"

# Step 3: Configure ML pipeline on VPS
Write-Host "⚙️  Configuring ML pipeline..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
cd /var/www/ml-pipeline

# Create storage files
echo '{}' > storage.json
echo '[]' > queue_jobs.json
echo '{}' > users.json
echo '[]' > credits.json

# Set up Nginx configuration for ML pipeline
cat > /etc/nginx/conf.d/ml-pipeline.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name ml-pipeline.crysgarage.studio;
    root /var/www/ml-pipeline;
    index router.php;

    location / {
        try_files \$uri \$uri/ /router.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index router.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";

    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
}
NGINX_EOF

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Set up queue worker as a service
cat > /etc/systemd/system/ml-pipeline-worker.service << 'SERVICE_EOF'
[Unit]
Description=ML Pipeline Queue Worker
After=network.target

[Service]
Type=simple
User=nginx
WorkingDirectory=/var/www/ml-pipeline
ExecStart=/usr/bin/php queue_worker.php
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Enable and start the queue worker
systemctl daemon-reload
systemctl enable ml-pipeline-worker
systemctl start ml-pipeline-worker

echo "ML Pipeline configuration completed!"
"@

# Step 4: Test ML pipeline deployment
Write-Host "🧪 Testing ML pipeline deployment..." -ForegroundColor Yellow
ssh $SSH_OPTS $VPS_USER@$VPS_HOST @"
# Test health endpoint
curl -s http://localhost/api/health || echo "Health endpoint test failed"

# Check queue worker status
systemctl status ml-pipeline-worker --no-pager -l

# Check Nginx status
systemctl status nginx --no-pager -l
"@

# Step 5: Update frontend to use VPS ML pipeline
Write-Host "🔧 Updating frontend configuration..." -ForegroundColor Yellow

# Update the frontend API configuration to point to VPS
$apiConfigPath = "crysgarage-frontend/services/mlPipelineAPI.ts"
if (Test-Path $apiConfigPath) {
  $content = Get-Content $apiConfigPath -Raw
  $content = $content -replace 'http://localhost:8000', 'https://ml-pipeline.crysgarage.studio'
  Set-Content $apiConfigPath $content
  Write-Host "  ✅ Updated frontend API configuration" -ForegroundColor Green
}

# Clean up
Remove-Item -Recurse -Force $deployDir

Write-Host "🎉 ML Pipeline deployment completed!" -ForegroundColor Green
Write-Host "🌐 ML Pipeline URL: https://ml-pipeline.crysgarage.studio" -ForegroundColor Cyan
Write-Host "🏥 Health Check: https://ml-pipeline.crysgarage.studio/api/health" -ForegroundColor Cyan
Write-Host "📊 Queue Worker Status: systemctl status ml-pipeline-worker" -ForegroundColor Cyan
