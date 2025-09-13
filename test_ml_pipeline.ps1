# Test Simple ML Pipeline
Write-Host "=== TESTING SIMPLE ML PIPELINE ===" -ForegroundColor Green
Write-Host ""

# Start PHP server in background
Write-Host "1. Starting PHP ML Pipeline server..." -ForegroundColor Yellow
Start-Process -FilePath "php" -ArgumentList "-S", "localhost:8000", "-t", "." -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 3

# Test endpoints
Write-Host "2. Testing ML Pipeline endpoints..." -ForegroundColor Yellow

# Test health check
Write-Host "   Testing health check..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Health check: Working" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Service: $($healthData.service)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Health check: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Health check: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Test ML test endpoint
Write-Host "   Testing ML test endpoint..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/ml-test/upload" -Method POST -ContentType "application/json" -Body '{"test": "data"}' -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ ML test endpoint: Working" -ForegroundColor Green
        $testData = $response.Content | ConvertFrom-Json
        Write-Host "   Message: $($testData.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ ML test endpoint: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ ML test endpoint: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Test audio upload
Write-Host "   Testing audio upload..." -ForegroundColor Gray
try {
    $uploadData = @{
        filename = "test_audio.wav"
        tier = "free"
        genre = "hip_hop"
        file_size = 1024000
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/upload-audio" -Method POST -ContentType "application/json" -Body $uploadData -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Audio upload: Working" -ForegroundColor Green
        $uploadResult = $response.Content | ConvertFrom-Json
        Write-Host "   Audio ID: $($uploadResult.audio_id)" -ForegroundColor Gray
        $global:testAudioId = $uploadResult.audio_id
    } else {
        Write-Host "   ❌ Audio upload: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Audio upload: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Test audio processing
if ($global:testAudioId) {
    Write-Host "   Testing audio processing..." -ForegroundColor Gray
    try {
        $processData = @{
            audio_id = $global:testAudioId
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/process-audio" -Method POST -ContentType "application/json" -Body $processData -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Audio processing: Working" -ForegroundColor Green
            $processResult = $response.Content | ConvertFrom-Json
            Write-Host "   Processing time: $($processResult.processing_time)" -ForegroundColor Gray
            Write-Host "   Available formats: $($processResult.download_urls.Keys -join ', ')" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Audio processing: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Audio processing: Failed ($($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Starting Python ML Service..." -ForegroundColor Yellow

# Start Python ML service in background
Start-Process -FilePath "python" -ArgumentList "simple_ml_service.py" -WindowStyle Hidden

# Wait for service to start
Start-Sleep -Seconds 3

# Test Python ML service
Write-Host "   Testing Python ML service..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Python ML service: Working" -ForegroundColor Green
        $mlData = $response.Content | ConvertFrom-Json
        Write-Host "   Service: $($mlData.service)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Python ML service: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Python ML service: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ML PIPELINE TEST COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Yellow
Write-Host "  PHP ML Pipeline: http://localhost:8000" -ForegroundColor Gray
Write-Host "  Python ML Service: http://localhost:5000" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop services, press Ctrl+C or close this window" -ForegroundColor Yellow
Write-Host ""

# Keep the script running
Write-Host "Press any key to stop services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "Stopping services..." -ForegroundColor Yellow
Get-Process -Name "php" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Services stopped." -ForegroundColor Green