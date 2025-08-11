@echo off
setlocal enabledelayedexpansion

echo 🚀 Fast Deploy to VPS
echo ====================

:: Check if we're in the right directory
if not exist "crysgarage-frontend" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

:: Add all changes
echo 📝 Adding changes to git...
git add .

:: Commit changes
echo Committing changes...
git commit -m "Fast deploy: %date% %time%"

:: Push to repository
echo 🚀 Pushing to repository...
git push origin master

:: Fast deploy to VPS using Git pull and Docker
echo 🌐 Fast deploying to VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && git pull origin master && docker-compose down && docker-compose build --no-cache && docker-compose up -d"

if %errorlevel% equ 0 (
    echo ✅ Fast deployment successful!
    echo 🌐 Check your application at: https://crysgarage.studio
) else (
    echo ❌ Fast deployment failed!
    echo Check the VPS logs for errors
)

pause 