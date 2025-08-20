# Crys Garage Local Deployment Script
# This script deploys the project to your VPS from your local machine

param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa",
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" $Green
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" $Red
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" $Blue
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "[STEP] $Message" $Cyan
}

# Header
Write-ColorOutput "==========================================" $Cyan
Write-ColorOutput "   Crys Garage Local Deployment Script" $Cyan
Write-ColorOutput "==========================================" $Cyan
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY_PATH)) {
    Write-Error "SSH key not found at: $SSH_KEY_PATH"
    Write-Info "Please ensure your SSH key is properly configured"
    exit 1
}

# Check if git is available
try {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
} catch {
    Write-Error "Git not found. Please install Git first."
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not in a git repository. Please run this script from the project root."
    exit 1
}

# Check if deployment script exists
if (-not (Test-Path "deploy_script.sh")) {
    Write-Error "Deployment script 'deploy_script.sh' not found"
    exit 1
}

Write-Success "Prerequisites check passed!"
Write-Host ""

# Get current branch
$currentBranch = git branch --show-current
Write-Info "Current branch: $currentBranch"

# Confirm deployment
Write-Warning "This will deploy the current branch ($currentBranch) to your VPS"
$confirm = Read-Host "Do you want to continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Info "Deployment cancelled."
    exit 0
}

Write-Host ""

# Step 1: Build Frontend
if (-not $SkipBuild) {
    Write-Step "Step 1: Building Frontend..."
    
    if (-not (Test-Path "crysgarage-frontend")) {
        Write-Error "Frontend directory not found"
        exit 1
    }
    
    Set-Location "crysgarage-frontend"
    
    Write-Info "Installing dependencies..."
    try {
        npm ci
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    
    Write-Info "Building frontend..."
    try {
        npm run build
        Write-Success "Frontend built successfully"
    } catch {
        Write-Error "Failed to build frontend"
        exit 1
    }
    
    # Verify build output
    if (-not (Test-Path "dist/index.html")) {
        Write-Error "Build output not found. Build may have failed."
        exit 1
    }
    
    Write-Success "Frontend build completed successfully!"
    Set-Location ".."
} else {
    Write-Info "Skipping frontend build..."
}

Write-Host ""

# Step 2: Test SSH Connection
Write-Step "Step 2: Testing SSH Connection..."
try {
    $sshTest = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i $SSH_KEY_PATH "${VPS_USER}@${VPS_HOST}" "echo 'SSH connection successful'; whoami; pwd"
    Write-Success "SSH connection successful"
    Write-Info "Connected as: $sshTest"
} catch {
    Write-Error "SSH connection failed. Please check your SSH key and VPS credentials."
    exit 1
}

Write-Host ""

# Step 3: Deploy to VPS
Write-Step "Step 3: Deploying to VPS..."

try {
    Write-Info "Copying deployment script to VPS..."
    scp -o StrictHostKeyChecking=no -i $SSH_KEY_PATH "deploy_script.sh" "${VPS_USER}@${VPS_HOST}:/tmp/deploy_script.sh"
    
    Write-Info "Making script executable and running deployment..."
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY_PATH "${VPS_USER}@${VPS_HOST}" "chmod +x /tmp/deploy_script.sh; /tmp/deploy_script.sh"
    
    Write-Success "Deployment completed!"
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
} finally {
    # Clean up on VPS
    try {
        ssh -o StrictHostKeyChecking=no -i $SSH_KEY_PATH "${VPS_USER}@${VPS_HOST}" "rm -f /tmp/deploy_script.sh"
        Write-Info "Cleaned up temporary script on VPS"
    } catch {
        Write-Warning "Could not clean up temporary file on VPS"
    }
}

Write-Host ""
Write-ColorOutput "==========================================" $Green
Write-ColorOutput "   Deployment Completed Successfully!" $Green
Write-ColorOutput "==========================================" $Green
Write-Host ""
Write-Success "Your site should now be live at: https://crysgarage.studio"
Write-Info "Branch deployed: $currentBranch"
Write-Info "VPS: $VPS_USER@$VPS_HOST"
Write-Host ""

# Optional: Open the website
$openWebsite = Read-Host "Do you want to open the website? (y/N)"
if ($openWebsite -eq "y" -or $openWebsite -eq "Y") {
    Start-Process "https://crysgarage.studio"
}
