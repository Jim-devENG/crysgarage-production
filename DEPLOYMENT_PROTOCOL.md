# CrysGarage Safe Deployment Protocol

## 🎯 Overview

This protocol ensures safe deployments without creating frequent large backups that fill up disk space. It implements a staging-first approach with minimal backup strategy.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Staging       │    │   Production    │
│   (Port 9000)   │    │   (Port 80/443) │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────────────┐
         │    Backup Strategy      │
         │  (Config + DB only)     │
         └─────────────────────────┘
```

## 📋 Deployment Steps

### 1. Pre-Deployment Checks

```bash
# Check for existing backups (last 24 hours)
find /var/backups/crysgarage -name "*.tar" -mtime -1

# Check cron jobs for backup systems
crontab -l | grep -E '(tar|rsync|duplicity|backup)'

# Check service status
systemctl list-units --type=service | grep crysgarage
```

### 2. Minimal Backup (if needed)

**Only create backup if no recent backup exists (last 24h)**

```bash
# Create minimal backup (config + databases only)
tar cf /var/backups/crysgarage/config_db_$(date +%Y%m%d_%H%M%S).tar \
    /etc/nginx/conf.d/studio-ssl.conf \
    /var/www/crysgarage-admin/backend/admin.db \
    /var/www/waitlist-backend/waitlist.db \
    /etc/systemd/system/audio-mastering.service \
    /etc/systemd/system/crysgarage-admin-backend.service \
    /etc/systemd/system/waitlist-backend.service
```

### 3. Staging Deployment

```bash
# Pull staging branch
cd /var/www/crysgarage-deploy
git checkout staging
git pull origin staging

# Install dependencies
cd crysgarage-frontend && npm ci
cd ../crysgarage-admin/frontend && npm ci
cd ../backend && source .venv/bin/activate && pip install -r requirements.txt

# Build applications
cd ../../crysgarage-frontend && npm run build
cd ../crysgarage-admin/frontend && npm run build
```

### 4. Staging Tests

```bash
# Test core endpoints
curl -f http://localhost:8002/health
curl -f http://localhost:8082/health
curl -f http://localhost:8083/health

# Test audio processing
curl -X POST -F 'file=@test_audio.wav' http://localhost:8002/analyze-file
```

### 5. Production Deployment

```bash
# Stop services gracefully
systemctl stop audio-mastering.service
systemctl stop crysgarage-admin-backend.service
systemctl stop waitlist-backend.service
systemctl stop crysgarage-analyzer.service

# Merge staging to main
git checkout main
git merge staging

# Deploy to production
rsync -av --delete dist/ /var/www/frontend_publish/
rsync -av --delete admin/dist/ /var/www/admin-frontend/

# Start services
systemctl start audio-mastering.service
systemctl start crysgarage-admin-backend.service
systemctl start waitlist-backend.service
systemctl start crysgarage-analyzer.service
```

### 6. Health Verification

```bash
# Check service status
systemctl is-active audio-mastering.service
systemctl is-active crysgarage-admin-backend.service
systemctl is-active waitlist-backend.service
systemctl is-active crysgarage-analyzer.service

# Test production endpoints
curl -f https://crysgarage.studio
curl -f https://crysgarage.studio/admin
curl -f https://crysgarage.studio/analyzer
curl -f https://crysgarage.studio/normalizer

# Test audio processing
curl -f https://crysgarage.studio/master-basic/health
```

## 🔄 Rollback Procedure

```bash
# Stop all services
systemctl stop audio-mastering.service
systemctl stop crysgarage-admin-backend.service
systemctl stop waitlist-backend.service
systemctl stop crysgarage-analyzer.service

# Restore from backup
cd / && tar xf /var/backups/crysgarage/config_db_YYYYMMDD_HHMMSS.tar

# Revert code
cd /var/www/crysgarage-deploy
git reset --hard HEAD~1

# Redeploy previous version
rsync -av --delete crysgarage-frontend/dist/ /var/www/frontend_publish/
rsync -av --delete crysgarage-admin/frontend/dist/ /var/www/admin-frontend/

# Start services
systemctl start audio-mastering.service
systemctl start crysgarage-admin-backend.service
systemctl start waitlist-backend.service
systemctl start crysgarage-analyzer.service
```

## 🛡️ Safety Controls

### Backup Strategy
- **Never backup entire webroot** during each deploy
- **Only backup config files and databases** (small, essential files)
- **Check for recent backups** before creating new ones
- **Use timestamped, incremental backups** only when necessary

### Service Management
- **Use `systemctl stop/start`** instead of `restart` to avoid partial states
- **Wait 10 seconds** between stop and start operations
- **Verify service status** before proceeding to next step

### Testing Requirements
- **All staging tests must pass** before production deployment
- **Health verification required** after production deployment
- **Immediate rollback** if any critical failure detected

## 📊 Monitoring

### Log Files
- **Deployment logs**: `/var/log/crysgarage-deploy.log`
- **Service logs**: `journalctl -u service-name`
- **Nginx logs**: `/var/log/nginx/`

### Key Metrics
- **Service uptime**: `systemctl is-active service-name`
- **Response times**: `curl -w "@curl-format.txt" -o /dev/null -s URL`
- **Disk usage**: `df -h /var/www`
- **Memory usage**: `free -h`

## 🚨 Emergency Procedures

### Critical Failure Response
1. **Immediate rollback** using latest backup
2. **Service restart** in correct order
3. **Health verification** after rollback
4. **Incident logging** with timestamps

### Communication
- **Log all actions** in `/var/log/crysgarage-deploy.log`
- **Record backup status** (created/skipped)
- **Document rollback actions** if needed

## 🔧 Maintenance

### Daily Checks
- **Service status**: `systemctl list-units --type=service | grep crysgarage`
- **Disk space**: `df -h`
- **Log rotation**: Check log file sizes

### Weekly Tasks
- **Backup cleanup**: Remove backups older than 7 days
- **Log analysis**: Review deployment logs for issues
- **Performance review**: Check response times and error rates

## 📝 Deployment Checklist

- [ ] Check for existing backups (last 24h)
- [ ] Create minimal backup (if needed)
- [ ] Deploy to staging
- [ ] Run staging tests
- [ ] Promote to production
- [ ] Verify health
- [ ] Monitor for 30-60 seconds
- [ ] Log deployment status

## 🎯 Success Criteria

- ✅ All services active and healthy
- ✅ All endpoints responding correctly
- ✅ Audio processing pipeline functional
- ✅ No critical errors in logs
- ✅ Backup created (if needed) or skipped (if recent exists)
