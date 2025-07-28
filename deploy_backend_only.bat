@echo off
echo 🔧 Backend Only Deploy
echo =====================

set VPS_HOST=209.74.80.162
set VPS_USER=root
set VPS_PATH=/var/www/crysgarage

echo 📤 Uploading backend files...
scp -r crysgarage-backend/app/Http/Controllers/* %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/app/Http/Controllers/
scp -r crysgarage-backend/bootstrap/app.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/bootstrap/
scp -r crysgarage-backend/routes/api.php %VPS_USER%@%VPS_HOST%:%VPS_PATH%/crysgarage-backend/routes/

echo 🔧 Restarting backend...
ssh %VPS_USER%@%VPS_HOST% "cd /var/www/crysgarage/crysgarage-backend && php artisan config:cache && systemctl restart crysgarage-backend"

echo ✅ Backend updated in 10 seconds!
echo 🧪 Test API: https://api.crysgarage.studio

pause 