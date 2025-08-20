# Crys Garage Local Deployment Script
# This script deploys the project to your VPS from your local machine

param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa",
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false,
    [switch]$Force = $false
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

Write-Success "Prerequisites check passed!"
Write-Host ""

# Get current branch
$currentBranch = git branch --show-current
Write-Info "Current branch: $currentBranch"

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus -and -not $Force) {
    Write-Warning "You have uncommitted changes:"
    Write-Host $gitStatus
    $commitChanges = Read-Host "Do you want to commit these changes before deploying? (y/N)"
    if ($commitChanges -eq "y" -or $commitChanges -eq "Y") {
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if (-not $commitMessage) {
            $commitMessage = "Auto-commit before deployment"
        }
        git add -A
        git commit -m $commitMessage
        Write-Success "Changes committed successfully"
    }
}

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
    
    # Check if we're in the right directory
    if (-not (Test-Path "crysgarage-frontend")) {
        Write-Error "crysgarage-frontend directory not found. Please run from project root."
        exit 1
    }
    
    Set-Location crysgarage-frontend
    
    # Install dependencies
    Write-Info "Installing dependencies..."
    try {
        npm ci
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    
    # Build frontend
    Write-Info "Building frontend..."
    try {
        npm run build
        Write-Success "Frontend built successfully"
    } catch {
        Write-Error "Frontend build failed"
        exit 1
    }
    
    # Verify build output
    if (-not (Test-Path "dist/index.html")) {
        Write-Error "Build failed - dist/index.html not found"
        exit 1
    }
    
    Write-Success "Frontend build completed successfully!"
    Set-Location ..
} else {
    Write-Info "Skipping frontend build (SkipBuild flag used)"
}

Write-Host ""

# Step 2: Test SSH Connection
Write-Step "Step 2: Testing SSH Connection..."
try {
    $sshTest = ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"
    if ($sshTest -like "*SSH connection successful*") {
        Write-Success "SSH connection successful"
        Write-Info "Connected as: $VPS_USER@$VPS_HOST"
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

Write-Host ""

# Step 3: Deploy to VPS
Write-Step "Step 3: Deploying to VPS..."

# Create deployment script
$deployScript = @"
#!/bin/bash
set -e
echo "🚀 Starting deployment..."

# Backup current version
echo "📦 Creating backup..."
if [ -d "/var/www/html" ]; then
    cp -r /var/www/html /var/www/html.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No backup needed"
fi

# Clear web root
echo "🧹 Clearing web root..."
rm -rf /var/www/html/*
mkdir -p /var/www/html

# Copy new files
echo "📁 Copying new files..."
cp -r /tmp/crysgarage-frontend/* /var/www/html/

# Fix permissions
echo "🔐 Setting permissions..."
chown -R nginx:nginx /var/www/html/
chmod -R 755 /var/www/html/

# Test nginx config
echo "🌐 Testing nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

# Health check
echo "🏥 Running health check..."
sleep 3
if curl -f -s https://crysgarage.studio > /dev/null; then
    echo "✅ Deployment successful!"
    echo "🌐 Site is live at: https://crysgarage.studio"
else
    echo "⚠️ Health check failed, but deployment may have succeeded"
fi

echo "🎉 Deployment completed!"
"@

# Copy deployment script to VPS
Write-Info "Copying deployment script to VPS..."
$deployScript | ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "cat > /tmp/deploy_script.sh"

# Copy frontend files to VPS
Write-Info "Copying frontend files to VPS..."
try {
    scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -r "crysgarage-frontend/dist/*" "$VPS_USER@$VPS_HOST:/tmp/crysgarage-frontend/"
    Write-Success "Frontend files copied successfully"
} catch {
    Write-Error "Failed to copy frontend files"
    exit 1
}

# Run deployment script
Write-Info "Running deployment script..."
try {
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "chmod +x /tmp/deploy_script.sh && /tmp/deploy_script.sh"
    Write-Success "Deployment completed!"
} catch {
    Write-Error "Deployment failed"
    exit 1
}

# Cleanup
Write-Info "Cleaning up temporary files..."
ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "rm -rf /tmp/deploy_script.sh /tmp/crysgarage-frontend"

Write-Host ""
Write-ColorOutput "==========================================" $Cyan
Write-ColorOutput "   Deployment Completed Successfully!" $Cyan
Write-ColorOutput "==========================================" $Cyan
Write-Host ""
Write-Success "Your site should now be live at: https://crysgarage.studio"
Write-Host ""
Write-Info "Branch deployed: $currentBranch"
Write-Info "VPS: $VPS_USER@$VPS_HOST"
Write-Host ""

# Ask if user wants to open the website
$openWebsite = Read-Host "Do you want to open the website? (y/N)"
if ($openWebsite -eq "y" -or $openWebsite -eq "Y") {
    Start-Process "https://crysgarage.studio"
}
