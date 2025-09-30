@echo off
echo 🎵 Starting Crys Garage Enhanced Mastering Server
echo ================================================
echo.

REM Check if Ruby is available
ruby --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ruby is not installed or not in PATH
    echo Please install Ruby and try again
    pause
    exit /b 1
)

REM Check if bundle is available
bundle --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Bundler is not installed
    echo Please install bundler: gem install bundler
    pause
    exit /b 1
)

echo ✅ Ruby and Bundler found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
bundle install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Create necessary directories
echo 📁 Creating directories...
if not exist "output" mkdir output
if not exist "logs" mkdir logs
if not exist "temp" mkdir temp

echo ✅ Directories created
echo.

REM Start the enhanced mastering server
echo 🚀 Starting Enhanced Mastering Server...
echo.
echo Server will be available at:
echo - Health check: http://localhost:4567/health
echo - Process audio: POST http://localhost:4567/process
echo - Check status: GET http://localhost:4567/status/:session_id
echo - Download file: GET http://localhost:4567/download/:session_id/:format
echo.
echo Press Ctrl+C to stop the server
echo.

bundle exec ruby mastering_server.rb

pause 