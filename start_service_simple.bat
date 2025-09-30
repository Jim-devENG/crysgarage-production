@echo off
echo Starting Python Audio Service...

REM Change to the script directory
cd /d "%~dp0"

REM Activate virtual environment and start service
echo Activating virtual environment...
call "venv\Scripts\activate.bat"

echo Starting Python service on port 8002...
echo Press Ctrl+C to stop
echo.

python main.py

pause
