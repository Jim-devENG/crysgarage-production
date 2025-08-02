<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple API response
$response = [
    'status' => 'success',
    'message' => 'Crys Garage Backend API',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        '/api/health' => 'Health check',
        '/api/auth' => 'Authentication',
        '/api/upload' => 'File upload',
        '/api/process' => 'Audio processing'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
