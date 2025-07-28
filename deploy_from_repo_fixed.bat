@echo off
echo ========================================
echo Crys Garage - Deploy from GitHub
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo Repository: https://github.com/Jim-devENG/crys-garage.git
echo.

echo Step 1: Pushing changes to GitHub...
git add .
git commit -m "Update $(date /t)"
git push origin main
echo ✅ Changes pushed to GitHub
echo.

echo Step 2: Connecting to VPS and pulling latest changes...
ssh root@209.74.80.162 "cd /var/www && rm -rf crysgarage && git clone https://github.com/Jim-devENG/crys-garage.git"
echo ✅ Repository cloned on VPS
echo.

echo Step 3: Building frontend on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm install && npm run build"
echo ✅ Frontend built on VPS
echo.

echo Step 4: Copying built frontend to web directory...
ssh root@209.74.80.162 "cp -r /var/www/crysgarage/crysgarage-frontend/dist/* /var/www/crysgarage-frontend/"
echo ✅ Frontend files copied
echo.

echo Step 5: Setting proper permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage-frontend && chmod -R 755 /var/www/crysgarage-frontend"
echo ✅ Permissions set
echo.

echo Step 6: Testing the website...
ssh root@209.74.80.162 "curl -I https://localhost"
echo.

echo Step 7: Checking what's being served...
ssh root@209.74.80.162 "curl -s https://localhost | head -5"
echo.

echo ========================================
echo Deployment complete!
echo ========================================
echo 🌐 Visit: https://crysgarage.studio
echo 📝 Next time: Just run this script after making changes
echo.
pause 