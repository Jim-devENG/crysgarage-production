@echo off
echo 🛑 Stopping Crys Garage Audio Mastering Platform...
echo ================================================

echo 🛑 Stopping all WSL processes...
wsl -d Ubuntu -e bash -c "pkill -f 'npm run dev'"
wsl -d Ubuntu -e bash -c "pkill -f 'php artisan serve'"
wsl -d Ubuntu -e bash -c "pkill -f 'ruby live_audio_processor'"

echo ✅ All services stopped!
echo.
echo 🏗️ To start again: start_wsl_app.bat
pause
