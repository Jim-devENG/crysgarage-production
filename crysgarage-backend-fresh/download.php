<?php
// Download handler for processed audio files
header('Content-Type: application/json');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the requested file from URL path
$requestUri = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim($requestUri, '/'));

// Expected formats: 
// /download/mastered_audio.wav (old format)
// /download/audioId/mastered.wav (new format)
if (count($pathParts) >= 2 && $pathParts[0] === 'download') {
    if (count($pathParts) === 3) {
        // New format: /download/audioId/mastered.wav
        $audioId = $pathParts[1];
        $filename = $pathParts[2];
        $filePath = __DIR__ . '/download/' . $audioId . '/' . $filename;
        
        // Validate audioId and filename (security check)
        if (preg_match('/^[a-zA-Z0-9_-]+$/', $audioId) && preg_match('/^mastered\.(wav|mp3|flac|aiff)$/', $filename)) {
            // Valid format
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid audio ID or filename format',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit();
        }
    } else {
        // Old format: /download/mastered_audio.wav
        $filename = $pathParts[1];
        $filePath = __DIR__ . '/download/' . $filename;
        
        // Validate filename (security check)
        if (preg_match('/^mastered_audio\.(wav|mp3|flac|aiff)$/', $filename)) {
            // Valid format
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid filename format',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit();
        }
    }
        
        if (file_exists($filePath)) {
            // Set appropriate headers for file download
            $mimeTypes = [
                'wav' => 'audio/wav',
                'mp3' => 'audio/mpeg',
                'flac' => 'audio/flac',
                'aiff' => 'audio/aiff'
            ];
            
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
            
            header('Content-Type: ' . $mimeType);
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: no-cache, must-revalidate');
            
            // Output the file
            readfile($filePath);
            exit();
        } else {
            // File not found, return JSON error
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'File not found: ' . $filename,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit();
        }
    } else {
        // Invalid filename
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid filename format',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
} else {
    // Invalid URL format
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid download URL format',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}
?>
