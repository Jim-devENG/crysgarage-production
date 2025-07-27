@echo off
echo ========================================
echo Crys Garage - Quick Deploy
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Pushing to GitHub...
git add .
git commit -m "Update $(date /t)"
git push origin main
echo ✅ Pushed to GitHub
echo.

echo Step 2: Updating VPS...
ssh crysgarage "cd /var/www/crysgarage && git pull origin main"
echo ✅ VPS updated
echo.

echo Step 3: Rebuilding frontend...
ssh crysgarage "cd /var/www/crysgarage/crysgarage-frontend && npm run build"
echo ✅ Frontend rebuilt
echo.

echo Step 4: Deploying to web directory...
ssh crysgarage "cp -r /var/www/crysgarage/crysgarage-frontend/dist/* /var/www/crysgarage-frontend/ && chown -R nginx:nginx /var/www/crysgarage-frontend"
echo ✅ Deployed to web
echo.

echo ========================================
echo Quick deploy complete!
echo ========================================
echo 🌐 Visit: https://crysgarage.studio
echo.
pause 
