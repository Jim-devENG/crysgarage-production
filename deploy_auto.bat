@echo off
echo Starting automated deployment...
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PowerShell is not available
    pause
    exit /b 1
)

REM Run the PowerShell deployment script
powershell -ExecutionPolicy Bypass -File "deploy_auto.ps1"

REM Check if deployment was successful
if %errorlevel% equ 0 (
    echo.
    echo Deployment completed successfully!
    echo Your application should be running on: http://209.74.80.162
) else (
    echo.
    echo Deployment failed. Check the output above for details.
)

echo.
pause
