@echo off
echo 🚀 Crys Garage VPS Deployment
echo =============================

echo 📤 Uploading deployment script to VPS...
scp deploy_to_vps.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo 🔧 Executing deployment on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x deploy_to_vps.sh && ./deploy_to_vps.sh"

echo ✅ Deployment completed!
echo 🌐 Check your application at: https://crysgarage.studio
pause 