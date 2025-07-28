@echo off
echo ========================================
echo Crys Garage - Git Deployment Setup
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Setting up Git repository on server...
ssh root@209.74.80.162 "cd /var/www && rm -rf crysgarage && git clone https://github.com/Jim-devENG/crys-garage.git crysgarage"

echo Step 2: Building frontend on server...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm install && npm run build"

echo Step 3: Installing backend dependencies...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-backend && composer install"

echo Step 4: Setting up deployment script...
ssh root@209.74.80.162 "cat > /var/www/crysgarage/deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/crysgarage
git pull origin master
cd crysgarage-frontend
npm run build
cd ../crysgarage-backend
composer install
systemctl restart crysgarage-backend
systemctl restart crysgarage-ruby
echo 'Deployment completed!'
EOF"

echo Step 5: Making deployment script executable...
ssh root@209.74.80.162 "chmod +x /var/www/crysgarage/deploy.sh"

echo Step 6: Creating local update script...
echo @echo off > update_site.bat
echo echo ======================================== >> update_site.bat
echo echo Crys Garage - Quick Update >> update_site.bat
echo echo ======================================== >> update_site.bat
echo echo. >> update_site.bat
echo echo Step 1: Pushing changes to GitHub... >> update_site.bat
echo git add . >> update_site.bat
echo git commit -m "Update: %date% %time%" >> update_site.bat
echo git push origin master >> update_site.bat
echo echo. >> update_site.bat
echo echo Step 2: Deploying to server... >> update_site.bat
echo ssh root@209.74.80.162 "/var/www/crysgarage/deploy.sh" >> update_site.bat
echo echo. >> update_site.bat
echo echo Update completed! >> update_site.bat
echo pause >> update_site.bat

echo ========================================
echo Git Deployment Setup Complete!
echo ========================================
echo.
echo To update your site in the future:
echo 1. Make changes to your local files
echo 2. Run: update_site.bat
echo.
echo This will:
echo - Push changes to GitHub
echo - Pull changes on server
echo - Rebuild frontend
echo - Restart services
echo.
pause 