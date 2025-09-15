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

// Python Microservice Test Route
Route::get('/python-service/health', function() {
    try {
        $pythonServiceUrl = env('PYTHON_SERVICE_URL', 'http://209.74.80.162:8002');
        $response = \Illuminate\Support\Facades\Http::timeout(10)->get("{$pythonServiceUrl}/health");
        
        if ($response->successful()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Python microservice is healthy',
                'python_service_response' => $response->json(),
                'timestamp' => now()->toISOString()
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Python microservice health check failed',
                'status_code' => $response->status(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to connect to Python microservice: ' . $e->getMessage(),
            'timestamp' => now()->toISOString()
        ], 500);
    }
});

// Python Microservice Proxy Routes
Route::prefix('python')->group(function () {
    // Health check
    Route::get('/health', function() {
        try {
            $pythonServiceUrl = env('PYTHON_SERVICE_URL', 'http://localhost:8002');
            $response = \Illuminate\Support\Facades\Http::timeout(10)->get("{$pythonServiceUrl}/health");
            
            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Python microservice is not responding',
                    'status_code' => $response->status()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to connect to Python microservice',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Get tier information
    Route::get('/tiers', function() {
        try {
            $pythonServiceUrl = env('PYTHON_SERVICE_URL', 'http://localhost:8002');
            $response = \Illuminate\Support\Facades\Http::timeout(10)->get("{$pythonServiceUrl}/tiers");
            
            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to get tier information',
                    'status_code' => $response->status()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to connect to Python microservice',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Get genre information
    Route::get('/genres', function() {
        try {
            $pythonServiceUrl = env('PYTHON_SERVICE_URL', 'http://localhost:8002');
            $response = \Illuminate\Support\Facades\Http::timeout(10)->get("{$pythonServiceUrl}/genres");
            
            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to get genre information',
                    'status_code' => $response->status()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to connect to Python microservice',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Process audio
    Route::post('/master', function(Request $request) {
        try {
            $pythonServiceUrl = env('PYTHON_SERVICE_URL', 'http://localhost:8002');
            $response = \Illuminate\Support\Facades\Http::timeout(300)->post("{$pythonServiceUrl}/master", $request->all());
            
            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to process audio',
                    'status_code' => $response->status(),
                    'error' => $response->body()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to connect to Python microservice',
                'error' => $e->getMessage()
            ], 500);
        }
    });
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
