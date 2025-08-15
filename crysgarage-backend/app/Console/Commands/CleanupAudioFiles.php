<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Audio;
use Carbon\Carbon;

class CleanupAudioFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audio:cleanup {--force : Force cleanup without confirmation} {--older-than=10 : Delete files older than X minutes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up audio files from storage and database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        $olderThan = (int) $this->option('older-than');
        
        $this->info("Starting audio file cleanup...");
        $this->info("Files older than {$olderThan} minutes will be deleted.");
        
        if (!$force) {
            if (!$this->confirm('This will permanently delete audio files. Are you sure?')) {
                $this->info('Cleanup cancelled.');
                return 0;
            }
        }

        // Clean up completed files older than specified time
        $cutoffTime = Carbon::now()->subMinutes($olderThan);
        
        $completedAudios = Audio::where('status', 'done')
            ->where('processing_completed_at', '<', $cutoffTime)
            ->get();

        $this->info("Found " . $completedAudios->count() . " completed audio files to clean up.");

        $deletedCount = 0;
        $errorCount = 0;

        foreach ($completedAudios as $audio) {
            try {
                // Delete the original file
                $originalPath = "uploads/{$audio->id}.wav";
                if (Storage::disk('local')->exists($originalPath)) {
                    Storage::disk('local')->delete($originalPath);
                    $this->line("Deleted original file: {$originalPath}");
                }

                // Delete processed files if they exist
                if ($audio->output_files) {
                    $outputFiles = json_decode($audio->output_files, true);
                    if (is_array($outputFiles)) {
                        foreach ($outputFiles as $format => $path) {
                            if (Storage::disk('local')->exists($path)) {
                                Storage::disk('local')->delete($path);
                                $this->line("Deleted processed file: {$path}");
                            }
                        }
                    }
                }

                // Delete processing status file
                $processingPath = "processing/{$audio->id}.json";
                if (Storage::disk('local')->exists($processingPath)) {
                    Storage::disk('local')->delete($processingPath);
                    $this->line("Deleted processing file: {$processingPath}");
                }

                // Delete database record
                $audio->delete();
                $deletedCount++;

            } catch (\Exception $e) {
                $this->error("Error cleaning up audio {$audio->id}: " . $e->getMessage());
                $errorCount++;
            }
        }

        // Clean up orphaned files in uploads directory
        $this->cleanupOrphanedFiles();

        $this->info("Cleanup completed!");
        $this->info("Successfully deleted: {$deletedCount} audio records");
        if ($errorCount > 0) {
            $this->warn("Errors encountered: {$errorCount}");
        }

        return 0;
    }

    /**
     * Clean up orphaned files that don't have database records
     */
    private function cleanupOrphanedFiles()
    {
        $this->info("Checking for orphaned files...");

        // Get all files in uploads directory
        $uploadFiles = Storage::disk('local')->files('uploads');
        $processingFiles = Storage::disk('local')->files('processing');

        $orphanedCount = 0;

        // Check upload files
        foreach ($uploadFiles as $file) {
            $audioId = pathinfo($file, PATHINFO_FILENAME);
            
            // Check if database record exists
            $audio = Audio::find($audioId);
            if (!$audio) {
                Storage::disk('local')->delete($file);
                $this->line("Deleted orphaned upload file: {$file}");
                $orphanedCount++;
            }
        }

        // Check processing files
        foreach ($processingFiles as $file) {
            $audioId = pathinfo($file, PATHINFO_FILENAME);
            
            // Check if database record exists
            $audio = Audio::find($audioId);
            if (!$audio) {
                Storage::disk('local')->delete($file);
                $this->line("Deleted orphaned processing file: {$file}");
                $orphanedCount++;
            }
        }

        if ($orphanedCount > 0) {
            $this->info("Deleted {$orphanedCount} orphaned files.");
        } else {
            $this->info("No orphaned files found.");
        }
    }
}
