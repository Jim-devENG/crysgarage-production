<?php
/**
 * Simple ML Pipeline for Crys Garage
 * Standalone PHP script that works without Laravel dependencies
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

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($request_uri, PHP_URL_PATH);

// Route handling
switch ($path) {
    case '/api/health':
        handleHealthCheck();
        break;
        
    case '/api/ml-test/upload':
        if ($method === 'POST') {
            handleMLTestUpload();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/upload-audio':
        if ($method === 'POST') {
            handleAudioUpload();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/process-audio':
        if ($method === 'POST') {
            handleAudioProcessing();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    default:
        sendError('Endpoint not found', 404);
        break;
}

function handleHealthCheck() {
    sendResponse([
        'status' => 'healthy',
        'service' => 'Crys Garage ML Pipeline',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            '/api/health' => 'Health check',
            '/api/ml-test/upload' => 'ML Pipeline Test',
            '/api/upload-audio' => 'Upload Audio',
            '/api/process-audio' => 'Process Audio'
        ]
    ]);
}

function handleMLTestUpload() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    sendResponse([
        'status' => 'success',
        'message' => 'ML Pipeline Upload Endpoint Working',
        'timestamp' => date('Y-m-d H:i:s'),
        'received_data' => $input,
        'method' => $_SERVER['REQUEST_METHOD'],
        'url' => $_SERVER['REQUEST_URI']
    ]);
}

function handleAudioUpload() {
    // Simulate audio upload
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Generate a mock audio ID
    $audioId = 'audio_' . uniqid();
    
    // Simulate file storage
    $uploadData = [
        'audio_id' => $audioId,
        'filename' => $input['filename'] ?? 'test_audio.wav',
        'tier' => $input['tier'] ?? 'free',
        'genre' => $input['genre'] ?? 'hip_hop',
        'file_size' => $input['file_size'] ?? 1024000,
        'file_path' => __DIR__ . '/download/mastered_audio.wav', // Use existing sample file for processing
        'status' => 'uploaded',
        'uploaded_at' => date('Y-m-d H:i:s')
    ];
    
    // Store in simple JSON file (simulating database)
    $storageFile = 'storage.json';
    $storage = file_exists($storageFile) ? json_decode(file_get_contents($storageFile), true) : [];
    $storage[$audioId] = $uploadData;
    file_put_contents($storageFile, json_encode($storage, JSON_PRETTY_PRINT));
    
    sendResponse([
        'status' => 'success',
        'message' => 'Audio uploaded successfully',
        'audio_id' => $audioId,
        'estimated_processing_time' => getEstimatedProcessingTime($input['tier'] ?? 'free')
    ]);
}

function handleAudioProcessing() {
    // Handle both JSON and form data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }
    
    $audioId = $input['audio_id'] ?? null;
    $userId = $input['user_id'] ?? 'test@crysgarage.com'; // Default for testing
    
    if (!$audioId) {
        sendError('Audio ID is required', 400);
        return;
    }
    
    // Load storage
    $storageFile = 'storage.json';
    if (!file_exists($storageFile)) {
        sendError('Audio not found', 404);
        return;
    }
    
    $storage = json_decode(file_get_contents($storageFile), true);
    if (!isset($storage[$audioId])) {
        sendError('Audio not found', 404);
        return;
    }
    
    $audio = $storage[$audioId];
    
    // Check if already processing or completed
    if ($audio['status'] === 'processing') {
        sendResponse([
            'status' => 'info',
            'message' => 'Audio is already being processed',
            'audio_id' => $audioId
        ]);
        return;
    }
    
    if ($audio['status'] === 'completed') {
        sendResponse([
            'status' => 'info',
            'message' => 'Audio processing already completed',
            'audio_id' => $audioId,
            'download_urls' => $audio['processed_files'] ?? []
        ]);
        return;
    }
    
    // Check payment/credit requirements
    $paymentCheck = checkPaymentRequirements($userId, $audio['tier']);
    if (!$paymentCheck['success']) {
        sendError($paymentCheck['message'], 402); // 402 Payment Required
        return;
    }
    
    // Deduct credits if required
    if ($paymentCheck['requires_payment']) {
        $creditDeduction = deductCreditsForProcessing($userId, $audio['tier']);
        if (!$creditDeduction['success']) {
            sendError($creditDeduction['message'], 402);
            return;
        }
    }
    
    // Dispatch job to queue
    $jobId = dispatchAudioProcessingJob($audioId);
    
    // Update audio status to processing
    $audio['status'] = 'processing';
    $audio['processing_started_at'] = date('Y-m-d H:i:s');
    $audio['job_id'] = $jobId;
    $audio['user_id'] = $userId;
    
    $storage[$audioId] = $audio;
    file_put_contents($storageFile, json_encode($storage, JSON_PRETTY_PRINT));
    
    sendResponse([
        'status' => 'success',
        'message' => 'Audio processing job dispatched',
        'audio_id' => $audioId,
        'job_id' => $jobId,
        'estimated_processing_time' => getEstimatedProcessingTime($audio['tier']),
        'payment_info' => $paymentCheck,
        'credits_remaining' => $creditDeduction['remaining_credits'] ?? null
    ]);
}

function dispatchAudioProcessingJob($audioId) {
    $jobId = 'job_' . uniqid();
    $jobsFile = 'queue_jobs.json';
    
    // Load existing jobs
    $jobs = file_exists($jobsFile) ? json_decode(file_get_contents($jobsFile), true) : [];
    
    // Add new job
    $jobs[$jobId] = [
        'id' => $jobId,
        'audio_id' => $audioId,
        'status' => 'pending',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Save jobs
    file_put_contents($jobsFile, json_encode($jobs, JSON_PRETTY_PRINT));
    
    return $jobId;
}

function handleJobStatus() {
    $audioId = $_GET['audio_id'] ?? null;
    $jobId = $_GET['job_id'] ?? null;
    
    if (!$audioId && !$jobId) {
        sendError('Audio ID or Job ID is required', 400);
        return;
    }
    
    // Load storage
    $storageFile = 'storage.json';
    if (!file_exists($storageFile)) {
        sendError('Audio not found', 404);
        return;
    }
    
    $storage = json_decode(file_get_contents($storageFile), true);
    
    if ($audioId && isset($storage[$audioId])) {
        $audio = $storage[$audioId];
        $response = [
            'status' => 'success',
            'audio_id' => $audioId,
            'audio_status' => $audio['status'],
            'processing_started_at' => $audio['processing_started_at'] ?? null,
            'processing_completed_at' => $audio['processing_completed_at'] ?? null,
            'job_id' => $audio['job_id'] ?? null
        ];
        
        if ($audio['status'] === 'completed') {
            $response['download_urls'] = $audio['processed_files'] ?? [];
            $response['ml_recommendations'] = $audio['ml_recommendations'] ?? null;
        } elseif ($audio['status'] === 'failed') {
            $response['error_message'] = $audio['error_message'] ?? 'Unknown error';
        }
        
        sendResponse($response);
        return;
    }
    
    // Check job status if job_id provided
    if ($jobId) {
        $jobsFile = 'queue_jobs.json';
        if (file_exists($jobsFile)) {
            $jobs = json_decode(file_get_contents($jobsFile), true);
            if (isset($jobs[$jobId])) {
                $job = $jobs[$jobId];
                sendResponse([
                    'status' => 'success',
                    'job_id' => $jobId,
                    'job_status' => $job['status'],
                    'audio_id' => $job['audio_id'],
                    'created_at' => $job['created_at'],
                    'updated_at' => $job['updated_at'],
                    'error' => $job['error'] ?? null
                ]);
                return;
            }
        }
    }
    
    sendError('Audio or job not found', 404);
}

function getEstimatedProcessingTime($tier) {
    $times = [
        'free' => '30-60 seconds',
        'pro' => '45-90 seconds', 
        'advanced' => '60-120 seconds'
    ];
    
    return $times[$tier] ?? '30-60 seconds';
}

function checkPaymentRequirements($userId, $tier) {
    // Load user data
    $usersFile = 'users.json';
    $users = file_exists($usersFile) ? json_decode(file_get_contents($usersFile), true) : [];
    $user = $users[$userId] ?? null;
    
    // Create default user if not exists
    if (!$user) {
        $user = [
            'id' => $userId,
            'name' => 'Test User',
            'email' => $userId,
            'tier' => 'free',
            'credits' => 5,
            'total_tracks' => 0,
            'total_spent' => 0.00
        ];
        $users[$userId] = $user;
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    }
    
    $userTier = $user['tier'] ?? 'free';
    $userCredits = $user['credits'] ?? 5;
    
    // Tier-based payment rules
    switch ($userTier) {
        case 'one_on_one':
            return [
                'success' => true,
                'requires_payment' => false,
                'reason' => 'One-on-one tier has unlimited processing'
            ];
            
        case 'free':
            return [
                'success' => true,
                'requires_payment' => false,
                'reason' => 'Free tier uses pay-per-download'
            ];
            
        case 'pro':
        case 'advanced':
            if ($userCredits > 0) {
                return [
                    'success' => true,
                    'requires_payment' => true,
                    'reason' => 'User has sufficient credits',
                    'credits_required' => 1,
                    'credits_available' => $userCredits
                ];
            } else {
                return [
                    'success' => false,
                    'requires_payment' => true,
                    'message' => 'Insufficient credits. Please purchase more credits to continue.',
                    'credits_required' => 1,
                    'credits_available' => $userCredits
                ];
            }
            
        default:
            return [
                'success' => false,
                'requires_payment' => true,
                'message' => 'Invalid user tier'
            ];
    }
}

function deductCreditsForProcessing($userId, $tier) {
    // Load user data
    $usersFile = 'users.json';
    $users = file_exists($usersFile) ? json_decode(file_get_contents($usersFile), true) : [];
    $user = $users[$userId] ?? null;
    
    if (!$user) {
        return [
            'success' => false,
            'message' => 'User not found'
        ];
    }
    
    $userTier = $user['tier'] ?? 'free';
    $userCredits = $user['credits'] ?? 5;
    
    // Free and one-on-one tiers don't use credits
    if ($userTier === 'free' || $userTier === 'one_on_one') {
        return [
            'success' => true,
            'credits_deducted' => 0,
            'remaining_credits' => $userCredits,
            'reason' => 'Tier does not use credits'
        ];
    }
    
    // Check if user has sufficient credits
    $creditsRequired = 1; // 1 credit per processing
    if ($userCredits >= $creditsRequired) {
        $user['credits'] = $userCredits - $creditsRequired;
        $user['total_tracks'] = ($user['total_tracks'] ?? 0) + 1;
        
        $users[$userId] = $user;
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
        
        // Log credit transaction
        logCreditTransaction($userId, -$creditsRequired, 'audio_processing', 'Audio processing credit deduction');
        
        return [
            'success' => true,
            'credits_deducted' => $creditsRequired,
            'remaining_credits' => $user['credits'],
            'total_tracks' => $user['total_tracks']
        ];
    } else {
        return [
            'success' => false,
            'message' => 'Insufficient credits',
            'credits_required' => $creditsRequired,
            'credits_available' => $userCredits
        ];
    }
}

function logCreditTransaction($userId, $amount, $type, $description) {
    $creditsFile = 'credits.json';
    $credits = file_exists($creditsFile) ? json_decode(file_get_contents($creditsFile), true) : [];
    
    $transaction = [
        'id' => uniqid(),
        'user_id' => $userId,
        'type' => $type,
        'amount' => $amount,
        'description' => $description,
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $credits[] = $transaction;
    file_put_contents($creditsFile, json_encode($credits, JSON_PRETTY_PRINT));
}

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

function generateProcessedFiles($tier, $audioId, $originalFilePath, $mlRecommendations) {
    $baseUrl = 'http://' . $_SERVER['HTTP_HOST'];
    
    $formats = [
        'free' => ['wav', 'mp3'],
        'pro' => ['wav', 'mp3', 'flac'],
        'advanced' => ['wav', 'mp3', 'flac', 'aiff']
    ];
    
    $availableFormats = $formats[$tier] ?? $formats['free'];
    $processedFiles = [];
    
    // Create output directory for this audio
    $outputDir = __DIR__ . '/download/' . $audioId;
    if (!file_exists($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    
    // Process each format with FFmpeg
    foreach ($availableFormats as $format) {
        $outputPath = $outputDir . '/mastered.' . $format;
        $downloadUrl = "{$baseUrl}/download/{$audioId}/mastered.{$format}";
        
        // Try to process with FFmpeg
        if (processAudioWithFFmpeg($originalFilePath, $outputPath, $format, $tier, $mlRecommendations)) {
            $processedFiles[$format] = $downloadUrl;
        } else {
            // Fallback: copy existing sample file
            $sampleFile = __DIR__ . '/download/mastered_audio.' . $format;
            if (file_exists($sampleFile)) {
                copy($sampleFile, $outputPath);
                $processedFiles[$format] = $downloadUrl;
            }
        }
    }
    
    return $processedFiles;
}

function processAudioWithFFmpeg($inputPath, $outputPath, $format, $tier, $mlRecommendations) {
    // Check if FFmpeg is available
    $ffmpegPath = getFFmpegPath();
    if (!$ffmpegPath) {
        return false; // FFmpeg not available
    }
    
    // Build FFmpeg command
    $cmd = buildFFmpegCommand($ffmpegPath, $inputPath, $outputPath, $format, $tier, $mlRecommendations);
    
    // Execute FFmpeg command
    $output = [];
    $returnCode = 0;
    exec($cmd . ' 2>&1', $output, $returnCode);
    
    // Check if processing was successful
    if ($returnCode === 0 && file_exists($outputPath)) {
        return true;
    } else {
        error_log("FFmpeg failed for {$format}: " . implode("\n", $output));
        return false;
    }
}

function getFFmpegPath() {
    // Try different possible FFmpeg locations
    $possiblePaths = [
        'ffmpeg',                    // In PATH
        'C:\\ffmpeg\\bin\\ffmpeg.exe', // Windows common location
        '/usr/bin/ffmpeg',           // Linux common location
        '/usr/local/bin/ffmpeg',     // macOS common location
    ];
    
    foreach ($possiblePaths as $path) {
        if (is_executable($path) || (PHP_OS_FAMILY === 'Windows' && file_exists($path))) {
            return $path;
        }
    }
    
    return null;
}

function buildFFmpegCommand($ffmpegPath, $inputPath, $outputPath, $format, $tier, $mlRecommendations) {
    $cmd = "\"{$ffmpegPath}\" -i \"{$inputPath}\"";
    
    // Add audio filters based on ML recommendations
    $filters = [];
    
    // EQ filter
    if (isset($mlRecommendations['eq'])) {
        $eq = $mlRecommendations['eq'];
        $filters[] = "equalizer=f=100:width_type=h:width=100:g=" . ($eq['low'] - 1);
        $filters[] = "equalizer=f=1000:width_type=h:width=1000:g=" . ($eq['mid'] - 1);
        $filters[] = "equalizer=f=10000:width_type=h:width=10000:g=" . ($eq['high'] - 1);
    }
    
    // Compression filter
    if (isset($mlRecommendations['compression'])) {
        $comp = $mlRecommendations['compression'];
        $filters[] = "acompressor=threshold={$comp['threshold']}dB:ratio={$comp['ratio']}:attack=5:release=50";
    }
    
    // Loudness normalization (LUFS)
    $targetLufs = getTargetLufs($tier);
    if ($targetLufs) {
        $filters[] = "loudnorm=I={$targetLufs}:TP=-1.5:LRA=11";
    }
    
    // Add filters to command
    if (!empty($filters)) {
        $cmd .= " -af \"" . implode(',', $filters) . "\"";
    }
    
    // Add format-specific options
    switch ($format) {
        case 'wav':
            $sampleRate = getSampleRate($tier);
            $bitDepth = getBitDepth($tier);
            $cmd .= " -ar {$sampleRate} -sample_fmt s{$bitDepth}";
            break;
        case 'mp3':
            $cmd .= " -ar 44100 -b:a 320k";
            break;
        case 'flac':
            $sampleRate = getSampleRate($tier);
            $bitDepth = getBitDepth($tier);
            $cmd .= " -ar {$sampleRate} -sample_fmt s{$bitDepth}";
            break;
        case 'aiff':
            $sampleRate = getSampleRate($tier);
            $bitDepth = getBitDepth($tier);
            $cmd .= " -ar {$sampleRate} -sample_fmt s{$bitDepth}";
            break;
    }
    
    $cmd .= " -y \"{$outputPath}\"";
    
    return $cmd;
}

function getTargetLufs($tier) {
    $lufsTargets = [
        'free' => -14,      // Streaming standard
        'pro' => -10,       // Louder for pro
        'advanced' => -7    // Commercial loudness
    ];
    
    return $lufsTargets[$tier] ?? -14;
}

function getSampleRate($tier) {
    $sampleRates = [
        'free' => 44100,
        'pro' => 48000,
        'advanced' => 96000
    ];
    
    return $sampleRates[$tier] ?? 44100;
}

function getBitDepth($tier) {
    $bitDepths = [
        'free' => 16,
        'pro' => 24,
        'advanced' => 32
    ];
    
    return $bitDepths[$tier] ?? 16;
}

function getEstimatedProcessingTime($tier) {
    $times = [
        'free' => '2-5 minutes',
        'pro' => '1-3 minutes',
        'advanced' => '30 seconds - 2 minutes'
    ];
    
    return $times[$tier] ?? '2-5 minutes';
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $statusCode = 400) {
    sendResponse([
        'status' => 'error',
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], $statusCode);
}
?>
