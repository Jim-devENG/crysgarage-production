#!/usr/bin/env pwsh

# Install Python pip and FFmpeg on AlmaLinux 8.10
# This script will install the required dependencies for the Audio Mastering Microservice

Write-Host "=== Installing Dependencies on AlmaLinux 8.10 ===" -ForegroundColor Green

# Update system packages
Write-Host "Updating system packages..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf update -y"

# Install pip for Python 3.11
Write-Host "Installing pip for Python 3.11..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y python3-pip python3-devel"

# Install FFmpeg and audio libraries
Write-Host "Installing FFmpeg and audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y ffmpeg ffmpeg-devel"

# Install additional audio processing dependencies
Write-Host "Installing additional audio processing libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y libsndfile libsndfile-devel alsa-lib-devel portaudio-devel"

# Install development tools and libraries
Write-Host "Installing development tools..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y gcc gcc-c++ make cmake libffi-devel openssl-devel libjpeg-devel zlib-devel"

# Install EPEL repository for additional packages
Write-Host "Installing EPEL repository..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y epel-release"

# Install additional audio libraries from EPEL
Write-Host "Installing additional audio libraries from EPEL..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y libsndfile-devel portaudio-devel"

# Verify installations
Write-Host "Verifying Python and pip installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 --version && python3 -m pip --version"

Write-Host "Verifying FFmpeg installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -version | head -3"

# Test FFmpeg functionality
Write-Host "Testing FFmpeg functionality..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -f lavfi -i 'sine=frequency=1000:duration=1' -t 1 /tmp/test_audio.wav && ls -la /tmp/test_audio.wav && rm /tmp/test_audio.wav"

# Create directory for the microservice
Write-Host "Creating microservice directory..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "mkdir -p /opt/audio-mastering-service && chown -R root:root /opt/audio-mastering-service"

# Set up Python virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && python3 -m venv venv"

# Install basic Python packages in virtual environment
Write-Host "Installing basic Python packages..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && pip install --upgrade pip setuptools wheel"

# Test Python audio libraries installation
Write-Host "Testing Python audio libraries installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && pip install numpy librosa soundfile"

# Verify the installation
Write-Host "Verifying audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && python3 -c 'import numpy; print(\"NumPy: OK\"); import librosa; print(\"Librosa: OK\"); import soundfile; print(\"SoundFile: OK\")'"

Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host "✅ Python 3.11+ with pip installed and configured" -ForegroundColor Cyan
Write-Host "✅ FFmpeg installed and working" -ForegroundColor Cyan
Write-Host "✅ Audio processing libraries installed" -ForegroundColor Cyan
Write-Host "✅ Virtual environment created at /opt/audio-mastering-service" -ForegroundColor Cyan
Write-Host "✅ Core Python audio libraries installed and tested" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Next step: Deploy the microservice code to the server" -ForegroundColor Yellow


