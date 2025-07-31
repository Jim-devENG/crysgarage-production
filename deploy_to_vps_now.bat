@echo off
echo 🚀 Deploy to VPS Now
echo ===================

echo 📤 Uploading deployment script to VPS...
scp manual_vps_deploy.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running deployment on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x manual_vps_deploy.sh && ./manual_vps_deploy.sh"

echo.
echo ✅ Deployment completed!
echo 🌐 Check your application at: https://crysgarage.studio

pause 