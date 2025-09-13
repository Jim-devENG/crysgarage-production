<?php
/**
 * Health Check API Endpoint
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

// Health check response
$response = [
    'status' => 'healthy',
    'service' => 'Crys Garage ML Pipeline',
    'version' => '1.0.0',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        'GET /api/health' => 'Health check',
        'POST /api/ml-test/upload' => 'ML Pipeline Test',
        'POST /api/upload-audio' => 'Upload Audio',
        'POST /api/process-audio' => 'Process Audio'
    ]
];

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
?>
