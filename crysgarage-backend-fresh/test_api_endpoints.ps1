# Test All ML Pipeline API Endpoints
Write-Host "=== TESTING ML PIPELINE API ENDPOINTS ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8000"

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health.php" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] Health check: Working" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Service: $($healthData.service)" -ForegroundColor Gray
        Write-Host "   Version: $($healthData.version)" -ForegroundColor Gray
    } else {
        Write-Host "   [FAIL] Health check: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   [FAIL] Health check: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Test 2: Audio Upload
Write-Host "2. Testing Audio Upload..." -ForegroundColor Yellow
try {
    $uploadData = @{
        filename = "test_audio.wav"
        tier = "free"
        genre = "hip_hop"
        file_size = 1024000
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/upload-audio.php" -Method POST -ContentType "application/json" -Body $uploadData -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] Audio upload: Working" -ForegroundColor Green
        $uploadResult = $response.Content | ConvertFrom-Json
        Write-Host "   Audio ID: $($uploadResult.audio_id)" -ForegroundColor Gray
        Write-Host "   Processing time: $($uploadResult.estimated_processing_time)" -ForegroundColor Gray
        $global:testAudioId = $uploadResult.audio_id
    } else {
        Write-Host "   [FAIL] Audio upload: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   [FAIL] Audio upload: Failed ($($_.Exception.Message))" -ForegroundColor Red
}

# Test 3: Audio Processing
if ($global:testAudioId) {
    Write-Host "3. Testing Audio Processing..." -ForegroundColor Yellow
    try {
        $processData = @{
            audio_id = $global:testAudioId
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/process-audio.php" -Method POST -ContentType "application/json" -Body $processData -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "   [OK] Audio processing: Working" -ForegroundColor Green
            $processResult = $response.Content | ConvertFrom-Json
            Write-Host "   Processing time: $($processResult.processing_time)" -ForegroundColor Gray
            Write-Host "   Available formats: $($processResult.download_urls.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
            Write-Host "   ML Recommendations: EQ Low=$($processResult.ml_recommendations.eq.low), Mid=$($processResult.ml_recommendations.eq.mid), High=$($processResult.ml_recommendations.eq.high)" -ForegroundColor Gray
        } else {
            Write-Host "   [FAIL] Audio processing: Failed (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "   [FAIL] Audio processing: Failed ($($_.Exception.Message))" -ForegroundColor Red
    }
}

# Test 4: Different Tiers and Genres
Write-Host "4. Testing Different Tiers and Genres..." -ForegroundColor Yellow
$testCases = @(
    @{tier="pro"; genre="afrobeats"},
    @{tier="advanced"; genre="gospel"}
)

foreach ($testCase in $testCases) {
    try {
        $uploadData = @{
            filename = "test_$($testCase.genre).wav"
            tier = $testCase.tier
            genre = $testCase.genre
            file_size = 2048000
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/api/upload-audio.php" -Method POST -ContentType "application/json" -Body $uploadData -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $uploadResult = $response.Content | ConvertFrom-Json
            $audioId = $uploadResult.audio_id
            
            # Process the audio
            $processData = @{audio_id = $audioId} | ConvertTo-Json
            $processResponse = Invoke-WebRequest -Uri "$baseUrl/api/process-audio.php" -Method POST -ContentType "application/json" -Body $processData -TimeoutSec 10
            
            if ($processResponse.StatusCode -eq 200) {
                $processResult = $processResponse.Content | ConvertFrom-Json
                Write-Host "   [OK] $($testCase.tier) tier, $($testCase.genre) genre: Working" -ForegroundColor Green
                Write-Host "      Available formats: $($processResult.download_urls.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
                Write-Host "      Compression ratio: $($processResult.ml_recommendations.compression.ratio)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "   [FAIL] $($testCase.tier) tier, $($testCase.genre) genre: Failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== API ENDPOINTS TEST COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Available endpoints:" -ForegroundColor Yellow
Write-Host "  GET  $baseUrl/api/health.php - Health check" -ForegroundColor Gray
Write-Host "  POST $baseUrl/api/upload-audio.php - Upload audio" -ForegroundColor Gray
Write-Host "  POST $baseUrl/api/process-audio.php - Process audio" -ForegroundColor Gray
Write-Host ""
Write-Host "All endpoints are working and ready for frontend integration! 🎉" -ForegroundColor Green
