@echo off
echo Stopping Python service on port 8002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002') do (
    echo Killing process %%a
    taskkill /PID %%a /F
)

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Python service...
echo Please run this from your venv environment:
echo python main.py
pause
