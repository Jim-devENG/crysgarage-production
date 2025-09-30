@echo off
echo 🚀 Quick VPS Deployment for CrysGarage
echo =====================================
echo.

set /p VPS_HOST="Enter your VPS host (domain or IP): "
set /p VPS_USER="Enter VPS username (default: root): "
if "%VPS_USER%"=="" set VPS_USER=root

echo.
echo 📋 Configuration:
echo   VPS Host: %VPS_HOST%
echo   VPS User: %VPS_USER%
echo.

set /p CONFIRM="Proceed with deployment? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 1
)

echo.
echo 🚀 Starting deployment...
powershell -ExecutionPolicy Bypass -File "deploy_fresh.ps1" -VpsHost "%VPS_HOST%" -VpsUser "%VPS_USER%"

echo.
echo ✅ Deployment completed!
echo Your CrysGarage application should now be available at:
echo   🌐 http://%VPS_HOST%
echo.
pause
