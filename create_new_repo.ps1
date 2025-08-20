# Crys Garage - New Repository Setup Script
# This script helps you create a new repository and migrate your code

param(
    [string]$NewRepoName = "crysgarage-production",
    [string]$GitHubUsername = "Jim-devENG"
)

# Color functions for better output
function Write-Success { param($Message) Write-Host "SUCCESS: $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "INFO: $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "WARNING: $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "ERROR: $Message" -ForegroundColor Red }

Write-Info "Crys Garage - New Repository Setup"
Write-Info "=================================="
Write-Info ""

Write-Info "This script will help you create a new repository and migrate your code."
Write-Info ""

# Step 1: Check current status
Write-Info "Step 1: Checking current repository status..."
$currentRemote = git remote get-url origin
Write-Info "Current repository: $currentRemote"

$currentBranch = git branch --show-current
Write-Info "Current branch: $currentBranch"

$uncommittedChanges = git status --porcelain
if ($uncommittedChanges) {
    Write-Warning "You have uncommitted changes. Let's commit them first..."
    git add .
    git commit -m "Final commit before repository migration"
    Write-Success "Changes committed"
} else {
    Write-Success "No uncommitted changes found"
}

Write-Info ""

# Step 2: Create new repository URL
$newRepoUrl = "https://github.com/$GitHubUsername/$NewRepoName.git"
Write-Info "Step 2: New repository will be created at:"
Write-Info "  $newRepoUrl"
Write-Info ""

# Step 3: Instructions for manual GitHub creation
Write-Warning "Step 3: Manual GitHub Repository Creation Required"
Write-Info "Please follow these steps:"
Write-Info "1. Go to https://github.com/new"
Write-Info "2. Repository name: $NewRepoName"
Write-Info "3. Description: Crys Garage - Professional Audio Mastering Platform"
Write-Info "4. Make it Private (recommended)"
Write-Info "5. DO NOT initialize with README, .gitignore, or license"
Write-Info "6. Click Create repository"
Write-Info ""

$continue = Read-Host "Have you created the repository on GitHub? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Error "Please create the repository first and run this script again."
    exit 1
}

Write-Info ""

# Step 4: Update remote and push
Write-Info "Step 4: Updating remote repository..."
Write-Info "Adding new remote as new-origin..."
git remote add new-origin $newRepoUrl

Write-Info "Pushing all branches to new repository..."
git push new-origin --all

Write-Info "Pushing all tags to new repository..."
git push new-origin --tags

Write-Success "Code pushed to new repository successfully!"
Write-Info ""

# Step 5: Update deployment scripts
Write-Info "Step 5: Updating deployment scripts..."
$deploymentScripts = @(
    "deploy_simple.bat",
    "deploy_force_rebuild.bat",
    "deploy_auto.bat",
    "deploy_auto.ps1"
)

foreach ($script in $deploymentScripts) {
    if (Test-Path $script) {
        Write-Info "Updating $script..."
        $content = Get-Content $script -Raw
        $updatedContent = $content -replace "https://github.com/Jim-devENG/Crysgarage.git", $newRepoUrl
        Set-Content $script $updatedContent
        Write-Success "Updated $script"
    }
}

Write-Info ""

# Step 6: Switch to new remote
Write-Info "Step 6: Switching to new repository..."
Write-Info "Removing old remote..."
git remote remove origin

Write-Info "Renaming new remote to origin..."
git remote rename new-origin origin

Write-Info "Verifying new remote..."
$newRemote = git remote get-url origin
Write-Success "New repository set as origin: $newRemote"

Write-Info ""

# Step 7: Final instructions
Write-Success "Repository migration completed successfully!"
Write-Info ""
Write-Info "Next steps:"
Write-Info "1. Your code is now in the new repository: $newRepoUrl"
Write-Info "2. All deployment scripts have been updated"
Write-Info "3. You can now deploy using: .\deploy_force_rebuild.bat"
Write-Info ""
Write-Info "To deploy your application with the new repository:"
Write-Info "  .\deploy_force_rebuild.bat"
Write-Info ""

$deployNow = Read-Host "Would you like to deploy now? (y/n)"
if ($deployNow -eq "y" -or $deployNow -eq "Y") {
    Write-Info "Starting deployment..."
    .\deploy_force_rebuild.bat
} else {
    Write-Info "You can deploy later using: .\deploy_force_rebuild.bat"
}

Write-Success "Setup complete!"
