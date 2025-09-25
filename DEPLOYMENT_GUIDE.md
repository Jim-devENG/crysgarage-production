# 🚀 Fresh VPS Deployment Guide for CrysGarage

This guide will help you completely clean your VPS server and deploy a fresh instance of CrysGarage.

## 📋 Prerequisites

- VPS server with Ubuntu/Debian
- SSH access to your VPS
- Local machine with Node.js and npm installed
- SSH client (OpenSSH, PuTTY, etc.)

## 🛠️ Quick Deployment

### Option 1: PowerShell (Windows)

```powershell
# Make sure you're in the project root directory
.\deploy_fresh.ps1 -VpsHost "your-domain.com" -VpsUser "root" -VpsPath "/var/www/crysgarage"
```

### Option 2: Bash (Linux/Mac)

```bash
# Make the script executable
chmod +x deploy_fresh.sh

# Edit the script to set your VPS details
nano deploy_fresh.sh

# Run the deployment
./deploy_fresh.sh
```

## ⚙️ Manual Configuration

Before running the deployment script, update these variables:

### In `deploy_fresh.sh`:
```bash
VPS_HOST="your-domain.com"        # Your VPS domain or IP
VPS_USER="root"                   # Your VPS username
VPS_PATH="/var/www/crysgarage"    # Deployment directory
```

### In `deploy_fresh.ps1`:
```powershell
# Pass parameters when running:
.\deploy_fresh.ps1 -VpsHost "your-domain.com" -VpsUser "root" -VpsPath "/var/www/crysgarage"
```

## 🔧 What the Script Does

### 1. **Complete Cleanup**
- Stops all running services (Nginx, PHP-FPM, Python, Node.js)
- Creates a backup of existing deployment
- Removes all old files and directories

### 2. **Local Build**
- Installs frontend dependencies
- Builds production frontend
- Prepares Python service with requirements

### 3. **VPS Deployment**
- Copies frontend build to VPS
- Copies Python service to VPS
- Copies backend (if exists) to VPS

### 4. **Environment Setup**
- Creates Python virtual environment
- Installs all Python dependencies
- Sets up proper file permissions

### 5. **Service Configuration**
- Creates systemd service files
- Configures Nginx with proper routing
- Sets up CORS headers and security

### 6. **Service Management**
- Enables and starts all services
- Configures auto-restart on failure
- Sets up proper logging

## 🌐 Service Architecture

After deployment, your services will be:

```
Internet → Nginx (Port 80) → Frontend (Static Files)
                    ↓
            Python API (Port 8002) → Audio Processing
                    ↓
            File Storage → /files/ endpoint
```

## 📁 Directory Structure

```
/var/www/crysgarage/
├── frontend/                 # Built React app
├── audio-mastering-service/  # Python FastAPI service
│   ├── venv/                # Python virtual environment
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── storage/             # File storage
└── crysgarage-backend/      # PHP backend (if exists)
```

## 🔍 Verification

After deployment, verify everything is working:

```bash
# Check service status
systemctl status crysgarage-python
systemctl status crysgarage-frontend
systemctl status nginx

# Check logs
journalctl -u crysgarage-python -f
journalctl -u crysgarage-frontend -f

# Test endpoints
curl http://your-domain.com/
curl http://your-domain.com/api/health
curl http://your-domain.com/proxy-download?file_url=test
```

## 🚨 Troubleshooting

### Python Service Not Starting
```bash
# Check Python service logs
journalctl -u crysgarage-python -f

# Check if port 8002 is in use
netstat -tlnp | grep 8002

# Restart Python service
systemctl restart crysgarage-python
```

### Frontend Not Loading
```bash
# Check if files exist
ls -la /var/www/crysgarage/frontend/

# Check Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### File Downloads Not Working
```bash
# Check file permissions
ls -la /var/www/crysgarage/audio-mastering-service/storage/

# Check Python service health
curl http://localhost:8002/health

# Check proxy endpoint
curl http://localhost:8002/proxy-download?file_url=test
```

## 🔐 Security Considerations

The deployment script sets up basic security:

- ✅ Proper file permissions (755/644)
- ✅ Security headers in Nginx
- ✅ CORS configuration
- ✅ Service isolation (www-data user)
- ✅ Auto-restart on failure

### Additional Security (Recommended)

```bash
# Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Monitoring

### Service Monitoring
```bash
# Check all services
systemctl status crysgarage-*

# Monitor logs in real-time
journalctl -u crysgarage-python -f
journalctl -u crysgarage-frontend -f
journalctl -u nginx -f
```

### Performance Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check service resource usage
systemctl show crysgarage-python --property=MemoryCurrent,CPUUsageNSec
```

## 🔄 Updates

To update your deployment:

1. Make changes locally
2. Run the deployment script again
3. The script will backup the old version and deploy fresh

## 📞 Support

If you encounter issues:

1. Check the logs: `journalctl -u crysgarage-python -f`
2. Verify service status: `systemctl status crysgarage-*`
3. Test endpoints manually: `curl http://your-domain.com/api/health`
4. Check file permissions: `ls -la /var/www/crysgarage/`

## 🎉 Success!

Once deployed, your CrysGarage application will be available at:
- **Frontend**: `http://your-domain.com`
- **API**: `http://your-domain.com/api/`
- **Files**: `http://your-domain.com/files/`

The application includes:
- ✅ Audio upload and processing
- ✅ A/B comparison player
- ✅ Advanced download settings
- ✅ Multi-tier support (Free, Professional, Advanced)
- ✅ Real-time audio effects
- ✅ File format conversion
