# 🚀 Crys Garage Frontend Deployment Guide

## **Quick Deployment (SSH)**

### **Step 1: Connect to Your VPS**
```bash
ssh username@your-vps-ip
# or
ssh username@crysgarage.studio
```

### **Step 2: Navigate to Project Directory**
```bash
cd /var/www/crysgarage-frontend
# Update this path to match your VPS setup
```

### **Step 3: Pull Latest Changes**
```bash
git pull origin master
```

### **Step 4: Build and Deploy**
```bash
npm install
npm run build
cp -r dist/* /var/www/html/
```

### **Step 5: Set Permissions**
```bash
chmod -R 755 /var/www/html
chown -R www-data:www-data /var/www/html
```

## **Automated Deployment**

### **Option 1: Use the Deployment Script**
1. Upload `deploy.sh` to your VPS
2. Make it executable: `chmod +x deploy.sh`
3. Update the paths in the script
4. Run: `./deploy.sh`

### **Option 2: Manual Commands**
```bash
# Navigate to project
cd /var/www/crysgarage-frontend

# Pull latest changes
git pull origin master

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to web server
cp -r dist/* /var/www/html/

# Set permissions
chmod -R 755 /var/www/html
chown -R www-data:www-data /var/www/html
```

## **Verification Steps**

### **1. Check Latest Commit**
```bash
git log --oneline -1
# Should show: 4a1eeba Complete authentication system integration
```

### **2. Verify Build Files**
```bash
ls -la dist/
# Should show: index.html, assets/, and other files
```

### **3. Check Web Server Files**
```bash
ls -la /var/www/html/
# Should show updated files
```

### **4. Test Live Site**
- Visit: `https://crysgarage.studio`
- Look for "Sign In" and "Get Started" buttons in header
- Test authentication flow

## **Troubleshooting**

### **If deployment fails:**
1. Check if project directory exists
2. Verify git repository is set up correctly
3. Ensure npm and Node.js are installed
4. Check web server directory permissions

### **If authentication doesn't work:**
1. Verify API endpoints are correct
2. Check CORS settings on server
3. Ensure SSL certificate is valid
4. Test API endpoints directly

### **If buttons don't appear:**
1. Clear browser cache
2. Check if CSS/JS files loaded correctly
3. Verify build was successful
4. Check browser console for errors

## **Common VPS Paths**

### **Ubuntu/Debian:**
- Project: `/var/www/crysgarage-frontend`
- Web Server: `/var/www/html`
- User: `www-data`

### **CentOS/RHEL:**
- Project: `/var/www/crysgarage-frontend`
- Web Server: `/var/www/html`
- User: `apache` or `nginx`

### **Custom Setup:**
- Update paths in `deploy.sh` script
- Adjust permissions for your user/group

## **What's Being Deployed**

✅ **Complete Authentication System**
- Login/Signup forms
- Token-based authentication
- User session management

✅ **Tier-Based Access Control**
- Free/Pro/Advanced tier restrictions
- Protected routes
- Feature access control

✅ **Live Server Integration**
- API endpoints: `https://crysgarage.studio/api`
- CORS resolved
- Production-ready

✅ **UI Updates**
- Authentication buttons in header
- Responsive design
- Modern styling

## **Post-Deployment Checklist**

- [ ] Authentication buttons visible in header
- [ ] Sign up form works
- [ ] Sign in form works
- [ ] Tier-based access working
- [ ] API endpoints responding
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL certificate valid

## **Support**

If you encounter issues:
1. Check the deployment logs
2. Verify all paths are correct
3. Ensure proper permissions
4. Test API endpoints
5. Check browser console for errors
