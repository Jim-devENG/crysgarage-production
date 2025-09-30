# Setup Local ML Pipeline Environment
# This script will set up everything needed to test the ML pipeline locally

Write-Host "=== SETTING UP LOCAL ML PIPELINE ===" -ForegroundColor Green
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Cyan

# Step 1: Check if we're in the right directory
if (-not (Test-Path "crysgarage-backend")) {
    Write-Host "❌ Error: crysgarage-backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found crysgarage-backend directory" -ForegroundColor Green

# Step 2: Check PHP installation
Write-Host "`n1. CHECKING PHP INSTALLATION" -ForegroundColor Yellow
try {
    $phpVersion = php --version
    Write-Host "✅ PHP is installed: $($phpVersion.Split("`n")[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ PHP not found. Please install PHP 8.1+ first." -ForegroundColor Red
    exit 1
}

# Step 3: Check Composer
Write-Host "`n2. CHECKING COMPOSER" -ForegroundColor Yellow
try {
    $composerVersion = composer --version
    Write-Host "✅ Composer is installed: $($composerVersion.Split("`n")[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Composer not found. Please install Composer first." -ForegroundColor Red
    exit 1
}

# Step 4: Check Python
Write-Host "`n3. CHECKING PYTHON" -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Python not found. Installing Python..." -ForegroundColor Yellow
    winget install Python.Python.3.12
    Write-Host "✅ Python installed. Please restart PowerShell and run this script again." -ForegroundColor Green
    exit 0
}

# Step 5: Check Node.js
Write-Host "`n4. CHECKING NODE.JS" -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 6: Install Laravel dependencies
Write-Host "`n5. INSTALLING LARAVEL DEPENDENCIES" -ForegroundColor Yellow
Set-Location "crysgarage-backend"
try {
    composer install --ignore-platform-req=ext-fileinfo
    Write-Host "✅ Laravel dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Laravel dependencies" -ForegroundColor Red
    exit 1
}

# Step 7: Set up Python ML service
Write-Host "`n6. SETTING UP PYTHON ML SERVICE" -ForegroundColor Yellow
Set-Location "ml-service"
if (Test-Path "requirements.txt") {
    try {
        pip install -r requirements.txt
        Write-Host "✅ Python ML service dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Failed to install Python dependencies. Continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  requirements.txt not found. Creating basic ML service..." -ForegroundColor Yellow
    # Create basic requirements.txt
    @"
fastapi==0.104.1
uvicorn==0.24.0
librosa==0.10.1
numpy==1.24.3
scipy==1.11.4
python-multipart==0.0.6
"@ | Out-File -FilePath "requirements.txt" -Encoding UTF8
    
    try {
        pip install -r requirements.txt
        Write-Host "✅ Basic Python ML service dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Failed to install Python dependencies. Continuing..." -ForegroundColor Yellow
    }
}

# Step 8: Create test audio file
Write-Host "`n7. CREATING TEST AUDIO FILE" -ForegroundColor Yellow
Set-Location ".."
if (-not (Test-Path "test_audio.wav")) {
    # Create a simple test audio file (1 second of silence)
    $testAudioBytes = [byte[]]::new(88200) # 1 second of 44.1kHz 16-bit audio
    [System.IO.File]::WriteAllBytes("test_audio.wav", $testAudioBytes)
    Write-Host "✅ Test audio file created" -ForegroundColor Green
}

# Step 9: Check FFmpeg
Write-Host "`n8. CHECKING FFMPEG" -ForegroundColor Yellow
try {
    $ffmpegVersion = ffmpeg -version
    Write-Host "✅ FFmpeg is installed: $($ffmpegVersion.Split("`n")[0])" -ForegroundColor Green
} catch {
    Write-Host "⚠️  FFmpeg not found. Installing FFmpeg..." -ForegroundColor Yellow
    winget install Gyan.FFmpeg
    Write-Host "✅ FFmpeg installed. Please restart PowerShell and run this script again." -ForegroundColor Green
    exit 0
}

# Step 10: Set up Redis (optional for local testing)
Write-Host "`n9. CHECKING REDIS" -ForegroundColor Yellow
try {
    $redisVersion = redis-server --version
    Write-Host "✅ Redis is installed: $($redisVersion.Split("`n")[0])" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Redis not found. For local testing, we'll use database queue instead." -ForegroundColor Yellow
    Write-Host "To install Redis: winget install Redis.Redis" -ForegroundColor Cyan
}

Write-Host "`n=== LOCAL ML PIPELINE SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\test_local_ml_pipeline.ps1" -ForegroundColor Cyan
Write-Host "2. Test the ML pipeline endpoints" -ForegroundColor Cyan
Write-Host "3. Deploy to live server when ready" -ForegroundColor Cyan
