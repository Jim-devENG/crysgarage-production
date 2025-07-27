@echo off
echo ========================================
echo Uploading Frontend to Server
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Creating dist directory on server...
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage/crysgarage-frontend/dist && mkdir -p /var/www/crysgarage/crysgarage-frontend/dist"

echo.
echo Step 2: Uploading the HTML file...
scp simple_frontend.html root@209.74.80.162:/var/www/crysgarage/crysgarage-frontend/dist/index.html

echo.
echo Step 3: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage/crysgarage-frontend/dist && chmod -R 755 /var/www/crysgarage/crysgarage-frontend/dist"

echo.
echo Step 4: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo ========================================
echo FRONTEND UPLOADED!
echo ========================================
echo.
echo Now visit: http://crysgarage.studio
echo You should see a beautiful working frontend page!
echo.
pause 