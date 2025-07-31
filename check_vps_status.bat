@echo off
echo 🔍 Crys Garage VPS Status Check
echo ===============================

echo.
echo 📊 Checking GitHub Actions status...
echo Visit: https://github.com/Jim-devENG/Crysgarage/actions
echo.

echo 🌐 Testing application availability...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://crysgarage.studio

echo.
echo 🔧 Manual VPS Commands (run these on your VPS):
echo ===============================================
echo.
echo 1. SSH into VPS:
echo    ssh root@209.74.80.162
echo.
echo 2. Check if GitHub Actions secrets are configured:
echo    cd /var/www/crysgarage-deploy
echo    git status
echo.
echo 3. Check service status:
echo    systemctl status crysgarage-frontend.service
echo    systemctl status crysgarage-backend.service
echo    systemctl status crysgarage-ruby.service
echo    systemctl status nginx
echo.
echo 4. Check recent logs:
echo    journalctl -u crysgarage-frontend.service -n 20
echo    journalctl -u crysgarage-backend.service -n 20
echo    journalctl -u crysgarage-ruby.service -n 20
echo.
echo 5. Manual deployment (if GitHub Actions fails):
echo    cd /var/www/crysgarage-deploy
echo    git pull origin master
echo    cd crysgarage-frontend && npm install && systemctl restart crysgarage-frontend.service
echo    cd ../crysgarage-backend && composer install && systemctl restart crysgarage-backend.service
echo    cd ../crysgarage-ruby && bundle install && systemctl restart crysgarage-ruby.service
echo    systemctl reload nginx
echo.
echo 💡 If GitHub Actions is not working, you may need to set up secrets:
echo    Go to: https://github.com/Jim-devENG/Crysgarage/settings/secrets/actions
echo    Add these secrets:
echo    - VPS_HOST: 209.74.80.162
echo    - VPS_USERNAME: root
echo    - VPS_SSH_KEY: (your private SSH key)

pause 