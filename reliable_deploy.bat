@echo off
setlocal enabledelayedexpansion

echo 🚀 Crys Garage Reliable Deployment System
echo =========================================

:: Check if we're in the right directory
if not exist "crysgarage-frontend" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

:: Create backup of current state
echo Creating backup of current state...
if not exist "backups" mkdir backups
set "backup_name=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=!backup_name: =0!"
mkdir "backups\!backup_name!"

:: Backup current working files
echo Backing up current files...
xcopy "crysgarage-frontend\App.tsx" "backups\!backup_name!\App.tsx" /Y >nul
xcopy "crysgarage-frontend\styles\globals.css" "backups\!backup_name!\globals.css" /Y >nul
if exist "docker-compose.yml" xcopy "docker-compose.yml" "backups\!backup_name!\docker-compose.yml" /Y >nul

:: Check git status
echo Checking git status...
git status --porcelain
if %errorlevel% neq 0 (
    echo ❌ Git repository not found or not initialized
    pause
    exit /b 1
)

:: Add all changes
echo Adding changes to git...
git add .

:: Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ️ No changes to commit
) else (
    :: Commit changes
    echo Committing changes...
    git commit -m "Auto-deploy: %date% %time%"
)

:: Push to repository
echo Pushing to repository...
git push origin master
if %errorlevel% neq 0 (
    echo ❌ Failed to push to repository
    pause
    exit /b 1
)

:: Deploy to VPS
echo Deploying to VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && git pull origin master && docker-compose down && docker-compose build && docker-compose up -d"

if %errorlevel% neq 0 (
    echo ❌ VPS deployment failed
    echo Attempting to restore from backup...
    xcopy "backups\!backup_name!\App.tsx" "crysgarage-frontend\App.tsx" /Y >nul
    xcopy "backups\!backup_name!\globals.css" "crysgarage-frontend\styles\globals.css" /Y >nul
    if exist "backups\!backup_name!\docker-compose.yml" xcopy "backups\!backup_name!\docker-compose.yml" "docker-compose.yml" /Y >nul
    echo ✅ Backup restored
    pause
    exit /b 1
)

:: Wait for services to start
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

:: Test the application
echo Testing application...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://crysgarage.studio/health

echo ✅ Deployment completed successfully!
echo 📦 Backup saved in: backups\!backup_name!
echo 🌐 Application URL: https://crysgarage.studio

pause 