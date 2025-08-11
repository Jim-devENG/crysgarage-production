@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Crys Garage - Service Troubleshooting
echo ========================================
echo.

:: Configuration
set VPS_IP=209.74.80.162
set VPS_USER=root

:: Colors
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

:menu
echo %BLUE%Select an option:%RESET%
echo.
echo 1. Check all service statuses
echo 2. View service logs
echo 3. Restart all services
echo 4. Check disk space and memory
echo 5. Test API endpoints
echo 6. Fix common issues
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto check_status
if "%choice%"=="2" goto view_logs
if "%choice%"=="3" goto restart_services
if "%choice%"=="4" goto check_resources
if "%choice%"=="5" goto test_apis
if "%choice%"=="6" goto fix_issues
if "%choice%"=="7" goto exit
goto menu

:check_status
echo.
echo %BLUE%=== Checking Service Status ===%RESET%
ssh %VPS_USER%@%VPS_IP% "echo 'Backend Status:' && systemctl status crysgarage-backend --no-pager -l && echo && echo 'Ruby Status:' && systemctl status crysgarage-ruby --no-pager -l && echo && echo 'Nginx Status:' && systemctl status nginx --no-pager -l"
echo.
pause
goto menu

:view_logs
echo.
echo %BLUE%=== View Service Logs ===%RESET%
echo.
echo 1. Backend logs (last 20 lines)
echo 2. Ruby logs (last 20 lines)
echo 3. Nginx logs (last 20 lines)
echo 4. Back to main menu
echo.
set /p log_choice="Enter your choice (1-4): "

if "%log_choice%"=="1" (
    ssh %VPS_USER%@%VPS_IP% "journalctl -u crysgarage-backend -n 20 --no-pager"
) else if "%log_choice%"=="2" (
    ssh %VPS_USER%@%VPS_IP% "journalctl -u crysgarage-ruby -n 20 --no-pager"
) else if "%log_choice%"=="3" (
    ssh %VPS_USER%@%VPS_IP% "journalctl -u nginx -n 20 --no-pager"
) else if "%log_choice%"=="4" (
    goto menu
)
echo.
pause
goto menu

:restart_services
echo.
echo %BLUE%=== Restarting All Services ===%RESET%
ssh %VPS_USER%@%VPS_IP% "systemctl restart crysgarage-backend && systemctl restart crysgarage-ruby && systemctl reload nginx && echo 'All services restarted'"
echo.
pause
goto menu

:check_resources
echo.
echo %BLUE%=== Checking System Resources ===%RESET%
ssh %VPS_USER%@%VPS_IP% "echo 'Disk Usage:' && df -h && echo && echo 'Memory Usage:' && free -h && echo && echo 'Process Count:' && ps aux | wc -l"
echo.
pause
goto menu

:test_apis
echo.
echo %BLUE%=== Testing API Endpoints ===%RESET%
ssh %VPS_USER%@%VPS_IP% "echo 'Testing Backend API...' && curl -s -o /dev/null -w 'Backend API: %%{http_code}' http://localhost:8000/api/ || echo 'Backend API: Failed' && echo && echo 'Testing Ruby Service...' && curl -s -o /dev/null -w 'Ruby Service: %%{http_code}' http://localhost:4567/ || echo 'Ruby Service: Failed' && echo && echo 'Testing HTTPS Frontend...' && curl -s -o /dev/null -w 'HTTPS Frontend: %%{http_code}' https://crysgarage.studio/ || echo 'HTTPS Frontend: Failed'"
echo.
pause
goto menu

:fix_issues
echo.
echo %BLUE%=== Fix Common Issues ===%RESET%
echo.
echo 1. Fix Ruby gem issues
echo 2. Fix Laravel cache issues
echo 3. Fix Nginx configuration
echo 4. Fix file permissions
echo 5. Back to main menu
echo.
set /p fix_choice="Enter your choice (1-5): "

if "%fix_choice%"=="1" (
    echo %YELLOW%Fixing Ruby gem issues...%RESET%
    ssh %VPS_USER%@%VPS_IP% "cd /var/www/crysgarage/crysgarage-ruby && bundle install && systemctl restart crysgarage-ruby"
) else if "%fix_choice%"=="2" (
    echo %YELLOW%Fixing Laravel cache issues...%RESET%
    ssh %VPS_USER%@%VPS_IP% "cd /var/www/crysgarage/crysgarage-backend && php artisan config:clear && php artisan route:clear && php artisan view:clear && php artisan cache:clear && systemctl restart crysgarage-backend"
) else if "%fix_choice%"=="3" (
    echo %YELLOW%Fixing Nginx configuration...%RESET%
    ssh %VPS_USER%@%VPS_IP% "nginx -t && systemctl reload nginx"
) else if "%fix_choice%"=="4" (
    echo %YELLOW%Fixing file permissions...%RESET%
    ssh %VPS_USER%@%VPS_IP% "chown -R www-data:www-data /var/www/crysgarage/crysgarage-backend/storage && chmod -R 775 /var/www/crysgarage/crysgarage-backend/storage"
) else if "%fix_choice%"=="5" (
    goto menu
)
echo.
pause
goto menu

:exit
echo %GREEN%Goodbye!%RESET%
exit /b 0