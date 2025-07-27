# Fresh Deployment Guide for Crys Garage VPS

## ⚠️ **IMPORTANT: This will COMPLETELY OVERRIDE existing installation**

This deployment will:

- **Stop and remove** all existing Crys Garage services
- **Delete** the entire `/var/www/crysgarage` directory
- **Drop and recreate** the database (all data will be lost)
- **Remove** existing Nginx configurations
- **Clear** all logs and cache files
- **Install fresh** copies of all files

## 🚀 **Your VPS Details**

- **IP Address**: 209.74.80.162
- **Domain**: crysgarage.studio
- **OS**: AlmaLinux 8 (64-bit)
- **Specs**: 6GB RAM, 120GB Storage
- **User**: root

## 📋 **Prerequisites**

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

## 🎯 **Fresh Deployment**

### Run the Fresh Deployment Script

```powershell
# Run the fresh deployment script (WILL OVERRIDE EVERYTHING)
.\deploy_to_almalinux_fresh.ps1
```

## 🧹 **What the Fresh Deployment Does**

### 1. **Cleans Existing Installation**

- Stops all existing services
- Removes service files
- Deletes entire `/var/www/crysgarage` directory
- Removes Nginx configurations
- Drops existing database
- Clears all logs and cache

### 2. **Fresh Installation**

- Installs all required software
- Creates new database and user
- Deploys fresh application files
- Sets up new services
- Configures fresh Nginx

### 3. **Complete Override**

- Uses `--delete` flag with rsync to remove old files
- Creates fresh systemd services
- Sets up new firewall rules
- Installs fresh dependencies

## ⚙️ **Post-Fresh Deployment Configuration**

### 1. SSH into your VPS

```bash
ssh root@209.74.80.162
```

### 2. Configure Fresh Laravel Environment

```bash
cd /var/www/crysgarage/crysgarage-backend
cp .env.example .env
php artisan key:generate
nano .env
```

### 3. Update Fresh .env File

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

### 4. Run Fresh Migrations

```bash
# Run fresh migrations (database is empty)
php artisan migrate --force

# Clear and cache fresh config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🔧 **Fresh Service Management**

### Check Fresh Service Status

```bash
systemctl status crysgarage-backend
systemctl status crysgarage-ruby
systemctl status nginx
systemctl status mysqld
```

### Restart Fresh Services

```bash
systemctl restart crysgarage-backend
systemctl restart crysgarage-ruby
systemctl restart nginx
```

### View Fresh Logs

```bash
journalctl -u crysgarage-backend -f
journalctl -u crysgarage-ruby -f
tail -f /var/log/nginx/error.log
```

## 🌐 **Fresh Domain Configuration**

### 1. Configure DNS

Point your domain `crysgarage.studio` to your VPS IP:

- **A Record**: crysgarage.studio → 209.74.80.162
- **A Record**: www.crysgarage.studio → 209.74.80.162

### 2. Set Up Fresh SSL Certificate

```bash
# Install Certbot
dnf install -y certbot python3-certbot-nginx

# Obtain fresh SSL certificate
certbot --nginx -d crysgarage.studio -d www.crysgarage.studio
```

## 🔍 **Testing Fresh Deployment**

### 1. Test Fresh Backend API

```bash
curl http://209.74.80.162:8000/api/health
```

### 2. Test Fresh Frontend

Visit: http://crysgarage.studio

### 3. Test Fresh Audio Processing

```bash
curl http://209.74.80.162:4567/health
```

## 🛠️ **Fresh Troubleshooting**

### Common Issues After Fresh Deployment

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

## 📊 **Fresh Monitoring**

### Check Fresh System Resources

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

### Set Up Fresh Monitoring

```bash
# Install monitoring tools
dnf install -y htop iotop nethogs

# Monitor fresh logs
tail -f /var/www/crysgarage/crysgarage-backend/storage/logs/laravel.log
```

## 🔒 **Fresh Security Checklist**

- [ ] SSH key authentication enabled
- [ ] Root login disabled (optional)
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Database user has limited privileges
- [ ] Environment variables secured
- [ ] Regular backups scheduled

## 🎉 **Fresh Success!**

Your Crys Garage application has been completely refreshed and is now running at:

- **Frontend**: https://crysgarage.studio
- **API**: https://crysgarage.studio/api
- **Audio Processing**: https://crysgarage.studio/audio

## ⚠️ **Important Notes**

1. **All existing data has been deleted** - this is a completely fresh start
2. **Database is empty** - you'll need to run migrations
3. **All configurations are fresh** - update environment variables
4. **All logs are cleared** - new logs will be generated
5. **All cache is cleared** - fresh cache will be built

## 📞 **Fresh Support**

If you encounter any issues after the fresh deployment:

1. Check the fresh logs: `journalctl -u crysgarage-backend -f`
2. Verify fresh services are running: `systemctl status crysgarage-*`
3. Test fresh connectivity: `curl http://209.74.80.162:8000`
4. Check fresh firewall: `firewall-cmd --list-all`
