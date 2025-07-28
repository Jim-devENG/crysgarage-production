@echo off
echo 🎨 Frontend Only Deploy
echo ======================

set VPS_HOST=209.74.80.162
set VPS_USER=root
set VPS_PATH=/var/www/crysgarage

echo 📦 Building frontend...
cd crysgarage-frontend
call npm run build
cd ..

echo 📤 Uploading frontend only...
scp -r crysgarage-frontend/dist/* %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-frontend/dist/

echo ✅ Frontend updated in 15 seconds!
echo 🧪 Test: https://crysgarage.studio

pause 