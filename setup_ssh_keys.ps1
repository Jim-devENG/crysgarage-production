# SSH Key Setup Script for CrysGarage VPS
# This script will generate SSH keys and set up passwordless authentication

param(
    [Parameter(Mandatory = $true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory = $true)]
    [string]$Username = "root"
)

Write-Host "🔑 Setting up SSH key authentication for CrysGarage VPS..." -ForegroundColor Green

# Step 1: Check if SSH key already exists
$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
$sshPubKeyPath = "$env:USERPROFILE\.ssh\id_rsa.pub"

if (Test-Path $sshKeyPath) {
    Write-Host "✅ SSH key already exists at: $sshKeyPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite existing key? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Using existing SSH key..." -ForegroundColor Green
    }
    else {
        Remove-Item $sshKeyPath -Force -ErrorAction SilentlyContinue
        Remove-Item $sshPubKeyPath -Force -ErrorAction SilentlyContinue
    }
}

# Step 2: Generate SSH key if it doesn't exist
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "🔧 Generating new SSH key..." -ForegroundColor Blue
    ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""' -C "crysgarage-vps@$(Get-Date -Format 'yyyy-MM-dd')"
    
    if (-not (Test-Path $sshKeyPath)) {
        Write-Host "❌ Failed to generate SSH key!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ SSH key generated successfully!" -ForegroundColor Green
}

# Step 3: Read the public key
Write-Host "📋 Reading public key..." -ForegroundColor Blue
$publicKey = Get-Content $sshPubKeyPath -Raw
$publicKey = $publicKey.Trim()

Write-Host "Public key: $publicKey" -ForegroundColor Cyan

# Step 4: Create SSH config for easier connection
Write-Host "⚙️ Creating SSH config..." -ForegroundColor Blue
$sshConfigPath = "$env:USERPROFILE\.ssh\config"
$sshConfigContent = @"

Host crysgarage-vps
    HostName $ServerIP
    User $Username
    IdentityFile $sshKeyPath
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

"@

# Create .ssh directory if it doesn't exist
if (-not (Test-Path "$env:USERPROFILE\.ssh")) {
    New-Item -Path "$env:USERPROFILE\.ssh" -ItemType Directory -Force | Out-Null
}

# Write config file
$sshConfigContent | Out-File -FilePath $sshConfigPath -Encoding UTF8 -Force
Write-Host "✅ SSH config created at: $sshConfigPath" -ForegroundColor Green

# Step 5: Create deployment script
Write-Host "📝 Creating deployment script..." -ForegroundColor Blue
$deployScript = @"
# CrysGarage VPS Deployment Script
# Run this script to deploy the application

echo "🚀 Starting CrysGarage VPS deployment..."

# Update system
yum update -y

# Install EPEL repository
yum install -y epel-release

# Install PHP and extensions
yum install -y php php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-gd php-bcmath php-soap php-intl php-redis php-sqlite3

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Ruby and Bundler
yum install -y ruby ruby-devel gcc gcc-c++ make
gem install bundler

# Install MySQL and Nginx
yum install -y mysql-server mysql nginx

# Install FFmpeg
yum install -y ffmpeg

# Start services
systemctl start mysqld
systemctl enable mysqld
systemctl start nginx
systemctl enable nginx
systemctl start php-fpm
systemctl enable php-fpm

# Create deployment directory
mkdir -p /var/www/crysgarage-deploy
cd /var/www/crysgarage-deploy

# Clone repository
git clone https://github.com/Jim-devENG/Crysgarage.git .

echo "✅ Deployment completed!"
"@

$deployScript | Out-File -FilePath "deploy_vps.sh" -Encoding UTF8 -Force
Write-Host "✅ Deployment script created: deploy_vps.sh" -ForegroundColor Green

# Step 6: Instructions for manual key upload
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Connect to your VPS manually (one last time with password):" -ForegroundColor White
Write-Host "   ssh $Username@$ServerIP" -ForegroundColor Cyan
Write-Host "`n2. Run these commands on your VPS:" -ForegroundColor White
Write-Host "   mkdir -p ~/.ssh" -ForegroundColor Cyan
Write-Host "   echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "   chmod 700 ~/.ssh" -ForegroundColor Cyan
Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "`n3. Test passwordless connection:" -ForegroundColor White
Write-Host "   ssh crysgarage-vps" -ForegroundColor Cyan
Write-Host "`n4. Deploy the application:" -ForegroundColor White
Write-Host "   bash deploy_vps.sh" -ForegroundColor Cyan

Write-Host "`n🎉 SSH key setup completed! Follow the steps above to complete the setup." -ForegroundColor Green 