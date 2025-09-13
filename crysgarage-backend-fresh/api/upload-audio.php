<?php
/**
 * Audio Upload API Endpoint
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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_PRETTY_PRINT);
    exit();
}

// Get input data
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
$storageFile = '../storage.json';
$storage = file_exists($storageFile) ? json_decode(file_get_contents($storageFile), true) : [];
$storage[$audioId] = $uploadData;
file_put_contents($storageFile, json_encode($storage, JSON_PRETTY_PRINT));

// Response
$response = [
    'status' => 'success',
    'message' => 'Audio uploaded successfully',
    'audio_id' => $audioId,
    'estimated_processing_time' => getEstimatedProcessingTime($input['tier'] ?? 'free')
];

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);

function getEstimatedProcessingTime($tier) {
    $times = [
        'free' => '2-5 minutes',
        'pro' => '1-3 minutes',
        'advanced' => '30 seconds - 2 minutes'
    ];
    
    return $times[$tier] ?? '2-5 minutes';
}
?>
