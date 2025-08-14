@echo off
title Crys Garage - Start All Servers
color 0A

echo.
echo ========================================
echo    🎵 Crys Garage - Start All Servers
echo ========================================
echo.

:: Kill any existing processes on common ports
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a 2>nul

:: Start Frontend Server
echo 🚀 Starting Frontend Server (Vite)...
start "Frontend Server" cmd /k "cd /d %~dp0crysgarage-frontend && npm run dev"

:: Wait a moment
timeout /t 3 /nobreak >nul

:: Check and start Ruby backend
if exist "crysgarage-ruby" (
    echo 💎 Starting Ruby Backend Server...
    if exist "crysgarage-ruby\Gemfile" (
        start "Ruby Backend" cmd /k "cd /d %~dp0crysgarage-ruby && bundle install && rails server -p 3000"
    ) else if exist "crysgarage-ruby\app.rb" (
        start "Ruby Backend" cmd /k "cd /d %~dp0crysgarage-ruby && ruby app.rb"
    ) else if exist "crysgarage-ruby\config.ru" (
        start "Ruby Backend" cmd /k "cd /d %~dp0crysgarage-ruby && rackup -p 3000"
    ) else (
        echo ⚠️  Ruby backend found but no recognized framework detected
    )
    timeout /t 3 /nobreak >nul
)

:: Check and start Node.js backend
if exist "crysgarage-backend" (
    echo 🟢 Starting Node.js Backend Server...
    if exist "crysgarage-backend\package.json" (
        start "Node.js Backend" cmd /k "cd /d %~dp0crysgarage-backend && npm install && npm start"
    ) else if exist "crysgarage-backend\server.js" (
        start "Node.js Backend" cmd /k "cd /d %~dp0crysgarage-backend && node server.js"
    ) else (
        echo ⚠️  Node.js backend found but no package.json or server.js detected
    )
    timeout /t 3 /nobreak >nul
)

:: Check and start PHP backend
if exist "crysgarage-php" (
    echo 🐘 Starting PHP Backend Server...
    start "PHP Backend" cmd /k "cd /d %~dp0crysgarage-php && php -S localhost:8000"
    timeout /t 3 /nobreak >nul
)

:: Wait for servers to start
echo ⏳ Waiting for servers to be ready...
timeout /t 5 /nobreak >nul

:: Check server status
echo 🔍 Checking server status...
echo.

:: Check Frontend
netstat -an | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend (Vite) is running at http://localhost:5173
) else (
    echo ❌ Frontend (Vite) is not running
)

:: Check Ruby Backend
netstat -an | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✅ Ruby Backend is running at http://localhost:3000
) else (
    echo ❌ Ruby Backend is not running
)

:: Check PHP Backend
netstat -an | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo ✅ PHP Backend is running at http://localhost:8000
) else (
    echo ❌ PHP Backend is not running
)

:: Check Node.js Backend
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✅ Node.js Backend is running at http://localhost:3001
) else (
    echo ❌ Node.js Backend is not running
)

echo.
echo 🌐 Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo 🎉 All servers started!
echo ========================================
echo Frontend: http://localhost:5173
echo Ruby Backend: http://localhost:3000
echo PHP Backend: http://localhost:8000
echo Node.js Backend: http://localhost:3001
echo.
echo Press any key to stop all servers...
pause >nul

echo 🛑 Stopping all servers...
taskkill /f /im node.exe 2>nul
taskkill /f /im ruby.exe 2>nul
taskkill /f /im php.exe 2>nul
taskkill /f /im cmd.exe 2>nul

echo ✅ All servers stopped
pause
