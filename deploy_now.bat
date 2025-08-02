@echo off
setlocal enabledelayedexpansion

echo 🚀 Quick Deploy to VPS
echo =====================

:: Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found. Creating it...
    call :create_docker_compose
)

:: Add all changes
echo 📝 Adding changes to git...
git add .

:: Commit changes
echo Committing changes...
git commit -m "Deploy: %date% %time%"

:: Push to repository
echo 🚀 Pushing to repository...
git push origin master

:: Deploy to VPS
echo 🌐 Deploying to VPS...
ssh root@209.74.80.162 "cd /var/www/crysgarage-deploy && git pull origin master && docker-compose down && docker-compose build && docker-compose up -d"

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo 🌐 Check your application at: https://crysgarage.studio
) else (
    echo ❌ Deployment failed!
    echo Check the VPS logs for errors
)

pause
goto :eof

:create_docker_compose
echo Creating docker-compose.yml...
(
echo version: '3.8'
echo.
echo services:
echo   frontend:
echo     build: ./crysgarage-frontend
echo     container_name: crysgarage-frontend
echo     ports:
echo       - "5173:5173"
echo     volumes:
echo       - ./crysgarage-frontend:/app
echo       - /app/node_modules
echo     environment:
echo       - NODE_ENV=development
echo     networks:
echo       - crysgarage-network
echo     restart: unless-stopped
echo.
echo   backend:
echo     build: ./crysgarage-backend
echo     container_name: crysgarage-backend
echo     ports:
echo       - "8001:8000"
echo     volumes:
echo       - ./crysgarage-backend:/var/www
echo     environment:
echo       - APP_ENV=production
echo     networks:
echo       - crysgarage-network
echo     restart: unless-stopped
echo.
echo   ruby-service:
echo     build: ./crysgarage-ruby
echo     container_name: crysgarage-ruby
echo     ports:
echo       - "4568:4567"
echo     volumes:
echo       - ./crysgarage-ruby:/app
echo     networks:
echo       - crysgarage-network
echo     restart: unless-stopped
echo.
echo   nginx:
echo     image: nginx:alpine
echo     container_name: crysgarage-nginx
echo     ports:
echo       - "80:80"
echo       - "443:443"
echo     volumes:
echo       - ./nginx-docker.conf:/etc/nginx/nginx.conf:ro
echo       - /etc/letsencrypt:/etc/letsencrypt:ro
echo     networks:
echo       - crysgarage-network
echo     restart: unless-stopped
echo     depends_on:
echo       - frontend
echo       - backend
echo       - ruby-service
echo.
echo networks:
echo   crysgarage-network:
echo     driver: bridge
) > docker-compose.yml

echo ✅ docker-compose.yml created!
goto :eof 