# 🚀 Crys Garage Fast Deployment System

A comprehensive deployment system that enables rapid development and deployment from local development to VPS via GitHub.

## 📋 Overview

This system provides a complete workflow for:
1. **Local Development** → **GitHub Push** → **Automatic VPS Deployment**
2. **One-command deployment** from your local machine
3. **Automatic service management** on the VPS
4. **Health monitoring** and auto-repair capabilities

## 🏗️ System Architecture

```
Local Development → Git Push → GitHub Actions → VPS Deployment
     ↓                    ↓           ↓              ↓
  React Frontend    Repository   Workflow      Systemd Services
  Laravel Backend   Changes      Trigger       Nginx Proxy
  Ruby Service      Commit       SSH Action    SSL Certificate
```

## 📁 Scripts Overview

### 🖥️ Local Development Scripts

| Script | Purpose | Platform |
|--------|---------|----------|
| `fast_deploy.bat` | Windows batch deployment | Windows |
| `fast_deploy.ps1` | PowerShell deployment | Windows |
| `deploy_to_vps.bat` | Legacy deployment | Windows |
| `deploy_to_vps.ps1` | Legacy PowerShell | Windows |

### 🌐 VPS Deployment Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `fast-deploy.yml` | GitHub Actions workflow | `.github/workflows/` |
| `deploy_vps_simple.sh` | Simple VPS deployment | VPS |
| `setup_vps_for_fast_deploy.sh` | Complete VPS setup | VPS |
| `check_health.sh` | Service health monitoring | VPS |

### 🔧 Service Management

| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| `crysgarage-frontend.service` | 5173 | React Development Server | ✅ Active |
| `crysgarage-backend.service` | 8000 | Laravel API Server | ✅ Active |
| `crysgarage-ruby.service` | 4567 | Ruby Audio Processing | ✅ Active |
| `nginx` | 80/443 | Reverse Proxy & SSL | ✅ Active |

## 🚀 Quick Start

### 1. Initial VPS Setup (One-time)

```bash
# SSH into your VPS
ssh root@209.74.80.162

# Run the complete setup script
curl -sSL https://raw.githubusercontent.com/Jim-devENG/Crysgarage/master/setup_vps_for_fast_deploy.sh | bash
```

### 2. Local Development Workflow

#### Option A: Windows Batch (Recommended)
```cmd
# Run from project root
fast_deploy.bat
```

#### Option B: PowerShell
```powershell
# Run from project root
.\fast_deploy.ps1

# With custom commit message
.\fast_deploy.ps1 -CommitMessage "Add new mastering feature"

# Skip commit (if already committed)
.\fast_deploy.ps1 -SkipCommit

# Skip push (for testing)
.\fast_deploy.ps1 -SkipPush
```

### 3. Manual VPS Deployment

```bash
# SSH into VPS
ssh root@209.74.80.162

# Navigate to project
cd /var/www/crysgarage-deploy

# Pull and deploy
git pull origin master
chmod +x deploy_vps_simple.sh
./deploy_vps_simple.sh
```

## 🔧 Configuration

### GitHub Secrets Setup

For automatic deployment, set these secrets in your GitHub repository:

1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_HOST` | `209.74.80.162` | Your VPS IP address |
| `VPS_USERNAME` | `root` | VPS username |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Your SSH private key |

### SSH Key Setup

```bash
# Generate SSH key (if not exists)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to VPS
ssh-copy-id root@209.74.80.162

# Test connection
ssh root@209.74.80.162 "echo 'SSH connection successful'"
```

## 📊 Monitoring & Health Checks

### Automatic Health Check

```bash
# On VPS
cd /var/www/crysgarage-deploy
bash check_health.sh
```

### Manual Service Status

```bash
# Check all services
systemctl status crysgarage-*

# Check specific service
systemctl status crysgarage-frontend.service
systemctl status crysgarage-backend.service
systemctl status crysgarage-ruby.service
systemctl status nginx

# View logs
journalctl -u crysgarage-frontend.service -f
journalctl -u crysgarage-backend.service -f
journalctl -u crysgarage-ruby.service -f
```

### Port Monitoring

```bash
# Check if ports are listening
netstat -tlnp | grep -E ":(5173|8000|4567|80|443)"

