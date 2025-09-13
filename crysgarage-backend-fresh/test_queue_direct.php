<?php
/**
 * Direct test of queue system functionality
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

// Simple test functions
function sendResponse($data) {
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'status' => 'error',
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($request_uri, PHP_URL_PATH);
$segments = array_filter(explode('/', $path));

// Route handling
if (empty($segments)) {
    // Root path
    sendResponse([
        'status' => 'success',
        'service' => 'Crys Garage Queue System Test',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            'GET /api/health' => 'Health check',
            'POST /api/upload-audio' => 'Upload Audio',
            'POST /api/process-audio' => 'Process Audio',
            'GET /api/job-status' => 'Check Job Status'
        ]
    ]);
} elseif ($segments[0] === 'api') {
    if (count($segments) >= 2) {
        $endpoint = implode('/', array_slice($segments, 1));
        
        switch ($endpoint) {
            case 'health':
                if ($method === 'GET') {
                    sendResponse([
                        'status' => 'success',
                        'service' => 'Crys Garage Queue System',
                        'version' => '1.0.0',
                        'timestamp' => date('Y-m-d H:i:s'),
                        'queue_system' => 'operational',
                        'ffmpeg' => 'available'
                    ]);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'upload-audio':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $audioId = 'audio_' . uniqid();
                    
                    // Create storage file if it doesn't exist
                    $storageFile = 'storage.json';
                    $storage = file_exists($storageFile) ? json_decode(file_get_contents($storageFile), true) : [];
                    
                    $storage[$audioId] = [
                        'audio_id' => $audioId,
                        'filename' => $input['filename'] ?? 'test.wav',
                        'tier' => $input['tier'] ?? 'free',
                        'genre' => $input['genre'] ?? 'hip_hop',
                        'status' => 'uploaded',
                        'uploaded_at' => date('Y-m-d H:i:s'),
                        'file_path' => 'download/test_audio.wav'
                    ];
                    
                    file_put_contents($storageFile, json_encode($storage, JSON_PRETTY_PRINT));
                    
                    sendResponse([
                        'status' => 'success',
                        'message' => 'Audio uploaded successfully',
                        'audio_id' => $audioId,
                        'tier' => $input['tier'] ?? 'free',
                        'genre' => $input['genre'] ?? 'hip_hop'
                    ]);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'process-audio':
                if ($method === 'POST') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $audioId = $input['audio_id'] ?? null;
                    
                    if (!$audioId) {
                        sendError('Audio ID is required', 400);
                    }
                    
                    // Create job
                    $jobId = 'job_' . uniqid();
                    $jobsFile = 'queue_jobs.json';
                    $jobs = file_exists($jobsFile) ? json_decode(file_get_contents($jobsFile), true) : [];
                    
                    $jobs[$jobId] = [
                        'id' => $jobId,
                        'audio_id' => $audioId,
                        'status' => 'pending',
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ];
                    
                    file_put_contents($jobsFile, json_encode($jobs, JSON_PRETTY_PRINT));
                    
                    sendResponse([
                        'status' => 'success',
                        'message' => 'Audio processing job dispatched',
                        'audio_id' => $audioId,
                        'job_id' => $jobId,
                        'estimated_processing_time' => '30-60 seconds'
                    ]);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            case 'job-status':
                if ($method === 'GET') {
                    $audioId = $_GET['audio_id'] ?? null;
                    $jobId = $_GET['job_id'] ?? null;
                    
                    if (!$audioId && !$jobId) {
                        sendError('Audio ID or Job ID is required', 400);
                    }
                    
                    // Check storage
                    $storageFile = 'storage.json';
                    if (file_exists($storageFile)) {
                        $storage = json_decode(file_get_contents($storageFile), true);
                        if ($audioId && isset($storage[$audioId])) {
                            $audio = $storage[$audioId];
                            sendResponse([
                                'status' => 'success',
                                'audio_id' => $audioId,
                                'audio_status' => $audio['status'],
                                'processing_started_at' => $audio['processing_started_at'] ?? null,
                                'processing_completed_at' => $audio['processing_completed_at'] ?? null,
                                'job_id' => $audio['job_id'] ?? null
                            ]);
                        }
                    }
                    
                    // Check jobs
                    $jobsFile = 'queue_jobs.json';
                    if (file_exists($jobsFile)) {
                        $jobs = json_decode(file_get_contents($jobsFile), true);
                        if ($jobId && isset($jobs[$jobId])) {
                            $job = $jobs[$jobId];
                            sendResponse([
                                'status' => 'success',
                                'job_id' => $jobId,
                                'job_status' => $job['status'],
                                'audio_id' => $job['audio_id'],
                                'created_at' => $job['created_at'],
                                'updated_at' => $job['updated_at']
                            ]);
                        }
                    }
                    
                    sendError('Audio or job not found', 404);
                } else {
                    sendError('Method not allowed', 405);
                }
                break;
                
            default:
                sendError('API endpoint not found', 404);
                break;
        }
    } else {
        sendError('API endpoint not found', 404);
    }
} else {
    sendError('Invalid path', 404);
}
?>
