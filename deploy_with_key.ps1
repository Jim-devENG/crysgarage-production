# Fresh VPS Deployment with SSH Key Authentication
param(
    [string]$VpsHost = "209.74.80.162",
    [string]$VpsUser = "root",
    [string]$SshKeyPath = ".\crysgarage_key",
    [string]$VpsPath = "/var/www/crysgarage"
)

$ErrorActionPreference = "Stop"

Write-Host "Fresh VPS Deployment for CrysGarage" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "VPS: $VpsHost" -ForegroundColor White
Write-Host "User: $VpsUser" -ForegroundColor White
Write-Host "Path: $VpsPath" -ForegroundColor White
Write-Host ""

# Function to run commands on VPS with SSH key
function Invoke-VpsCommand {
    param([string]$Command)
    Write-Host "VPS: $Command" -ForegroundColor Green
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost $Command
    if ($LASTEXITCODE -ne 0) {
        throw "VPS command failed: $Command"
    }
}

# Function to copy files to VPS with SSH key
function Copy-ToVps {
    param([string]$LocalPath, [string]$RemotePath)
    Write-Host "Copying: $LocalPath -> $RemotePath" -ForegroundColor Green
    scp -i $SshKeyPath -o StrictHostKeyChecking=no -r $LocalPath "${VpsUser}@${VpsHost}:${RemotePath}"
    if ($LASTEXITCODE -ne 0) {
        throw "File copy failed: $LocalPath -> $RemotePath"
    }
}

