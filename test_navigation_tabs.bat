@echo off
echo 🎵 Testing Crys Garage Navigation Tabs
echo ======================================
echo.

echo 🔍 Checking if frontend is running...
timeout /t 2 /nobreak > nul

echo.
echo 🌐 Opening frontend in browser...
start http://localhost:5173

echo.
echo ✅ Navigation tabs should now be visible and functional!
echo.
echo 📋 What you should see in the header:
echo    - Crys Garage logo (clickable)
echo    - Navigation tabs with icons:
echo      • Dashboard (when logged in)
echo      • Upload Audio (when logged in)
echo      • Pricing
echo      • Courses
echo      • Help
echo    - User menu with dropdown (when logged in)
echo    - Mobile hamburger menu (on mobile/tablet)
echo.
echo 🎯 Test the following:
echo    1. Desktop navigation tabs are visible
echo    2. Click each tab to navigate
echo    3. Hover effects work properly
echo    4. Mobile menu opens/closes
echo    5. User dropdown menu works
echo    6. Logo click takes you home
echo.
echo 📱 Mobile Testing:
echo    - Resize browser to mobile width
echo    - Click hamburger menu (☰)
echo    - Verify mobile navigation opens
echo    - Test mobile menu items
echo.
echo 🚀 If navigation tabs work properly, they're restored!
echo.
pause