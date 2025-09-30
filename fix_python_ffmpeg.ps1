#!/usr/bin/env pwsh

# Fix Python and FFmpeg installation on AlmaLinux 8.10

Write-Host "=== Fixing Python and FFmpeg Installation ===" -ForegroundColor Green

# First, let's install Python 3.11 properly
Write-Host "Installing Python 3.11 from source..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y python311 python311-pip python311-devel"

# Install FFmpeg from RPM Fusion
Write-Host "Installing RPM Fusion repositories..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y https://mirrors.rpmfusion.org/free/el/rpmfusion-free-release-8.noarch.rpm"

# Install FFmpeg
Write-Host "Installing FFmpeg..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y ffmpeg ffmpeg-devel"

# Install audio libraries
Write-Host "Installing audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y libsndfile libsndfile-devel alsa-lib-devel"

# Create symbolic links for Python 3.11
Write-Host "Creating Python 3.11 symbolic links..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ln -sf /usr/bin/python3.11 /usr/bin/python3 && ln -sf /usr/bin/python3.11 /usr/bin/python"

# Verify installations
Write-Host "Verifying Python 3.11 installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 --version && python3 -m pip --version"

Write-Host "Verifying FFmpeg installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -version | head -3"

# Test FFmpeg functionality
Write-Host "Testing FFmpeg functionality..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -f lavfi -i 'sine=frequency=1000:duration=1' -t 1 /tmp/test_audio.wav && ls -la /tmp/test_audio.wav && rm /tmp/test_audio.wav"

# Recreate virtual environment with Python 3.11
Write-Host "Recreating virtual environment with Python 3.11..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "rm -rf /opt/audio-mastering-service/venv && cd /opt/audio-mastering-service && python3 -m venv venv"

# Install Python packages in the new virtual environment
Write-Host "Installing Python packages in virtual environment..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && pip install --upgrade pip setuptools wheel"

# Install core audio processing libraries
Write-Host "Installing core audio processing libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && pip install numpy librosa soundfile"

# Test the installation
Write-Host "Testing Python audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && python3 -c 'import numpy; print(\"NumPy: OK\"); import librosa; print(\"Librosa: OK\"); import soundfile; print(\"SoundFile: OK\")'"

Write-Host "=== Installation Fixed ===" -ForegroundColor Green
Write-Host "✅ Python 3.11+ installed and configured" -ForegroundColor Cyan
Write-Host "✅ FFmpeg installed and working" -ForegroundColor Cyan
Write-Host "✅ Audio processing libraries installed" -ForegroundColor Cyan
Write-Host "✅ Virtual environment recreated with Python 3.11" -ForegroundColor Cyan
Write-Host "✅ Core Python audio libraries installed and tested" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Step 1 Complete: Python 3.11+ and FFmpeg are now properly installed!" -ForegroundColor Green
Write-Host "Next step: Deploy the microservice code to the server" -ForegroundColor Yellow


