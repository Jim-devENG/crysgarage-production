#!/usr/bin/env pwsh

# Check server OS and package manager

Write-Host "=== Checking Server OS and Package Manager ===" -ForegroundColor Green

# Check OS information
Write-Host "Checking OS information..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cat /etc/os-release"

# Check available package managers
Write-Host "Checking available package managers..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "which yum dnf apt-get zypper pacman"

# Check current Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 --version && which python3"

# Check if pip is available
Write-Host "Checking pip availability..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 -m pip --version || echo 'pip not available'"

# Check FFmpeg installation status
Write-Host "Checking FFmpeg status..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "which ffmpeg || echo 'FFmpeg not found'"

Write-Host "=== Server Check Complete ===" -ForegroundColor Green


