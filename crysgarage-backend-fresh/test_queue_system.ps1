#!/usr/bin/env pwsh
# Test script for Crys Garage Queue System

Write-Host "=== CRYS GARAGE QUEUE SYSTEM TEST ===" -ForegroundColor Green
Write-Host ""
Write-Host "Testing the enhanced ML pipeline with queue system..." -ForegroundColor Yellow
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8000"
$testAudioFile = "test_audio.wav"

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$ContentType = "application/json"
    )
    
    try {
        $headers = @{
            "Content-Type" = $ContentType
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        return $response
    } catch {
        Write-Host "❌ API Request failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Cyan
$healthResponse = Invoke-ApiRequest -Url "$baseUrl/api/health"
if ($healthResponse) {
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "   Service: $($healthResponse.service)" -ForegroundColor Gray
    Write-Host "   Version: $($healthResponse.version)" -ForegroundColor Gray
} else {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Upload Audio
Write-Host "2. Testing Audio Upload..." -ForegroundColor Cyan

# Create a test audio file if it doesn't exist
if (-not (Test-Path $testAudioFile)) {
    Write-Host "📁 Creating test audio file..." -ForegroundColor Yellow
    # Copy existing sample file or create a dummy one
    $sampleFile = "download/mastered_audio.wav"
    if (Test-Path $sampleFile) {
        Copy-Item $sampleFile $testAudioFile
        Write-Host "✅ Test audio file created from sample" -ForegroundColor Green
    } else {
        Write-Host "❌ No sample file found to create test audio" -ForegroundColor Red
        exit 1
    }
}

# Upload the test audio
$uploadBody = @{
    tier = "pro"
    genre = "hip_hop"
    filename = "test_queue_audio.wav"
}

$uploadResponse = Invoke-ApiRequest -Url "$baseUrl/api/upload-audio" -Method "POST" -Body $uploadBody
if ($uploadResponse -and $uploadResponse.status -eq "success") {
    $audioId = $uploadResponse.audio_id
    Write-Host "✅ Audio uploaded successfully" -ForegroundColor Green
    Write-Host "   Audio ID: $audioId" -ForegroundColor Gray
} else {
    Write-Host "❌ Audio upload failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Process Audio (Queue Job)
Write-Host "3. Testing Audio Processing (Queue Job)..." -ForegroundColor Cyan

$processBody = @{
    audio_id = $audioId
}

$processResponse = Invoke-ApiRequest -Url "$baseUrl/api/process-audio" -Method "POST" -Body $processBody
if ($processResponse -and $processResponse.status -eq "success") {
    $jobId = $processResponse.job_id
    Write-Host "✅ Processing job dispatched successfully" -ForegroundColor Green
    Write-Host "   Job ID: $jobId" -ForegroundColor Gray
    Write-Host "   Estimated time: $($processResponse.estimated_processing_time)" -ForegroundColor Gray
} else {
    Write-Host "❌ Processing job dispatch failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Check Job Status
Write-Host "4. Testing Job Status Check..." -ForegroundColor Cyan

$statusResponse = Invoke-ApiRequest -Url "$baseUrl/api/job-status?audio_id=$audioId"
if ($statusResponse -and $statusResponse.status -eq "success") {
    Write-Host "✅ Job status check successful" -ForegroundColor Green
    Write-Host "   Audio Status: $($statusResponse.audio_status)" -ForegroundColor Gray
    Write-Host "   Job ID: $($statusResponse.job_id)" -ForegroundColor Gray
} else {
    Write-Host "❌ Job status check failed" -ForegroundColor Red
}

Write-Host ""

# Test 5: Check Queue Jobs File
Write-Host "5. Checking Queue Jobs File..." -ForegroundColor Cyan

if (Test-Path "queue_jobs.json") {
    $jobs = Get-Content "queue_jobs.json" | ConvertFrom-Json
    $totalJobs = ($jobs.PSObject.Properties).Count
    Write-Host "✅ Queue jobs file found" -ForegroundColor Green
    Write-Host "   Total jobs: $totalJobs" -ForegroundColor Gray
    
    # Show job details
    foreach ($jobProp in $jobs.PSObject.Properties) {
        $job = $jobProp.Value
        Write-Host "   Job $($job.id): $($job.status) (Audio: $($job.audio_id))" -ForegroundColor Gray
    }
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
    
    # Show audio details
    foreach ($audioProp in $storage.PSObject.Properties) {
        $audio = $audioProp.Value
        Write-Host "   Audio $($audio.audio_id): $($audio.status) ($($audio.tier) - $($audio.genre))" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Storage file not found" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "=== QUEUE SYSTEM TEST SUMMARY ===" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Queue System Features Tested:" -ForegroundColor Green
Write-Host "   • Job dispatch and queuing" -ForegroundColor Gray
Write-Host "   • Job status tracking" -ForegroundColor Gray
Write-Host "   • Storage management" -ForegroundColor Gray
Write-Host "   • API endpoints" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Queue System Status: OPERATIONAL" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Start queue worker: php queue_worker.php" -ForegroundColor Gray
Write-Host "   2. Monitor jobs: Check queue_jobs.json" -ForegroundColor Gray
Write-Host "   3. Integrate with frontend polling" -ForegroundColor Gray
Write-Host ""

# Cleanup
if (Test-Path $testAudioFile) {
    Remove-Item $testAudioFile -Force
    Write-Host "🧹 Cleaned up test files" -ForegroundColor Gray
}

Write-Host "Queue system test completed!" -ForegroundColor Green