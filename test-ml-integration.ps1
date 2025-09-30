# ML Pipeline Integration Test
Write-Host "🚀 Testing ML Pipeline Integration..." -ForegroundColor Green
Write-Host ""

# Check if ML pipeline files exist
$requiredFiles = @(
    "services/mlPipelineAPI.ts",
    "hooks/useMLPipeline.ts", 
    "components/MLPipelineUpload.tsx",
    "components/MLPipelineTestPage.tsx"
)

Write-Host "📁 Checking required files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - Found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing" -ForegroundColor Red
    }
}

# Test ML Pipeline API
Write-Host ""
Write-Host "🔍 Testing ML Pipeline API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health.php" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ ML Pipeline Service is running" -ForegroundColor Green
        Write-Host "   Service: $($data.service)" -ForegroundColor Gray
        Write-Host "   Version: $($data.version)" -ForegroundColor Gray
        Write-Host "   Status: $($data.status)" -ForegroundColor Gray
    } else {
        Write-Host "❌ ML Pipeline Service returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ML Pipeline Service is not available" -ForegroundColor Red
    Write-Host "   Make sure to start the PHP server: php -S localhost:8000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Integration Instructions:" -ForegroundColor Yellow
Write-Host "1. Add the ML Pipeline route to your React Router:" -ForegroundColor Gray
Write-Host "   import MLPipelineTestPage from './components/MLPipelineTestPage';" -ForegroundColor Gray
Write-Host "   <Route path='/ml-pipeline' element={<MLPipelineTestPage />} />" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add the ML Pipeline upload component to existing pages:" -ForegroundColor Gray
Write-Host "   import MLPipelineUpload from './components/MLPipelineUpload';" -ForegroundColor Gray
Write-Host "   <MLPipelineUpload onProcessingComplete={handleComplete} />" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Use the ML Pipeline hook in your components:" -ForegroundColor Gray
Write-Host "   import { useMLPipeline } from './hooks/useMLPipeline';" -ForegroundColor Gray
Write-Host "   const { processAudioFile, isProcessing } = useMLPipeline();" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 ML Pipeline integration test complete!" -ForegroundColor Green
