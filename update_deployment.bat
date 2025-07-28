@echo off
echo ========================================
echo Crys Garage - Update from GitHub
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Pulling latest changes...
ssh root@209.74.80.162 "cd /var/www/crysgarage && git pull origin main"

echo.
echo Step 2: Rebuilding frontend...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-frontend && npm install && npm run build"

echo.
echo Step 3: Updating backend dependencies...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-backend && composer install --no-dev --optimize-autoloader"

echo.
echo Step 4: Updating Ruby dependencies...
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && bundle install"

echo.
echo Step 5: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage && chmod -R 755 /var/www/crysgarage"

echo.
echo Step 6: Restarting services...
ssh root@209.74.80.162 "systemctl restart crysgarage-backend && systemctl restart crysgarage-ruby"

echo.
echo ========================================
echo UPDATE COMPLETED!
echo ========================================
echo.
echo Your Crys Garage has been updated!
echo Test at http://crysgarage.studio
echo.
pause 