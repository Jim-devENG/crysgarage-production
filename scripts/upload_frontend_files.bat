@echo off
echo ========================================
echo Crys Garage - Upload Frontend Files
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking if frontend is built...
if not exist "crysgarage-frontend\dist\index.html" (
    echo ❌ Frontend not built. Building now...
    cd crysgarage-frontend
    call npm run build
    cd ..
) else (
    echo ✅ Frontend already built
)
echo.

echo Step 2: Creating directory on server...
ssh root@209.74.80.162 "mkdir -p /var/www/crysgarage-frontend"
echo.

echo Step 3: Uploading frontend files...
scp -r crysgarage-frontend\dist\* root@209.74.80.162:/var/www/crysgarage-frontend/
echo.

echo Step 4: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage-frontend && chmod -R 755 /var/www/crysgarage-frontend"
echo.

echo Step 5: Verifying files uploaded...
ssh root@209.74.80.162 "ls -la /var/www/crysgarage-frontend/"
echo.

echo Step 6: Testing website...
ssh root@209.74.80.162 "curl -I http://localhost"
echo.

echo ========================================
echo Frontend upload complete!
echo ========================================
echo.
echo 🌐 Visit: http://crysgarage.studio
echo.
pause 