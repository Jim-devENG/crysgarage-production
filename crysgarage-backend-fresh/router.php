<?php
/**
 * Simple Router for Crys Garage ML Pipeline
 * This file handles all HTTP requests and routes them to the appropriate handlers
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string and get the path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove leading slash and split into segments
$segments = array_filter(explode('/', $path));

// Route handling
if (empty($segments) || count($segments) === 0) {
    // Root path - show available endpoints
    sendResponse([
        'status' => 'success',
        'service' => 'Crys Garage ML Pipeline',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            'GET /api/health' => 'Health check',
            'POST /api/ml-test/upload' => 'ML Pipeline Test',
            'POST /api/upload-audio' => 'Upload Audio',
            'POST /api/process-audio' => 'Process Audio',
            'GET /api/job-status' => 'Check Job Status',
            'GET /api/credits/balance' => 'Get Credit Balance',
            'POST /api/credits/deduct' => 'Deduct Credits',
            'POST /api/credits/add' => 'Add Credits',
            'GET /api/tier/pricing' => 'Get Tier Pricing'
        ]
    ]);
} elseif (count($segments) > 0 && $segments[0] === 'api') {
    // API routes
    if (count($segments) >= 2) {
        $endpoint = implode('/', array_slice($segments, 1));
        
        switch ($endpoint) {
            case 'health':
                handleHealthCheck();
                break;
                
            case 'debug':
                handleDebug();
                break;
                
            case 'ml-test/upload':
                if ($method === 'POST') {
                    handleMLTestUpload();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'upload-audio':
                if ($method === 'POST') {
                    handleAudioUpload();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'process-audio':
                if ($method === 'POST') {
                    handleAudioProcessing();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'job-status':
                if ($method === 'GET') {
                    handleJobStatus();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'credits/balance':
                if ($method === 'GET') {
                    handleCreditBalance();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'credits/deduct':
                if ($method === 'POST') {
                    handleCreditDeduction();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'credits/add':
                if ($method === 'POST') {
                    handleCreditAddition();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'tier/pricing':
                if ($method === 'GET') {
                    handleTierPricing();
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            default:
                sendError('API endpoint not found', 404);
                break;
        }
    } else {
        sendError('API endpoint not specified', 400);
    }
} else {
    sendError('Invalid path', 404);
}

function handleHealthCheck() {
    sendResponse([
        'status' => 'healthy',
        'service' => 'Crys Garage ML Pipeline',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            '/api/health' => 'Health check',
            '/api/ml-test/upload' => 'ML Pipeline Test',
            '/api/upload-audio' => 'Upload Audio',
            '/api/process-audio' => 'Process Audio'
        ]
    ]);
}

function handleMLTestUpload() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    sendResponse([
        'status' => 'success',
        'message' => 'ML Pipeline Upload Endpoint Working',
        'timestamp' => date('Y-m-d H:i:s'),
        'received_data' => $input,
        'method' => $_SERVER['REQUEST_METHOD'],
        'url' => $_SERVER['REQUEST_URI']
    ]);
}

function handleAudioUpload() {
    // Simulate audio upload
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Generate a mock audio ID
    $audioId = 'audio_' . uniqid();
    
    // Simulate file storage
    $uploadData = [
        'audio_id' => $audioId,
        'filename' => $input['filename'] ?? 'test_audio.wav',
        'tier' => $input['tier'] ?? 'free',
        'genre' => $input['genre'] ?? 'hip_hop',
        'file_size' => $input['file_size'] ?? 1024000,
        'status' => 'uploaded',
        'uploaded_at' => date('Y-m-d H:i:s')
    ];
    
    // Store in simple JSON file (simulating database)
    $storageFile = 'storage.json';
    $storage = file_exists($storageFile) ? json_decode(file_get_contents($storageFile), true) : [];
    $storage[$audioId] = $uploadData;
    file_put_contents($storageFile, json_encode($storage, JSON_PRETTY_PRINT));
    
    sendResponse([
        'status' => 'success',
        'message' => 'Audio uploaded successfully',
        'audio_id' => $audioId,
        'estimated_processing_time' => getEstimatedProcessingTime($input['tier'] ?? 'free')
    ]);
}

function handleAudioProcessing() {
    $input = json_decode(file_get_contents('php://input'), true);
    $audioId = $input['audio_id'] ?? null;
    
    if (!$audioId) {
        sendError('Audio ID is required', 400);
        return;
    }
    
    // Load storage
    $storageFile = 'storage.json';
    if (!file_exists($storageFile)) {
        sendError('Audio not found', 404);
        return;
    }
    
    $storage = json_decode(file_get_contents($storageFile), true);
    if (!isset($storage[$audioId])) {
        sendError('Audio not found', 404);
        return;
    }
    
    $audio = $storage[$audioId];
    
    // Simulate ML processing
    $mlRecommendations = generateMLRecommendations($audio['tier'], $audio['genre']);
    
    // Simulate FFmpeg processing
    $processedFiles = generateProcessedFiles($audio['tier']);
    
    // Update status
    $audio['status'] = 'completed';
    $audio['processing_started_at'] = date('Y-m-d H:i:s');
    $audio['processing_completed_at'] = date('Y-m-d H:i:s');
    $audio['ml_recommendations'] = $mlRecommendations;
    $audio['processed_files'] = $processedFiles;
    
    $storage[$audioId] = $audio;
    file_put_contents($storageFile, json_encode($storage, JSON_PRETTY_PRINT));
    
    sendResponse([
        'status' => 'success',
        'message' => 'Audio processing completed',
        'audio_id' => $audioId,
        'processing_time' => '2.5 seconds',
        'download_urls' => $processedFiles
    ]);
}

function generateMLRecommendations($tier, $genre) {
    $baseRecommendations = [
        'eq' => ['low' => 1.0, 'mid' => 1.0, 'high' => 1.0],
        'compression' => ['ratio' => 2.0, 'threshold' => -12.0],
        'genre' => $genre
    ];
    
    // Genre-specific adjustments
    $genreAdjustments = [
        'hip_hop' => [
            'eq' => ['low' => 1.3, 'mid' => 0.9, 'high' => 1.1],
            'compression' => ['ratio' => 4.0, 'threshold' => -10.0]
        ],
        'afrobeats' => [
            'eq' => ['low' => 1.1, 'mid' => 1.2, 'high' => 1.3],
            'compression' => ['ratio' => 3.0, 'threshold' => -12.0]
        ],
        'gospel' => [
            'eq' => ['low' => 1.0, 'mid' => 1.1, 'high' => 1.0],
            'compression' => ['ratio' => 2.5, 'threshold' => -14.0]
        ]
    ];
    
    if (isset($genreAdjustments[$genre])) {
        $baseRecommendations = array_merge($baseRecommendations, $genreAdjustments[$genre]);
    }
    
    // Tier-specific adjustments
    if ($tier === 'pro') {
        $baseRecommendations['compression']['ratio'] *= 1.2;
    } elseif ($tier === 'advanced') {
        $baseRecommendations['compression']['ratio'] *= 1.5;
        $baseRecommendations['stereo_width'] = 1.1;
    }
    
    return $baseRecommendations;
}

function generateProcessedFiles($tier) {
    $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
    
    $formats = [
        'free' => ['wav', 'mp3'],
        'pro' => ['wav', 'mp3', 'flac'],
        'advanced' => ['wav', 'mp3', 'flac', 'aiff']
    ];
    
    $availableFormats = $formats[$tier] ?? $formats['free'];
    $processedFiles = [];
    
    foreach ($availableFormats as $format) {
        $processedFiles[$format] = "{$baseUrl}/download/mastered_audio.{$format}";
    }
    
    return $processedFiles;
}

function getEstimatedProcessingTime($tier) {
    $times = [
        'free' => '2-5 minutes',
        'pro' => '1-3 minutes',
        'advanced' => '30 seconds - 2 minutes'
    ];
    
    return $times[$tier] ?? '2-5 minutes';
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $statusCode = 400) {
    sendResponse([
        'status' => 'error',
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], $statusCode);
}

function handleCreditBalance() {
    $userId = $_GET['user_id'] ?? 'test@crysgarage.com';
    
    // Load user data
    $usersFile = 'users.json';
    $users = file_exists($usersFile) ? json_decode(file_get_contents($usersFile), true) : [];
    $user = $users[$userId] ?? null;
    
    // Create default user if not exists
    if (!$user) {
        $user = [
            'id' => $userId,
            'name' => 'Test User',
            'email' => $userId,
            'tier' => 'free',
            'credits' => 5,
            'total_tracks' => 0,
            'total_spent' => 0.00
        ];
        $users[$userId] = $user;
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    }
    
    sendResponse([
        'status' => 'success',
        'credits' => $user['credits'] ?? 5,
        'tier' => $user['tier'] ?? 'free',
        'total_tracks' => $user['total_tracks'] ?? 0,
        'total_spent' => $user['total_spent'] ?? 0.00
    ]);
}

function handleCreditDeduction() {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? 'test@crysgarage.com';
    $amount = $input['amount'] ?? 1;
    
    $result = deductCreditsForProcessing($userId, 'pro');
    sendResponse($result);
}

function handleCreditAddition() {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? 'test@crysgarage.com';
    $amount = $input['amount'] ?? 0;
    $reason = $input['reason'] ?? 'credit_purchase';
    
    // Load user data
    $usersFile = 'users.json';
    $users = file_exists($usersFile) ? json_decode(file_get_contents($usersFile), true) : [];
    $user = $users[$userId] ?? null;
    
    if (!$user) {
        sendError('User not found', 404);
        return;
    }
    
    $user['credits'] = ($user['credits'] ?? 0) + $amount;
    $user['total_spent'] = ($user['total_spent'] ?? 0) + ($amount * 100); // Assuming 1 credit = 100 kobo
    
    $users[$userId] = $user;
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    
    // Log credit transaction
    logCreditTransaction($userId, $amount, $reason, 'Credit purchase');
    
    sendResponse([
        'status' => 'success',
        'credits_added' => $amount,
        'total_credits' => $user['credits'],
        'total_spent' => $user['total_spent']
    ]);
}

function handleTierPricing() {
    $pricing = [
        'free' => [
            'name' => 'Free',
            'price' => 0,
            'credits' => 5,
            'features' => [
                'Pay-per-download',
                'Basic mastering',
                'WAV & MP3 formats'
            ]
        ],
        'pro' => [
            'name' => 'Professional',
            'price' => 5000, // 5000 kobo = 50 NGN
            'credits' => 20,
            'features' => [
                '20 credits included',
                'Professional mastering',
                'WAV, MP3 & FLAC formats',
                'Priority processing'
            ]
        ],
        'advanced' => [
            'name' => 'Advanced',
            'price' => 10000, // 10000 kobo = 100 NGN
            'credits' => 50,
            'features' => [
                '50 credits included',
                'Advanced mastering',
                'All formats (WAV, MP3, FLAC, AIFF)',
                'Highest quality processing',
                'Priority support'
            ]
        ],
        'one_on_one' => [
            'name' => 'One-on-One',
            'price' => 50000, // 50000 kobo = 500 NGN
            'credits' => 'unlimited',
            'features' => [
                'Unlimited processing',
                'Personal consultation',
                'Custom mastering',
                'All formats',
                'Direct communication'
            ]
        ]
    ];
    
    sendResponse([
        'status' => 'success',
        'pricing' => $pricing
    ]);
}

function handleDebug() {
    // Get the request URI and method
    $request_uri = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Remove query string and get the path
    $path = parse_url($request_uri, PHP_URL_PATH);
    
    // Remove leading slash and split into segments
    $segments = array_filter(explode('/', $path));
    
    sendResponse([
        'status' => 'debug',
        'request_uri' => $request_uri,
        'method' => $method,
        'path' => $path,
        'segments' => $segments,
        'segments_count' => count($segments),
        'first_segment' => isset($segments[0]) ? $segments[0] : 'none',
        'is_api' => (count($segments) > 0 && $segments[0] === 'api'),
        'endpoint' => (count($segments) >= 2) ? implode('/', array_slice($segments, 1)) : 'none'
    ]);
}
?>
