# Crys Garage VPS Deployment Guide

This guide will help you deploy your Crys Garage project to a VPS (Virtual Private Server).

## Prerequisites

### VPS Requirements

- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **CPU**: 2+ cores recommended

### Required Software on VPS

- PHP 8.0+
- Node.js 16+
- Ruby 3.0+
- Composer
- npm/yarn
- MySQL/PostgreSQL
- Nginx/Apache
- FFmpeg (for audio processing)

## Step 1: Prepare Your VPS

### 1.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Software

```bash
# Install PHP and extensions
sudo apt install php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-gd php8.1-bcmath php8.1-soap php8.1-intl php8.1-redis php8.1-sqlite3

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Ruby
sudo apt install ruby ruby-dev ruby-bundler build-essential

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install FFmpeg
sudo apt install ffmpeg

# Install MySQL
sudo apt install mysql-server

# Install Nginx
sudo apt install nginx
```

### 1.3 Configure MySQL

```bash
sudo mysql_secure_installation
sudo mysql -u root -p
```

```sql
CREATE DATABASE crysgarage;
CREATE USER 'crysgarage_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON crysgarage.* TO 'crysgarage_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 2: Configure Deployment Script

### 2.1 Update VPS Connection Details

Edit the deployment script (`deploy_to_vps.ps1` for Windows or `deploy_to_vps.sh` for Linux):

```powershell
# Update these variables with your VPS details
$VPS_USER = "your_actual_username"
$VPS_HOST = "your_vps_ip_or_domain"
$VPS_PORT = "22"
$VPS_PATH = "/var/www/crysgarage"
```

### 2.2 Set Up SSH Key Authentication (Recommended)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to VPS
ssh-copy-id your_username@your_vps_ip
```

## Step 3: Deploy Your Application

### 3.1 Run the Deployment Script

```powershell
# For Windows PowerShell
.\deploy_to_vps.ps1

# For Linux/Mac
chmod +x deploy_to_vps.sh
./deploy_to_vps.sh
```

### 3.2 Manual Deployment (Alternative)

If the script doesn't work, you can deploy manually:

```bash
# 1. Create directories on VPS
ssh your_username@your_vps_ip "mkdir -p /var/www/crysgarage/{crysgarage-backend,crysgarage-frontend,crysgarage-ruby}"

# 2. Copy files using rsync
rsync -avz --exclude='vendor/' --exclude='node_modules/' --exclude='.env' crysgarage-backend/ your_username@your_vps_ip:/var/www/crysgarage/crysgarage-backend/
rsync -avz --exclude='node_modules/' crysgarage-frontend/ your_username@your_vps_ip:/var/www/crysgarage/crysgarage-frontend/
rsync -avz crysgarage-ruby/ your_username@your_vps_ip:/var/www/crysgarage/crysgarage-ruby/
```

## Step 4: Configure Environment

### 4.1 Set Up Laravel Environment

```bash
# SSH into your VPS
ssh your_username@your_vps_ip

# Navigate to backend directory
cd /var/www/crysgarage/crysgarage-backend

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Edit .env file with your production settings
nano .env
```

### 4.2 Configure .env File

```env
APP_NAME="Crys Garage"
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crysgarage
DB_USERNAME=crysgarage_user
DB_PASSWORD=your_secure_password

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=your_email@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 4.3 Install Dependencies and Run Migrations

```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Set proper permissions
sudo chown -R www-data:www-data /var/www/crysgarage
sudo chmod -R 755 /var/www/crysgarage/crysgarage-backend/storage
sudo chmod -R 755 /var/www/crysgarage/crysgarage-backend/bootstrap/cache

# Run migrations
php artisan migrate --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4.4 Set Up Frontend

```bash
# Navigate to frontend directory
cd /var/www/crysgarage/crysgarage-frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 4.5 Set Up Ruby Audio Processor

```bash
# Navigate to Ruby directory
cd /var/www/crysgarage/crysgarage-ruby

# Install Ruby dependencies
bundle install

# Test the audio processor
ruby test_mastering.rb
```

## Step 5: Configure Web Server

### 5.1 Nginx Configuration

Create `/etc/nginx/sites-available/crysgarage`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/crysgarage/crysgarage-frontend;
    index index.html;

    # Frontend static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to Laravel backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Audio processing proxy
    location /audio {
        proxy_pass http://127.0.0.1:4567;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/crysgarage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Set Up Systemd Services

### 6.1 Create Service Files

Create `/etc/systemd/system/crysgarage-backend.service`:

```ini
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
```

Create `/etc/systemd/system/crysgarage-ruby.service`:

```ini
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
```

### 6.2 Enable and Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable crysgarage-backend
sudo systemctl enable crysgarage-ruby
sudo systemctl start crysgarage-backend
sudo systemctl start crysgarage-ruby

# Check status
sudo systemctl status crysgarage-backend
sudo systemctl status crysgarage-ruby
```

## Step 7: SSL Configuration

### 7.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Monitoring and Maintenance

### 8.1 Set Up Log Rotation

Create `/etc/logrotate.d/crysgarage`:

```
/var/www/crysgarage/crysgarage-backend/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### 8.2 Set Up Backup Script

Create `/var/www/crysgarage/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/www/crysgarage/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u crysgarage_user -p crysgarage > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/crysgarage

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 8.3 Set Up Cron Jobs

```bash
# Edit crontab
crontab -e

# Add these lines:
0 2 * * * /var/www/crysgarage/backup.sh
0 3 * * * cd /var/www/crysgarage/crysgarage-backend && php artisan queue:work --stop-when-empty
```

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   sudo chown -R www-data:www-data /var/www/crysgarage
   sudo chmod -R 755 /var/www/crysgarage
   ```

2. **Service Not Starting**

   ```bash
   sudo journalctl -u crysgarage-backend -f
   sudo journalctl -u crysgarage-ruby -f
   ```

3. **Database Connection Issues**

   ```bash
   sudo mysql -u root -p
   SHOW DATABASES;
   SELECT User, Host FROM mysql.user;
   ```

4. **Nginx Configuration Errors**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] SSL certificate installed
- [ ] Database user has limited privileges
- [ ] Environment variables secured
- [ ] Log files properly configured
- [ ] Regular backups scheduled
- [ ] Security updates automated

## Performance Optimization

1. **Enable OPcache for PHP**
2. **Configure Redis for caching**
3. **Set up CDN for static assets**
4. **Optimize database queries**
5. **Enable gzip compression**
6. **Configure browser caching**

Your Crys Garage application should now be successfully deployed and running on your VPS!
