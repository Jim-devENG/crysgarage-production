# Test ML Pipeline - Passwordless VPS Testing
param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root",
    [string]$SSH_KEY = "github_actions_key"
)

Write-Host "🧪 Testing ML Audio Pipeline..." -ForegroundColor Cyan

# Test 1: Check Redis connection
Write-Host "1️⃣ Testing Redis connection..." -ForegroundColor Yellow
$redisTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "redis-cli ping"
if ($redisTest -eq "PONG") {
    Write-Host "✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "❌ Redis connection failed" -ForegroundColor Red
}

# Test 2: Check ML service health
Write-Host "2️⃣ Testing ML service health..." -ForegroundColor Yellow
$mlHealth = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "curl -s http://localhost:8001/health"
if ($mlHealth -like "*healthy*") {
    Write-Host "✅ ML service is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ ML service health check failed" -ForegroundColor Red
}

# Test 3: Check Horizon status
Write-Host "3️⃣ Testing Laravel Horizon..." -ForegroundColor Yellow
$horizonStatus = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "systemctl is-active crysgarage-horizon"
if ($horizonStatus -eq "active") {
    Write-Host "✅ Horizon is running" -ForegroundColor Green
} else {
    Write-Host "❌ Horizon is not running" -ForegroundColor Red
}

# Test 4: Check new API endpoints
Write-Host "4️⃣ Testing new API endpoints..." -ForegroundColor Yellow
$apiTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "curl -s -o /dev/null -w '%{http_code}' https://crysgarage.studio/api/audio/features"
if ($apiTest -eq "200") {
    Write-Host "✅ API endpoints are accessible" -ForegroundColor Green
} else {
    Write-Host "⚠️ API endpoint test returned: $apiTest" -ForegroundColor Yellow
}

# Test 5: Check queue configuration
Write-Host "5️⃣ Testing queue configuration..." -ForegroundColor Yellow
$queueTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "cd /var/www/html/api && php artisan queue:work --once --timeout=5"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Queue worker is functional" -ForegroundColor Green
} else {
    Write-Host "⚠️ Queue worker test completed with exit code: $LASTEXITCODE" -ForegroundColor Yellow
}

# Test 6: Check FFmpeg installation
Write-Host "6️⃣ Testing FFmpeg installation..." -ForegroundColor Yellow
$ffmpegTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "ffmpeg -version | head -1"
if ($ffmpegTest -like "*ffmpeg*") {
    Write-Host "✅ FFmpeg is installed: $ffmpegTest" -ForegroundColor Green
} else {
    Write-Host "❌ FFmpeg not found" -ForegroundColor Red
}

# Test 7: Check Python ML dependencies
Write-Host "7️⃣ Testing Python ML dependencies..." -ForegroundColor Yellow
$pythonTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "cd /var/www/html/api/ml-service && python3 -c 'import librosa, numpy, fastapi; print(\"All ML dependencies available\")'"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python ML dependencies are available" -ForegroundColor Green
} else {
    Write-Host "❌ Python ML dependencies missing" -ForegroundColor Red
}

Write-Host "`n📊 ML Pipeline Test Summary:" -ForegroundColor Cyan
Write-Host "  Redis: $redisTest" -ForegroundColor White
Write-Host "  ML Service: $mlHealth" -ForegroundColor White
Write-Host "  Horizon: $horizonStatus" -ForegroundColor White
Write-Host "  API: HTTP $apiTest" -ForegroundColor White
Write-Host "  FFmpeg: $ffmpegTest" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test audio upload with new pipeline" -ForegroundColor White
Write-Host "  2. Monitor queue processing in Horizon dashboard" -ForegroundColor White
Write-Host "  3. Check ML service logs for any issues" -ForegroundColor White
Write-Host "  4. Test tier-specific processing" -ForegroundColor White
