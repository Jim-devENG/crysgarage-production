@echo off
echo ========================================
echo Crys Garage - Update All Scripts
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Updating quick_deploy.bat...
powershell -Command "(Get-Content 'quick_deploy.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'quick_deploy.bat'"
echo ✅ quick_deploy.bat updated
echo.

echo Step 2: Updating deploy_from_repo_fixed.bat...
powershell -Command "(Get-Content 'deploy_from_repo_fixed.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'deploy_from_repo_fixed.bat'"
echo ✅ deploy_from_repo_fixed.bat updated
echo.

echo Step 3: Updating monitor_mastering.bat...
powershell -Command "(Get-Content 'monitor_mastering.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'monitor_mastering.bat'"
echo ✅ monitor_mastering.bat updated
echo.

echo Step 4: Updating debug_mastering_stuck.bat...
powershell -Command "(Get-Content 'debug_mastering_stuck.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'debug_mastering_stuck.bat'"
echo ✅ debug_mastering_stuck.bat updated
echo.

echo Step 5: Updating fix_mastering_stuck.bat...
powershell -Command "(Get-Content 'fix_mastering_stuck.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'fix_mastering_stuck.bat'"
echo ✅ fix_mastering_stuck.bat updated
echo.

echo Step 6: Updating fix_ruby_dependencies.bat...
powershell -Command "(Get-Content 'fix_ruby_dependencies.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'fix_ruby_dependencies.bat'"
echo ✅ fix_ruby_dependencies.bat updated
echo.

echo Step 7: Updating check_ruby_code.bat...
powershell -Command "(Get-Content 'check_ruby_code.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'check_ruby_code.bat'"
echo ✅ check_ruby_code.bat updated
echo.

echo Step 8: Updating test_mastering_remote.bat...
powershell -Command "(Get-Content 'test_mastering_remote.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'test_mastering_remote.bat'"
echo ✅ test_mastering_remote.bat updated
echo.

echo Step 9: Updating setup_ruby_service.bat...
powershell -Command "(Get-Content 'setup_ruby_service.bat') -replace 'ssh root@209.74.80.162', 'ssh crysgarage' | Set-Content 'setup_ruby_service.bat'"
echo ✅ setup_ruby_service.bat updated
echo.

echo Step 10: Updating scp commands in scripts...
powershell -Command "(Get-Content 'upload_fixed_nginx.bat') -replace 'scp .* root@209.74.80.162', 'scp $1 crysgarage' | Set-Content 'upload_fixed_nginx.bat'"
echo ✅ scp commands updated
echo.

echo ========================================
echo All scripts updated!
echo ========================================
echo 🔑 All scripts now use: ssh crysgarage
echo 📝 No more password prompts!
echo 🌐 Test: .\quick_deploy.bat
echo.
pause 