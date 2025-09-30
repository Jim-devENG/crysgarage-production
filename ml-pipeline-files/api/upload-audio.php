<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $filename = $input['filename'] ?? 'unknown_' . uniqid() . '.wav';
    $audioId = 'audio_' . uniqid() . '_' . time();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload POST working',
        'audio_id' => $audioId,
        'filename' => $filename,
        'method' => 'POST',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Upload GET working',
        'method' => 'GET',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
