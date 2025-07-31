@echo off
echo 🚀 Crys Garage GitHub Deployment
echo ================================

echo 📊 Checking current git status...
git status

echo.
echo 💬 Do you want to commit and push changes? (y/n)
set /p CONFIRM=
if /i not "%CONFIRM%"=="y" (
    echo ❌ Deployment cancelled
    pause
    exit /b 0
)

echo.
echo 📝 Staging all changes...
git add .

echo 💬 Enter commit message (or press Enter for default):
set /p COMMIT_MSG=
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Deploy: Update application

echo 💾 Committing changes...
git commit -m "%COMMIT_MSG%"

echo.
echo 📤 Pushing to GitHub...
git push origin master

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to push to GitHub
    echo Please check your git configuration and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Successfully pushed to GitHub!
echo.
echo 🌐 GitHub Actions will automatically deploy to your VPS
echo 📊 Monitor deployment at: https://github.com/Jim-devENG/Crysgarage/actions
echo 🌐 Your application: https://crysgarage.studio
echo.
echo ⏳ Waiting 10 seconds for deployment to start...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Testing application availability...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://crysgarage.studio

echo.
echo 🎉 Deployment Summary:
echo ✅ Code pushed to GitHub
echo ✅ Automated deployment triggered
echo 🌐 Check status at: https://github.com/Jim-devENG/Crysgarage/actions
echo 🌐 Application: https://crysgarage.studio

pause 