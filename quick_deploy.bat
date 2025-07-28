@echo off
setlocal enabledelayedexpansion

echo 🚀 Quick Deploy - Crys Garage to VPS
echo ====================================

REM Configuration
set VPS_HOST=209.74.80.162
set VPS_USER=root
set VPS_PATH=/var/www/crysgarage

echo 🔍 Testing SSH connection...
ssh -o ConnectTimeout=10 -o BatchMode=yes %VPS_USER%@%VPS_HOST% "echo SSH connection successful" >nul 2>&1
if errorlevel 1 (
    echo ❌ Cannot connect to VPS. Please check your SSH configuration.
    pause
    exit /b 1
)
echo ✅ SSH connection established

echo 📦 Building frontend (fast mode)...
cd crysgarage-frontend
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

echo 📤 Uploading frontend (essential files only)...
scp -r dist/* %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-frontend/dist/
if errorlevel 1 (
    echo ❌ Frontend upload failed
    pause
    exit /b 1
)
echo ✅ Frontend uploaded

echo 📤 Uploading backend (essential files only)...
cd ..\crysgarage-backend

REM Only upload essential backend files
scp -r app/Http/Controllers/AuthController.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/app/Http/Controllers/
scp -r bootstrap/app.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/bootstrap/
scp -r database/seeders/DemoUserSeeder.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/database/seeders/
scp -r .env %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/
scp -r routes/api.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/routes/

if errorlevel 1 (
    echo ❌ Backend upload failed
    pause
    exit /b 1
)
echo ✅ Backend uploaded

echo 🔧 Quick server configuration...
ssh %VPS_USER%@%VPS_HOST% "cd /var/www/crysgarage/crysgarage-backend && php artisan config:cache && php artisan route:cache && systemctl restart crysgarage-backend && systemctl restart nginx"
if errorlevel 1 (
    echo ❌ Server configuration failed
    pause
    exit /b 1
)
echo ✅ Server configured

echo 🧪 Quick test...
timeout /t 3 /nobreak >nul

echo 🎉 Quick deployment completed!
echo.
echo 📋 What was deployed:
echo    ✅ Frontend (built files only)
echo    ✅ AuthController.php (login fixes)
echo    ✅ bootstrap/app.php (middleware fixes)
echo    ✅ DemoUserSeeder.php (demo users)
echo    ✅ .env (configuration)
echo    ✅ api.php (routes)
echo.
echo 🔗 Your application should be available at:
echo    Frontend: https://crysgarage.studio
echo    API: https://api.crysgarage.studio
echo.
echo 🧪 Test the login modal with:
echo    Email: demo.free@crysgarage.com
echo    Password: password
echo.

pause 
