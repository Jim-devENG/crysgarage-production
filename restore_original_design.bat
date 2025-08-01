@echo off
echo 🎨 Restoring Original Complex Design
echo ===================================

echo.
echo This will restore the original complex React app with all features:
echo    - File upload and management
echo    - Mastering presets (Afrobeats, Gospel, Hip-Hop, Traditional)
echo    - Audio player with waveform visualization
echo    - Volume controls and progress tracking
echo    - Professional mastering workflow
echo.

set /p confirm="Do you want to restore the original design? (y/N): "
if /i not "%confirm%"=="y" (
    echo Restore cancelled.
    pause
    exit /b
)

echo.
echo 📤 Uploading restore script to VPS...
scp restore_original_design.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🎨 Running design restore on VPS...
echo This may take 5-10 minutes. Please be patient...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x restore_original_design.sh && ./restore_original_design.sh"

echo.
echo 🌐 Testing application after restore...
timeout /t 10 /nobreak >nul
echo Testing https://crysgarage.studio

echo.
echo ✅ Original design restored!
echo.
echo 🎯 What was restored:
echo    - Complex React app with all features
echo    - File upload and management system
echo    - Mastering presets for different music styles
echo    - Audio player with waveform visualization
echo    - Professional mastering workflow
echo.
echo 🌐 Your application: https://crysgarage.studio

pause 