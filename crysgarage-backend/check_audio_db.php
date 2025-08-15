<?php

try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if audio table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='audio'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "Audio table does not exist in database.\n";
        exit;
    }
    
    // Count audio records
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM audio');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Audio records in database: " . $result['count'] . "\n";
    
    // Show sample records
    if ($result['count'] > 0) {
        echo "\nSample audio records:\n";
        $stmt = $pdo->query('SELECT id, user_id, file_name, genre, tier, status, created_at FROM audio LIMIT 5');
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "- ID: {$row['id']}, File: {$row['file_name']}, Genre: {$row['genre']}, Status: {$row['status']}, Created: {$row['created_at']}\n";
        }
    } else {
        echo "No audio records found in database.\n";
    }
    
    // Check users table
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
    $userResult = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\nUsers in database: " . $userResult['count'] . "\n";
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
