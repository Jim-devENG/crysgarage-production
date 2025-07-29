@echo off
setlocal enabledelayedexpansion

echo 🎵 Crys Garage Service Integration Script
echo ============================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  Warning: Not running as administrator. Some features may be limited.
    echo.
)

:: Set colors for output
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

:: Function to print colored output
:print_status
echo %~1%~2%~3
goto :eof

:: Check prerequisites
call :print_status %BLUE% "🔍 Checking prerequisites..." %RESET%

:: Check Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Node.js not found. Please install Node.js first." %RESET%
    pause
    exit /b 1
)

:: Check PHP
php --version >nul 2>&1
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ PHP not found. Please install PHP first." %RESET%
    pause
    exit /b 1
)

:: Check Ruby
ruby --version >nul 2>&1
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Ruby not found. Please install Ruby first." %RESET%
    pause
    exit /b 1
)

:: Check Composer
composer --version >nul 2>&1
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Composer not found. Please install Composer first." %RESET%
    pause
    exit /b 1
)

call :print_status %GREEN% "✅ All prerequisites found!" %RESET%
echo.

:: Create unified environment file
call :print_status %BLUE% "🔧 Setting up unified environment..." %RESET%
if not exist ".env" (
    copy ".env.unified" ".env" >nul
    call :print_status %GREEN% "✅ Created unified .env file" %RESET%
) else (
    call :print_status %YELLOW% "⚠️  .env file already exists, skipping creation" %RESET%
)

:: Copy environment files to individual services
copy ".env" "crysgarage-backend\.env" >nul
copy ".env" "crysgarage-frontend\.env" >nul

:: Create Ruby environment file
echo RUBY_SERVICE_PORT=4567 > "crysgarage-ruby\.env"
echo RUBY_SERVICE_HOST=0.0.0.0 >> "crysgarage-ruby\.env"
echo AUDIO_PROCESSING_TIMEOUT=300 >> "crysgarage-ruby\.env"
echo MAX_FILE_SIZE=200 >> "crysgarage-ruby\.env"

call :print_status %GREEN% "✅ Environment files configured" %RESET%
echo.

:: Install dependencies
call :print_status %BLUE% "📦 Installing dependencies..." %RESET%

:: Frontend dependencies
call :print_status %YELLOW% "📦 Installing frontend dependencies..." %RESET%
cd crysgarage-frontend
call npm install
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Failed to install frontend dependencies" %RESET%
    pause
    exit /b 1
)
cd ..

:: Backend dependencies
call :print_status %YELLOW% "📦 Installing backend dependencies..." %RESET%
cd crysgarage-backend
call composer install --no-dev --optimize-autoloader
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Failed to install backend dependencies" %RESET%
    pause
    exit /b 1
)
cd ..

:: Ruby dependencies
call :print_status %YELLOW% "📦 Installing Ruby dependencies..." %RESET%
cd crysgarage-ruby
call bundle install
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Failed to install Ruby dependencies" %RESET%
    pause
    exit /b 1
)
cd ..

call :print_status %GREEN% "✅ All dependencies installed!" %RESET%
echo.

:: Setup database
call :print_status %BLUE% "🗄️  Setting up database..." %RESET%
cd crysgarage-backend

:: Create database directory if it doesn't exist
if not exist "database" mkdir database

:: Run migrations
call php artisan migrate --force
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Database migration failed" %RESET%
    pause
    exit /b 1
)

:: Seed database if needed
if exist "database\seeders\DatabaseSeeder.php" (
    call php artisan db:seed --force
)

cd ..
call :print_status %GREEN% "✅ Database setup complete!" %RESET%
echo.

:: Create necessary directories
call :print_status %BLUE% "📁 Creating necessary directories..." %RESET%

:: Ruby service directories
if not exist "crysgarage-ruby\output" mkdir "crysgarage-ruby\output"
if not exist "crysgarage-ruby\temp" mkdir "crysgarage-ruby\temp"
if not exist "crysgarage-ruby\logs" mkdir "crysgarage-ruby\logs"

