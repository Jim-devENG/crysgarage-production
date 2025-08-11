@echo off
echo 🔥 Hotfix Deploy - Login Modal Fixes Only
echo =========================================

set VPS_HOST=209.74.80.162
set VPS_USER=root
set VPS_PATH=/var/www/crysgarage

echo 🔍 Testing connection...
ssh -o ConnectTimeout=5 %VPS_USER%@%VPS_HOST% "echo OK" >nul 2>&1
if errorlevel 1 (
    echo ❌ Connection failed
    pause
    exit /b 1
)

echo 📦 Building frontend...
cd crysgarage-frontend
call npm run build
cd ..

echo 📤 Uploading login fixes...
scp -r crysgarage-frontend/dist/* %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-frontend/dist/
scp crysgarage-backend/app/Http/Controllers/AuthController.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/app/Http/Controllers/
scp crysgarage-backend/bootstrap/app.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/bootstrap/

echo 🔧 Restarting services...
ssh %VPS_USER%@%VPS_HOST% "systemctl restart crysgarage-backend && systemctl restart nginx"

echo ✅ Hotfix deployed in 30 seconds!
echo.
echo 🧪 Test: https://crysgarage.studio
echo    Login: demo.free@crysgarage.com / password

pause 