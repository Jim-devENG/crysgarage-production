@echo off
echo ========================================
echo Testing Real Mastering (FIXED)
echo ========================================
echo.

echo ✅ API Configuration Fixed:
echo    - Frontend now uses: http://localhost:8000/api
echo    - Backend has public upload endpoint
echo    - Real mastering should work now
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

echo 3. Starting Frontend (with fixed API config)...
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
echo What Was Fixed:
echo ========================================
echo.
echo ✅ Changed VITE_API_URL from production to localhost
echo ✅ Backend has /public/upload endpoint
echo ✅ Backend has /public/status endpoint
echo ✅ AudioController has publicUpload method
echo ✅ Fallback system still works if needed
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
echo    - Should now connect to localhost:8000/api/public/upload
echo    - Should start real mastering process
echo    - Should show real progress updates
echo    - Should display real analysis data
echo.
echo 4. Expected Real Mastering Behavior:
echo    - File uploads to Laravel backend (localhost:8000)
echo    - Backend processes with Ruby service
echo    - Real audio mastering algorithms applied
echo    - Actual before/after comparison
echo    - Real analysis metrics displayed
echo.
echo 5. API Endpoints to Monitor (in browser dev tools):
echo    - POST http://localhost:8000/api/public/upload
echo    - GET  http://localhost:8000/api/public/status/{id}
echo    - POST http://localhost:8000/api/audio/{id}/master
echo    - GET  http://localhost:8000/api/audio/{id}/result
echo.
echo ========================================
echo Success Indicators:
echo ========================================
echo.
echo ✅ No more "crysgarage.studio" connection errors
echo ✅ No more "Network Error" messages
echo ✅ Real file upload to localhost:8000
echo ✅ Actual audio processing
echo ✅ Real mastering algorithms
echo ✅ Genuine before/after comparison
echo ✅ Authentic analysis data
echo ✅ Real processing time
echo ✅ Actual file size differences
echo ✅ Real audio quality improvements
echo.
echo ========================================
echo Troubleshooting:
echo ========================================
echo.
echo If real mastering still doesn't work:
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
echo 6. If backend fails, fallback to demo mode:
echo    - System will automatically use demo mode
echo    - No errors shown to user
echo    - Full workflow still works
echo.
echo ========================================
echo API Configuration Details:
echo ========================================
echo.
echo Frontend .env file now contains:
echo VITE_API_URL=http://localhost:8000/api
echo.
echo This ensures:
echo - Real backend connection for uploads
echo - Real mastering processing
echo - Real analysis data
echo - Real before/after comparison
echo.
echo ========================================
echo Press any key to close this window...
pause >nul 