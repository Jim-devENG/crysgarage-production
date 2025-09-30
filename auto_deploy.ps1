# Automatic VPS Deployment Script for CrysGarage
param(
    [string]$VpsHost = "",
    [string]$VpsUser = "root"
)

$ErrorActionPreference = "Stop"

Write-Host "Automatic VPS Deployment for CrysGarage" -ForegroundColor Cyan

# Get VPS host if not provided
if ([string]::IsNullOrEmpty($VpsHost)) {
    $VpsHost = Read-Host "Enter your VPS host (domain or IP)"
}

Write-Host "Deploying to: $VpsHost as $VpsUser" -ForegroundColor Yellow

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Blue
ssh -o ConnectTimeout=10 $VpsUser@$VpsHost "echo 'SSH OK'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "SSH connection failed!" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Blue
Set-Location "crysgarage-frontend"
npm install
npm run build
Set-Location ".."

# Deploy using the main script
Write-Host "Starting deployment..." -ForegroundColor Blue
& ".\deploy_fresh.ps1" -VpsHost $VpsHost -VpsUser $VpsUser

Write-Host "Deployment completed!" -ForegroundColor Green