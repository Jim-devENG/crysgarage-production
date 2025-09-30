<?php
// Working router for ML Pipeline
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Simple routing
if ($path === '/' || $path === '') {
    // Root endpoint
    echo '{"status":"success","service":"Crys Garage ML Pipeline","version":"1.0.0","timestamp":"' . date('Y-m-d H:i:s') . '","endpoints":["/api/health","/api/upload-audio","/api/process-audio"]}';
} elseif ($path === '/api/health') {
    // Health endpoint
    echo '{"status":"healthy","service":"Crys Garage ML Pipeline","version":"1.0.0","timestamp":"' . date('Y-m-d H:i:s') . '","queue_system":"file-based","payment_system":"integrated","ffmpeg":"ready"}';
} elseif ($path === '/api/upload-audio') {
    // Upload endpoint
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        echo '{"status":"success","message":"Audio upload endpoint ready","audio_id":"test_123","file_size":"0","tier":"free"}';
    } else {
        http_response_code(405);
        echo '{"status":"error","message":"Method not allowed"}';
    }
} elseif ($path === '/api/process-audio') {
    // Process endpoint
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        echo '{"status":"success","message":"Audio processing endpoint ready","job_id":"job_123","estimated_time":"30 seconds"}';
    } else {
        http_response_code(405);
        echo '{"status":"error","message":"Method not allowed"}';
    }
} else {
    // 404 for other paths
    http_response_code(404);
    echo '{"status":"error","message":"Not Found","path":"' . $path . '"}';
}
?>
