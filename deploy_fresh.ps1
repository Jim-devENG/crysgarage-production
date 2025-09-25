# Fresh Deployment Script for CrysGarage (PowerShell)
# This script will completely clean the VPS and deploy everything fresh

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$VpsPath = "/var/www/crysgarage"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Fresh Deployment of CrysGarage" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$BackupPath = "/tmp/crysgarage-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "  VPS Host: $VpsHost" -ForegroundColor White
Write-Host "  VPS User: $VpsUser" -ForegroundColor White
Write-Host "  Deployment Path: $VpsPath" -ForegroundColor White
Write-Host "  Backup Path: $BackupPath" -ForegroundColor White
Write-Host ""

# Function to run commands on VPS
function Invoke-VpsCommand {
    param([string]$Command)
    Write-Host "🔧 Running on VPS: $Command" -ForegroundColor Green
    ssh $VpsUser@$VpsHost $Command
}

# Function to copy files to VPS
function Copy-ToVps {
    param([string]$LocalPath, [string]$RemotePath)
    Write-Host "📁 Copying to VPS: $LocalPath -> $RemotePath" -ForegroundColor Green
    scp -r $LocalPath "${VpsUser}@${VpsHost}:${RemotePath}"
}

try {
    Write-Host "🛑 Step 1: Stopping all services on VPS" -ForegroundColor Red
    Write-Host "=======================================" -ForegroundColor Red
    Invoke-VpsCommand "systemctl stop nginx || true"
    Invoke-VpsCommand "systemctl stop php8.1-fpm || true"
    Invoke-VpsCommand "systemctl stop php8.2-fpm || true"
    Invoke-VpsCommand "systemctl stop php8.3-fpm || true"
    Invoke-VpsCommand "pkill -f 'python.*main.py' || true"
    Invoke-VpsCommand "pkill -f 'node.*vite' || true"
    Invoke-VpsCommand "pkill -f 'npm.*dev' || true"

    Write-Host ""
    Write-Host "💾 Step 2: Creating backup of current deployment" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Yellow
    Invoke-VpsCommand "mkdir -p $BackupPath"
    Invoke-VpsCommand "cp -r $VpsPath $BackupPath/ 2>/dev/null || echo 'No existing deployment to backup'"
    Invoke-VpsCommand "cp -r /etc/nginx/sites-available/crysgarage* $BackupPath/ 2>/dev/null || echo 'No nginx config to backup'"
    Invoke-VpsCommand "cp -r /etc/nginx/sites-enabled/crysgarage* $BackupPath/ 2>/dev/null || echo 'No nginx enabled config to backup'"

    Write-Host ""
    Write-Host "🗑️  Step 3: Completely cleaning VPS deployment directory" -ForegroundColor Red
    Write-Host "=======================================================" -ForegroundColor Red
    Invoke-VpsCommand "rm -rf $VpsPath"
    Invoke-VpsCommand "mkdir -p $VpsPath"
    Invoke-VpsCommand "chown -R www-data:www-data $VpsPath"

    Write-Host ""
    Write-Host "📦 Step 4: Preparing local build" -ForegroundColor Blue
    Write-Host "===============================" -ForegroundColor Blue
    
    # Build frontend
    Write-Host "Building frontend..." -ForegroundColor White
    Set-Location "crysgarage-frontend"
    npm install
    npm run build
    Set-Location ".."

    # Prepare Python service
    Write-Host "Preparing Python service..." -ForegroundColor White
    Set-Location "audio-mastering-service"
    
    # Create requirements.txt if it doesn't exist
    if (-not (Test-Path "requirements.txt")) {
        Write-Host "Creating requirements.txt..." -ForegroundColor White
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

    Write-Host ""
    Write-Host "📤 Step 5: Deploying to VPS" -ForegroundColor Green
    Write-Host "===========================" -ForegroundColor Green

    # Copy frontend build
    Write-Host "Deploying frontend..." -ForegroundColor White
    Copy-ToVps "crysgarage-frontend/dist" "$VpsPath/frontend"

    # Copy Python service
    Write-Host "Deploying Python service..." -ForegroundColor White
    Invoke-VpsCommand "mkdir -p $VpsPath/audio-mastering-service"
    Copy-ToVps "audio-mastering-service" "$VpsPath/"

    # Copy backend (if exists)
    if (Test-Path "crysgarage-backend") {
        Write-Host "Deploying backend..." -ForegroundColor White
        Copy-ToVps "crysgarage-backend" "$VpsPath/"
    }

    Write-Host ""
    Write-Host "🐍 Step 6: Setting up Python environment on VPS" -ForegroundColor Magenta
    Write-Host "==============================================" -ForegroundColor Magenta
    Invoke-VpsCommand "cd $VpsPath/audio-mastering-service && python3 -m venv venv"
    Invoke-VpsCommand "cd $VpsPath/audio-mastering-service && source venv/bin/activate && pip install --upgrade pip"
    Invoke-VpsCommand "cd $VpsPath/audio-mastering-service && source venv/bin/activate && pip install -r requirements.txt"

    Write-Host ""
    Write-Host "⚙️  Step 7: Setting up systemd services" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan

    # Create Python service systemd file
    $PythonServiceContent = @"
[Unit]
Description=CrysGarage Python Audio Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
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

    # Create frontend service systemd file
    $FrontendServiceContent = @"
[Unit]
Description=CrysGarage Frontend Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
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

    Write-Host ""
    Write-Host "🌐 Step 8: Setting up Nginx configuration" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue

    # Create Nginx configuration
    $NginxConfig = @"
server {
    listen 80;
    server_name $VpsHost;
    
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

    # Enable the site
    Invoke-VpsCommand "ln -sf /etc/nginx/sites-available/crysgarage /etc/nginx/sites-enabled/"
    Invoke-VpsCommand "rm -f /etc/nginx/sites-enabled/default"

    Write-Host ""
    Write-Host "🔧 Step 9: Setting up file permissions and directories" -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Yellow
    Invoke-VpsCommand "chown -R www-data:www-data $VpsPath"
    Invoke-VpsCommand "chmod -R 755 $VpsPath"
    Invoke-VpsCommand "mkdir -p $VpsPath/audio-mastering-service/storage/app/public/mastered"
    Invoke-VpsCommand "chown -R www-data:www-data $VpsPath/audio-mastering-service/storage"
    Invoke-VpsCommand "chmod -R 755 $VpsPath/audio-mastering-service/storage"

    Write-Host ""
    Write-Host "🔄 Step 10: Reloading and starting services" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Invoke-VpsCommand "systemctl daemon-reload"
    Invoke-VpsCommand "systemctl enable crysgarage-python"
    Invoke-VpsCommand "systemctl enable crysgarage-frontend"
    Invoke-VpsCommand "systemctl start crysgarage-python"
    Invoke-VpsCommand "systemctl start crysgarage-frontend"

    # Test Nginx configuration
    Invoke-VpsCommand "nginx -t"
    Invoke-VpsCommand "systemctl restart nginx"

    Write-Host ""
    Write-Host "✅ Step 11: Verifying deployment" -ForegroundColor Green
    Write-Host "===============================" -ForegroundColor Green
    Write-Host "Checking Python service..." -ForegroundColor White
    Invoke-VpsCommand "curl -s http://localhost:8002/health || echo 'Python service not responding'"

    Write-Host "Checking frontend..." -ForegroundColor White
    Invoke-VpsCommand "curl -s http://localhost:5173 || echo 'Frontend not responding'"

    Write-Host "Checking Nginx..." -ForegroundColor White
    Invoke-VpsCommand "curl -s http://localhost || echo 'Nginx not responding'"

    Write-Host ""
    Write-Host "🎉 Fresh Deployment Complete!" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    Write-Host "Your CrysGarage application has been deployed fresh to:" -ForegroundColor White
    Write-Host "  🌐 Frontend: http://$VpsHost" -ForegroundColor Cyan
    Write-Host "  🐍 Python API: http://$VpsHost/api/" -ForegroundColor Cyan
    Write-Host "  📁 Files: http://$VpsHost/files/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Service Status:" -ForegroundColor Yellow
    Invoke-VpsCommand "systemctl status crysgarage-python --no-pager -l"
    Invoke-VpsCommand "systemctl status crysgarage-frontend --no-pager -l"
    Invoke-VpsCommand "systemctl status nginx --no-pager -l"
    Write-Host ""
    Write-Host "💾 Backup created at: $BackupPath" -ForegroundColor Yellow
    Write-Host "🔍 Logs: journalctl -u crysgarage-python -f" -ForegroundColor Yellow
    Write-Host "🔍 Logs: journalctl -u crysgarage-frontend -f" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 Deployment completed successfully!" -ForegroundColor Green

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the error above and try again." -ForegroundColor Red
    exit 1
}
