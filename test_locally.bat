@echo off
setlocal enabledelayedexpansion

echo 🧪 Crys Garage Local Testing Script
echo =================================

REM Check if we're in the right directory
if not exist "crysgarage-frontend" (
    echo ❌ ERROR: crysgarage-frontend directory not found
    echo Please run this script from the Crys Garage project root directory
    pause
    exit /b 1
)

if not exist "crysgarage-backend" (
    echo ❌ ERROR: crysgarage-backend directory not found
    echo Please run this script from the Crys Garage project root directory
    pause
    exit /b 1
)

echo.
echo 📋 Testing Checklist:
echo ====================

echo.
echo 1️⃣ Testing Frontend Dependencies...
cd crysgarage-frontend
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies already installed
)

echo.
echo 2️⃣ Testing Frontend Build...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend builds successfully

echo.
echo 3️⃣ Testing Backend Dependencies...
cd ..\crysgarage-backend
if not exist "vendor" (
    echo 📥 Installing backend dependencies...
    call composer install
    if errorlevel 1 (
        echo ❌ Backend dependency installation failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies already installed
)

echo.
echo 4️⃣ Testing Backend Configuration...
if not exist ".env" (
    echo 📝 Creating .env file...
    copy .env.example .env
    call php artisan key:generate
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo 5️⃣ Testing Database...
if not exist "database\database.sqlite" (
    echo 📝 Creating database...
    type nul > database\database.sqlite
    echo ✅ Database file created
) else (
    echo ✅ Database file exists
)

echo.
echo 6️⃣ Testing Database Migrations...
call php artisan migrate --force
if errorlevel 1 (
    echo ❌ Database migration failed
    pause
    exit /b 1
)
echo ✅ Database migrations successful

echo.
echo 7️⃣ Testing Demo User Seeding...
call php artisan db:seed --class=DemoUserSeeder --force
if errorlevel 1 (
    echo ❌ Demo user seeding failed
    pause
    exit /b 1
)
echo ✅ Demo users seeded successfully

echo.
echo 8️⃣ Testing Backend Server...
echo Starting backend server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo 🧪 Test the following:
echo    - Frontend: http://localhost:3000 (run 'npm run dev' in crysgarage-frontend)
echo    - Backend API: http://localhost:8000/api/auth/signin
echo    - Demo login: demo.free@crysgarage.com / password
echo.
echo 📋 Login Modal Test Checklist:
echo    ✅ Modal opens when clicking "Sign In" or "Get Started"
echo    ✅ Modal closes when clicking X button
echo    ✅ Modal closes when clicking outside (backdrop)
echo    ✅ Demo login works with correct credentials
echo    ✅ Error messages display for invalid credentials
echo.

cd ..\crysgarage-backend
call php artisan serve --port=8000

pause 