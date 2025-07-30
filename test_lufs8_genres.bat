@echo off
echo ========================================
echo Testing LUFS -8 and New Genres
echo ========================================
echo.

echo Starting Enhanced Ruby Server...
cd crysgarage-ruby
start "Enhanced Ruby Server" cmd /k "bundle exec ruby mastering_server.rb"
timeout /t 3 /nobreak >nul

echo Starting Laravel Backend...
cd ..\crysgarage-backend
start "Laravel Backend" cmd /k "php artisan serve"
timeout /t 3 /nobreak >nul

echo Starting React Frontend...
cd ..\crysgarage-frontend
start "React Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo TESTING INSTRUCTIONS
echo ========================================
echo.
echo 1. Open your browser and go to: http://localhost:5173
echo.
echo 2. Navigate to the Pricing page and click "Start with trials"
echo.
echo 3. TEST THE NEW LUFS -8 SETTINGS:
echo    - Upload an audio file
echo    - Check the mastering analysis
echo    - Verify LUFS shows -8.0 (not -12.0)
echo    - Verify dynamic range shows 6.5 dB (not 8.5)
echo    - Verify stereo width shows 98%% (not 95%%)
echo.
echo 4. TEST THE NEW GENRE SETTINGS:
echo    - The system now supports:
echo      * Hip Hop (default)
echo      * R&B (r_b)
echo      * AfroBeat (afrobeats)
echo.
echo 5. VERIFY ENHANCED PROCESSING:
echo    - Processing steps should show:
echo      * "AGGRESSIVE noise reduction (-8dB)"
echo      * "Enhancing EQ with heavy boosts (+7dB low-end)"
echo      * "Expanding stereo width (180%%)"
echo      * "Tight limiting (-0.2dB peak)"
echo      * "Commercial loudness (-8.0 LUFS)"
echo.
echo 6. CHECK IMPROVEMENTS LIST:
echo    - Should show "AGGRESSIVE low-end boost (+7dB)"
echo    - Should show "Enhanced mid-range presence (+5dB)"
echo    - Should show "Wide stereo imaging (+50%%)"
echo    - Should show "Commercial loudness (-8.0 LUFS)"
echo.
echo 7. TEST RUBY SERVICE:
echo    - Check Ruby server logs for:
echo      * "target_lufs: -8.0"
echo      * Genre-specific processing
echo      * Enhanced processing pipeline
echo.
echo ========================================
echo EXPECTED CHANGES
echo ========================================
echo.
echo ✓ LUFS target changed from -12.0 to -8.0
echo ✓ Dynamic range reduced from 8.5 to 6.5 dB
echo ✓ Stereo width increased from 95%% to 98%%
echo ✓ Processing time increased to 4.2 seconds
echo ✓ More aggressive EQ and compression settings
echo ✓ Three supported genres: Hip Hop, R&B, AfroBeat
echo ✓ Enhanced processing steps with higher values
echo.
echo ========================================
echo GENRE-SPECIFIC SETTINGS
echo ========================================
echo.
echo HIP HOP:
echo - Bass boost: +6dB
echo - Compression ratio: 7:1
echo - Target LUFS: -8.0
echo.
echo R&B:
echo - Vocal presence: +6dB
echo - Compression ratio: 6.5:1
echo - Target LUFS: -8.0
echo.
echo AFROBEATS:
echo - Low bass boost: +7dB
echo - Compression ratio: 8:1
echo - Target LUFS: -8.0
echo.
echo Press any key to close this window...
pause >nul 