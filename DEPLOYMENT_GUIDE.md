# Crys Garage Deployment Guide

This guide explains how to deploy the Crys Garage application using the provided deployment scripts.

## Deployment Scripts

### 1. `deploy_all_services.bat` - Complete Deployment

**Use this for:** Full deployment with comprehensive checks and status monitoring.

**What it does:**

- ✅ Checks for uncommitted changes and commits them
- ✅ Pushes changes to GitHub
- ✅ Deploys backend (Laravel) with dependency updates
- ✅ Deploys frontend (React) with build process
- ✅ Deploys Ruby service with gem updates
- ✅ Restarts all services
- ✅ Performs comprehensive health checks
- ✅ Tests API endpoints

**Usage:**

```bash
.\deploy_all_services.bat
```

### 2. `quick_deploy.bat` - Fast Deployment

**Use this for:** Quick deployments when you just need to push changes.

**What it does:**

- ✅ Commits and pushes changes
- ✅ Updates dependencies
- ✅ Restarts services
- ⚠️ Minimal error checking

**Usage:**

```bash
.\quick_deploy.bat
```

### 3. `troubleshoot_services.bat` - Troubleshooting Tool

**Use this for:** Diagnosing and fixing deployment issues.

**Features:**

- 🔍 Check service statuses
- 📋 View service logs
- 🔄 Restart services
- 💾 Check system resources
- 🧪 Test API endpoints
- 🔧 Fix common issues

**Usage:**

```bash
.\troubleshoot_services.bat
```

## Prerequisites

### Local Setup

1. **Git configured** with access to the repository
2. **SSH key** set up for VPS access
3. **Node.js and npm** installed locally
4. **PHP and Composer** (for local development)

### VPS Setup

1. **SSH access** to the VPS (209.74.80.162)
2. **Git** installed on VPS
3. **Systemd services** configured:
   - `crysgarage-backend`
   - `crysgarage-ruby`
   - `nginx`

## Deployment Process

### Step 1: Local Development

1. Make your changes in the local repository
2. Test locally if possible
3. Ensure all files are saved

### Step 2: Deploy

1. Run the appropriate deployment script
2. Monitor the output for any errors
3. Wait for completion

### Step 3: Verify

1. Check the live site: https://crysgarage.studio
2. Test the functionality you changed
3. Use troubleshooting script if needed

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Ruby Service  │
│   (React)       │    │   (Laravel)     │    │   (Sinatra)     │
│   Port: 443     │    │   Port: 8000    │    │   Port: 4567    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   (Reverse      │
                    │   Proxy)        │
                    └─────────────────┘
```

## Common Issues and Solutions

### 1. Ruby Service Not Starting

**Symptoms:** 404 errors from Ruby service, "cannot load such file" errors

**Solution:**

```bash
# Check Ruby service status
.\troubleshoot_services.bat
# Select option 1 to check status
# Select option 6, then 1 to fix Ruby gem issues
```

### 2. Frontend Not Loading

**Symptoms:** White screen, 404 errors, API calls failing

**Solution:**

```bash
# Check if frontend was built properly
ssh root@209.74.80.162 "ls -la /var/www/crysgarage/crysgarage-frontend/dist/"

# Rebuild frontend if needed
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm run build"
```

### 3. Backend API Errors

**Symptoms:** 500 errors, "Unauthorized" messages

**Solution:**

```bash
# Clear Laravel caches
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-backend && php artisan config:clear && php artisan route:clear && php artisan cache:clear"

# Restart backend service
ssh root@209.74.80.162 "systemctl restart crysgarage-backend"
```

### 4. Nginx Configuration Issues

**Symptoms:** 502 Bad Gateway, SSL errors

**Solution:**

```bash
# Test nginx configuration
ssh root@209.74.80.162 "nginx -t"

# Reload nginx
ssh root@209.74.80.162 "systemctl reload nginx"
```

## Manual Commands

### Check Service Status

```bash
ssh root@209.74.80.162 "systemctl status crysgarage-backend crysgarage-ruby nginx"
```

### View Logs

```bash
# Backend logs
ssh root@209.74.80.162 "journalctl -u crysgarage-backend -f"

# Ruby logs
ssh root@209.74.80.162 "journalctl -u crysgarage-ruby -f"

# Nginx logs
ssh root@209.74.80.162 "tail -f /var/log/nginx/error.log"
```

### Restart Services

```bash
ssh root@209.74.80.162 "systemctl restart crysgarage-backend && systemctl restart crysgarage-ruby && systemctl reload nginx"
```

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=https://crysgarage.studio/api
```

### Backend (.env)

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://crysgarage.studio
```

## File Structure on VPS

```
/var/www/crysgarage/
├── crysgarage-backend/          # Laravel backend
├── crysgarage-frontend/         # React frontend
│   └── dist/                    # Built frontend files
└── crysgarage-ruby/             # Ruby audio processor
```

## Security Notes

1. **SSH Keys:** Use SSH keys instead of passwords for VPS access
2. **Firewall:** Ensure only necessary ports are open (22, 80, 443)
3. **SSL:** Let's Encrypt certificates are automatically managed
4. **Updates:** Keep the VPS updated regularly

## Support

If you encounter issues not covered in this guide:

1. Use the troubleshooting script first
2. Check the service logs for specific error messages
3. Verify the deployment completed successfully
4. Test the specific functionality that's failing

## Quick Reference

| Command                       | Purpose                     |
| ----------------------------- | --------------------------- |
| `.\deploy_all_services.bat`   | Full deployment with checks |
| `.\quick_deploy.bat`          | Fast deployment             |
| `.\troubleshoot_services.bat` | Diagnose and fix issues     |
| `ssh root@209.74.80.162`      | Direct VPS access           |
| `https://crysgarage.studio`   | Live site URL               |
