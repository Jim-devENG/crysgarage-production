@echo off
setlocal enabledelayedexpansion

echo 🚀 Crys Garage Fast Deployment System
echo =====================================

:: Configuration
set VPS_HOST=209.74.80.162
set VPS_USER=root
set GITHUB_REPO=https://github.com/Jim-devENG/Crysgarage.git
set APP_URL=https://crysgarage.studio

echo Step 1: Local Development Check
echo ================================

:: Check if we're in the right directory
if not exist "crysgarage-frontend" (
    echo ❌ Error: Not in Crys Garage project directory
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Check git status
echo 📊 Checking git status...
git status --porcelain > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if not "%STATUS%"=="" (
    echo 📝 Changes detected. Staging files...
    git add .
    
    echo 💬 Enter commit message (or press Enter for default):
    set /p COMMIT_MSG=
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=Fast deploy: Update application
    
    echo 💾 Committing changes...
    git commit -m "!COMMIT_MSG!"
) else (
    echo ✅ No changes to commit
)

echo.
echo Step 2: Push to GitHub
echo =====================

echo 📤 Pushing to GitHub...
git push origin master

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to push to GitHub
    echo Please check your git configuration and try again.
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub

echo.
echo Step 3: Trigger VPS Deployment
echo =============================

echo 🌐 Triggering automatic deployment to VPS...
echo The GitHub Actions workflow will automatically deploy to your VPS.
echo You can monitor the deployment at: https://github.com/Jim-devENG/Crysgarage/actions

:: Wait a moment for GitHub Actions to start
timeout /t 3 /nobreak >nul

echo.
echo Step 4: Verify Deployment
echo ========================

echo 🔍 Checking VPS deployment status...
echo Waiting for deployment to complete...

:: Wait for deployment (adjust timeout as needed)
timeout /t 30 /nobreak >nul

echo 🌐 Testing application availability...

:: Test if the application is accessible
curl -s -o nul -w "%%{http_code}" %APP_URL% > temp_response.txt 2>nul
set /p HTTP_CODE=<temp_response.txt
del temp_response.txt

if "%HTTP_CODE%"=="200" (
    echo ✅ Application is live and accessible!
) else (
    echo ⚠️  Application might still be deploying (HTTP: %HTTP_CODE%)
)

echo.
echo 🎉 Fast Deployment Summary
echo =========================
echo ✅ Local changes committed
echo ✅ Code pushed to GitHub
echo ✅ VPS deployment triggered
echo.
echo 🌐 Your application: %APP_URL%
echo 📊 GitHub Actions: https://github.com/Jim-devENG/Crysgarage/actions
echo 🔧 VPS Status: SSH to %VPS_HOST% and run 'systemctl status crysgarage-*'
echo.
echo 💡 Tip: You can also manually trigger deployment from GitHub Actions tab

pause 