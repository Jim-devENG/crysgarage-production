@echo off
title Crys Garage - Server Test
color 0B

echo.
echo ========================================
echo    🧪 Crys Garage - Server Test
echo ========================================
echo.

echo 🔍 Testing server availability...
echo.

:: Test Frontend
echo Testing Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:5173
) else (
    echo ❌ Frontend is not running
)

:: Test Ruby Backend
echo Testing Ruby Backend (Port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ruby Backend is running at http://localhost:3000
) else (
    echo ❌ Ruby Backend is not running
)

:: Test PHP Backend
echo Testing PHP Backend (Port 8000)...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PHP Backend is running at http://localhost:8000
) else (
    echo ❌ PHP Backend is not running
)

:: Test Node.js Backend
echo Testing Node.js Backend (Port 3001)...
curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js Backend is running at http://localhost:3001
) else (
    echo ❌ Node.js Backend is not running
)

echo.
echo ========================================
echo 🎉 Test Complete!
echo ========================================
echo.

echo 📊 Summary:
echo - Frontend: http://localhost:5173
echo - Ruby Backend: http://localhost:3000
echo - PHP Backend: http://localhost:8000
echo - Node.js Backend: http://localhost:3001
echo.

echo 💡 If any servers are not running, use:
echo    npm run start-all
echo    or
echo    start_all_servers.bat
echo.

pause
