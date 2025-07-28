# 🚀 Crys Garage Quick Start Guide

## 🎯 Your Development Workflow

### Step 1: Test Locally First

```bash
# Run the local testing script
test_locally.bat
```

This will:

- ✅ Install all dependencies
- ✅ Build the frontend
- ✅ Set up the database
- ✅ Start the backend server
- ✅ Test all components

### Step 2: Fix Issues Locally

If you find issues during local testing:

1. **Frontend Issues** - Edit files in `crysgarage-frontend/`
2. **Backend Issues** - Edit files in `crysgarage-backend/`
3. **Test again** - Run `test_locally.bat` to verify fixes

### Step 3: Deploy to VPS

```bash
# Deploy everything to your VPS
deploy_to_vps.bat
```

This will:

- ✅ Build and upload frontend
- ✅ Upload backend
- ✅ Configure server
- ✅ Restart services
- ✅ Test deployment

## 🧪 Testing Checklist

### Local Testing:

- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] Database migrations run successfully
- [ ] Demo users are seeded
- [ ] Login modal opens and closes properly
- [ ] Demo login works: `demo.free@crysgarage.com` / `password`

### VPS Testing:

- [ ] Frontend accessible at https://crysgarage.studio
- [ ] API accessible at https://api.crysgarage.studio
- [ ] Login modal works on live site
- [ ] Demo login works on live site

## 🔧 Common Issues & Fixes

### Frontend Issues:

1. **Modal won't close**

   - Fix: Check `App.tsx` `onClose` handlers
   - Fix: Check `AuthPages.tsx` backdrop click

2. **Build errors**
   - Fix: Run `npm install` in `crysgarage-frontend/`
   - Fix: Check for TypeScript errors

### Backend Issues:

1. **JSON parsing errors**

   - Fix: Check `AuthController.php` JSON parsing
   - Fix: Check `bootstrap/app.php` middleware

2. **Database errors**
   - Fix: Run `php artisan migrate --force`
   - Fix: Run `php artisan db:seed --class=DemoUserSeeder --force`

## 📋 Quick Commands

### Local Development:

```bash
# Start frontend
cd crysgarage-frontend && npm run dev

# Start backend
cd crysgarage-backend && php artisan serve --port=8000

# Test everything
test_locally.bat
```

### VPS Management:

```bash
# Deploy to VPS
deploy_to_vps.bat

# Check VPS status
ssh root@209.74.80.162 "systemctl status crysgarage-backend"

# View VPS logs
ssh root@209.74.80.162 "journalctl -u crysgarage-backend -f"
```

## 🎯 Your VPS Details

- **Server**: `209.74.80.162`
- **User**: `root`
- **Path**: `/var/www/crysgarage`
- **Frontend**: https://crysgarage.studio
- **API**: https://api.crysgarage.studio

## 🚨 Important Notes

1. **Always test locally first** - Use `test_locally.bat`
2. **Check for errors** - The scripts will show you exactly what's wrong
3. **Backup is automatic** - Your VPS installation is backed up before each deploy
4. **Services restart automatically** - Backend and Nginx restart after deployment

## 🎉 Success Indicators

When everything is working:

- ✅ Local testing passes all checks
- ✅ VPS deployment completes without errors
- ✅ Login modal opens and closes properly
- ✅ Demo login works on live site
- ✅ No console errors in browser

---

**Happy coding! 🎉**

Your login modal issues are already fixed in the code. Just test locally and deploy!
