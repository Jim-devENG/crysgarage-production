@echo off
echo ========================================
echo TESTING OBVIOUS MASTERING DIFFERENCES
echo ========================================
echo.

echo Starting Enhanced Ruby Mastering Server...
cd crysgarage-ruby
start "Enhanced Ruby Server" cmd /k "bundle exec ruby mastering_server.rb"
timeout /t 3 /nobreak >nul

echo.
echo Starting Laravel Backend...
cd ..\crysgarage-backend
start "Laravel Backend" cmd /k "php artisan serve"
timeout /t 3 /nobreak >nul

echo.
echo Starting React Frontend...
cd ..\crysgarage-frontend
start "React Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo TESTING INSTRUCTIONS:
echo =====================
echo.
echo 1. Open your browser and go to: http://localhost:5173
echo.
echo 2. Navigate to the Pricing page and click "Start Free Trial"
echo.
echo 3. Upload an audio file (MP3, WAV, FLAC, or AIFF)
echo.
echo 4. Watch for the ENHANCED processing steps:
echo    - AGGRESSIVE noise reduction (-6dB noise floor)
echo    - AGGRESSIVE EQ adjustments (+6dB low-end, +4dB mid-range)
echo    - AGGRESSIVE compression (8:1 ratio, -12dB threshold)
echo    - AGGRESSIVE stereo enhancement (150% width expansion)
echo    - AGGRESSIVE limiting (-0.5dB true peak)
echo    - AGGRESSIVE loudness normalization (-12.0 LUFS target)
echo.
echo 5. Compare the Original vs Mastered audio:
echo    - Mastered version should be noticeably LOUDER
echo    - Enhanced bass and mid-range frequencies
echo    - Wider stereo image
echo    - More compressed dynamic range
echo    - Clearer, more present sound
echo.
echo 6. Check the Analysis section for enhanced metrics:
echo    - Higher loudness values (-12.0 LUFS vs -14.2 LUFS)
echo    - More compressed dynamic range
echo    - Enhanced processing time
echo.
echo 7. Monitor the Ruby server console for detailed logs:
echo    - Look for "AGGRESSIVE" processing messages
echo    - Check for enhanced parameter values
echo    - Verify real file analysis and processing
echo.
echo EXPECTED DIFFERENCES:
echo ====================
echo - Mastered audio should be 20-30% louder
echo - Bass frequencies should be more prominent
echo - Mid-range should be more present and clear
echo - Stereo width should be noticeably wider
echo - Overall sound should be more "commercial" and "radio-ready"
echo.
echo If you don't hear obvious differences, check:
echo - Ruby server logs for processing errors
echo - Browser console for API errors
echo - File format compatibility
echo.
echo Press any key to open the frontend...
pause >nul
start http://localhost:5173 