<?php
// Debug router to see what's happening
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

echo json_encode([
    'status' => 'debug',
    'request_uri' => $request_uri,
    'method' => $method,
    'path' => $path,
    'segments' => $segments,
    'segments_count' => count($segments),
    'first_segment' => isset($segments[0]) ? $segments[0] : 'none',
    'is_api' => (count($segments) > 0 && $segments[0] === 'api'),
    'endpoint' => (count($segments) >= 2) ? implode('/', array_slice($segments, 1)) : 'none'
], JSON_PRETTY_PRINT);
?>
