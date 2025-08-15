<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Storage;
use App\Models\Audio;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== AUDIO FILES CLEANUP SCRIPT ===\n";
echo "This will permanently delete ALL audio files from storage and database.\n";
echo "Are you sure you want to continue? (yes/no): ";

$handle = fopen("php://stdin", "r");
$line = fgets($handle);
fclose($handle);

if (trim($line) !== 'yes') {
    echo "Cleanup cancelled.\n";
    exit(0);
}

echo "\nStarting cleanup...\n";

try {
    // Get all audio records
    $audios = Audio::all();
    echo "Found " . $audios->count() . " audio records in database.\n";
    
    $deletedCount = 0;
    $errorCount = 0;
    
    foreach ($audios as $audio) {
        try {
            echo "Cleaning up audio ID: {$audio->id} ({$audio->file_name})\n";
            
            // Delete original file
            $originalPath = "uploads/{$audio->id}.wav";
            if (Storage::disk('local')->exists($originalPath)) {
                Storage::disk('local')->delete($originalPath);
                echo "  - Deleted original file: {$originalPath}\n";
            }
            
            // Delete processed files if they exist
            if ($audio->output_files) {
                $outputFiles = json_decode($audio->output_files, true);
                if (is_array($outputFiles)) {
                    foreach ($outputFiles as $format => $path) {
                        if (Storage::disk('local')->exists($path)) {
                            Storage::disk('local')->delete($path);
                            echo "  - Deleted processed file: {$path}\n";
                        }
                    }
                }
            }
            
            // Delete processing status file
            $processingPath = "processing/{$audio->id}.json";
            if (Storage::disk('local')->exists($processingPath)) {
                Storage::disk('local')->delete($processingPath);
                echo "  - Deleted processing file: {$processingPath}\n";
            }
            
            // Delete database record
            $audio->delete();
            $deletedCount++;
            echo "  - Deleted database record\n";
            
        } catch (Exception $e) {
            echo "  - ERROR: " . $e->getMessage() . "\n";
            $errorCount++;
        }
    }
    
    // Clean up orphaned files in uploads directory
    echo "\nChecking for orphaned files...\n";
    $uploadFiles = Storage::disk('local')->files('uploads');
    $processingFiles = Storage::disk('local')->files('processing');
    
    $orphanedCount = 0;
    
    foreach ($uploadFiles as $file) {
        $audioId = pathinfo($file, PATHINFO_FILENAME);
        $audio = Audio::find($audioId);
        
        if (!$audio) {
            Storage::disk('local')->delete($file);
            echo "Deleted orphaned upload file: {$file}\n";
            $orphanedCount++;
        }
    }
    
    foreach ($processingFiles as $file) {
        $audioId = pathinfo($file, PATHINFO_FILENAME);
        $audio = Audio::find($audioId);
        
        if (!$audio) {
            Storage::disk('local')->delete($file);
            echo "Deleted orphaned processing file: {$file}\n";
            $orphanedCount++;
        }
    }
    
    echo "\n=== CLEANUP COMPLETED ===\n";
    echo "Successfully deleted: {$deletedCount} audio records\n";
    echo "Orphaned files deleted: {$orphanedCount}\n";
    if ($errorCount > 0) {
        echo "Errors encountered: {$errorCount}\n";
    }
    
    // Show remaining files
    $remainingUploads = Storage::disk('local')->files('uploads');
    $remainingProcessing = Storage::disk('local')->files('processing');
    
    echo "\nRemaining files:\n";
    echo "Uploads: " . count($remainingUploads) . " files\n";
    echo "Processing: " . count($remainingProcessing) . " files\n";
    
    if (count($remainingUploads) > 0) {
        echo "Remaining upload files:\n";
        foreach ($remainingUploads as $file) {
            echo "  - {$file}\n";
        }
    }
    
    if (count($remainingProcessing) > 0) {
        echo "Remaining processing files:\n";
        foreach ($remainingProcessing as $file) {
            echo "  - {$file}\n";
        }
    }
    
} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
