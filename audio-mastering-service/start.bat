@echo off
REM Audio Mastering Microservice Startup Script for Windows

echo 🎵 Starting Audio Mastering Microservice...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ❌ FFmpeg is not installed. Please install FFmpeg first.
    echo    Download from: https://ffmpeg.org/download.html
    echo    Or use: winget install ffmpeg
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo 📁 Creating directories...
if not exist "logs" mkdir logs
if not exist "temp_audio" mkdir temp_audio

REM Check if .env exists
if not exist ".env" (
    echo ⚙️  Creating .env file from template...
    copy .env.example .env
    echo    Please edit .env file with your configuration
)

REM Start the service
echo 🚀 Starting Audio Mastering Microservice...
echo    Service will be available at: http://localhost:8000
echo    API docs will be available at: http://localhost:8000/docs
echo    Press Ctrl+C to stop the service
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
