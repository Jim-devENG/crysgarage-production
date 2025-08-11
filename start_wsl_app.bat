@echo off
echo 🎵 Starting Crys Garage Audio Mastering Platform with WSL...
echo ========================================================

echo 🚀 Starting Frontend (React)...
start "Crys Garage Frontend" wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/MIKENZY/Documents/Apps/Crys\ Garage/crysgarage-frontend && npm run dev"

echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo 🚀 Starting Backend (Laravel)...
start "Crys Garage Backend" wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/MIKENZY/Documents/Apps/Crys\ Garage/crysgarage-backend && php artisan serve --host=0.0.0.0 --port=8001"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🚀 Starting Ruby Audio Engine...
start "Crys Garage Ruby Engine" wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/MIKENZY/Documents/Apps/Crys\ Garage/crysgarage-ruby && ruby live_audio_processor.rb -o 0.0.0.0 -p 4568"

echo.
echo ✅ Crys Garage is starting up!
echo.
echo 🌐 Your app will be available at:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:8001
echo    Ruby Service: http://localhost:4568
echo.
echo 📊 To view logs, check the individual terminal windows
echo 🛑 To stop, close the terminal windows
echo.
echo 🎵 Enjoy your Crys Garage Audio Mastering Platform!
pause
