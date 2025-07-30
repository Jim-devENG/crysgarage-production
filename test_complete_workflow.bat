@echo off
echo ========================================
echo   Crys Garage - Complete Workflow Test
echo ========================================
echo.

echo Starting all services...
echo.

echo [1/3] Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd crysgarage-backend && php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Ruby Mastering Service...
start "Ruby Service" cmd /k "cd crysgarage-ruby && bundle exec ruby mastering_server.rb"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend...
start "React Frontend" cmd /k "cd crysgarage-frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo Ruby:     http://localhost:4567
echo.
echo ========================================
echo   TESTING INSTRUCTIONS
echo ========================================
echo.
echo 1. OPEN FRONTEND:
echo    - Go to: http://localhost:5173
echo    - You should see the landing page
echo.
echo 2. NAVIGATE TO PRICING:
echo    - Click "Pricing" in the navigation
echo    - You should see the pricing page with tiers
echo.
echo 3. START FREE TRIAL:
echo    - Click "Start with trials" on the Free tier
echo    - You should be redirected to the Free Tier Dashboard
echo.
echo 4. TEST UPLOAD WORKFLOW:
echo    - Upload an audio file (MP3, WAV, etc.)
echo    - You should see the AI mastering process start
echo    - Progress bar should show processing steps
echo    - After completion, you should see:
echo      * Original vs Mastered comparison
echo      * Playback controls for both versions
echo      * Analysis data
echo      * Download option (with $2 payment prompt)
echo.
echo 5. EXPECTED BEHAVIOR:
echo    - Upload should work without errors
echo    - Processing should complete successfully
echo    - Results should display and stay visible
echo    - Playback controls should work
echo    - Download should prompt for payment
echo.
echo 6. TROUBLESHOOTING:
echo    - If upload fails, check browser console for errors
echo    - If processing fails, check Laravel logs
echo    - If Ruby service fails, check Ruby console
echo.
echo ========================================
echo   MONITORING COMMANDS
echo ========================================
echo.
echo To check service status:
echo - Backend: http://localhost:8000/api/health
echo - Ruby:    http://localhost:4567/health
echo - Frontend: http://localhost:5173
echo.
echo To view logs:
echo - Laravel: cd crysgarage-backend && Get-Content storage/logs/laravel.log -Tail 20
echo - Ruby: Check the Ruby service console window
echo.
echo Press any key to continue...
pause >nul 