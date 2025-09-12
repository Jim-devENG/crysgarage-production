<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AudioController;
use App\Http\Controllers\CreditsController;
use App\Http\Controllers\AddonController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\AudioQualityController;
use App\Http\Controllers\TierController;
use App\Http\Middleware\ApiTokenAuth;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/signin', [AuthController::class, 'signIn']);
Route::post('/auth/signup', [AuthController::class, 'signUp']);
Route::post('/auth/signout', [AuthController::class, 'signOut']);
Route::get('/auth/user', [AuthController::class, 'getCurrentUser']);
Route::post('/auth/google', [AuthController::class, 'googleAuth']);
Route::post('/auth/facebook', [AuthController::class, 'facebookAuth']);

// Public genre routes
Route::get('/genres', [GenreController::class, 'getGenresForTier']);

// Public audio quality routes
Route::get('/audio-quality', [AudioQualityController::class, 'getQualityOptionsForTier']);

// Test route for debugging
Route::get('/test/debug', function() {
    return response()->json([
        'message' => 'API is working',
        'timestamp' => now()->toISOString(),
        'storage_path' => storage_path('app/processing'),
        'processing_files' => \Storage::disk('local')->files('processing')
    ]);
});

// Create test audio file for development
Route::get('/test/create-audio', function() {
    $testAudioPath = storage_path('app/test_audio.wav');
    
    if (file_exists($testAudioPath)) {
        return response()->json([
            'message' => 'Test audio file already exists',
            'path' => $testAudioPath,
            'size' => filesize($testAudioPath)
        ]);
    }
    
    // Create a simple WAV file (1 second of silence at 44.1kHz, 16-bit)
    $sampleRate = 44100;
    $duration = 1; // 1 second
    $numSamples = $sampleRate * $duration;
    
    // WAV header
    $wavHeader = pack('V', 0x52494646); // RIFF
    $wavHeader .= pack('V', 36 + ($numSamples * 2)); // File size
    $wavHeader .= pack('V', 0x57415645); // WAVE
    $wavHeader .= pack('V', 0x666D7420); // fmt
    $wavHeader .= pack('V', 16); // fmt chunk size
    $wavHeader .= pack('v', 1); // Audio format (PCM)
    $wavHeader .= pack('v', 1); // Number of channels
    $wavHeader .= pack('V', $sampleRate); // Sample rate
    $wavHeader .= pack('V', $sampleRate * 2); // Byte rate
    $wavHeader .= pack('v', 2); // Block align
    $wavHeader .= pack('v', 16); // Bits per sample
    $wavHeader .= pack('V', 0x64617461); // data
    $wavHeader .= pack('V', $numSamples * 2); // data chunk size
    
    // Create silent audio data
    $audioData = str_repeat(pack('v', 0), $numSamples);
    
    $wavContent = $wavHeader . $audioData;
    
    if (file_put_contents($testAudioPath, $wavContent)) {
        return response()->json([
            'message' => 'Test audio file created successfully',
            'path' => $testAudioPath,
            'size' => strlen($wavContent)
        ]);
    } else {
        return response()->json([
            'message' => 'Failed to create test audio file',
            'error' => 'Could not write to file'
        ], 500);
    }
});

// Test mastering results endpoint (no auth required for debugging)
Route::get('/test/mastering/{audio_id}/results', function($audioId) {
    $processingFile = storage_path('app/processing/' . $audioId . '.json');
    
    if (!file_exists($processingFile)) {
        return response()->json([
            'error' => 'Audio not found'
        ], 404);
    }
    
    $processingData = json_decode(file_get_contents($processingFile), true);
    
    return response()->json($processingData);
});

// Test endpoint to immediately complete mastering
Route::post('/test/mastering/{audio_id}/complete', [AudioController::class, 'testCompleteMastering']);

