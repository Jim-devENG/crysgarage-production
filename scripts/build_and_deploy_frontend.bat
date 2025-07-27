@echo off
echo ========================================
echo Building Frontend Locally and Deploying
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Building frontend locally...
cd crysgarage-frontend
call npm install
call npm run build
cd ..

echo.
echo Step 2: Checking if dist folder was created locally...
if exist "crysgarage-frontend\dist" (
    echo Local dist folder found!
) else (
    echo ERROR: Local build failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Uploading built frontend to server...
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage/crysgarage-frontend/dist"
scp -r crysgarage-frontend\dist\* root@209.74.80.162:/var/www/crysgarage/crysgarage-frontend/dist/

echo.
echo Step 4: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage/crysgarage-frontend/dist && chmod -R 755 /var/www/crysgarage/crysgarage-frontend/dist"

echo.
echo Step 5: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo ========================================
echo FRONTEND DEPLOYED!
echo ========================================
echo.
echo Now visit: http://crysgarage.studio
echo You should see your React frontend!
echo.
pause 