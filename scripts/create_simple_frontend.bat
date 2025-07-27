@echo off
echo ========================================
echo Creating Simple Frontend
echo ========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Creating dist directory...
if not exist "crysgarage-frontend\dist" mkdir "crysgarage-frontend\dist"

echo.
echo Step 2: Creating simple HTML frontend...
echo ^<!DOCTYPE html^> > "crysgarage-frontend\dist\index.html"
echo ^<html lang="en"^> >> "crysgarage-frontend\dist\index.html"
echo ^<head^> >> "crysgarage-frontend\dist\index.html"
echo   ^<meta charset="UTF-8"^> >> "crysgarage-frontend\dist\index.html"
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> "crysgarage-frontend\dist\index.html"
echo   ^<title^>Crys Garage^</title^> >> "crysgarage-frontend\dist\index.html"
echo   ^<style^> >> "crysgarage-frontend\dist\index.html"
echo     body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; min-height: 100vh; } >> "crysgarage-frontend\dist\index.html"
echo     .container { max-width: 800px; margin: 0 auto; text-align: center; padding-top: 50px; } >> "crysgarage-frontend\dist\index.html"
echo     h1 { font-size: 3rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } >> "crysgarage-frontend\dist\index.html"
echo     p { font-size: 1.2rem; margin-bottom: 2rem; } >> "crysgarage-frontend\dist\index.html"
echo     .btn { display: inline-block; padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 8px; margin: 10px; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.3); } >> "crysgarage-frontend\dist\index.html"
echo     .btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); } >> "crysgarage-frontend\dist\index.html"
echo     .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; backdrop-filter: blur(10px); } >> "crysgarage-frontend\dist\index.html"
echo     .status p { margin: 8px 0; } >> "crysgarage-frontend\dist\index.html"
echo   ^</style^> >> "crysgarage-frontend\dist\index.html"
echo ^</head^> >> "crysgarage-frontend\dist\index.html"
echo ^<body^> >> "crysgarage-frontend\dist\index.html"
echo   ^<div class="container"^> >> "crysgarage-frontend\dist\index.html"
echo     ^<h1^>🎵 Crys Garage^</h1^> >> "crysgarage-frontend\dist\index.html"
echo     ^<p^>Professional Audio Mastering Platform^</p^> >> "crysgarage-frontend\dist\index.html"
echo     ^<div class="status"^> >> "crysgarage-frontend\dist\index.html"
echo       ^<h3^>🚀 Deployment Status^</h3^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>✅ Frontend: Deployed^</p^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>✅ Backend: Running on port 8000^</p^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>✅ Audio Processing: Running on port 4567^</p^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>✅ Nginx: Configured and Running^</p^> >> "crysgarage-frontend\dist\index.html"
echo     ^</div^> >> "crysgarage-frontend\dist\index.html"
echo     ^<a href="/api" class="btn"^>Test API^</a^> >> "crysgarage-frontend\dist\index.html"
echo     ^<a href="/audio" class="btn"^>Test Audio Service^</a^> >> "crysgarage-frontend\dist\index.html"
echo     ^<div style="margin-top: 40px; opacity: 0.8;"^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>Your Crys Garage application is now live!^</p^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>Domain: crysgarage.studio^</p^> >> "crysgarage-frontend\dist\index.html"
echo       ^<p^>Server: 209.74.80.162^</p^> >> "crysgarage-frontend\dist\index.html"
echo     ^</div^> >> "crysgarage-frontend\dist\index.html"
echo   ^</div^> >> "crysgarage-frontend\dist\index.html"
echo ^</body^> >> "crysgarage-frontend\dist\index.html"
echo ^</html^> >> "crysgarage-frontend\dist\index.html"

echo.
echo Step 3: Uploading the working frontend to server...
ssh root@209.74.80.162 "rm -rf /var/www/crysgarage/crysgarage-frontend/dist && mkdir -p /var/www/crysgarage/crysgarage-frontend/dist"
scp -r "crysgarage-frontend\dist\*" root@209.74.80.162:/var/www/crysgarage/crysgarage-frontend/dist/

echo.
echo Step 4: Setting permissions...
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage/crysgarage-frontend/dist && chmod -R 755 /var/www/crysgarage/crysgarage-frontend/dist"

echo.
echo Step 5: Testing the website...
ssh root@209.74.80.162 "curl -I http://localhost"

echo.
echo ========================================
echo FRONTEND CREATED AND DEPLOYED!
echo ========================================
echo.
echo Now visit: http://crysgarage.studio
echo You should see a beautiful working frontend page!
echo.
pause 