// Test audio endpoints (no auth required for development)
Route::options('/test/audio/{audio_id}/original', function($audioId) {
    return response()->json([], 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
});

Route::get('/test/audio/{audio_id}/original', function($audioId) {
    // Return a simple test audio file or create one
    $testAudioPath = storage_path('app/test_audio.wav');
    
    if (!file_exists($testAudioPath)) {
        // Create a simple test audio file
        $testAudioPath = storage_path('app/test_audio.wav');
        // For now, return a 404 but log that we need to create test audio
        \Log::info("Test audio file requested but not found: {$testAudioPath}");
        return response()->json([
            'message' => 'Test audio file not found',
            'audio_id' => $audioId,
            'note' => 'Create test audio file for development'
        ], 404);
    }
    
    return response()->file($testAudioPath, [
        'Content-Type' => 'audio/wav',
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
});

Route::options('/test/audio/{audio_id}/mastered', function($audioId) {
    return response()->json([], 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
});

Route::get('/test/audio/{audio_id}/mastered', function($audioId) {
    // Return the same test audio file for mastered version
    $testAudioPath = storage_path('app/test_audio.wav');
    
    if (!file_exists($testAudioPath)) {
        return response()->json([
            'message' => 'Test mastered audio file not found',
            'audio_id' => $audioId
        ], 404);
    }
    
    return response()->file($testAudioPath, [
        'Content-Type' => 'audio/wav',
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
});

Route::options('/test/audio/{audio_id}/download/{format}', function($audioId, $format) {
    return response()->json([], 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
});

Route::get('/test/audio/{audio_id}/download/{format}', function($audioId, $format) {
    $testAudioPath = storage_path('app/test_audio.wav');
    
    if (!file_exists($testAudioPath)) {
        return response()->json([
            'message' => 'Test audio file not found',
            'audio_id' => $audioId,
            'format' => $format
        ], 404);
    }
    
    $mimeType = match($format) {
        'wav' => 'audio/wav',
        'mp3' => 'audio/mpeg',
        'flac' => 'audio/flac',
        default => 'audio/wav'
    };
    
    return response()->file($testAudioPath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
});

// Protected routes
Route::middleware(ApiTokenAuth::class)->group(function () {
    // User routes
    Route::get('/user', [UserController::class, 'getCurrentUser']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/stats', [UserController::class, 'getStats']);
    Route::post('/user/upgrade', [UserController::class, 'upgradeTier']);
    
    // Tier management routes
    Route::get('/tier/features', [TierController::class, 'getTierFeatures']);
    Route::get('/tier/dashboard', [TierController::class, 'getTierDashboard']);
    Route::get('/tier/upload-options', [TierController::class, 'getTierUploadOptions']);
    Route::get('/tier/processing-options', [TierController::class, 'getTierProcessingOptions']);
    Route::get('/tier/stats', [TierController::class, 'getTierStats']);
    Route::post('/tier/upgrade', [TierController::class, 'upgradeTier']);
    
    // Audio routes
    Route::post('/upload', [AudioController::class, 'upload']);
    Route::get('/status/{audio_id}', [AudioController::class, 'getStatus']);
    
    // Audio download routes with CORS support
    Route::options('/audio/{audio_id}/download/{format}', function($audioId, $format) {
        return response()->json([], 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
        ]);
    });
    Route::get('/audio/{audio_id}/download/{format}', [AudioController::class, 'download']);
    
    Route::options('/audio/{audio_id}/original', function($audioId) {
        return response()->json([], 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
        ]);
    });
    Route::get('/audio/{audio_id}/download-urls', [AudioController::class, 'getDownloadUrls']);
    Route::get('/audio/{audio_id}/original', [AudioController::class, 'getOriginalAudio']);
    
    // Credits routes
    Route::get('/credits/balance', [CreditsController::class, 'getBalance']);
    Route::post('/credits/purchase', [CreditsController::class, 'purchase']);
    Route::get('/credits/history', [CreditsController::class, 'getHistory']);
    
    // Addon routes
    Route::get('/addons', [AddonController::class, 'getAddons']);
    Route::get('/user/addons', [AddonController::class, 'getUserAddons']);
    Route::post('/addons/{addon_id}/purchase', [AddonController::class, 'purchaseAddon']);
    
    // Admin genre routes
    Route::get('/admin/genres', [GenreController::class, 'getAllGenres']);
    Route::post('/admin/genres', [GenreController::class, 'createGenre']);
    Route::put('/admin/genres/{id}', [GenreController::class, 'updateGenre']);
    Route::delete('/admin/genres/{id}', [GenreController::class, 'deleteGenre']);
    
    // Admin audio quality routes
    Route::get('/admin/audio-quality', [AudioQualityController::class, 'getAllQualityOptions']);
    Route::post('/admin/audio-quality', [AudioQualityController::class, 'createQualityOption']);
    Route::put('/admin/audio-quality/{id}', [AudioQualityController::class, 'updateQualityOption']);
    Route::delete('/admin/audio-quality/{id}', [AudioQualityController::class, 'deleteQualityOption']);
    
    // Mastering routes (for advanced controls)
    Route::post('/mastering/{audio_id}/start', [AudioController::class, 'startMastering']);
    Route::get('/mastering/{session_id}', [AudioController::class, 'getSession']);
    Route::get('/mastering/{session_id}/result', [AudioController::class, 'getResult']);
    Route::post('/mastering/{session_id}/cancel', [AudioController::class, 'cancelMastering']);
    
    // Mastering results with audio URLs
    Route::get('/mastering/{audio_id}/results', [AudioController::class, 'getMasteringResults']);
});

// Public audio endpoints (no auth required for demo)
Route::get('/public/audio/{audio_id}/download/{format}', [AudioController::class, 'download']);
Route::get('/public/audio/{audio_id}/original', [AudioController::class, 'getOriginalAudio']);

// Public upload route for testing (no auth required)
Route::post('/public/upload', [AudioController::class, 'publicUpload']);

// Public status route for free tier (no auth required)
Route::get('/public/status/{audio_id}', [AudioController::class, 'getPublicStatus']);

// Public result route for free tier (no auth required)
Route::get('/public/result/{audio_id}', [AudioController::class, 'getPublicResult']);

// NEW PIPELINE ROUTES - Tier-Aware Audio Processing
Route::middleware('auth:sanctum')->group(function () {
    // Audio processing pipeline
    Route::post('/upload-audio', [AudioController::class, 'uploadAudio']);
    Route::post('/process-audio', [AudioController::class, 'processAudio']);
    Route::get('/status/{audioId}', [AudioController::class, 'getProcessingStatus']);
    Route::get('/download/{audioId}/{format}', [AudioController::class, 'downloadProcessed']);
    
    // Payment routes for free tier
    Route::post('/payment/free-download', [AudioController::class, 'processFreeDownload']);
});

// Cleanup routes (admin only)
Route::middleware(ApiTokenAuth::class)->group(function () {
    Route::post('/admin/audio/cleanup', [AudioController::class, 'manualCleanup']);
    Route::post('/admin/audio/cleanup-auto', [AudioController::class, 'cleanupCompletedFiles']);
});