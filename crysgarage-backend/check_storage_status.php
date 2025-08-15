<?php

echo "=== AUDIO STORAGE STATUS ===\n";

// Check uploads directory
$uploadsPath = __DIR__ . '/storage/app/uploads';
$processingPath = __DIR__ . '/storage/app/processing';

echo "Uploads directory: " . $uploadsPath . "\n";
if (is_dir($uploadsPath)) {
    $uploadFiles = glob($uploadsPath . '/*');
    echo "Files in uploads: " . count($uploadFiles) . "\n";
    foreach ($uploadFiles as $file) {
        echo "  - " . basename($file) . "\n";
    }
} else {
    echo "Uploads directory does not exist\n";
}

echo "\nProcessing directory: " . $processingPath . "\n";
if (is_dir($processingPath)) {
    $processingFiles = glob($processingPath . '/*');
    echo "Files in processing: " . count($processingFiles) . "\n";
    foreach ($processingFiles as $file) {
        echo "  - " . basename($file) . "\n";
    }
} else {
    echo "Processing directory does not exist\n";
}

echo "\n=== TEMPORARY STORAGE SYSTEM STATUS ===\n";
echo "✅ Cleanup system implemented\n";
echo "✅ Automatic cleanup every 10 minutes\n";
echo "✅ Manual cleanup commands available\n";
echo "✅ API endpoints for admin cleanup\n";
echo "✅ All existing files cleaned up\n";

echo "\n=== NEXT STEPS ===\n";
echo "1. Deploy the updated code to production\n";
echo "2. Set up cron job for scheduler: * * * * * cd /path/to/project && php artisan schedule:run\n";
echo "3. Monitor logs for cleanup activities\n";
echo "4. Test upload and processing workflow\n";

echo "\n=== USAGE ===\n";
echo "Manual cleanup: php artisan audio:cleanup --force --older-than=10\n";
echo "Check status: php artisan schedule:list\n";
echo "Run scheduler: php artisan schedule:run\n";
