#!/bin/bash

# SSH Key Setup Script for CrysGarage VPS
# This script will generate SSH keys and set up passwordless authentication

echo "🔑 Setting up SSH key authentication for CrysGarage VPS..."

# Step 1: Check if SSH key already exists
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
SSH_PUB_KEY_PATH="$HOME/.ssh/id_rsa.pub"

if [ -f "$SSH_KEY_PATH" ]; then
    echo "✅ SSH key already exists at: $SSH_KEY_PATH"
    read -p "Do you want to overwrite existing key? (y/N): " overwrite
    if [[ $overwrite =~ ^[Yy]$ ]]; then
        rm -f "$SSH_KEY_PATH" "$SSH_PUB_KEY_PATH"
    else
        echo "Using existing SSH key..."
    fi
fi

# Step 2: Generate SSH key if it doesn't exist
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "🔧 Generating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "crysgarage-vps@$(date +%Y-%m-%d)"
    
    if [ ! -f "$SSH_KEY_PATH" ]; then
        echo "❌ Failed to generate SSH key!"
        exit 1
    fi
    echo "✅ SSH key generated successfully!"
fi

# Step 3: Read the public key
echo "📋 Reading public key..."
PUBLIC_KEY=$(cat "$SSH_PUB_KEY_PATH")
echo "Public key: $PUBLIC_KEY"

# Step 4: Set up authorized_keys
echo "⚙️ Setting up authorized_keys..."
mkdir -p ~/.ssh
echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 "$SSH_KEY_PATH"
chmod 644 "$SSH_PUB_KEY_PATH"

echo "✅ SSH key authentication set up successfully!"

# Step 5: Create deployment script
echo "📝 Creating deployment script..."
cat > deploy_vps.sh << 'EOF'
#!/bin/bash

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
EOF

chmod +x deploy_vps.sh
echo "✅ Deployment script created: deploy_vps.sh"

# Step 6: Create SSH config for easier connection
echo "⚙️ Creating SSH config..."
cat > ~/.ssh/config << EOF
Host crysgarage-vps
    HostName localhost
    User root
    IdentityFile ~/.ssh/id_rsa
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF

chmod 600 ~/.ssh/config
echo "✅ SSH config created at: ~/.ssh/config"

echo ""
echo "🎉 SSH key setup completed!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Copy your public key to your local machine:"
echo "   cat ~/.ssh/id_rsa.pub"
echo ""
echo "2. Add this key to your local SSH config for passwordless connection"
echo ""
echo "3. Deploy the application:"
echo "   bash deploy_vps.sh"
echo ""
echo "4. Test passwordless connection from your local machine:"
echo "   ssh root@YOUR_SERVER_IP"
echo "" 