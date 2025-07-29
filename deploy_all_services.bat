@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Crys Garage - Complete Deployment Script
echo ========================================
echo.

:: Configuration
set VPS_IP=209.74.80.162
set VPS_USER=root
set PROJECT_PATH=/var/www/crysgarage
set BACKEND_PATH=%PROJECT_PATH%/crysgarage-backend
set FRONTEND_PATH=%PROJECT_PATH%/crysgarage-frontend
set RUBY_PATH=%PROJECT_PATH%/crysgarage-ruby

:: Colors for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

:: Function to print colored output
:print_status
echo %~1%~2%RESET%
goto :eof

:: Function to check if command succeeded
:check_error
if %errorlevel% neq 0 (
    call :print_status "%RED%" "ERROR: %~1"
    exit /b 1
) else (
    call :print_status "%GREEN%" "✓ %~1"
)
goto :eof

echo %BLUE%Step 1: Preparing local changes...%RESET%
echo.

:: Check if there are any uncommitted changes
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    call :print_status "%YELLOW%" "Found uncommitted changes, adding them..."
    git add .
    if %errorlevel% neq 0 (
        call :print_status "%RED%" "Failed to add files to git"
        exit /b 1
    )
    
    git commit -m "Auto-deploy: %date% %time%"
    if %errorlevel% neq 0 (
        call :print_status "%RED%" "Failed to commit changes"
        exit /b 1
    )
    call :print_status "%GREEN%" "✓ Changes committed"
) else (
    call :print_status "%GREEN%" "✓ No uncommitted changes found"
)

echo.
echo %BLUE%Step 2: Pushing to GitHub...%RESET%
echo.

git push origin master
call :check_error "Failed to push to GitHub"

echo.
echo %BLUE%Step 3: Deploying to VPS...%RESET%
echo.

:: Connect to VPS and deploy
ssh %VPS_USER%@%VPS_IP% "bash -c '
echo \"=== Deploying Crys Garage Services ===\"
echo

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e \"\\033[92m✓ $1\\033[0m\"
    else
        echo -e \"\\033[91m✗ $1\\033[0m\"
        return 1
    fi
}

# Function to check service status
check_service() {
    local service_name=$1
    local display_name=$2
    if systemctl is-active --quiet $service_name; then
        echo -e \"\\033[92m✓ $display_name is running\\033[0m\"
        return 0
    else
        echo -e \"\\033[91m✗ $display_name is not running\\033[0m\"
        return 1
    fi
}

# Navigate to project directory
cd %PROJECT_PATH% || exit 1

echo \"Step 1: Pulling latest changes from GitHub...\"
git stash -q 2>/dev/null || true
git pull origin master
print_status \"Git pull completed\"

echo
echo \"Step 2: Deploying Backend (Laravel)...\"
cd %BACKEND_PATH%

# Install/update PHP dependencies
composer install --no-dev --optimize-autoloader
print_status \"Composer dependencies installed\"

# Clear Laravel caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
print_status \"Laravel caches cleared\"

# Restart backend service
systemctl restart crysgarage-backend
sleep 3
check_service crysgarage-backend \"Laravel Backend\"

echo
echo \"Step 3: Deploying Frontend (React)...\"
cd %FRONTEND_PATH%

# Install/update Node.js dependencies
npm ci --production
print_status \"Node.js dependencies installed\"

# Build frontend
npm run build
print_status \"Frontend build completed\"

echo
echo \"Step 4: Deploying Ruby Service...\"
cd %RUBY_PATH%

# Install/update Ruby gems
bundle install
print_status \"Ruby gems installed\"

# Restart Ruby service
systemctl restart crysgarage-ruby
sleep 3
check_service crysgarage-ruby \"Ruby Audio Processor\"

echo
echo \"Step 5: Restarting Nginx...\"
systemctl reload nginx
print_status \"Nginx reloaded\"

echo
echo \"Step 6: Final Service Status Check...\"
echo

# Check all services
backend_status=0
ruby_status=0
nginx_status=0

check_service crysgarage-backend \"Laravel Backend\" || backend_status=1
check_service crysgarage-ruby \"Ruby Audio Processor\" || ruby_status=1
check_service nginx \"Nginx Web Server\" || nginx_status=1

echo
echo \"Step 7: Testing API endpoints...\"
echo

# Test backend API
if curl -s -f http://localhost:8000/api/health >/dev/null 2>&1; then
    echo -e \"\\033[92m✓ Backend API is responding\\033[0m\"
else
    echo -e \"\\033[93m⚠ Backend API health check failed (this is normal if no health endpoint exists)\\033[0m\"
fi

# Test Ruby service
if curl -s -f http://localhost:4567/ >/dev/null 2>&1; then
    echo -e \"\\033[92m✓ Ruby service is responding\\033[0m\"
else
    echo -e \"\\033[91m✗ Ruby service is not responding\\033[0m\"
    ruby_status=1
fi

# Test HTTPS frontend
if curl -s -f https://crysgarage.studio/ >/dev/null 2>&1; then
    echo -e \"\\033[92m✓ Frontend is accessible via HTTPS\\033[0m\"
else
    echo -e \"\\033[91m✗ Frontend is not accessible via HTTPS\\033[0m\"
    nginx_status=1
fi

echo
echo \"=== Deployment Summary ===\"
if [ $backend_status -eq 0 ] && [ $ruby_status -eq 0 ] && [ $nginx_status -eq 0 ]; then
    echo -e \"\\033[92m🎉 All services deployed successfully!\\033[0m\"
    echo -e \"\\033[92m🌐 Your site is live at: https://crysgarage.studio\\033[0m\"
    exit 0
else
    echo -e \"\\033[91m⚠ Some services may have issues. Please check the logs:\\033[0m\"
    echo -e \"\\033[93m   Backend: journalctl -u crysgarage-backend -n 20\\033[0m\"
    echo -e \"\\033[93m   Ruby: journalctl -u crysgarage-ruby -n 20\\033[0m\"
    echo -e \"\\033[93m   Nginx: journalctl -u nginx -n 20\\033[0m\"
    exit 1
fi
'"

:: Check the deployment result
if %errorlevel% equ 0 (
    echo.
    call :print_status "%GREEN%" "🎉 Deployment completed successfully!"
    call :print_status "%GREEN%" "🌐 Your site is live at: https://crysgarage.studio"
) else (
    echo.
    call :print_status "%RED%" "⚠ Deployment completed with some issues."
    call :print_status "%YELLOW%" "Please check the service logs on the VPS."
)

echo.
echo %BLUE%========================================%RESET%
echo %BLUE%Deployment completed!%RESET%
echo %BLUE%========================================%RESET%
echo.
pause