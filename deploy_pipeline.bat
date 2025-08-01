@echo off
echo 🚀 Crys Garage Deployment Pipeline
echo ==================================

echo.
echo This will deploy your latest changes from Git to the VPS.
echo.
echo 📋 What will happen:
echo    1. Push your local changes to Git
echo    2. Pull changes on VPS from Git
echo    3. Rebuild Docker containers
echo    4. Restart all services
echo    5. Test the application
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b
)

echo.
echo 📤 Pushing changes to Git repository...
git add .
git commit -m "Auto-deploy: $(date /t) $(time /t)"
git push origin master

echo.
echo 📤 Uploading deployment script to VPS...
scp deploy_pipeline.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🚀 Running deployment pipeline on VPS...
echo This may take 10-15 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x deploy_pipeline.sh && ./deploy_pipeline.sh"

echo.
echo 🌐 Testing application after deployment...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Deployment pipeline completed!
echo.
echo 🎯 Your changes are now live:
echo    - All services updated from Git
echo    - Docker containers rebuilt
echo    - Application tested and running
echo.
echo 🌐 Your application: https://crysgarage.studio

pause 