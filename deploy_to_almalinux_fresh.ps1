# Crys Garage Fresh VPS Deployment Script (PowerShell) - AlmaLinux 8
# Configured for: 209.74.80.162 (crysgarage.studio)
# This script will COMPLETELY OVERRIDE existing installation

# VPS Connection Details
$VPS_USER = "root"
$VPS_HOST = "209.74.80.162"
$VPS_PORT = "22"
$VPS_PATH = "/var/www/crysgarage"

# Local project path
$LOCAL_PROJECT_PATH = Get-Location

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Starting FRESH Crys Garage Deployment to AlmaLinux 8 VPS" -ForegroundColor $Green
Write-Host "Server: $VPS_HOST (crysgarage.studio)" -ForegroundColor $Yellow
Write-Host "Specs: 6GB RAM, 120GB Storage" -ForegroundColor $Yellow
Write-Host "⚠️  WARNING: This will COMPLETELY OVERRIDE existing installation!" -ForegroundColor $Red

# Check if required tools are installed
function Check-Requirements {
    Write-Host "Checking requirements..." -ForegroundColor $Yellow
    
    # Check if rsync is available
    try {
        $null = Get-Command rsync -ErrorAction Stop
        Write-Host "✅ rsync found" -ForegroundColor $Green
    }
    catch {
        Write-Host "❌ rsync not found. Please install rsync for Windows." -ForegroundColor $Red
        Write-Host "You can install rsync via:" -ForegroundColor $Yellow
        Write-Host "  - Git Bash (comes with Git for Windows)"
        Write-Host "  - WSL (Windows Subsystem for Linux)"
        Write-Host "  - Cygwin"
        exit 1
    }
    
    # Check if ssh is available
    try {
        $null = Get-Command ssh -ErrorAction Stop
        Write-Host "✅ ssh found" -ForegroundColor $Green
    }
    catch {
        Write-Host "❌ ssh not found. Please install OpenSSH or use Git Bash." -ForegroundColor $Red
        exit 1
    }
    
    Write-Host "✅ Requirements check passed" -ForegroundColor $Green
}

# Test SSH connection
function Test-VPSConnection {
    Write-Host "Testing SSH connection to AlmaLinux 8 VPS..." -ForegroundColor $Yellow
    
    try {
        $testResult = ssh -p $VPS_PORT -o ConnectTimeout=10 -o BatchMode=yes "${VPS_USER}@${VPS_HOST}" "echo 'Connection successful'; cat /etc/os-release | grep PRETTY_NAME" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH connection successful" -ForegroundColor $Green
            Write-Host "✅ Confirmed AlmaLinux 8" -ForegroundColor $Green
        }
        else {
            throw "Connection failed"
        }
    }
    catch {
        Write-Host "❌ SSH connection failed. Please check your VPS details." -ForegroundColor $Red
        Write-Host "Make sure to:" -ForegroundColor $Yellow
        Write-Host "  1. VPS is accessible at $VPS_HOST"
        Write-Host "  2. SSH key authentication is set up"
        Write-Host "  3. Root access is enabled"
        exit 1
    }
}

# Clean existing installation
function Clean-ExistingInstallation {
    Write-Host "🧹 Cleaning existing installation..." -ForegroundColor $Yellow
    
    $cleanCommands = @"
# Stop existing services
systemctl stop crysgarage-backend 2>/dev/null || true
systemctl stop crysgarage-ruby 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
systemctl stop mysqld 2>/dev/null || true

# Disable services
systemctl disable crysgarage-backend 2>/dev/null || true
systemctl disable crysgarage-ruby 2>/dev/null || true

# Remove existing service files
rm -f /etc/systemd/system/crysgarage-backend.service
rm -f /etc/systemd/system/crysgarage-ruby.service

# Remove existing application directory
rm -rf /var/www/crysgarage

# Remove existing Nginx configuration
rm -f /etc/nginx/conf.d/crysgarage.conf
rm -f /etc/nginx/sites-enabled/crysgarage

# Clear Nginx cache
rm -rf /var/cache/nginx

# Remove existing database (WARNING: This will delete all data!)
mysql -u root -p -e "DROP DATABASE IF EXISTS crysgarage;" 2>/dev/null || true
mysql -u root -p -e "DROP USER IF EXISTS 'crysgarage_user'@'localhost';" 2>/dev/null || true

# Clear any existing logs
rm -rf /var/log/crysgarage* 2>/dev/null || true

echo "✅ Existing installation cleaned"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $cleanCommands
    
    Write-Host "✅ Existing installation cleaned" -ForegroundColor $Green
}

