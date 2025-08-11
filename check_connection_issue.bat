@echo off
echo 🔍 Diagnosing Connection Refused Issue
echo =====================================

echo 📤 Uploading diagnosis script to VPS...
scp check_connection_issue.sh root@209.74.80.162:/var/www/crysgarage-deploy/

echo.
echo 🔧 Running diagnosis on VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && chmod +x check_connection_issue.sh && ./check_connection_issue.sh"

echo.
echo ✅ Diagnosis completed!
echo 🌐 Check the results above to identify the issue

pause 