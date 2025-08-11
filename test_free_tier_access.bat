@echo off
echo ========================================
echo Testing Free Tier Access Flow
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
echo Testing Free Tier Access Flow:
echo ========================================
echo.
echo 1. Open http://localhost:5173 in your browser
echo.
echo 2. Test Non-Authenticated User Flow:
echo    - You should see the landing page
echo    - Click "View Pricing" or navigate to Pricing
echo    - On the pricing page, click "Start Free Trial" on Free tier
echo    - Expected: Should navigate to Free Tier Dashboard
echo    - Expected: Should see Free Tier features and limitations
echo    - Expected: Should be able to see upload interface
echo.
echo 3. Test Free Tier Dashboard Features:
echo    - Should show "Free Trial Experience" badge
echo    - Should display "3 tracks per month" limit
echo    - Should show "50MB file size" limit
echo    - Should display supported genres (afrobeats, gospel)
echo    - Should show "Standard quality" processing
echo    - Should show "Preview only" for downloads
echo.
echo 4. Test Upload Attempt (Non-Authenticated):
echo    - Try to upload a file
echo    - Expected: Should prompt to sign up
echo    - Expected: Should open sign-up modal
echo.
echo 5. Test Upgrade Flow:
echo    - Click "Upgrade Now" button
echo    - Expected: Should prompt to sign up
echo    - Expected: Should open sign-up modal
echo.
echo 6. Test Authenticated User Flow:
echo    - Sign up with a new account
echo    - Navigate to Pricing page
echo    - Click "Start Free Trial" on Free tier
echo    - Expected: Should navigate to Free Tier Dashboard
echo    - Expected: Should show user's actual credits and stats
echo.
echo ========================================
echo Expected Behavior:
echo ========================================
echo.
echo Non-Authenticated Users:
echo - Can access Free Tier Dashboard
echo - See default free tier features
echo - Upload attempts prompt sign-up
echo - Upgrade attempts prompt sign-up
echo.
echo Authenticated Users:
echo - Can access Free Tier Dashboard
echo - See personalized tier data from backend
echo - Can upload files (within limits)
echo - Can upgrade to paid tiers
echo.
echo ========================================
echo API Endpoints to Monitor:
echo ========================================
echo.
echo Check browser dev tools (F12) Network tab for:
echo - GET /api/tier/features (for authenticated users)
echo - GET /api/tier/dashboard (for authenticated users)
echo - POST /api/upload (when uploading files)
echo.
echo ========================================
echo Troubleshooting:
echo ========================================
echo.
echo If free tier access doesn't work:
echo.
echo 1. Check browser console for errors
echo 2. Verify all services are running
echo 3. Check that onSelectTier prop is passed correctly
echo 4. Verify handleTierSelection function is called
echo 5. Check that currentPage state updates to 'dashboard'
echo.
echo ========================================
echo Success Criteria:
echo ========================================
echo.
echo ✅ Non-authenticated users can access free tier dashboard
echo ✅ "Start Free Trial" button navigates to dashboard
echo ✅ Free tier features are displayed correctly
echo ✅ Upload attempts prompt authentication
echo ✅ Authenticated users see personalized data
echo ✅ Tier-specific validation works
echo.
echo ========================================
echo Press any key to close this window...
pause >nul 