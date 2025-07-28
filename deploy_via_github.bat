@echo off
echo ========================================
echo GitHub Deployment for Crys Garage
echo ========================================

echo.
echo 1. Adding all changes to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Update: %date% %time%"

echo.
echo 3. Pushing to GitHub...
git push origin master

echo.
echo 4. Deploying to VPS...
ssh root@209.74.80.162 "/var/www/crysgarage-deploy/update.sh"

echo.
echo ========================================
echo Deployment completed!
echo ========================================
echo.
echo Your site should be updated at: https://crysgarage.studio
echo.
pause 