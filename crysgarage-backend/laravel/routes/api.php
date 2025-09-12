<?php

use Illuminate\Http\Request;I
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaystackController;
use App\Http\Middleware\JsonMiddleware;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

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

// Public authentication routes (no auth required)
Route::post('/auth/signin', [AuthController::class, 'signIn']);
Route::post('/auth/signup', [AuthController::class, 'signUp']);
Route::post('/auth/signout', [AuthController::class, 'signOut']);
Route::post('/auth/google', [AuthController::class, 'googleAuth']);
Route::post('/auth/facebook', [AuthController::class, 'facebookAuth']);

// Authentication routes (public for now)
Route::get('/auth/user', [AuthController::class, 'getCurrentUser']);

// Deprecated legacy Paystack routes removed. Use /payments/initialize only.

// Protected routes (require authentication)
Route::put('/auth/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');

// Legacy credits routes removed as part of direct Paystack integration simplification

// Legacy paystack history route removed

// Test route
Route::get('/test', function() {
    return response()->json([
        'status' => 'success',
        'message' => 'Crys Garage Backend API',
        'timestamp' => now()->toDateTimeString(),
        'endpoints' => [
            '/api/health' => 'Health check',
            '/api/auth/google' => 'Google OAuth',
            '/api/auth/signin' => 'Email signin',
            '/api/auth/signup' => 'Email signup'
        ]
    ]);
});

// Simple POST test route
Route::post('/test-post', function(Request $request) {
    return response()->json([
        'message' => 'POST is working',
        'data' => $request->all(),
        'raw_input' => file_get_contents('php://input'),
        'content_type' => $request->header('Content-Type'),
        'is_json' => $request->isJson(),
        'json_decoded' => json_decode(file_get_contents('php://input'), true)
    ], 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept'
    ]);
});

// Dev Mode endpoints (secure cookie-based toggle)
Route::post('/dev-mode/login', function(Request $request) {
    $email = $request->input('email');
    $password = $request->input('password');

    $allowedEmail = env('DEV_MODE_EMAIL', 'dev@crysgarage.studio');
    $allowedPassword = env('DEV_MODE_PASSWORD'); // must be set in env

    if (!$allowedPassword) {
        return response()->json(['ok' => false, 'error' => 'DEV mode not configured'], 403);
    }

    if ($email !== $allowedEmail || !hash_equals($allowedPassword, $password)) {
        return response()->json(['ok' => false, 'error' => 'Invalid credentials'], 401);
    }

    $cookie = cookie('cg_dev_mode', '1', 60 * 24, '/', null, true, true, false, 'Lax');
    return response()->json(['ok' => true])->cookie($cookie);
});

Route::post('/dev-mode/logout', function() {
    $forget = Cookie::forget('cg_dev_mode', '/', null, true, true, false, 'Lax');
    return response()->json(['ok' => true])->withCookie($forget);
});

// Test Google auth route
Route::post('/test-google', function(Request $request) {
    return response()->json([
        'message' => 'Google auth test endpoint',
        'received_data' => $request->all(),
        'raw_input' => file_get_contents('php://input'),
        'headers' => $request->headers->all()
    ], 200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept'
    ]);
});

// Main Paystack payment initialization route
Route::post('/payments/initialize', [PaystackController::class, 'initializePayment']);


