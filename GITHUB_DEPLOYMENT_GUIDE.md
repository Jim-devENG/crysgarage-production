# GitHub Deployment Guide for Crys Garage

## Why GitHub Deployment is Better

✅ **Version Control**: Track all changes and rollback if needed  
✅ **Collaboration**: Multiple developers can work together  
✅ **Automated Deployment**: Push to GitHub, auto-deploy to VPS  
✅ **Cleaner Workflow**: No manual file uploads  
✅ **Backup**: Code safely stored in the cloud  
✅ **Branch Management**: Test changes before merging

## Setup Instructions

### Step 1: Prepare Your Local Repository

1. **Commit current changes**:

   ```bash
   git add .
   git commit -m "Initial commit for GitHub deployment"
   ```

2. **Push to GitHub** (if not already done):
   ```bash
   git push origin master
   ```

### Step 2: Set Up VPS for GitHub Deployment

1. **Upload the setup script**:

   ```bash
   scp setup_github_deployment.sh root@209.74.80.162:/tmp/
   ```

2. **Run the setup script on VPS**:

   ```bash
   ssh root@209.74.80.162 "chmod +x /tmp/setup_github_deployment.sh && /tmp/setup_github_deployment.sh"
   ```

3. **Update the repository URL** in the script with your actual GitHub repo URL.

### Step 3: Test the Setup

1. **Make a small change locally**
2. **Run the deployment script**:
   ```bash
   .\deploy_via_github.bat
   ```

## Deployment Options

### Option 1: Manual Deployment (Recommended for now)

```bash
# Local: Commit and push
git add .
git commit -m "Your commit message"
git push origin master

# VPS: Deploy
ssh root@209.74.80.162 "/var/www/crysgarage-deploy/update.sh"
```

### Option 2: Automated Deployment with GitHub Actions

1. **Set up GitHub Secrets**:

   - Go to your GitHub repository → Settings → Secrets
   - Add these secrets:
     - `VPS_HOST`: `209.74.80.162`
     - `VPS_USERNAME`: `root`
     - `VPS_SSH_KEY`: Your private SSH key

2. **Push the workflow file**:

   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment"
   git push origin master
   ```

3. **Automatic deployment**: Every push to master will automatically deploy to VPS!

## Workflow Comparison

### Current Method (Manual Upload)

```
Local Changes → Manual SCP Upload → Server
```

### GitHub Method

```
Local Changes → Git Push → GitHub → Auto Deploy → Server
```

## Benefits

1. **Faster Development**: Just `git push` and it's live
2. **Safer**: All changes are tracked and can be rolled back
3. **Collaborative**: Multiple people can work on the project
4. **Professional**: Industry-standard deployment workflow
5. **Reliable**: No more manual file uploads or missed files

## Quick Commands

### For Daily Development:

```bash
# Make changes locally
# Test locally
# Deploy to production
.\deploy_via_github.bat
```

### For Quick Fixes:

```bash
# Make small change
git add .
git commit -m "Quick fix"
git push origin master
# VPS auto-deploys (if GitHub Actions is set up)
```

## Troubleshooting

### If deployment fails:

1. Check VPS logs: `ssh root@209.74.80.162 "journalctl -u crysgarage-backend -f"`
2. Check nginx: `ssh root@209.74.80.162 "nginx -t"`
3. Manual deploy: `ssh root@209.74.80.162 "/var/www/crysgarage-deploy/deploy.sh"`

### If GitHub Actions fails:

1. Check GitHub Actions tab in your repository
2. Verify SSH keys and secrets are correct
3. Check VPS connectivity

## Next Steps

1. **Set up the GitHub deployment** using the scripts provided
2. **Test with a small change** to ensure it works
3. **Consider setting up GitHub Actions** for fully automated deployment
4. **Update your development workflow** to use `git push` instead of manual uploads

This will make your development process much more efficient and professional!
