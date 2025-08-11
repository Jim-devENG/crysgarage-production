<?php
// Test Ruby Service Integration
echo "Testing Ruby Mastering Service Integration\n";
echo "==========================================\n\n";

// Test 1: Health Check
echo "1. Testing Health Check...\n";
$healthUrl = 'http://localhost:4567/health';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $healthUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ Health check passed: $response\n";
} else {
    echo "❌ Health check failed: HTTP $httpCode\n";
}

// Test 2: Process Audio (with dummy file)
echo "\n2. Testing Process Audio...\n";
$processUrl = 'http://localhost:4567/process';
$data = [
    'input_file' => 'test_audio.wav',
    'genre' => 'afrobeats',
    'tier' => 'professional',
    'config' => [
        'target_lufs' => -14.0,
        'true_peak' => -1.0,
        'sample_rate' => 44100,
        'bit_depth' => 24
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $processUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);
    if (isset($result['error'])) {
        echo "✅ Process endpoint working (expected error for missing file): " . $result['error'] . "\n";
    } else {
        echo "✅ Process endpoint working: " . $response . "\n";
    }
} else {
    echo "❌ Process endpoint failed: HTTP $httpCode\n";
}

echo "\n3. Testing Laravel Backend...\n";
$laravelUrl = 'http://localhost:8000/api/upload';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $laravelUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 422 || $httpCode === 401) {
    echo "✅ Laravel backend is running (expected auth/validation error)\n";
} else {
    echo "❌ Laravel backend test failed: HTTP $httpCode\n";
}

echo "\n4. Testing Frontend...\n";
$frontendUrl = 'http://localhost:3000';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $frontendUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "✅ Frontend is running\n";
} else {
    echo "❌ Frontend test failed: HTTP $httpCode\n";
}

echo "\n==========================================\n";
echo "Integration Test Complete!\n";
echo "\nTo test the complete flow:\n";
echo "1. Open http://localhost:3000\n";
echo "2. Upload an audio file\n";
echo "3. Watch the processing status\n";
echo "4. Download the mastered file\n";
?> 