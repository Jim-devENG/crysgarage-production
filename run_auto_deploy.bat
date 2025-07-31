@echo off
echo 🚀 Automatic Crys Garage VPS Deployment
echo ========================================

echo.
echo 📤 Pushing latest changes to GitHub...
git add .
git commit -m "Auto-deploy: $(date)"
git push origin master

echo.
echo 🔧 Running automatic deployment on VPS...
echo This will install all dependencies and deploy the application...
echo.

REM Download and run the deployment script on VPS
ssh root@209.74.80.162 "curl -s https://raw.githubusercontent.com/Jim-devENG/Crysgarage/master/auto_deploy_vps.sh | bash"

echo.
echo ✅ Deployment completed!
echo 🌐 Your site should now be live at: http://crysgarage.studio
echo.
pause 