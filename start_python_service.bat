@echo off
echo ========================================
echo Starting CrysGarage Python Audio Service
echo ========================================

echo.
echo [1/3] Stopping any existing Python service on port 8002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002 2^>nul') do (
    echo   Killing existing process %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo [2/3] Activating Python virtual environment...
call "venv\Scripts\activate.bat"
if errorlevel 1 (
    echo   ERROR: Failed to activate virtual environment!
    echo   Make sure you're in the audio-mastering-service directory
    pause
    exit /b 1
)

echo   Virtual environment activated successfully!

echo.
echo [3/3] Starting Python audio mastering service...
echo   Service will be available at: http://localhost:8002
echo   Press Ctrl+C to stop the service
echo.

python main.py

echo.
echo Service stopped.
pause
