# Automatic Deployment Setup

This repository is configured for automatic deployment to your VPS using GitHub Actions.

## Setup Instructions

### 1. GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets:
- **VPS_HOST**: `209.74.80.162`
- **VPS_USERNAME**: `root`
- **VPS_SSH_KEY**: Your private SSH key content (the content of `crysgarage_key` file)

### 2. How to Get Your SSH Key

Run this command to get your private key content:
```bash
cat crysgarage_key
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and paste it as the `VPS_SSH_KEY` secret.

### 3. How It Works

The deployment workflow will:
1. **Trigger**: Automatically run on every push to `master` or `main` branch
2. **Build**: Install dependencies and build the frontend
3. **Deploy**: 
   - Update the repository on the VPS
   - Install/update Python dependencies
   - Upload the new frontend build
   - Restart services (FastAPI and Nginx)

### 4. Manual Deployment

If you need to deploy manually, you can run:
```bash
ssh -i crysgarage_key root@209.74.80.162 "/opt/crysgarage/deploy.sh"
```

### 5. Monitoring Deployments

- Check deployment status in GitHub Actions tab
- View logs in the Actions section of your repository
- Monitor VPS services: `systemctl status crysgarage-python.service nginx`

## Benefits

✅ **Automatic**: No manual deployment needed  
✅ **Fast**: Only deploys when you push changes  
✅ **Safe**: Runs tests and builds before deployment  
✅ **Rollback**: Easy to revert by pushing previous commit  
✅ **Logs**: Full deployment logs in GitHub Actions  

## Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Ensure VPS is accessible: `ping 209.74.80.162`
4. Check SSH key permissions

### If services don't restart:
```bash
ssh -i crysgarage_key root@209.74.80.162 "systemctl status crysgarage-python.service nginx"
```

### If frontend doesn't update:
```bash
ssh -i crysgarage_key root@209.74.80.162 "ls -la /opt/crysgarage/crysgarage-frontend/dist/"
```
