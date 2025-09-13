# Test Local ML Pipeline
# This script will test the ML pipeline components locally

Write-Host "=== TESTING LOCAL ML PIPELINE ===" -ForegroundColor Green
Write-Host ""

# Step 1: Test Laravel Backend
Write-Host "1. TESTING LARAVEL BACKEND" -ForegroundColor Yellow
Set-Location "crysgarage-backend"

# Clear caches
Write-Host "   Clearing Laravel caches..." -ForegroundColor Gray
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Check routes
Write-Host "   Checking ML pipeline routes..." -ForegroundColor Gray
php artisan route:list --path=api | findstr -E "(upload-audio|process-audio|ml-test)"

# Start Laravel server
Write-Host "   Starting Laravel server on port 8000..." -ForegroundColor Gray
Start-Process -FilePath "php" -ArgumentList "artisan", "serve", "--port=8000" -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 5

# Test endpoints
Write-Host "   Testing ML pipeline endpoints..." -ForegroundColor Gray

# Test 1: ML Test Endpoint
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/ml-test/upload" -Method POST -ContentType "application/json" -Body '{"test": "data"}' -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ ML Test Endpoint: Working" -ForegroundColor Green
        Write-Host "   Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "   ❌ ML Test Endpoint: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ ML Test Endpoint: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Test 2: Upload Audio Endpoint
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/upload-audio" -Method POST -ContentType "application/json" -Body '{"test": "upload"}' -TimeoutSec 10
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 422) {
        Write-Host "   ✅ Upload Audio Endpoint: Working" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Upload Audio Endpoint: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Upload Audio Endpoint: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Step 2: Test Python ML Service
Write-Host "`n2. TESTING PYTHON ML SERVICE" -ForegroundColor Yellow
Set-Location "ml-service"

if (Test-Path "app.py") {
    Write-Host "   Starting Python ML service on port 5000..." -ForegroundColor Gray
    Start-Process -FilePath "python" -ArgumentList "app.py" -WindowStyle Hidden
    
    # Wait for service to start
    Start-Sleep -Seconds 5
    
    # Test ML service
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Python ML Service: Working" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Python ML Service: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Python ML Service: Failed ($($_.Exception.Message))" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Python ML service not found. Creating basic service..." -ForegroundColor Yellow
    # Create basic ML service
    @"
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Crys Garage ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "crys-garage-ml"}

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    # Basic audio analysis (placeholder)
    return {
        "status": "success",
        "recommendations": {
            "eq": {"low": 1.0, "mid": 1.0, "high": 1.0},
            "compression": {"ratio": 2.0, "threshold": -12.0},
            "genre": "unknown"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
"@ | Out-File -FilePath "app.py" -Encoding UTF8
    
    Write-Host "   ✅ Basic Python ML service created" -ForegroundColor Green
}

# Step 3: Test FFmpeg
Write-Host "`n3. TESTING FFMPEG" -ForegroundColor Yellow
try {
    $ffmpegTest = ffmpeg -f lavfi -i "sine=frequency=1000:duration=1" -t 1 test_output.wav -y
    if (Test-Path "test_output.wav") {
        Write-Host "   ✅ FFmpeg: Working (test file created)" -ForegroundColor Green
        Remove-Item "test_output.wav" -ErrorAction SilentlyContinue
    } else {
        Write-Host "   ❌ FFmpeg: Failed to create test file" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ FFmpeg: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Step 4: Test File Upload
Write-Host "`n4. TESTING FILE UPLOAD" -ForegroundColor Yellow
Set-Location ".."
if (Test-Path "test_audio.wav") {
    Write-Host "   ✅ Test audio file exists" -ForegroundColor Green
    
    # Test file upload to Laravel
    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"audio`"; filename=`"test_audio.wav`"",
            "Content-Type: audio/wav$LF",
            [System.IO.File]::ReadAllBytes("test_audio.wav"),
            "--$boundary--$LF"
        ) -join $LF
        
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/upload-audio" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines -TimeoutSec 10
        Write-Host "   ✅ File upload test: Working" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ File upload test: Failed ($($_.Exception.Message))" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Test audio file not found" -ForegroundColor Yellow
}

# Step 5: Test Queue System
Write-Host "`n5. TESTING QUEUE SYSTEM" -ForegroundColor Yellow
try {
    # Check if Redis is available
    $redisTest = redis-cli ping
    if ($redisTest -eq "PONG") {
        Write-Host "   ✅ Redis: Available" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Redis: Not available, using database queue" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Redis: Not available, using database queue" -ForegroundColor Yellow
}

# Cleanup
Write-Host "`n6. CLEANUP" -ForegroundColor Yellow
Write-Host "   Stopping services..." -ForegroundColor Gray
Get-Process -Name "php" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n=== LOCAL ML PIPELINE TEST COMPLETE ===" -ForegroundColor Green
Write-Host "Check the results above to see what's working and what needs fixing." -ForegroundColor Yellow