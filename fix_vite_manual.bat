@echo off
echo 🔧 Manual Vite allowedHosts Fix
echo ===============================

echo.
echo 📋 Steps to fix the Vite allowedHosts issue:
echo.
echo 1. SSH into your VPS:
echo    ssh root@209.74.80.162
echo.
echo 2. Stop the frontend service:
echo    systemctl stop crysgarage-frontend
echo.
echo 3. Clear Vite cache:
echo    cd /var/www/crysgarage-deploy/crysgarage-frontend
echo    rm -rf node_modules/.vite
echo    rm -rf .vite
echo.
echo 4. Clear npm cache:
echo    npm cache clean --force
echo.
echo 5. Verify vite.config.ts has correct allowedHosts:
echo    cat vite.config.ts
echo.
echo 6. If needed, update vite.config.ts:
echo    nano vite.config.ts
echo.
echo 7. Start the frontend service:
echo    systemctl start crysgarage-frontend
echo.
echo 8. Check service status:
echo    systemctl status crysgarage-frontend
echo.
echo 9. Test the application:
echo    curl http://localhost:5173
echo.
echo 🌐 After completing these steps, test:
echo    https://crysgarage.studio
echo.
echo ✅ The allowedHosts issue should be resolved!
echo.
pause 