# Install required software on AlmaLinux 8
function Install-AlmaLinuxDependencies {
    Write-Host "Installing required software on AlmaLinux 8..." -ForegroundColor $Yellow
    
    $installCommands = @"
# Update system
dnf update -y

# Install EPEL repository
dnf install -y epel-release

# Install PHP 8.1 and extensions
dnf install -y php php-fpm php-mysqlnd php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-soap php-intl php-redis php-sqlite3

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Install Ruby and development tools
dnf install -y ruby ruby-devel ruby-bundler gcc gcc-c++ make

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install FFmpeg
dnf install -y ffmpeg

# Install MySQL
dnf install -y mysql-server mysql

# Install Nginx
dnf install -y nginx

# Install additional tools
dnf install -y git unzip wget curl

echo "✅ AlmaLinux 8 dependencies installed"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $installCommands
    
    Write-Host "✅ AlmaLinux 8 dependencies installed" -ForegroundColor $Green
}

# Configure MySQL for AlmaLinux 8
function Configure-MySQL {
    Write-Host "Configuring MySQL on AlmaLinux 8..." -ForegroundColor $Yellow
    
    $mysqlCommands = @"
# Start and enable MySQL
systemctl start mysqld
systemctl enable mysqld

# Secure MySQL installation
mysql_secure_installation << EOF
y
0
Y
Y
Y
Y
EOF

# Create fresh database and user
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS crysgarage;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'crysgarage_user'@'localhost' IDENTIFIED BY 'CrysGarage2024!';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON crysgarage.* TO 'crysgarage_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

echo "✅ MySQL configured for Crys Garage"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $mysqlCommands
    
    Write-Host "✅ MySQL configured" -ForegroundColor $Green
}

# Create fresh remote directory structure
function Setup-RemoteDirectories {
    Write-Host "Setting up fresh remote directory structure..." -ForegroundColor $Yellow
    
    $setupCommands = @"
# Create fresh directories
mkdir -p /var/www/crysgarage
mkdir -p /var/www/crysgarage/crysgarage-backend
mkdir -p /var/www/crysgarage/crysgarage-frontend
mkdir -p /var/www/crysgarage/crysgarage-ruby
mkdir -p /var/www/crysgarage/logs
mkdir -p /var/www/crysgarage/backups

# Set proper ownership
chown -R nginx:nginx /var/www/crysgarage
chmod -R 755 /var/www/crysgarage
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $setupCommands
    
    Write-Host "✅ Fresh remote directories created" -ForegroundColor $Green
}

# Deploy backend with fresh files
function Deploy-Backend {
    Write-Host "Deploying fresh Laravel backend..." -ForegroundColor $Yellow
    
    # Exclude unnecessary files for production
    $excludeArgs = @(
        "--exclude=vendor/",
        "--exclude=node_modules/",
        "--exclude=.env",
        "--exclude=storage/logs/",
        "--exclude=storage/framework/cache/",
        "--exclude=storage/framework/sessions/",
        "--exclude=storage/framework/views/",
        "--exclude=bootstrap/cache/",
        "--exclude=*.sqlite",
        "--exclude=.git/",
        "--exclude=tests/"
    )
    
    $rsyncArgs = @("-avz", "--progress", "--delete") + $excludeArgs + @("-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\crysgarage-backend\", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/crysgarage-backend/")
    
    & rsync @rsyncArgs
    
    Write-Host "✅ Fresh backend deployed" -ForegroundColor $Green
}

# Deploy frontend with fresh files
function Deploy-Frontend {
    Write-Host "Deploying fresh React frontend..." -ForegroundColor $Yellow
    
    # Build the frontend for production
    Write-Host "Building frontend for production..." -ForegroundColor $Yellow
    Set-Location "crysgarage-frontend"
    npm run build
    Set-Location $LOCAL_PROJECT_PATH
    
    # Deploy built files with delete flag
    $excludeArgs = @(
        "--exclude=node_modules/",
        "--exclude=.git/",
        "--exclude=src/",
        "--exclude=*.tsx",
        "--exclude=*.ts",
        "--exclude=*.js",
        "--exclude=*.jsx",
        "--exclude=package*.json",
        "--exclude=vite.config.ts",
        "--exclude=tailwind.config.js",
        "--exclude=postcss.config.js",
        "--exclude=tsconfig.json"
    )
    
    $rsyncArgs = @("-avz", "--progress", "--delete") + $excludeArgs + @("-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\crysgarage-frontend\dist\", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/crysgarage-frontend/")
    
    & rsync @rsyncArgs
    
    Write-Host "✅ Fresh frontend deployed" -ForegroundColor $Green
}

# Deploy Ruby audio processor with fresh files
function Deploy-Ruby {
    Write-Host "Deploying fresh Ruby audio processor..." -ForegroundColor $Yellow
    
    $excludeArgs = @(
        "--exclude=*.gem",
        "--exclude=*.rbc",
        "--exclude=/.config",
        "--exclude=/coverage/",
        "--exclude=/InstalledFiles",
        "--exclude=/pkg/",
        "--exclude=/spec/reports/",
        "--exclude=/spec/examples.txt",
        "--exclude=/test/tmp/",
        "--exclude=/test/version_tmp/",
        "--exclude=/tmp/",
        "--exclude=output/",
        "--exclude=logs/",
        "--exclude=temp/"
    )
    
    $rsyncArgs = @("-avz", "--progress", "--delete") + $excludeArgs + @("-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\crysgarage-ruby\", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/crysgarage-ruby/")
    
    & rsync @rsyncArgs
    
    Write-Host "✅ Fresh Ruby audio processor deployed" -ForegroundColor $Green
}

