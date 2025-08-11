# 🚀 Crys Garage Deployment Guide

## Overview
Your Crys Garage application is now running in Docker containers with a complete deployment pipeline.

## 📋 Deployment Methods

### 1. **Full Deployment Pipeline** (Recommended for major changes)
```bash
# From your local machine
.\deploy_pipeline.bat
```
**What it does:**
- Pushes all changes to Git
- Pulls changes on VPS
- Rebuilds Docker containers
- Restarts all services
- Tests the application

### 2. **Quick Deploy** (For small changes)
```bash
# From your local machine
.\quick_deploy.bat
```
**What it does:**
- Pushes changes to Git
- Pulls changes on VPS
- Restarts containers (no rebuild)
- Faster deployment

### 3. **Manual VPS Deployment**
```bash
# SSH into VPS and run
ssh root@209.74.80.162
cd /var/www/crysgarage-deploy
./deploy.sh
```

## 🐳 Docker Management

### Check Container Status
```bash
# From local machine
.\docker_management.bat
# Then select option 4 (Check status)
```

### View Logs
```bash
# From local machine
.\docker_management.bat
# Then select option 5 (View logs)
```

### Restart Services
```bash
# From local machine
.\docker_management.bat
# Then select option 3 (Restart containers)
```

## 📁 Project Structure

```
Crys Garage/
├── crysgarage-frontend/     # React application
├── crysgarage-backend/      # Laravel API
├── crysgarage-ruby/         # Ruby audio service
├── deploy_pipeline.bat      # Full deployment script
├── quick_deploy.bat         # Quick deployment script
├── docker_management.bat    # Docker management tool
└── README_DEPLOYMENT.md     # This file
```

## 🔧 Development Workflow

### 1. Make Changes Locally
- Edit files in your local project
- Test changes locally

### 2. Deploy Changes
```bash
# For major changes
.\deploy_pipeline.bat

# For small changes
.\quick_deploy.bat
```

### 3. Verify Deployment
- Check https://crysgarage.studio
- Use `.\docker_management.bat` to check status

## 🌐 Application URLs

- **Main Application**: https://crysgarage.studio
- **Frontend**: http://209.74.80.162:5173
- **Backend API**: http://209.74.80.162:8001
- **Ruby Service**: http://209.74.80.162:4568

## 🚨 Troubleshooting

### If containers won't start:
```bash
# Check what's using the ports
ssh root@209.74.80.162 "netstat -tlnp | grep 4567"
ssh root@209.74.80.162 "netstat -tlnp | grep 8000"

# Kill processes if needed
ssh root@209.74.80.162 "kill -9 [PID]"
```

### If application is down:
```bash
# Restart all containers
.\docker_management.bat
# Select option 3 (Restart containers)
```

### If you need to rebuild everything:
```bash
# Full rebuild
.\deploy_pipeline.bat
```

## 📊 Monitoring

Your application includes:
- ✅ Automatic container restarts
- ✅ SSL certificate management
- ✅ Health checks
- ✅ Log monitoring
- ✅ Backup system

## 🎯 Best Practices

1. **Always test locally** before deploying
2. **Use quick_deploy.bat** for small changes
3. **Use deploy_pipeline.bat** for major changes
4. **Check container status** after deployment
5. **Monitor logs** if issues occur

## 🔄 Update Process

1. Make changes in your local project
2. Test changes locally
3. Run deployment script
4. Verify deployment on https://crysgarage.studio
5. Monitor logs if needed

---

**Your application is now fully containerized and ready for continuous deployment!** 🎉 