@echo off
echo ========================================
echo Crys Garage - Quick Deploy
echo ========================================
echo.

:: Colors
set "GREEN=[92m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%Quick deployment to VPS...%RESET%
echo.

:: Add and commit changes
git add .
git commit -m "Quick deploy: %date% %time%"
if %errorlevel% neq 0 (
    echo %RED%Failed to commit changes%RESET%
    pause
    exit /b 1
)

:: Push to GitHub
git push origin master
if %errorlevel% neq 0 (
    echo %RED%Failed to push to GitHub%RESET%
    pause
    exit /b 1
)

:: Deploy to VPS
ssh root@209.74.80.162 "cd /var/www/crysgarage && git stash -q 2>/dev/null || true && git pull origin master && cd crysgarage-backend && composer install --no-dev --optimize-autoloader && php artisan config:clear && php artisan route:clear && systemctl restart crysgarage-backend && cd ../crysgarage-frontend && npm ci --production && npm run build && cd ../crysgarage-ruby && bundle install && systemctl restart crysgarage-ruby && systemctl reload nginx"

if %errorlevel% equ 0 (
    echo %GREEN%✓ Quick deployment completed!%RESET%
) else (
    echo %RED%⚠ Quick deployment had issues%RESET%
)

echo.
pause 
