# Crys Garage VPS Deployment Script (PowerShell)
# Customize the variables below with your VPS details

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

Write-Host "🚀 Starting Crys Garage VPS Deployment" -ForegroundColor $Green

# Check if required tools are installed
function Check-Requirements {
    Write-Host "Checking requirements..." -ForegroundColor $Yellow
    
    # Check if rsync is available (Windows users might need to install it)
    try {
        $null = Get-Command rsync -ErrorAction Stop
        Write-Host "✅ rsync found" -ForegroundColor $Green
    }
    catch {
        Write-Host "❌ rsync not found. Please install rsync for Windows or use an alternative." -ForegroundColor $Red
        Write-Host "You can install rsync via:"
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
    Write-Host "Testing SSH connection to VPS..." -ForegroundColor $Yellow
    
    try {
        $testResult = ssh -p $VPS_PORT -o ConnectTimeout=10 -o BatchMode=yes "${VPS_USER}@${VPS_HOST}" "echo 'Connection successful'" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH connection successful" -ForegroundColor $Green
        }
        else {
            throw "Connection failed"
        }
    }
    catch {
        Write-Host "❌ SSH connection failed. Please check your VPS details." -ForegroundColor $Red
        Write-Host "Make sure to:" -ForegroundColor $Yellow
        Write-Host "  1. Update VPS_USER, VPS_HOST, and VPS_PORT variables in this script"
        Write-Host "  2. Set up SSH key authentication or have password ready"
        Write-Host "  3. Ensure the VPS is accessible"
        exit 1
    }
}

# Create remote directory structure
function Setup-RemoteDirectories {
    Write-Host "Setting up remote directory structure..." -ForegroundColor $Yellow
    
    $setupCommands = @"
mkdir -p /var/www/crysgarage
mkdir -p /var/www/crysgarage/crysgarage-backend
mkdir -p /var/www/crysgarage/crysgarage-frontend
mkdir -p /var/www/crysgarage/crysgarage-ruby
mkdir -p /var/www/crysgarage/logs
mkdir -p /var/www/crysgarage/backups
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $setupCommands
    
    Write-Host "✅ Remote directories created" -ForegroundColor $Green
}

# Deploy backend
function Deploy-Backend {
    Write-Host "Deploying Laravel backend..." -ForegroundColor $Yellow
    
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
    
    $rsyncArgs = @("-avz", "--progress") + $excludeArgs + @("-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\crysgarage-backend\", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/crysgarage-backend/")
    
    & rsync @rsyncArgs
    
    Write-Host "✅ Backend deployed" -ForegroundColor $Green
}

# Deploy frontend
function Deploy-Frontend {
    Write-Host "Deploying React frontend..." -ForegroundColor $Yellow
    
    # Build the frontend for production
    Write-Host "Building frontend for production..." -ForegroundColor $Yellow
    Set-Location "crysgarage-frontend"
    npm run build
    Set-Location $LOCAL_PROJECT_PATH
    
    # Deploy built files
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
    
    $rsyncArgs = @("-avz", "--progress") + $excludeArgs + @("-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\crysgarage-frontend\dist\", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/crysgarage-frontend/")
    
    & rsync @rsyncArgs
    
    Write-Host "✅ Frontend deployed" -ForegroundColor $Green
}

# Deploy Ruby audio processor
function Deploy-Ruby {
    Write-Host "Deploying Ruby audio processor..." -ForegroundColor $Yellow
    
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
    
    $rsyncArgs = @("-avz", "--progress") + $excludeArgs + @("-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\crysgarage-ruby\", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/crysgarage-ruby/")
    
    & rsync @rsyncArgs
    
    Write-Host "✅ Ruby audio processor deployed" -ForegroundColor $Green
}

# Deploy configuration files
function Deploy-Config {
    Write-Host "Deploying configuration files..." -ForegroundColor $Yellow
    
    $rsyncArgs = @("-avz", "--progress", "-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\README.md", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/")
    & rsync @rsyncArgs
    
    $rsyncArgs = @("-avz", "--progress", "-e", "ssh -p $VPS_PORT", "${LOCAL_PROJECT_PATH}\.gitignore", "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/")
    & rsync @rsyncArgs
    
    Write-Host "✅ Configuration files deployed" -ForegroundColor $Green
}

# Setup services on VPS
function Setup-Services {
    Write-Host "Setting up services on VPS..." -ForegroundColor $Yellow
    
    $setupCommands = @"
cd /var/www/crysgarage

# Install backend dependencies
echo "Installing Laravel dependencies..."
cd crysgarage-backend
composer install --no-dev --optimize-autoloader

# Set proper permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
cd ../crysgarage-frontend
npm install
npm run build

# Install Ruby dependencies
echo "Installing Ruby dependencies..."
cd ../crysgarage-ruby
bundle install

echo "✅ Services setup completed"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $setupCommands
    
    Write-Host "✅ Services setup completed" -ForegroundColor $Green
}

# Create systemd service files
function Create-ServiceFiles {
    Write-Host "Creating systemd service files..." -ForegroundColor $Yellow
    
    $laravelService = @"
[Unit]
Description=Crys Garage Laravel Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
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
User=www-data
Group=www-data
WorkingDirectory=/var/www/crysgarage/crysgarage-ruby
ExecStart=/usr/bin/ruby mastering_server.rb
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"@
    
    $serviceCommands = @"
sudo tee /etc/systemd/system/crysgarage-backend.service > /dev/null << 'SERVICE'
$laravelService
SERVICE

sudo tee /etc/systemd/system/crysgarage-ruby.service > /dev/null << 'SERVICE'
$rubyService
SERVICE

# Reload systemd and enable services
sudo systemctl daemon-reload
sudo systemctl enable crysgarage-backend
sudo systemctl enable crysgarage-ruby
sudo systemctl start crysgarage-backend
sudo systemctl start crysgarage-ruby

echo "✅ Systemd services created and started"
"@
    
    ssh -p $VPS_PORT "${VPS_USER}@${VPS_HOST}" $serviceCommands
    
    Write-Host "✅ Systemd services created and started" -ForegroundColor $Green
}

# Main deployment function
function Main {
    Check-Requirements
    Test-VPSConnection
    Setup-RemoteDirectories
    Deploy-Backend
    Deploy-Frontend
    Deploy-Ruby
    Deploy-Config
    Setup-Services
    Create-ServiceFiles
    
    Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green
    Write-Host "Next steps:" -ForegroundColor $Yellow
    Write-Host "  1. Configure your web server (nginx/apache) to serve the frontend"
    Write-Host "  2. Set up environment variables in /var/www/crysgarage/crysgarage-backend/.env"
    Write-Host "  3. Run database migrations: php artisan migrate"
    Write-Host "  4. Configure SSL certificates"
    Write-Host "  5. Set up monitoring and logging"
}

# Run main function
Main 