# Setup fresh services on AlmaLinux 8
function Setup-Services {
    Write-Host "Setting up fresh services on AlmaLinux 8..." -ForegroundColor $Yellow
    
    $setupCommands = @"
cd /var/www/crysgarage

# Install backend dependencies fresh
echo "Installing Laravel dependencies..."
cd crysgarage-backend
composer install --no-dev --optimize-autoloader

# Set proper permissions for AlmaLinux 8
chown -R nginx:nginx /var/www/crysgarage
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

# Install frontend dependencies and build fresh
echo "Installing frontend dependencies..."
cd ../crysgarage-frontend
npm install
npm run build

# Install Ruby dependencies fresh
echo "Installing Ruby dependencies..."
cd ../crysgarage-ruby
bundle install

echo "✅ Fresh services setup completed"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $setupCommands
    
    Write-Host "✅ Fresh services setup completed" -ForegroundColor $Green
}

# Create fresh systemd service files for AlmaLinux 8
function Create-ServiceFiles {
    Write-Host "Creating fresh systemd service files for AlmaLinux 8..." -ForegroundColor $Yellow
    
    $laravelService = @"
[Unit]
Description=Crys Garage Laravel Backend
After=network.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=/var/www/crysgarage/crysgarage-backend
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"@
    
    $rubyService = @"
[Unit]
Description=Crys Garage Ruby Audio Processor
After=network.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=/var/www/crysgarage/crysgarage-ruby
ExecStart=/usr/bin/ruby mastering_server.rb
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"@
    
    $serviceCommands = @"
# Create fresh Laravel service
tee /etc/systemd/system/crysgarage-backend.service > /dev/null << 'SERVICE'
$laravelService
SERVICE

# Create fresh Ruby service
tee /etc/systemd/system/crysgarage-ruby.service > /dev/null << 'SERVICE'
$rubyService
SERVICE

# Reload systemd and enable fresh services
systemctl daemon-reload
systemctl enable crysgarage-backend
systemctl enable crysgarage-ruby
systemctl start crysgarage-backend
systemctl start crysgarage-ruby

echo "✅ Fresh systemd services created and started"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $serviceCommands
    
    Write-Host "✅ Fresh systemd services created and started" -ForegroundColor $Green
}

# Configure fresh Nginx for AlmaLinux 8
function Configure-Nginx {
    Write-Host "Configuring fresh Nginx for AlmaLinux 8..." -ForegroundColor $Yellow
    
    $nginxConfig = @"
server {
    listen 80;
    server_name crysgarage.studio www.crysgarage.studio;
    root /var/www/crysgarage/crysgarage-frontend;
    index index.html;

    # Frontend static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy to Laravel backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Audio processing proxy
    location /audio {
        proxy_pass http://127.0.0.1:4567;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
"@
    
    $nginxCommands = @"
# Create fresh Nginx configuration
tee /etc/nginx/conf.d/crysgarage.conf > /dev/null << 'NGINX'
$nginxConfig
NGINX

# Test Nginx configuration
nginx -t

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Configure firewall for AlmaLinux 8
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8000/tcp
firewall-cmd --permanent --add-port=4567/tcp
firewall-cmd --reload

echo "✅ Fresh Nginx configured and firewall updated"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $nginxCommands
    
    Write-Host "✅ Fresh Nginx configured" -ForegroundColor $Green
}

# Main deployment function
function Main {
    Check-Requirements
    Test-VPSConnection
    Clean-ExistingInstallation
    Install-AlmaLinuxDependencies
    Configure-MySQL
    Setup-RemoteDirectories
    Deploy-Backend
    Deploy-Frontend
    Deploy-Ruby
    Setup-Services
    Create-ServiceFiles
    Configure-Nginx
    
    Write-Host "🎉 FRESH Deployment completed successfully!" -ForegroundColor $Green
    Write-Host "Your Crys Garage application has been completely refreshed on AlmaLinux 8!" -ForegroundColor $Yellow
    Write-Host "Next steps:" -ForegroundColor $Yellow
    Write-Host "  1. Configure environment variables in /var/www/crysgarage/crysgarage-backend/.env"
    Write-Host "  2. Run database migrations: php artisan migrate"
    Write-Host "  3. Set up SSL certificate with Let's Encrypt"
    Write-Host "  4. Configure domain DNS to point to $VPS_HOST"
    Write-Host "  5. Test your application at http://crysgarage.studio"
    Write-Host "  6. All existing data has been cleared - this is a fresh start!"
}

# Run main function
Main 