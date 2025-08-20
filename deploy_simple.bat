@echo off
echo ========================================
echo    Crys Garage Auto Deployment
echo ========================================
echo.

REM Configuration
set VPS_IP=209.74.80.162
set VPS_USER=root
set SSH_KEY=github_actions_key
set PROJECT_DIR=/root/crysgarage-deploy
set REPO_URL=https://github.com/Jim-devENG/Crysgarage.git

echo Starting deployment to VPS: %VPS_IP%
echo Project Directory: %PROJECT_DIR%
echo.

REM Step 1: Test SSH connection
echo [1/5] Testing SSH connection...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no -o ConnectTimeout=10 %VPS_USER%@%VPS_IP% "echo SSH connection successful"
if %errorlevel% neq 0 (
    echo ERROR: Failed to connect to VPS
    echo Please check:
    echo - VPS is running and accessible
    echo - SSH key is properly configured
    echo - Firewall allows SSH connections
    pause
    exit /b 1
)
echo ✓ SSH connection successful
echo.

REM Step 2: Create project directory
echo [2/5] Setting up project directory...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "mkdir -p %PROJECT_DIR%"
echo ✓ Project directory ready
echo.

REM Step 3: Check if repository exists and update
echo [3/5] Checking repository status...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && if [ -d .git ]; then echo 'exists'; else echo 'not_exists'; fi" > temp_repo_status.txt
set /p REPO_STATUS=<temp_repo_status.txt
del temp_repo_status.txt

if "%REPO_STATUS%"=="exists" (
    echo Repository exists, pulling latest changes...
    ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && git pull origin master"
    if %errorlevel% neq 0 (
        echo Warning: Failed to pull, trying reset and pull...
        ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && git reset --hard HEAD && git pull origin master"
    )
    echo ✓ Repository updated
) else (
    echo Repository doesn't exist, cloning...
    ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && git clone %REPO_URL% ."
    if %errorlevel% neq 0 (
        echo ERROR: Failed to clone repository
        pause
        exit /b 1
    )
    echo ✓ Repository cloned
)
echo.

REM Step 4: Deploy application
echo [4/5] Deploying application...
echo Checking for docker-compose.yml...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && if [ -f docker-compose.yml ]; then echo 'exists'; else echo 'not_exists'; fi" > temp_compose_status.txt
set /p COMPOSE_STATUS=<temp_compose_status.txt
del temp_compose_status.txt

if not "%COMPOSE_STATUS%"=="exists" (
    echo ERROR: docker-compose.yml not found in project root
    pause
    exit /b 1
)

echo Stopping existing containers...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose down"

echo Pulling latest Docker images...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose pull"

echo Starting containers...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose up -d"

echo Waiting for containers to start...
timeout /t 5 /nobreak >nul

echo Checking container status...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose ps"
echo ✓ Deployment completed
echo.

REM Step 5: Verify deployment
echo [5/5] Verifying deployment...
timeout /t 10 /nobreak >nul

echo Final container status:
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose ps"

echo.
echo Testing service responses...
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "curl -s -o /dev/null -w 'Frontend: %%{http_code}' http://localhost:80 || echo 'Frontend: not responding'"
ssh -i %SSH_KEY% -o StrictHostKeyChecking=no %VPS_USER%@%VPS_IP% "curl -s -o /dev/null -w 'Backend: %%{http_code}' http://localhost:3000 || echo 'Backend: not responding'"

echo.
echo ========================================
echo    Deployment completed!
echo ========================================
echo Your application should now be running on: http://%VPS_IP%
echo.
echo To check status manually, run:
echo ssh -i %SSH_KEY% %VPS_USER%@%VPS_IP% "cd %PROJECT_DIR% && docker-compose ps"
echo.
pause
