@echo off
echo 🎵 Starting Crys Garage Audio Processing Services...
echo.

echo 📁 Setting up directories...
if not exist "crysgarage-ruby\output" mkdir "crysgarage-ruby\output"
if not exist "crysgarage-ruby\temp" mkdir "crysgarage-ruby\temp"

echo.
echo 🔧 Installing Ruby dependencies...
cd crysgarage-ruby
bundle install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Ruby dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting Ruby Audio Processing Service...
start "Ruby Audio Processor" cmd /k "cd crysgarage-ruby && ruby audio_processor.rb"

echo.
echo ⏳ Waiting for Ruby service to start...
timeout /t 3 /nobreak > nul

echo.
echo 🚀 Starting Laravel Backend...
cd ..\crysgarage-backend
start "Laravel Backend" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

echo.
echo ⏳ Waiting for Laravel service to start...
timeout /t 5 /nobreak > nul

echo.
echo 🎯 Starting Frontend Development Server...
cd ..\crysgarage-frontend
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ✅ All services started!
echo.
echo 📊 Service Status:
echo    - Ruby Audio Processor: http://localhost:4567
echo    - Laravel Backend: http://localhost:8000
echo    - Frontend Dev Server: http://localhost:5173
echo.
echo 🎵 Ready for audio processing!
pause 