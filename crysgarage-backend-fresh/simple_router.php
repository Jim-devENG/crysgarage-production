<?php
// Simple test router
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
    echo json_encode([
        'status' => 'success',
        'service' => 'Simple Test Router',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} elseif ($path === '/api/health') {
    echo json_encode([
        'status' => 'healthy',
        'service' => 'Simple Test Router',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Not Found',
        'path' => $path
    ]);
}
?>
