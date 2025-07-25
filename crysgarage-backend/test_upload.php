<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use GuzzleHttp\Client;

echo "Testing upload endpoint...\n";

// Create a test audio file
$testFile = 'test_audio.wav';
$audioData = str_repeat('test', 1000); // Simple test data
file_put_contents($testFile, $audioData);

// Get token
$user = \App\Models\User::where('email', 'test@example.com')->first();
$token = $user->api_token;

echo "Using token: $token\n";

// Test upload with Guzzle
$client = new Client();

try {
    $response = $client->post('http://127.0.0.1:8000/api/upload', [
        'headers' => [
            'Authorization' => "Bearer $token",
            'Accept' => 'application/json',
        ],
        'multipart' => [
            [
                'name' => 'audio',
                'contents' => fopen($testFile, 'r'),
                'filename' => 'test_audio.wav'
            ],
            [
                'name' => 'genre',
                'contents' => 'afrobeats'
            ]
        ]
    ]);
    
    echo "Upload successful!\n";
    echo "Response: " . $response->getBody() . "\n";
    
} catch (\Exception $e) {
    echo "Upload failed: " . $e->getMessage() . "\n";
    if ($e->hasResponse()) {
        echo "Response: " . $e->getResponse()->getBody() . "\n";
    }
}

// Clean up
unlink($testFile); 