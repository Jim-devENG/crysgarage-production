<?php
// Minimal router without complex dependencies
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

// Simple routing without complex array operations
if ($path === '/' || $path === '') {
    // Root endpoint
    echo '{"status":"success","service":"Crys Garage ML Pipeline","version":"1.0.0","timestamp":"' . date('Y-m-d H:i:s') . '"}';
} elseif ($path === '/api/health') {
    // Health endpoint
    echo '{"status":"healthy","service":"Crys Garage ML Pipeline","version":"1.0.0","timestamp":"' . date('Y-m-d H:i:s') . '","queue_system":"file-based","payment_system":"integrated"}';
} else {
    // 404 for other paths
    http_response_code(404);
    echo '{"status":"error","message":"Not Found","path":"' . $path . '"}';
}
?>
