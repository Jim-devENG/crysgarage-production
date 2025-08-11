@echo off
echo ========================================
echo Testing Crys Garage Tier Management System
echo ========================================
echo.

echo Starting services...
echo.

echo 1. Starting Backend (Laravel)...
cd crysgarage-backend
start "Backend" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak >nul

echo 2. Starting Ruby Service...
cd ..\crysgarage-ruby
start "Ruby Service" cmd /k "ruby app.rb"
timeout /t 3 /nobreak >nul

echo 3. Starting Frontend (React)...
cd ..\crysgarage-frontend
start "Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo Ruby:     http://localhost:4567
echo.
echo ========================================
echo Testing Instructions:
echo ========================================
echo.
echo 1. Open http://localhost:5173 in your browser
echo.
echo 2. Test Free Tier Dashboard:
echo    - Sign up with a new account (will default to free tier)
echo    - Navigate to Dashboard
echo    - Verify Free Tier features are displayed:
echo      * 3 tracks per month limit
echo      * 50MB file size limit
echo      * Basic genres (afrobeats, gospel)
echo      * Standard quality processing
echo      * Preview only (no downloads)
echo.
echo 3. Test Tier API Endpoints:
echo    - Open browser dev tools (F12)
echo    - Go to Network tab
echo    - Check for API calls to:
echo      * /api/tier/features
echo      * /api/tier/dashboard
echo      * /api/tier/upload-options
echo.
echo 4. Test File Upload Validation:
echo    - Try uploading files larger than 50MB (should be rejected)
echo    - Try uploading unsupported formats (should be rejected)
echo    - Try uploading more than 3 tracks per month (should show upgrade prompt)
echo.
echo 5. Test Upgrade Flow:
echo    - Click "Upgrade Now" button
echo    - Verify payment modal opens
echo    - Test tier upgrade functionality
echo.
echo ========================================
echo Expected Behavior:
echo ========================================
echo.
echo Free Tier:
echo - Shows "Free Trial Experience" badge
echo - Displays credits: X / 3
echo - Shows tracks remaining: X / 3
echo - Upload interface disabled when limits reached
echo - Upgrade prompts when limits exceeded
echo.
echo Professional Tier:
echo - Shows "Professional Tier" badge
echo - Displays credits: X remaining
echo - Shows tracks remaining: X / 20
echo - Processing queue display
echo - Download capabilities enabled
echo.
echo Advanced Tier:
echo - Shows "Advanced Tier" badge
echo - Displays "∞ Unlimited" for credits
echo - Shows "∞ Unlimited" for tracks
echo - Advanced analytics display
echo - All features enabled
echo.
echo ========================================
echo Troubleshooting:
echo ========================================
echo.
echo If you encounter issues:
echo.
echo 1. Check browser console for errors
echo 2. Verify all services are running on correct ports
echo 3. Check backend logs for API errors
echo 4. Ensure database is properly configured
echo 5. Verify CORS settings in backend
echo.
echo ========================================
echo Press any key to close this window...
pause >nul 