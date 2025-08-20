@echo off
echo ========================================
echo    Crys Garage Force Rebuild Deployment
echo ========================================
echo.

REM Configuration
set VPS_IP=209.74.80.162
set VPS_USER=root
set SSH_KEY=github_actions_key
set PROJECT_DIR=/root/crysgarage-deploy
set REPO_URL=https://github.com/Jim-devENG/Crysgarage.git

echo Starting FORCE REBUILD deployment to VPS: %VPS_IP%
echo Project Directory: %PROJECT_DIR%
echo.

REM Step 1: Test SSH connection
echo [1/6] Testing SSH connection...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no -o ConnectTimeout=10 %VPS_USER%@%VPS_IP% "echo SSH connection successful"
if %errorlevel% neq 0 (
    echo ERROR: Failed to connect to VPS
    pause
    exit /b 1
)
echo ✓ SSH connection successful
echo.

REM Step 2: Force pull latest changes
echo [2/6] Force pulling latest changes...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && git fetch origin && git reset --hard origin/master"
echo ✓ Repository force updated
echo.

REM Step 3: Stop and remove all containers
echo [3/6] Stopping and removing all containers...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose down --remove-orphans"
echo ✓ All containers stopped and removed
echo.

REM Step 4: Remove all images to force rebuild
echo [4/6] Removing all Docker images to force rebuild...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "docker rmi crysgarage-deploy-frontend crysgarage-deploy-backend crysgarage-deploy-ruby-service nginx 2>nul || echo Some images already removed"
echo ✓ Old images removed
echo.

REM Step 5: Rebuild and start containers
echo [5/6] Rebuilding and starting containers...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose up -d --build"
echo ✓ Containers rebuilt and started
echo.

REM Step 6: Verify deployment
echo [6/6] Verifying deployment...
timeout /t 15 /nobreak >nul

echo Final container status:
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose ps"

echo.
echo Testing service responses...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "curl -s -o /dev/null -w 'Frontend: %%{http_code}' http://localhost:3000 || echo 'Frontend: not responding'"
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "curl -s -o /dev/null -w 'Backend: %%{http_code}' http://localhost:8001 || echo 'Backend: not responding'"

echo.
echo ========================================
echo    Force Rebuild Deployment completed!
echo ========================================
echo Your application should now be running on: http://%VPS_IP%
echo.
echo To check status manually, run:
echo ssh -i %SSH_KEY% %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose ps"
echo.
pause
