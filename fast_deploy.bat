@echo off
setlocal enabledelayedexpansion

echo 🚀 Crys Garage Fast Deployment System
echo =====================================

:: Configuration
set VPS_HOST=209.74.80.162
set VPS_USER=root
set GITHUB_REPO=https://github.com/Jim-devENG/Crysgarage.git

:: Colors
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%Step 1: Local Development Check%RESET%
echo ================================

:: Check if we're in the right directory
if not exist "crysgarage-frontend" (
    echo %RED%❌ Error: Not in Crys Garage project directory%RESET%
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Check git status
echo %YELLOW%📊 Checking git status...%RESET%
git status --porcelain > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if not "%STATUS%"=="" (
    echo %YELLOW%📝 Changes detected. Staging files...%RESET%
    git add .
    
    echo %YELLOW%💬 Enter commit message (or press Enter for default):%RESET%
    set /p COMMIT_MSG=
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=Fast deploy: Update application
    
    echo %BLUE%💾 Committing changes...%RESET%
    git commit -m "!COMMIT_MSG!"
) else (
    echo %GREEN%✅ No changes to commit%RESET%
)

echo %BLUE%Step 2: Push to GitHub%RESET%
echo =====================

echo %YELLOW%📤 Pushing to GitHub...%RESET%
git push origin master

if %ERRORLEVEL% neq 0 (
    echo %RED%❌ Failed to push to GitHub%RESET%
    echo Please check your git configuration and try again.
    pause
    exit /b 1
)

echo %GREEN%✅ Successfully pushed to GitHub%RESET%

echo %BLUE%Step 3: Trigger VPS Deployment%RESET%
echo =============================

echo %YELLOW%🌐 Triggering automatic deployment to VPS...%RESET%
echo %BLUE%The GitHub Actions workflow will automatically deploy to your VPS.%RESET%
echo %BLUE%You can monitor the deployment at: https://github.com/Jim-devENG/Crysgarage/actions%RESET%

:: Wait a moment for GitHub Actions to start
timeout /t 3 /nobreak >nul

echo %BLUE%Step 4: Verify Deployment%RESET%
echo ========================

echo %YELLOW%🔍 Checking VPS deployment status...%RESET%
echo %BLUE%Waiting for deployment to complete...%RESET%

:: Wait for deployment (adjust timeout as needed)
timeout /t 30 /nobreak >nul

echo %YELLOW%🌐 Testing application availability...%RESET%

:: Test if the application is accessible
curl -s -o nul -w "%%{http_code}" https://crysgarage.studio > temp_response.txt 2>nul
set /p HTTP_CODE=<temp_response.txt
del temp_response.txt

if "%HTTP_CODE%"=="200" (
    echo %GREEN%✅ Application is live and accessible!%RESET%
) else (
    echo %YELLOW%⚠️  Application might still be deploying (HTTP: %HTTP_CODE%)%RESET%
)

echo.
echo %GREEN%🎉 Fast Deployment Summary%RESET%
echo =========================
echo %GREEN%✅ Local changes committed%RESET%
echo %GREEN%✅ Code pushed to GitHub%RESET%
echo %GREEN%✅ VPS deployment triggered%RESET%
echo.
echo %BLUE%🌐 Your application: https://crysgarage.studio%RESET%
echo %BLUE%📊 GitHub Actions: https://github.com/Jim-devENG/Crysgarage/actions%RESET%
echo %BLUE%🔧 VPS Status: SSH to %VPS_HOST% and run 'systemctl status crysgarage-*'%RESET%
echo.
echo %YELLOW%💡 Tip: You can also manually trigger deployment from GitHub Actions tab%RESET%

pause 