# Expected output:
# tcp6       0      0 :::5173                 :::*                    LISTEN
# tcp6       0      0 :::8000                 :::*                    LISTEN
# tcp6       0      0 :::4567                 :::*                    LISTEN
# tcp        0      0 0.0.0.0:80             0.0.0.0:*              LISTEN
# tcp        0      0 0.0.0.0:443            0.0.0.0:*              LISTEN
```

## 🔄 Deployment Workflow

### 1. Local Development
```bash
# Make changes to your code
# Test locally
npm run dev  # Frontend
php artisan serve  # Backend
ruby simple_ruby_service.rb  # Ruby service
```

### 2. Fast Deployment
```bash
# Run deployment script
./fast_deploy.ps1

# Script will:
# ✅ Check for changes
# ✅ Commit changes (if any)
# ✅ Push to GitHub
# ✅ Trigger GitHub Actions
# ✅ Monitor deployment
# ✅ Verify application
```

### 3. GitHub Actions Process
```yaml
# .github/workflows/fast-deploy.yml
1. Checkout code
2. SSH to VPS
3. Pull latest changes
4. Update dependencies
5. Restart services
6. Health check
```

### 4. VPS Deployment
```bash
# Automatic process on VPS:
1. git pull origin master
2. npm install (frontend)
3. composer install (backend)
4. bundle install (ruby)
5. systemctl restart services
6. nginx reload
7. health check
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. GitHub Actions Fails
```bash
# Check secrets are set correctly
# Verify SSH key permissions
# Test SSH connection manually
ssh root@209.74.80.162
```

#### 2. Services Not Starting
```bash
# Check service status
systemctl status crysgarage-*

# View detailed logs
journalctl -u crysgarage-frontend.service -n 50
journalctl -u crysgarage-backend.service -n 50
journalctl -u crysgarage-ruby.service -n 50

# Restart services manually
systemctl restart crysgarage-frontend.service
systemctl restart crysgarage-backend.service
systemctl restart crysgarage-ruby.service
```

#### 3. Port Conflicts
```bash
# Check what's using the ports
netstat -tlnp | grep -E ":(5173|8000|4567)"

# Kill conflicting processes
pkill -f "npm run dev"
pkill -f "php artisan serve"
pkill -f "ruby simple_ruby_service"
```

#### 4. Nginx Issues
```bash
# Test nginx configuration
nginx -t

# Check nginx status
systemctl status nginx

# View nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Emergency Recovery

```bash
# Complete service restart
systemctl restart crysgarage-frontend.service
systemctl restart crysgarage-backend.service
systemctl restart crysgarage-ruby.service
systemctl restart nginx

# Full health check
bash /var/www/crysgarage-deploy/check_health.sh
```

## 📈 Performance Optimization

### Frontend Optimization
```bash
# Build for production
cd crysgarage-frontend
npm run build

# Serve static files with nginx
# (Configure nginx to serve /dist directory)
```

### Backend Optimization
```bash
# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### Ruby Service Optimization
```bash
# Install production gems only
bundle install --without development test
```

## 🔒 Security Considerations

### SSL/TLS
- Automatic SSL certificate with Let's Encrypt
- HTTPS enforcement
- Secure headers configuration

### Firewall
```bash
# Configure firewall (if needed)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### SSH Security
```bash
# Disable password authentication
# Use SSH keys only
# Change default SSH port (optional)
```

## 📞 Support

### Useful Commands

```bash
# Quick status check
systemctl status crysgarage-*

# View recent logs
journalctl -u crysgarage-* --since "10 minutes ago"

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Emergency Contacts

- **VPS Provider**: Your VPS hosting provider
- **Domain Registrar**: Your domain registrar
- **GitHub Support**: For repository issues

## 🎯 Best Practices

1. **Always test locally** before deploying
2. **Use meaningful commit messages**
3. **Monitor deployment logs** in GitHub Actions
4. **Set up alerts** for service failures
5. **Regular backups** of your VPS
6. **Keep dependencies updated**
7. **Monitor application performance**

## 📝 Changelog

### v1.0.0 - Initial Release
- ✅ Complete fast deployment system
- ✅ GitHub Actions automation
- ✅ Systemd service management
- ✅ Health monitoring
- ✅ SSL certificate automation
- ✅ Comprehensive documentation

---

**Last Updated**: $(Get-Date)
**Version**: 1.0.0
**Maintainer**: Crys Garage Development Team 