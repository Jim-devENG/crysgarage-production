@echo off
echo 🔄 Restarting Crys Garage Frontend...
echo =====================================

echo 🛑 Stopping current frontend process...
wsl -d Ubuntu -e bash -c "pkill -f 'npm run dev'"

echo ⏳ Waiting for process to stop...
timeout /t 3 /nobreak >nul

echo 🚀 Starting frontend development server...
start "Crys Garage Frontend" wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/MIKENZY/Documents/Apps/Crys\ Garage/crysgarage-frontend && npm run dev"

echo ✅ Frontend restarted!
echo 🌐 Your app should be available at: http://localhost:5173
pause 