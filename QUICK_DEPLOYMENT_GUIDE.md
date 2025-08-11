# Quick Deployment Guide for Crys Garage VPS

## 🚀 Your VPS Details

- **IP Address**: 209.74.80.162
- **Domain**: crysgarage.studio
- **OS**: AlmaLinux 8 (64-bit)
- **Specs**: 6GB RAM, 120GB Storage
- **User**: root

## 📋 Prerequisites

### 1. Set Up SSH Key Authentication

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to VPS
ssh-copy-id root@209.74.80.162
```

### 2. Test Connection

```bash
ssh root@209.74.80.162 "echo 'Connection successful'"
```

## 🎯 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```powershell
# Run the AlmaLinux-specific deployment script
.\deploy_to_almalinux.ps1
```

### Option 2: Manual Deployment

```bash
# 1. Create directories on VPS
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage/{crysgarage-backend,crysgarage-frontend,crysgarage-ruby}"

# 2. Copy files using rsync
rsync -avz --exclude='vendor/' --exclude='node_modules/' --exclude='.env' crysgarage-backend/ root@209.74.80.162:/var/www/crysgarage/crysgarage-backend/
rsync -avz --exclude='node_modules/' crysgarage-frontend/ root@209.74.80.162:/var/www/crysgarage/crysgarage-frontend/
rsync -avz crysgarage-ruby/ root@209.74.80.162:/var/www/crysgarage/crysgarage-ruby/
```

## ⚙️ Post-Deployment Configuration

### 1. SSH into your VPS

```bash
ssh root@209.74.80.162
```

### 2. Configure Laravel Environment

```bash
cd /var/www/crysgarage/crysgarage-backend
cp .env.example .env
php artisan key:generate
nano .env
```

### 3. Update .env File

```env
APP_NAME="Crys Garage"
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_URL=https://crysgarage.studio

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crysgarage
DB_USERNAME=crysgarage_user
DB_PASSWORD=CrysGarage2024!

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.crysgarage.studio
MAIL_PORT=587
MAIL_USERNAME=your_email@crysgarage.studio
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@crysgarage.studio
MAIL_FROM_NAME="${APP_NAME}"
```

### 4. Install Dependencies and Run Migrations

```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Set proper permissions
chown -R nginx:nginx /var/www/crysgarage
chmod -R 755 /var/www/crysgarage/crysgarage-backend/storage
chmod -R 755 /var/www/crysgarage/crysgarage-backend/bootstrap/cache

# Run migrations
php artisan migrate --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Set Up Frontend

```bash
cd /var/www/crysgarage/crysgarage-frontend
npm install
npm run build
```

### 6. Set Up Ruby Audio Processor

```bash
cd /var/www/crysgarage/crysgarage-ruby
bundle install
```

## 🔧 Service Management

### Check Service Status

```bash
systemctl status crysgarage-backend
systemctl status crysgarage-ruby
systemctl status nginx
systemctl status mysqld
```

### Restart Services

```bash
systemctl restart crysgarage-backend
systemctl restart crysgarage-ruby
systemctl restart nginx
```

### View Logs

```bash
journalctl -u crysgarage-backend -f
journalctl -u crysgarage-ruby -f
tail -f /var/log/nginx/error.log
```

## 🌐 Domain Configuration

### 1. Configure DNS

Point your domain `crysgarage.studio` to your VPS IP:

- **A Record**: crysgarage.studio → 209.74.80.162
- **A Record**: www.crysgarage.studio → 209.74.80.162

### 2. Set Up SSL Certificate

```bash
# Install Certbot
dnf install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d crysgarage.studio -d www.crysgarage.studio
```

## 🔍 Testing Your Deployment

### 1. Test Backend API

```bash
curl http://209.74.80.162:8000/api/health
```

### 2. Test Frontend

Visit: http://crysgarage.studio

### 3. Test Audio Processing

```bash
curl http://209.74.80.162:4567/health
```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   chown -R nginx:nginx /var/www/crysgarage
   chmod -R 755 /var/www/crysgarage
   ```

2. **Service Not Starting**

   ```bash
   journalctl -u crysgarage-backend -f
   journalctl -u crysgarage-ruby -f
   ```

3. **Database Connection Issues**

   ```bash
   mysql -u root -p
   SHOW DATABASES;
   SELECT User, Host FROM mysql.user;
   ```

4. **Nginx Configuration Errors**
   ```bash
   nginx -t
   systemctl status nginx
   ```

## 📊 Monitoring

### Check System Resources

```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check CPU usage
top

# Check running services
systemctl list-units --type=service --state=running
```

### Set Up Monitoring

```bash
# Install monitoring tools
dnf install -y htop iotop nethogs

# Monitor logs
tail -f /var/www/crysgarage/crysgarage-backend/storage/logs/laravel.log
```

## 🔒 Security Checklist

- [ ] SSH key authentication enabled
- [ ] Root login disabled (optional)
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Database user has limited privileges
- [ ] Environment variables secured
- [ ] Regular backups scheduled

## 🎉 Success!

Your Crys Garage application should now be running at:

- **Frontend**: https://crysgarage.studio
- **API**: https://crysgarage.studio/api
- **Audio Processing**: https://crysgarage.studio/audio

## 📞 Support

If you encounter any issues:

1. Check the logs: `journalctl -u crysgarage-backend -f`
2. Verify services are running: `systemctl status crysgarage-*`
3. Test connectivity: `curl http://209.74.80.162:8000`
4. Check firewall: `firewall-cmd --list-all`
