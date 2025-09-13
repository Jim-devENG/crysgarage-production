<?php
/**
 * Audio Processing API Endpoint
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
$audioId = $input['audio_id'] ?? null;

if (!$audioId) {
    http_response_code(400);
    echo json_encode(['error' => 'Audio ID is required'], JSON_PRETTY_PRINT);
    exit();
}

// Load storage
$storageFile = '../storage.json';
if (!file_exists($storageFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Audio not found'], JSON_PRETTY_PRINT);
    exit();
}

$storage = json_decode(file_get_contents($storageFile), true);
if (!isset($storage[$audioId])) {
    http_response_code(404);
    echo json_encode(['error' => 'Audio not found'], JSON_PRETTY_PRINT);
    exit();
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

// Response
$response = [
    'status' => 'success',
    'message' => 'Audio processing completed',
    'audio_id' => $audioId,
    'processing_time' => '2.5 seconds',
    'download_urls' => $processedFiles,
    'ml_recommendations' => $mlRecommendations
];

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);

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
    $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname(dirname($_SERVER['REQUEST_URI']));
    
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
?>
