<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AudioController;

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

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'Crys Garage Backend',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString(),
    ]);
});

// ML Pipeline Test Route
Route::post('/ml-test/upload', function(Request $request) {
    return response()->json([
        'status' => 'success',
        'message' => 'ML Pipeline Upload Endpoint Working',
        'timestamp' => now()->toISOString(),
        'received_data' => $request->all(),
        'method' => $request->method(),
        'url' => $request->url()
    ]);
});

// Public routes (no authentication required)
Route::post('/upload-audio', [AudioController::class, 'uploadAudio']);
Route::post('/process-audio', [AudioController::class, 'processAudio']);
Route::get('/processing-status/{audioId}', [AudioController::class, 'getProcessingStatus']);
Route::get('/download/{audioId}/{format}', [AudioController::class, 'downloadProcessed']);

// Payment routes for free tier
Route::post('/payment/free-download', [AudioController::class, 'processFreeDownload']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Audio management routes
    Route::get('/audio', function (Request $request) {
        return $request->user()->audio()->latest()->get();
    });
    
    Route::get('/audio/{audio}', function (Request $request, $audioId) {
        $audio = \App\Models\Audio::where('id', $audioId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        return $audio;
    });
});

// Catch-all route for debugging
Route::any('{any}', function(Request $request) {
    return response()->json([
        'status' => 'error',
        'message' => 'Route not found',
        'requested_url' => $request->url(),
        'requested_method' => $request->method(),
        'timestamp' => now()->toISOString(),
        'available_endpoints' => [
            '/api/health' => 'Health check',
            '/api/ml-test/upload' => 'ML Pipeline Test',
            '/api/upload-audio' => 'Upload Audio',
            '/api/process-audio' => 'Process Audio',
            '/api/processing-status/{id}' => 'Get Processing Status',
            '/api/download/{id}/{format}' => 'Download Processed Audio',
            '/api/payment/free-download' => 'Free Tier Download'
        ]
    ], 404);
})->where('any', '.*');
