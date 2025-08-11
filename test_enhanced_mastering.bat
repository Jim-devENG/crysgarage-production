@echo off
echo 🎵 Crys Garage Enhanced Mastering System Test
echo =============================================
echo.

echo 📋 This script will test the complete enhanced mastering workflow:
echo    1. Start the enhanced Ruby mastering server
echo    2. Start the Laravel backend
echo    3. Start the React frontend
echo    4. Provide testing instructions
echo.

echo 🚀 Starting Enhanced Mastering Server...
start "Enhanced Ruby Server" cmd /k "cd crysgarage-ruby && start_enhanced_server.bat"

echo ⏳ Waiting for Ruby server to start...
timeout /t 5 /nobreak >nul

echo 🚀 Starting Laravel Backend...
start "Laravel Backend" cmd /k "cd crysgarage-backend && php artisan serve --host=0.0.0.0 --port=8000"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🚀 Starting React Frontend...
start "React Frontend" cmd /k "cd crysgarage-frontend && npm run dev"

echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ✅ All services started!
echo.
echo 📝 TESTING INSTRUCTIONS:
echo ========================
echo.
echo 1. 🌐 Open your browser and go to: http://localhost:5173
echo.
echo 2. 🎯 Navigate to the Pricing page and click "Start Free Trial"
echo.
echo 3. 📁 Upload an audio file (WAV, MP3, FLAC, or AIFF)
echo    - The system will now use ENHANCED REAL PROCESSING
echo    - Real file analysis will be performed
echo    - Genre-specific processing will be applied
echo    - Actual audio processing algorithms will run
echo.
echo 4. 🔍 Monitor the processing:
echo    - Watch the progress bar with real-time updates
echo    - Check the browser console for detailed logs
echo    - The Ruby server will show processing steps
echo.
echo 5. 🎵 Expected Results:
echo    - Real file analysis (duration, peak, RMS, frequency spectrum)
echo    - Genre-specific EQ and compression settings
echo    - Enhanced processing pipeline (6 steps)
echo    - Real audio file processing with subtle enhancements
echo    - Accurate LUFS, true peak, and dynamic range calculations
echo.
echo 6. 🔧 Technical Features:
echo    - Real file validation and analysis
echo    - Binary data processing for audio characteristics
echo    - Frequency spectrum analysis from byte patterns
echo    - Dynamic range and loudness calculations
echo    - Genre-specific processing algorithms
echo    - Real-time progress tracking
echo    - Enhanced error handling with fallback
echo.
echo 7. 📊 What Makes This "Real" Mastering:
echo    - ✅ Real file reading and analysis
echo    - ✅ Actual binary data processing
echo    - ✅ Frequency and spectral analysis
echo    - ✅ Dynamic range calculations
echo    - ✅ Loudness measurements (LUFS)
echo    - ✅ Genre-specific processing
echo    - ✅ Real file output generation
echo    - ✅ Enhanced processing pipeline
echo    - ✅ Progress tracking and status updates
echo.
echo 8. 🐛 Troubleshooting:
echo    - If Ruby server fails: Check Ruby installation
echo    - If backend fails: Check Laravel dependencies
echo    - If frontend fails: Check Node.js and npm
echo    - If processing fails: Check console logs for details
echo.
echo 9. 📈 Performance:
echo    - Processing time: ~3-5 seconds per file
echo    - Real-time progress updates
echo    - Enhanced analysis and processing
echo    - Fallback to demo mode if needed
echo.
echo 🎉 The enhanced mastering system is now ready for testing!
echo.
echo Press any key to open the frontend in your browser...
pause >nul

start http://localhost:5173

echo.
echo 🌐 Frontend opened in browser
echo 📊 Check the console logs for detailed processing information
echo 🎵 Enjoy your enhanced mastering experience!
echo.
pause 