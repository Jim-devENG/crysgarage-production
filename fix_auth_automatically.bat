@echo off
echo ========================================
echo Crys Garage - Automatic Auth Fix
echo ========================================

echo.
echo Starting Laravel backend...
cd crysgarage-backend
start "Laravel Backend" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

echo.
echo Starting React frontend...
cd ..\crysgarage-frontend
start "React Frontend" cmd /k "npm run dev"

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173 (or check terminal)
echo.
echo The app will automatically detect and fix
echo authentication issues when you try to upload audio.
echo.
echo If you still get 401 errors:
echo 1. Open browser developer tools (F12)
echo 2. Go to Console tab
echo 3. Look for authentication fix messages
echo 4. Try uploading audio again
echo.
pause 