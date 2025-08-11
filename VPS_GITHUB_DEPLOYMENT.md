# 🚀 Crys Garage VPS GitHub Deployment Guide

## VPS Details
- **IP Address**: 209.74.80.162
- **Hostname**: server1.crysgarage.studio
- **OS**: AlmaLinux 8 (64-bit)
- **Resources**: 6GB RAM, 120GB Disk, 2.93TB Bandwidth
- **Virtualization**: KVM

## Quick Deployment Commands

### Step 1: SSH into VPS
```bash
ssh root@209.74.80.162
```

### Step 2: Set up GitHub deployment
```bash
# Create deployment directory
mkdir -p /var/www/crysgarage-deploy

# Clone the repository
cd /var/www/crysgarage-deploy
git clone https://github.com/Jim-devENG/Crysgarage.git .

# Make deployment script executable
chmod +x deploy.sh

# Run initial deployment
./deploy.sh
```

### Step 3: Verify deployment
```bash
# Check if services are running
systemctl status crysgarage-backend
systemctl status crysgarage-ruby
systemctl status nginx

# Test the website
curl -I https://crysgarage.studio
```

## Automatic Deployment Setup

### Option 1: GitHub Actions (Recommended)

1. **Set up GitHub Secrets**:
   - Go to: https://github.com/Jim-devENG/Crysgarage/settings/secrets/actions
   - Add these secrets:
     - `VPS_HOST`: `209.74.80.162`
     - `VPS_USERNAME`: `root`
     - `VPS_SSH_KEY`: Your private SSH key

2. **Enable GitHub Actions**:
   - The workflow file is already in `.github/workflows/deploy.yml`
   - Every push to master will auto-deploy

### Option 2: Manual deployment script

Create a simple update script on VPS:
```bash
cat > /var/www/crysgarage-deploy/update.sh << 'EOF'
#!/bin/bash
cd /var/www/crysgarage-deploy
git pull origin master
./deploy.sh
EOF

chmod +x /var/www/crysgarage-deploy/update.sh
```

Then deploy with:
```bash
ssh root@209.74.80.162 "/var/www/crysgarage-deploy/update.sh"
```

## Service Management

### Check service status
```bash
systemctl status crysgarage-backend
systemctl status crysgarage-ruby
systemctl status nginx
```

### Restart services
```bash
systemctl restart crysgarage-backend
systemctl restart crysgarage-ruby
systemctl reload nginx
```

### View logs
```bash
journalctl -u crysgarage-backend -f
journalctl -u crysgarage-ruby -f
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### If deployment fails:
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check service logs
journalctl -u crysgarage-backend --no-pager -l
journalctl -u crysgarage-ruby --no-pager -l

# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:4567/health
```

### If website is down:
```bash
# Check nginx configuration
nginx -t

# Check if ports are listening
netstat -tlnp | grep :80
netstat -tlnp | grep :443
netstat -tlnp | grep :8000
netstat -tlnp | grep :4567
```

## URLs

- **Frontend**: https://crysgarage.studio
- **API**: https://api.crysgarage.studio
- **Admin**: https://admin.crysgarage.studio

## Development Workflow

1. **Make changes locally**
2. **Test locally**
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```
4. **Auto-deploy** (if GitHub Actions is set up)
5. **Verify** at https://crysgarage.studio

## Security Notes

- Keep your SSH keys secure
- Regularly update the system: `yum update -y`
- Monitor logs for suspicious activity
- Use strong passwords for database and services
- Consider setting up firewall rules

## Performance Monitoring

```bash
# Check system resources
htop
iotop
nethogs

# Check website performance
curl -w "@curl-format.txt" -o /dev/null -s https://crysgarage.studio
```

## Backup Strategy

```bash
# Backup database
mysqldump -u crysgarage_user -p crysgarage > backup_$(date +%Y%m%d).sql

# Backup application files
tar -czf crysgarage_backup_$(date +%Y%m%d).tar.gz /var/www/crysgarage/
```

---

**🎉 Your Crys Garage application is now ready for GitHub-based deployment!** 