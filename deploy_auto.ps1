# Automated Deployment Script for Crys Garage
# Uses SSH key authentication for passwordless deployment

param(
    [string]$VPS_IP = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY_PATH = ".\github_actions_key",
    [string]$PROJECT_DIR = "/root/crysgarage-deploy",
    [string]$REPO_URL = "https://github.com/Jim-devENG/Crysgarage.git"
)

# Color functions for better output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Info "Starting automated deployment to VPS..."
Write-Info "VPS: $VPS_IP"
Write-Info "Project Directory: $PROJECT_DIR"

# Step 1: Test SSH connection
Write-Info "Testing SSH connection..."
try {
    $testResult = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo Connection successful"
    if ($LASTEXITCODE -eq 0) {
        Write-Success "SSH connection established successfully"
    } else {
        throw "SSH connection failed"
    }
} catch {
    Write-Error "Failed to connect to VPS. Please check:"
    Write-Error "1. VPS is running and accessible"
    Write-Error "2. SSH key is properly configured"
    Write-Error "3. Firewall allows SSH connections"
    exit 1
}

# Step 2: Create project directory if it doesn't exist
Write-Info "Setting up project directory..."
try {
    $setupResult = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $PROJECT_DIR"
    Write-Success "Project directory setup completed"
} catch {
    Write-Error "Failed to setup project directory"
    exit 1
}

# Step 3: Check if repository exists and update
Write-Info "Checking repository status..."
$repoExists = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; test -d .git && echo 'exists' || echo 'not_exists'"

if ($repoExists -eq "exists") {
    Write-Info "Repository exists, pulling latest changes..."
    try {
        $updateResult = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; git pull origin main"
        Write-Success "Repository updated successfully"
    } catch {
        Write-Warning "Failed to pull changes, trying reset and pull..."
        $resetResult = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; git reset --hard HEAD; git pull origin main"
        Write-Success "Repository updated after reset"
    }
} else {
    Write-Info "Repository doesn't exist, cloning..."
    try {
        $cloneResult = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; git clone $REPO_URL ."
        Write-Success "Repository cloned successfully"
    } catch {
        Write-Error "Failed to clone repository"
        exit 1
    }
}

# Step 4: Deploy the application
Write-Info "Deploying application..."
try {
    # Check if docker-compose.yml exists
    $composeExists = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; test -f docker-compose.yml && echo 'exists' || echo 'not_exists'"
    
    if ($composeExists -ne "exists") {
        Write-Error "docker-compose.yml not found in project root"
        exit 1
    }
    
    # Stop existing containers
    Write-Info "Stopping existing containers..."
    & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; docker-compose down"
    
    # Pull latest images
    Write-Info "Pulling latest Docker images..."
    & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; docker-compose pull"
    
    # Start containers
    Write-Info "Starting containers..."
    & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; docker-compose up -d"
    
    # Wait a moment for containers to start
    Start-Sleep -Seconds 5
    
    # Check container status
    Write-Info "Checking container status..."
    $containerStatus = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; docker-compose ps"
    Write-Info $containerStatus
    
    Write-Success "Deployment completed successfully"
} catch {
    Write-Error "Deployment failed"
    Write-Info "Checking deployment status..."
    
    # Get deployment status for debugging
    $statusResult = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; docker-compose ps; echo '--- Recent Logs ---'; docker-compose logs --tail=10"
    Write-Info $statusResult
    exit 1
}

# Step 5: Verify deployment
Write-Info "Verifying deployment..."
try {
    Start-Sleep -Seconds 10
    
    # Check container status
    $finalStatus = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $PROJECT_DIR; docker-compose ps"
    Write-Info "Container Status:"
    Write-Info $finalStatus
    
    # Test service responses
    Write-Info "Testing service responses..."
    $frontendTest = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:80 || echo 'Frontend not responding'"
    $backendTest = & ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'Backend not responding'"
    
    Write-Info "Frontend response: $frontendTest"
    Write-Info "Backend response: $backendTest"
    
    Write-Success "Deployment verification completed"
} catch {
    Write-Warning "Verification had issues, but deployment may still be successful"
}

Write-Success "Deployment script completed!"
Write-Info "Your application should now be running on: http://$VPS_IP"
Write-Info "To check status manually, run: ssh -i `"$SSH_KEY_PATH`" $VPS_USER@$VPS_IP 'cd $PROJECT_DIR && docker-compose ps'"
