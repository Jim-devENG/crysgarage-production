# Crys Garage Development Tools Installation Script
Write-Host "🚀 Installing Crys Garage Development Tools..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  This script should be run as Administrator for best results" -ForegroundColor Yellow
}

# Function to add to PATH
function Add-ToPath {
    param([string]$Path)
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    if ($currentPath -notlike "*$Path*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$Path", "Machine")
        Write-Host "✅ Added $Path to system PATH" -ForegroundColor Green
    }
}

# 1. Install Git (if not already installed)
Write-Host "📦 Installing Git..." -ForegroundColor Cyan
try {
    winget install --accept-source-agreements --accept-package-agreements Git.Git
    Add-ToPath "C:\Program Files\Git\bin"
} catch {
    Write-Host "⚠️  Git installation failed or already installed" -ForegroundColor Yellow
}

# 2. Install PHP 8.2
Write-Host "📦 Installing PHP 8.2..." -ForegroundColor Cyan
try {
    winget install --accept-source-agreements --accept-package-agreements PHP.PHP.8.2
    Add-ToPath "C:\php"
} catch {
    Write-Host "⚠️  PHP installation failed or already installed" -ForegroundColor Yellow
}

# 3. Install Ruby 3.4
Write-Host "📦 Installing Ruby 3.4..." -ForegroundColor Cyan
try {
    winget install --accept-source-agreements --accept-package-agreements RubyInstallerTeam.Ruby.3.4
    Add-ToPath "C:\Ruby34-x64\bin"
} catch {
    Write-Host "⚠️  Ruby installation failed or already installed" -ForegroundColor Yellow
}

# 4. Install Composer
Write-Host "📦 Installing Composer..." -ForegroundColor Cyan
try {
    # Download Composer installer
    Invoke-WebRequest -Uri "https://getcomposer.org/installer" -OutFile "composer-setup.php"
    
    # Create Composer directory
    New-Item -ItemType Directory -Force -Path "C:\composer"
    
    # Install Composer
    php composer-setup.php --install-dir=C:\composer --filename=composer
    
    # Add to PATH
    Add-ToPath "C:\composer"
    
    # Clean up
    Remove-Item "composer-setup.php" -Force
    
    Write-Host "✅ Composer installed successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Composer installation failed" -ForegroundColor Yellow
}

# 5. Install Docker Desktop (optional)
Write-Host "📦 Installing Docker Desktop..." -ForegroundColor Cyan
try {
    winget install --accept-source-agreements --accept-package-agreements Docker.DockerDesktop
    Write-Host "✅ Docker Desktop installed successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker Desktop installation failed or already installed" -ForegroundColor Yellow
}

Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal/PowerShell" -ForegroundColor White
Write-Host "2. Navigate to crysgarage-frontend and run: npm run dev" -ForegroundColor White
Write-Host "3. Navigate to crysgarage-backend and run: composer install" -ForegroundColor White
Write-Host "4. Navigate to crysgarage-ruby and run: bundle install" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5176" -ForegroundColor White
Write-Host "- Backend: http://localhost:8000" -ForegroundColor White
Write-Host "- Ruby Service: http://localhost:4567" -ForegroundColor White