try {
    Write-Host "Testing SSH connection..." -ForegroundColor Blue
    Invoke-VpsCommand "echo 'SSH connection successful'"

    Write-Host "Stopping existing services..." -ForegroundColor Yellow
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "systemctl stop nginx || true"
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "systemctl stop php8.1-fpm || true"
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "systemctl stop php8.2-fpm || true"
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "systemctl stop php8.3-fpm || true"
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "pkill -f 'python.*main.py' || true"
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "pkill -f 'node.*vite' || true"
    ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "pkill -f 'npm.*dev' || true"

    Write-Host "Creating backup..." -ForegroundColor Yellow
    $BackupPath = "/tmp/crysgarage-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Invoke-VpsCommand "mkdir -p $BackupPath"
    Invoke-VpsCommand "cp -r $VpsPath $BackupPath/ 2>/dev/null || echo 'No existing deployment to backup'"

    Write-Host "Cleaning deployment directory..." -ForegroundColor Yellow
    Invoke-VpsCommand "rm -rf $VpsPath"
    Invoke-VpsCommand "mkdir -p $VpsPath"
    Invoke-VpsCommand "chown -R nginx:nginx $VpsPath"

    Write-Host "Building frontend..." -ForegroundColor Blue
    Set-Location "crysgarage-frontend"
    npm install
    npm run build
    Set-Location ".."

    Write-Host "Preparing Python service..." -ForegroundColor Blue
    Set-Location "audio-mastering-service"
    if (-not (Test-Path "requirements.txt")) {
        @"
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
aiofiles==23.2.1
numpy==1.24.3
soundfile==0.12.1
scipy==1.11.4
librosa==0.10.1
pydub==0.25.1
requests==2.31.0
aiohttp==3.9.1
python-dotenv==1.0.0
Pillow==10.1.0
opencv-python==4.8.1.78
tensorflow==2.15.0
torch==2.1.1
torchaudio==2.1.1
noisereduce==3.0.0
"@ | Out-File -FilePath "requirements.txt" -Encoding UTF8
    }
    Set-Location ".."

    Write-Host "Deploying files..." -ForegroundColor Yellow
    Copy-ToVps "crysgarage-frontend/dist" "$VpsPath/frontend"
    Invoke-VpsCommand "mkdir -p $VpsPath/audio-mastering-service"
    Copy-ToVps "audio-mastering-service" "$VpsPath/"

    if (Test-Path "crysgarage-backend") {
        Copy-ToVps "crysgarage-backend" "$VpsPath/"
    }

    Write-Host "Setting up Python environment..." -ForegroundColor Yellow
    Invoke-VpsCommand "cd $VpsPath/audio-mastering-service && python3 -m venv venv"
    Invoke-VpsCommand "cd $VpsPath/audio-mastering-service && source venv/bin/activate && pip install --upgrade pip"
    Invoke-VpsCommand "cd $VpsPath/audio-mastering-service && source venv/bin/activate && pip install -r requirements.txt"

    Write-Host "Setting up systemd services..." -ForegroundColor Yellow
    
    # Create Python service
    $PythonServiceContent = @"
[Unit]
Description=CrysGarage Python Audio Service
After=network.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=$VpsPath/audio-mastering-service
Environment=PATH=$VpsPath/audio-mastering-service/venv/bin
ExecStart=$VpsPath/audio-mastering-service/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"@

    Invoke-VpsCommand "cat > /etc/systemd/system/crysgarage-python.service << 'EOF'
$PythonServiceContent
EOF"

    # Create frontend service
    $FrontendServiceContent = @"
[Unit]
Description=CrysGarage Frontend Service
After=network.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=$VpsPath/frontend
ExecStart=/usr/bin/python3 -m http.server 5173
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"@

    Invoke-VpsCommand "cat > /etc/systemd/system/crysgarage-frontend.service << 'EOF'
$FrontendServiceContent
EOF"

    Write-Host "Setting up Nginx..." -ForegroundColor Yellow
    
    # Create Nginx configuration
    $NginxConfig = @"
server {
    listen 80;
    server_name $VpsHost crysgarage.studio;
    
    # Frontend
    location / {
        root $VpsPath/frontend;
        index index.html;
        try_files `$uri `$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    # Python API
    location /api/ {
        proxy_pass http://localhost:8002/;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        if (`$request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Direct Python service access
    location /proxy-download {
        proxy_pass http://localhost:8002/proxy-download;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    
    # File serving
    location /files/ {
        alias $VpsPath/audio-mastering-service/;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
"@

    Invoke-VpsCommand "cat > /etc/nginx/sites-available/crysgarage << 'EOF'
$NginxConfig
EOF"

    Invoke-VpsCommand "ln -sf /etc/nginx/sites-available/crysgarage /etc/nginx/sites-enabled/"
    Invoke-VpsCommand "rm -f /etc/nginx/sites-enabled/default"

    Write-Host "Setting up permissions..." -ForegroundColor Yellow
    Invoke-VpsCommand "chown -R nginx:nginx $VpsPath"
    Invoke-VpsCommand "chmod -R 755 $VpsPath"
    Invoke-VpsCommand "mkdir -p $VpsPath/audio-mastering-service/storage/app/public/mastered"
    Invoke-VpsCommand "chown -R nginx:nginx $VpsPath/audio-mastering-service/storage"
    Invoke-VpsCommand "chmod -R 755 $VpsPath/audio-mastering-service/storage"

    Write-Host "Starting services..." -ForegroundColor Yellow
    Invoke-VpsCommand "systemctl daemon-reload"
    Invoke-VpsCommand "systemctl enable crysgarage-python"
    Invoke-VpsCommand "systemctl enable crysgarage-frontend"
    Invoke-VpsCommand "systemctl start crysgarage-python"
    Invoke-VpsCommand "systemctl start crysgarage-frontend"

    # Test Nginx configuration
    Invoke-VpsCommand "nginx -t"
    Invoke-VpsCommand "systemctl restart nginx"

    Write-Host ""
    Write-Host "Verifying deployment..." -ForegroundColor Blue
    
    Write-Host "Checking Python service..." -ForegroundColor White
    $pythonHealth = ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "curl -s http://localhost:8002/health || echo 'Python service not responding'"
    Write-Host "Python service: $pythonHealth" -ForegroundColor White

    Write-Host "Checking frontend..." -ForegroundColor White
    $frontendHealth = ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "curl -s http://localhost:5173 || echo 'Frontend not responding'"
    Write-Host "Frontend: $frontendHealth" -ForegroundColor White

    Write-Host "Checking Nginx..." -ForegroundColor White
    $nginxHealth = ssh -i $SshKeyPath -o StrictHostKeyChecking=no $VpsUser@$VpsHost "curl -s http://localhost || echo 'Nginx not responding'"
    Write-Host "Nginx: $nginxHealth" -ForegroundColor White

    Write-Host ""
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "===================" -ForegroundColor Green
    Write-Host "Your CrysGarage application is now live at:" -ForegroundColor White
    Write-Host "  Frontend: http://crysgarage.studio" -ForegroundColor Cyan
    Write-Host "  Python API: http://crysgarage.studio/api/" -ForegroundColor Cyan
    Write-Host "  Files: http://crysgarage.studio/files/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Yellow
    Invoke-VpsCommand "systemctl status crysgarage-python --no-pager -l"
    Invoke-VpsCommand "systemctl status crysgarage-frontend --no-pager -l"
    Invoke-VpsCommand "systemctl status nginx --no-pager -l"
    Write-Host ""
    Write-Host "Backup created at: $BackupPath" -ForegroundColor Yellow
    Write-Host "Monitor logs: ssh -i '$SshKeyPath' $VpsUser@$VpsHost 'journalctl -u crysgarage-python -f'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Fresh deployment completed successfully!" -ForegroundColor Green

} catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the error above and try again." -ForegroundColor Red
    exit 1
}
