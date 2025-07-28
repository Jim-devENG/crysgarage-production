@echo off
echo 🎉 Crys Garage - Ready to Test!
echo ===============================

echo.
echo ✅ Both servers should now be running:
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:3000
echo.

echo 🧪 Testing Instructions:
echo ========================
echo.
echo 1. Open your browser and go to: http://localhost:3000
echo.
echo 2. Test the Login Modal:
echo    - Click "Sign In" or "Get Started" button
echo    - Modal should open
echo    - Try closing with X button
echo    - Try clicking outside the modal (backdrop)
echo    - Try pressing ESC key
echo.
echo 3. Test Demo Login:
echo    - Email: demo.free@crysgarage.com
echo    - Password: password
echo    - Click "Sign In"
echo    - Should successfully log in
echo.
echo 4. Test Error Handling:
echo    - Try wrong credentials
echo    - Should show error message
echo    - Modal should stay open
echo.

echo 🎯 Expected Results:
echo    ✅ Modal opens when clicking login buttons
echo    ✅ Modal closes with X button
echo    ✅ Modal closes with backdrop click
echo    ✅ Modal closes with ESC key
echo    ✅ Demo login works with correct credentials
echo    ✅ Error messages show for wrong credentials
echo    ✅ Modal closes after successful login
echo.

echo 🔧 If you find issues:
echo    - Check browser console (F12) for errors
echo    - Make sure both servers are running
echo    - Try refreshing the page
echo.

echo 🚀 When testing is complete:
echo    - Run deploy_to_vps.bat to deploy to your VPS
echo.

echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000 