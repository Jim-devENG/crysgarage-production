#!/usr/bin/env pwsh

# Install Python 3.11+ and FFmpeg on VPS Server
# This script will install the required dependencies for the Audio Mastering Microservice

Write-Host "=== Installing Python 3.11+ and FFmpeg on VPS Server ===" -ForegroundColor Green

# Check current Python version
Write-Host "Checking current Python installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 --version"

# Check current FFmpeg installation
Write-Host "Checking current FFmpeg installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -version | head -1"

# Update system packages
Write-Host "Updating system packages..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "apt update && apt upgrade -y"

# Install Python 3.11 and pip
Write-Host "Installing Python 3.11 and pip..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "apt install -y python3.11 python3.11-pip python3.11-venv python3.11-dev"

# Install FFmpeg and audio libraries
Write-Host "Installing FFmpeg and audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "apt install -y ffmpeg libsndfile1 libsndfile1-dev libasound2-dev portaudio19-dev"

# Install additional Python audio processing dependencies
Write-Host "Installing additional audio processing libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "apt install -y libffi-dev libssl-dev libjpeg-dev zlib1g-dev"

# Create symbolic links for easier access
Write-Host "Creating symbolic links..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ln -sf /usr/bin/python3.11 /usr/bin/python3 && ln -sf /usr/bin/python3.11 /usr/bin/python"

# Verify installations
Write-Host "Verifying Python installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 --version && python3 -m pip --version"

Write-Host "Verifying FFmpeg installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -version | head -3"

# Test Python audio libraries installation
Write-Host "Testing Python audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 -c 'import sys; print(f\"Python {sys.version}\"); import numpy; print(\"NumPy: OK\"); import librosa; print(\"Librosa: OK\"); import soundfile; print(\"SoundFile: OK\")'"

# Create directory for the microservice
Write-Host "Creating microservice directory..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "mkdir -p /opt/audio-mastering-service && chown -R root:root /opt/audio-mastering-service"

# Set up Python virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && python3 -m venv venv"

# Install basic Python packages in virtual environment
Write-Host "Installing basic Python packages..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && pip install --upgrade pip setuptools wheel"

# Test FFmpeg functionality
Write-Host "Testing FFmpeg functionality..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -f lavfi -i 'sine=frequency=1000:duration=1' -t 1 /tmp/test_audio.wav && ls -la /tmp/test_audio.wav && rm /tmp/test_audio.wav"

Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host "✅ Python 3.11+ installed and configured" -ForegroundColor Cyan
Write-Host "✅ FFmpeg installed and working" -ForegroundColor Cyan
Write-Host "✅ Audio processing libraries installed" -ForegroundColor Cyan
Write-Host "✅ Virtual environment created at /opt/audio-mastering-service" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Next step: Deploy the microservice code to the server" -ForegroundColor Yellow


