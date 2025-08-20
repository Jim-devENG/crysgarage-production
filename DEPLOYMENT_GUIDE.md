# 🚀 Crys Garage Deployment Guide

## **Sustainable Deployment Options**

You now have **3 reliable ways** to deploy your Crys Garage application:

---

## **Option 1: Enhanced Local Deployment (Recommended)**

### **For Major Updates & Full Deployments**

```powershell
.\deploy_local.ps1
```

**Features:**
- ✅ Automatic dependency installation
- ✅ Frontend build with verification
- ✅ SSH connection testing
- ✅ Automatic backups
- ✅ Permission fixing
- ✅ Health checks
- ✅ Uncommitted changes detection

**Best for:** Major feature updates, new releases, when you want full control

---

## **Option 2: Quick Deploy (Fast Updates)**

### **For Minor Changes & Quick Fixes**

```powershell
.\quick_deploy.ps1
```

**Features:**
- ⚡ Fast deployment (no prompts)
- ⚡ Skips dependency checks
- ⚡ Direct file transfer
- ⚡ Minimal overhead

**Best for:** CSS changes, text updates, quick bug fixes

---

## **Option 3: GitHub Actions (Automatic)**

### **For Continuous Deployment**

**How it works:**
1. Push to `master` branch
2. GitHub automatically builds and deploys
3. No manual intervention needed

**Features:**
- 🤖 Fully automated
- 🔄 Triggers on every push
- 📦 Builds in cloud
- ✅ Health checks included

**Best for:** Team development, continuous integration

---

## **🚀 Quick Start Commands**

### **For Daily Development:**
```powershell
# Make your changes
# Then deploy quickly:
.\quick_deploy.ps1
```

### **For Major Releases:**
```powershell
# Commit your changes
git add -A
git commit -m "New feature: Professional tier enhancements"
git push origin master

# Deploy with full verification:
.\deploy_local.ps1
```

### **For Automatic Deployment:**
```powershell
# Just push to GitHub - it deploys automatically!
git push origin master
```

---

## **🔧 Troubleshooting**

### **If deployment fails:**

1. **Check SSH connection:**
   ```powershell
   ssh -i ~/.ssh/id_rsa root@209.74.80.162 "echo 'Connection test'"
   ```

2. **Verify VPS is running:**
   ```powershell
   ping 209.74.80.162
   ```

3. **Check build locally:**
   ```powershell
   cd crysgarage-frontend
   npm run build
   ```

4. **Manual deployment:**
   ```powershell
   # Build manually
   cd crysgarage-frontend
   npm run build
   
   # Copy to VPS manually
   scp -i ~/.ssh/id_rsa -r dist/* root@209.74.80.162:/var/www/html/
   ```

---

## **📋 Pre-Deployment Checklist**

Before deploying, ensure:

- [ ] Code is tested locally
- [ ] All changes are committed
- [ ] SSH key is working
- [ ] VPS is accessible
- [ ] No critical errors in console

---

## **🎯 Best Practices**

### **For Regular Updates:**
1. Use `quick_deploy.ps1` for minor changes
2. Test changes locally first
3. Keep commits small and focused

### **For Major Releases:**
1. Use `deploy_local.ps1` for full verification
2. Test thoroughly before deployment
3. Monitor the site after deployment

### **For Team Development:**
1. Use GitHub Actions for automatic deployment
2. Set up branch protection rules
3. Require code reviews for master branch

---

## **🔒 Security Notes**

- SSH keys are stored in `~/.ssh/id_rsa`
- VPS credentials are in the scripts
- Keep these secure and don't share them
- Consider using environment variables for sensitive data

---

## **📞 Support**

If you encounter issues:

1. **Check the logs** in the deployment output
2. **Verify VPS status** with your hosting provider
3. **Test SSH connection** manually
4. **Check nginx logs** on the VPS if needed

---

## **🎉 Success Indicators**

Your deployment is successful when:

- ✅ Script completes without errors
- ✅ Site loads at https://crysgarage.studio
- ✅ Professional tier features work
- ✅ No console errors in browser
- ✅ Health check passes

---

**Happy Deploying! 🚀**
