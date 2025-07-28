<?php

require_once 'vendor/autoload.php';

use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing authentication...\n";

// Test 1: Check if user exists
$user = User::where('email', 'test@example.com')->first();
if ($user) {
    echo "User found: {$user->name}\n";
    echo "API Token: " . ($user->api_token ?: 'NULL') . "\n";
    
    // Test 2: Check if token is valid
    if ($user->api_token) {
        $testUser = User::where('api_token', $user->api_token)->first();
        echo "Token lookup result: " . ($testUser ? 'SUCCESS' : 'FAILED') . "\n";
    }
} else {
    echo "User not found\n";
}

// Test 3: Create a new user with token
echo "\nCreating test user...\n";
$newUser = User::create([
    'name' => 'Test User 2',
    'email' => 'test2@example.com',
    'password' => bcrypt('password123'),
    'tier' => 'free',
    'credits' => 5,
    'api_token' => 'test_token_123'
]);

echo "New user created with token: {$newUser->api_token}\n";

// Test 4: Verify token lookup
$foundUser = User::where('api_token', 'test_token_123')->first();
echo "Token lookup for new user: " . ($foundUser ? 'SUCCESS' : 'FAILED') . "\n"; 