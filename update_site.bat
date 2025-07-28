@echo off
echo ========================================
echo Crys Garage - Quick Update
echo ========================================
echo.

echo Step 1: Pushing changes to GitHub...
git add .
git commit -m "Update: %date% %time%"
git push origin master

echo.
echo Step 2: Deploying to server...
ssh root@209.74.80.162 "/var/www/crysgarage/deploy.sh"

echo.
echo Update completed!
pause 