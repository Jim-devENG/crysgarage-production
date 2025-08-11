@echo off
setlocal enabledelayedexpansion

echo ⚡ Quick Deploy to VPS
echo ====================

:: Check if we're in the right directory
if not exist "crysgarage-frontend" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

:: Add only essential files (excluding node_modules)
echo 📝 Adding essential files to git...
git add crysgarage-frontend/App.tsx
git add crysgarage-frontend/main.tsx
git add crysgarage-frontend/vite.config.ts
git add crysgarage-frontend/package.json
git add crysgarage-frontend/Dockerfile
git add crysgarage-frontend/.dockerignore
git add crysgarage-frontend/components/
git add crysgarage-frontend/styles/
git add crysgarage-frontend/src/

git add crysgarage-backend/app/
git add crysgarage-backend/routes/
git add crysgarage-backend/config/
git add crysgarage-backend/composer.json
git add crysgarage-backend/Dockerfile
git add crysgarage-backend/.dockerignore

git add crysgarage-ruby/*.rb
git add crysgarage-ruby/Gemfile
git add crysgarage-ruby/Dockerfile
git add crysgarage-ruby/.dockerignore

git add docker-compose.yml
git add nginx-docker.conf

:: Commit changes
echo Committing changes...
git commit -m "Quick deploy: %date% %time%"

:: Push to repository
echo 🚀 Pushing to repository...
git push origin master

:: Quick deploy to VPS
echo ⚡ Quick deploying to VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && git pull origin master && docker-compose down && docker-compose build && docker-compose up -d"

if %errorlevel% equ 0 (
    echo ✅ Quick deployment successful!
    echo 🌐 Check your application at: https://crysgarage.studio
) else (
    echo ❌ Quick deployment failed!
    echo Check the VPS logs for errors
)

pause 
