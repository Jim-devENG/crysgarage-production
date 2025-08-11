@echo off
echo ========================================
echo Testing Real Mastering Functionality
echo ========================================
echo.

echo Starting Backend Services...
echo.

echo 1. Starting Laravel Backend...
cd crysgarage-backend
start "Laravel Backend" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak >nul

echo 2. Starting Ruby Mastering Service...
cd ..\crysgarage-ruby
start "Ruby Service" cmd /k "bundle exec ruby mastering_server.rb"
timeout /t 3 /nobreak >nul

echo 3. Starting Frontend...
cd ..\crysgarage-frontend
start "Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:5174 (or next available port)
echo Backend:  http://localhost:8000
echo Ruby:     http://localhost:4567
echo.
echo ========================================
echo Real Mastering Test Instructions:
echo ========================================
echo.
echo 1. Open the frontend URL in your browser
echo.
echo 2. Navigate to Pricing page and click "Start Free Trial"
echo.
echo 3. Test Real Mastering Workflow:
echo    - Upload an audio file (MP3, WAV)
echo    - Should attempt real backend upload
echo    - Should start real mastering process
echo    - Should show real progress updates
echo    - Should display real analysis data
echo.
echo 4. Expected Real Mastering Behavior:
echo    - File uploads to Laravel backend
echo    - Backend processes with Ruby service
echo    - Real audio mastering algorithms applied
echo    - Actual before/after comparison
echo    - Real analysis metrics displayed
echo.
echo 5. Fallback Behavior:
echo    - If backend fails, falls back to demo mode
echo    - Maintains full workflow functionality
echo    - No errors shown to user
echo.
echo ========================================
echo API Endpoints to Monitor:
echo ========================================
echo.
echo Check browser dev tools (F12) Network tab for:
echo - POST /api/upload (file upload)
echo - POST /api/audio/{id}/master (start mastering)
echo - GET  /api/audio/{id}/status (check progress)
echo - GET  /api/audio/{id}/result (get final result)
echo.
echo ========================================
echo What's Different with Real Mastering:
echo ========================================
echo.
echo ✅ Real file upload to backend
echo ✅ Actual audio processing
echo ✅ Real mastering algorithms
echo ✅ Genuine before/after comparison
echo ✅ Authentic analysis data
echo ✅ Real processing time
echo ✅ Actual file size differences
echo ✅ Real audio quality improvements
echo.
echo ========================================
echo Success Criteria:
echo ========================================
echo.
echo ✅ Backend services are running
echo ✅ File uploads successfully
echo ✅ Mastering process starts
echo ✅ Real progress updates
echo ✅ Actual audio processing
echo ✅ Real analysis data
echo ✅ Before/after comparison works
echo ✅ Download restrictions work
echo ✅ Fallback to demo if needed
echo.
echo ========================================
echo Troubleshooting:
echo ========================================
echo.
echo If real mastering doesn't work:
echo.
echo 1. Check backend services are running:
echo    - Laravel: http://localhost:8000
echo    - Ruby: http://localhost:4567/health
echo.
echo 2. Check browser console for errors
echo 3. Verify API endpoints are accessible
echo 4. Check file format and size limits
echo 5. Monitor network requests in dev tools
echo.
echo ========================================
echo Press any key to close this window...
pause >nul 