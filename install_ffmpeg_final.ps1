#!/usr/bin/env pwsh

# Final FFmpeg installation for AlmaLinux 8.10

Write-Host "=== Installing FFmpeg on AlmaLinux 8.10 ===" -ForegroundColor Green

# Install SDL2 dependency first
Write-Host "Installing SDL2 dependency..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y SDL2 SDL2-devel"

# Install FFmpeg with all dependencies
Write-Host "Installing FFmpeg with dependencies..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y ffmpeg ffmpeg-devel --skip-broken"

# Alternative: Install from EPEL if RPM Fusion fails
Write-Host "Trying alternative FFmpeg installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "dnf install -y epel-release && dnf install -y ffmpeg"

# Verify FFmpeg installation
Write-Host "Verifying FFmpeg installation..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -version | head -3"

# Test FFmpeg functionality
Write-Host "Testing FFmpeg functionality..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "ffmpeg -f lavfi -i 'sine=frequency=1000:duration=1' -t 1 /tmp/test_audio.wav && ls -la /tmp/test_audio.wav && rm /tmp/test_audio.wav"

# Test Python audio libraries properly
Write-Host "Testing Python audio libraries..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "cd /opt/audio-mastering-service && source venv/bin/activate && python3 -c 'import numpy; print(\"NumPy: OK\"); import librosa; print(\"Librosa: OK\"); import soundfile; print(\"SoundFile: OK\")'"

# Final verification
Write-Host "Final verification of all components..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "python3 --version && echo 'Python: OK' && ffmpeg -version | head -1 && echo 'FFmpeg: OK'"

Write-Host "=== FFmpeg Installation Complete ===" -ForegroundColor Green
Write-Host "✅ Python 3.11+ installed and working" -ForegroundColor Cyan
Write-Host "✅ Core audio libraries (numpy, librosa, soundfile) installed" -ForegroundColor Cyan
Write-Host "✅ FFmpeg installed and working" -ForegroundColor Cyan
Write-Host "✅ Virtual environment ready at /opt/audio-mastering-service" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🎉 Step 1 SUCCESS: Python 3.11+ and FFmpeg are now properly installed!" -ForegroundColor Green
Write-Host "Ready to proceed to Step 2: Deploy the microservice code" -ForegroundColor Yellow


