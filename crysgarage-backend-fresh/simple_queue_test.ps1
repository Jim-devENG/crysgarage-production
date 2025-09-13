Write-Host "=== SIMPLE QUEUE SYSTEM TEST ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method "GET"
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "   Service: $($healthResponse.service)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Upload Audio
Write-Host "2. Testing Audio Upload..." -ForegroundColor Cyan
$uploadBody = @{
    tier = "pro"
    genre = "hip_hop"
    filename = "test_queue_audio.wav"
} | ConvertTo-Json

try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/upload-audio" -Method "POST" -Body $uploadBody -ContentType "application/json"
    $audioId = $uploadResponse.audio_id
    Write-Host "✅ Audio uploaded successfully" -ForegroundColor Green
    Write-Host "   Audio ID: $audioId" -ForegroundColor Gray
} catch {
    Write-Host "❌ Audio upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Process Audio (Queue Job)
Write-Host "3. Testing Audio Processing (Queue Job)..." -ForegroundColor Cyan
$processBody = @{
    audio_id = $audioId
} | ConvertTo-Json

try {
    $processResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/process-audio" -Method "POST" -Body $processBody -ContentType "application/json"
    $jobId = $processResponse.job_id
    Write-Host "✅ Processing job dispatched successfully" -ForegroundColor Green
    Write-Host "   Job ID: $jobId" -ForegroundColor Gray
    Write-Host "   Estimated time: $($processResponse.estimated_processing_time)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Processing job dispatch failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Check Job Status
Write-Host "4. Testing Job Status Check..." -ForegroundColor Cyan
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/job-status?audio_id=$audioId" -Method "GET"
    Write-Host "✅ Job status check successful" -ForegroundColor Green
    Write-Host "   Audio Status: $($statusResponse.audio_status)" -ForegroundColor Gray
    Write-Host "   Job ID: $($statusResponse.job_id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Job status check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Check Queue Jobs File
Write-Host "5. Checking Queue Jobs File..." -ForegroundColor Cyan
if (Test-Path "queue_jobs.json") {
    $jobs = Get-Content "queue_jobs.json" | ConvertFrom-Json
    $totalJobs = ($jobs.PSObject.Properties).Count
    Write-Host "✅ Queue jobs file found" -ForegroundColor Green
    Write-Host "   Total jobs: $totalJobs" -ForegroundColor Gray
} else {
    Write-Host "❌ Queue jobs file not found" -ForegroundColor Red
}

Write-Host ""

# Test 6: Check Storage File
Write-Host "6. Checking Storage File..." -ForegroundColor Cyan
if (Test-Path "storage.json") {
    $storage = Get-Content "storage.json" | ConvertFrom-Json
    $totalAudio = ($storage.PSObject.Properties).Count
    Write-Host "✅ Storage file found" -ForegroundColor Green
    Write-Host "   Total audio files: $totalAudio" -ForegroundColor Gray
} else {
    Write-Host "❌ Storage file not found" -ForegroundColor Red
}

Write-Host ""

Write-Host "=== QUEUE SYSTEM TEST COMPLETED ===" -ForegroundColor Green
Write-Host "✅ Queue system is operational!" -ForegroundColor Green
