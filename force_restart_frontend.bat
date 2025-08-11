@echo off
echo 🔄 Force Restarting Crys Garage Frontend...
echo ==========================================

echo 🛑 Killing all npm processes...
wsl -d Ubuntu -e bash -c "pkill -f npm"
wsl -d Ubuntu -e bash -c "pkill -f node"

echo ⏳ Waiting for processes to stop...
timeout /t 5 /nobreak >nul

echo 🧹 Clearing npm cache...
wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/MIKENZY/Documents/Apps/Crys\ Garage/crysgarage-frontend && npm cache clean --force"

echo 🚀 Starting fresh frontend development server...
start "Crys Garage Frontend" wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/MIKENZY/Documents/Apps/Crys\ Garage/crysgarage-frontend && npm run dev"

echo ✅ Frontend force restarted!
echo 🌐 Your app should be available at: http://localhost:5173
echo 📝 If you still see errors, try refreshing the browser
pause