:: Backend directories
if not exist "crysgarage-backend\storage\app\uploads" mkdir "crysgarage-backend\storage\app\uploads"
if not exist "crysgarage-backend\storage\app\processing" mkdir "crysgarage-backend\storage\app\processing"
if not exist "crysgarage-backend\storage\app\public" mkdir "crysgarage-backend\storage\app\public"

:: Set permissions (Windows equivalent)
icacls "crysgarage-backend\storage" /grant "Everyone:(OI)(CI)F" /T >nul 2>&1

call :print_status %GREEN% "✅ Directories created!" %RESET%
echo.

:: Build frontend
call :print_status %BLUE% "🔨 Building frontend..." %RESET%
cd crysgarage-frontend
call npm run build
if %errorLevel% neq 0 (
    call :print_status %RED% "❌ Frontend build failed" %RESET%
    pause
    exit /b 1
)
cd ..
call :print_status %GREEN% "✅ Frontend built successfully!" %RESET%
echo.

:: Start services
call :print_status %BLUE% "🚀 Starting services..." %RESET%

:: Start Ruby service
call :print_status %YELLOW% "🎵 Starting Ruby Audio Processing Service..." %RESET%
start "Ruby Audio Processor" cmd /k "cd crysgarage-ruby && ruby mastering_server.rb"

:: Wait for Ruby service to start
timeout /t 3 /nobreak > nul

:: Start Laravel backend
call :print_status %YELLOW% "🔧 Starting Laravel Backend..." %RESET%
start "Laravel Backend" cmd /k "cd crysgarage-backend && php artisan serve --host=127.0.0.1 --port=8000"

:: Wait for Laravel to start
timeout /t 5 /nobreak > nul

:: Start frontend development server
call :print_status %YELLOW% "🎨 Starting Frontend Development Server..." %RESET%
start "Frontend Dev Server" cmd /k "cd crysgarage-frontend && npm run dev"

:: Wait for frontend to start
timeout /t 3 /nobreak > nul

call :print_status %GREEN% "✅ All services started!" %RESET%
echo.

:: Display service information
call :print_status %BLUE% "📊 Service Information:" %RESET%
echo.
echo %GREEN%🎵 Ruby Audio Processor:%RESET% http://localhost:4567
echo %GREEN%🔧 Laravel Backend API:%RESET% http://localhost:8000
echo %GREEN%🎨 Frontend Dev Server:%RESET% http://localhost:5173
echo %GREEN%📚 API Documentation:%RESET% http://localhost:8000/api
echo.

:: Health check
call :print_status %BLUE% "🏥 Performing health checks..." %RESET%

:: Check Ruby service
curl -s http://localhost:4567/health >nul 2>&1
if %errorLevel% equ 0 (
    call :print_status %GREEN% "✅ Ruby service is healthy" %RESET%
) else (
    call :print_status %YELLOW% "⚠️  Ruby service health check failed (may still be starting)" %RESET%
)

:: Check Laravel backend
curl -s http://localhost:8000/api/test/debug >nul 2>&1
if %errorLevel% equ 0 (
    call :print_status %GREEN% "✅ Laravel backend is healthy" %RESET%
) else (
    call :print_status %YELLOW% "⚠️  Laravel backend health check failed (may still be starting)" %RESET%
)

echo.
call :print_status %GREEN% "🎉 Integration complete! All services are running." %RESET%
echo.
call :print_status %BLUE% "💡 Tips:" %RESET%
echo   - Use Ctrl+C in any service window to stop that service
echo   - Check the service windows for detailed logs
echo   - Access the frontend at http://localhost:5173
echo   - API endpoints are available at http://localhost:8000/api
echo.
call :print_status %YELLOW% "Press any key to open the frontend in your browser..." %RESET%
pause >nul

:: Open frontend in browser
start http://localhost:5173

echo.
call :print_status %GREEN% "🌐 Frontend opened in browser!" %RESET%
echo.
call :print_status %BLUE% "Integration script completed successfully!" %RESET%
pause