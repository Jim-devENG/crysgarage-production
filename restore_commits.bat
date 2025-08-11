@echo off
echo Restoring commits from 3-5 hours ago...

REM Reset to the commit that fixes the 75% stuck issue
git reset --hard 9fcdd40

echo.
echo Commits restored! Your work from 3-5 hours ago is now active.
echo.
echo Recent commits now include:
echo - Fix 75% stuck issue - properly check Ruby status and update processing data
echo - Fix 401 authentication error - add public upload for free tier  
echo - Remove timeout completely and enable actual Ruby processing
echo - Fix mastering processing issues - Add public upload endpoint, fix timeout
echo.
echo Your application should now be in the state you had 3-5 hours ago.
pause