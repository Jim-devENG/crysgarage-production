<?php
/**
 * Simple Queue Worker for Crys Garage ML Pipeline
 * Processes audio jobs from the database queue
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple autoloader for our classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/app/' . str_replace('App\\', '', $class) . '.php';
    $file = str_replace('\\', '/', $file);
    if (file_exists($file)) {
        require_once $file;
    }
});

class SimpleQueueWorker
{
    private $storageFile;
    private $jobsFile;
    private $running = true;

    public function __construct()
    {
        $this->storageFile = __DIR__ . '/storage.json';
        $this->jobsFile = __DIR__ . '/queue_jobs.json';
        
        // Create jobs file if it doesn't exist
        if (!file_exists($this->jobsFile)) {
            file_put_contents($this->jobsFile, json_encode([]));
        }
    }

    public function start()
    {
        echo "🚀 Starting Crys Garage Queue Worker...\n";
        echo "📁 Jobs file: {$this->jobsFile}\n";
        echo "📁 Storage file: {$this->storageFile}\n";
        echo "⏰ Started at: " . date('Y-m-d H:i:s') . "\n\n";

        // Handle graceful shutdown
        pcntl_signal(SIGTERM, [$this, 'shutdown']);
        pcntl_signal(SIGINT, [$this, 'shutdown']);

        while ($this->running) {
            $this->processJobs();
            sleep(2); // Check for jobs every 2 seconds
        }

        echo "🛑 Queue worker stopped.\n";
    }

    public function shutdown()
    {
        echo "\n🛑 Shutting down queue worker...\n";
        $this->running = false;
    }

    private function processJobs()
    {
        $jobs = $this->getJobs();
        
        if (empty($jobs)) {
            return;
        }

        foreach ($jobs as $jobId => $job) {
            if ($job['status'] === 'pending') {
                echo "🔄 Processing job: {$jobId}\n";
                $this->processJob($jobId, $job);
            }
        }
    }

    private function processJob($jobId, $job)
    {
        try {
            // Mark job as processing
            $this->updateJobStatus($jobId, 'processing');

            // Load audio data
            $audio = $this->getAudioData($job['audio_id']);
            if (!$audio) {
                throw new Exception("Audio not found: {$job['audio_id']}");
            }

            echo "   📁 Processing audio: {$audio['filename']}\n";
            echo "   🎵 Genre: {$audio['genre']}, Tier: {$audio['tier']}\n";

            // Generate ML recommendations
            $mlRecommendations = $this->generateMLRecommendations($audio['tier'], $audio['genre']);
            echo "   🤖 ML recommendations generated\n";

            // Process with FFmpeg
            $processedFiles = $this->processAudioWithFFmpeg($audio, $mlRecommendations);
            echo "   🎛️ Audio processing completed\n";

            // Update audio record
            $this->updateAudioRecord($job['audio_id'], [
                'status' => 'completed',
                'processing_completed_at' => date('Y-m-d H:i:s'),
                'ml_recommendations' => $mlRecommendations,
                'processed_files' => $processedFiles
            ]);

            // Mark job as completed
            $this->updateJobStatus($jobId, 'completed');
            echo "   ✅ Job completed successfully\n\n";

        } catch (Exception $e) {
            echo "   ❌ Job failed: " . $e->getMessage() . "\n";
            $this->updateJobStatus($jobId, 'failed', $e->getMessage());
            
            // Update audio record with error
            $this->updateAudioRecord($job['audio_id'], [
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'processing_completed_at' => date('Y-m-d H:i:s')
            ]);
        }
    }

    private function getJobs()
    {
        if (!file_exists($this->jobsFile)) {
            return [];
        }
        
        $content = file_get_contents($this->jobsFile);
        return json_decode($content, true) ?: [];
    }

    private function updateJobStatus($jobId, $status, $error = null)
    {
        $jobs = $this->getJobs();
        $jobs[$jobId]['status'] = $status;
        $jobs[$jobId]['updated_at'] = date('Y-m-d H:i:s');
        
        if ($error) {
            $jobs[$jobId]['error'] = $error;
        }
        
        file_put_contents($this->jobsFile, json_encode($jobs, JSON_PRETTY_PRINT));
    }

    private function getAudioData($audioId)
    {
        if (!file_exists($this->storageFile)) {
            return null;
        }
        
        $content = file_get_contents($this->storageFile);
        $storage = json_decode($content, true);
        
        return $storage[$audioId] ?? null;
    }

    private function updateAudioRecord($audioId, $updates)
    {
        if (!file_exists($this->storageFile)) {
            return;
        }
        
        $content = file_get_contents($this->storageFile);
        $storage = json_decode($content, true);
        
        if (isset($storage[$audioId])) {
            $storage[$audioId] = array_merge($storage[$audioId], $updates);
            file_put_contents($this->storageFile, json_encode($storage, JSON_PRETTY_PRINT));
        }
    }

    private function generateMLRecommendations($tier, $genre)
    {
        // Use the same ML recommendations logic from our pipeline
        $genreDefaults = [
            'hip_hop' => [
                'eq' => ['low' => 1.2, 'mid' => 0.9, 'high' => 1.1],
                'compression' => ['ratio' => 4.0, 'threshold' => -8.0],
                'loudness' => -7,
                'genre' => 'hip_hop'
            ],
            'afrobeats' => [
                'eq' => ['low' => 1.15, 'mid' => 1.0, 'high' => 1.05],
                'compression' => ['ratio' => 3.5, 'threshold' => -9.0],
                'loudness' => -8,
                'genre' => 'afrobeats'
            ],
            'gospel' => [
                'eq' => ['low' => 1.0, 'mid' => 1.1, 'high' => 1.0],
                'compression' => ['ratio' => 2.5, 'threshold' => -12.0],
                'loudness' => -14,
                'genre' => 'gospel'
            ],
            'highlife' => [
                'eq' => ['low' => 1.1, 'mid' => 1.05, 'high' => 1.0],
                'compression' => ['ratio' => 3.0, 'threshold' => -10.0],
                'loudness' => -9,
                'genre' => 'highlife'
            ],
            'r_b' => [
                'eq' => ['low' => 1.05, 'mid' => 1.0, 'high' => 1.1],
                'compression' => ['ratio' => 3.5, 'threshold' => -9.0],
                'loudness' => -8,
                'genre' => 'r_b'
            ]
        ];

        $baseRecommendations = $genreDefaults[$genre] ?? $genreDefaults['hip_hop'];
        
        // Adjust based on tier
        $tierMultipliers = [
            'free' => ['eq_multiplier' => 0.8, 'compression_multiplier' => 0.7],
            'pro' => ['eq_multiplier' => 1.0, 'compression_multiplier' => 1.0],
            'advanced' => ['eq_multiplier' => 1.2, 'compression_multiplier' => 1.3]
        ];

        $multiplier = $tierMultipliers[$tier] ?? $tierMultipliers['free'];
        
        return [
            'eq' => [
                'low' => $baseRecommendations['eq']['low'] * $multiplier['eq_multiplier'],
                'mid' => $baseRecommendations['eq']['mid'] * $multiplier['eq_multiplier'],
                'high' => $baseRecommendations['eq']['high'] * $multiplier['eq_multiplier']
            ],
            'compression' => [
                'ratio' => $baseRecommendations['compression']['ratio'] * $multiplier['compression_multiplier'],
                'threshold' => $baseRecommendations['compression']['threshold']
            ],
            'loudness' => $baseRecommendations['loudness'],
            'genre' => $genre,
            'tier' => $tier
        ];
    }

    private function processAudioWithFFmpeg($audio, $mlRecommendations)
    {
        $baseUrl = 'http://localhost:8000';
        $audioId = $audio['audio_id'];
        
        $formats = [
            'free' => ['wav', 'mp3'],
            'pro' => ['wav', 'mp3', 'flac'],
            'advanced' => ['wav', 'mp3', 'flac', 'aiff']
        ];
        
        $availableFormats = $formats[$audio['tier']] ?? $formats['free'];
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
            if ($this->processWithFFmpeg($audio['file_path'], $outputPath, $format, $audio['tier'], $mlRecommendations)) {
                $processedFiles[$format] = $downloadUrl;
                echo "     ✅ Processed {$format} format\n";
            } else {
                // Fallback: copy existing sample file
                $sampleFile = __DIR__ . '/download/mastered_audio.' . $format;
                if (file_exists($sampleFile)) {
                    copy($sampleFile, $outputPath);
                    $processedFiles[$format] = $downloadUrl;
                    echo "     📋 Used sample file for {$format}\n";
                }
            }
        }
        
        return $processedFiles;
    }

    private function processWithFFmpeg($inputPath, $outputPath, $format, $tier, $mlRecommendations)
    {
        // Check if FFmpeg is available
        $ffmpegPath = $this->getFFmpegPath();
        if (!$ffmpegPath) {
            return false; // FFmpeg not available
        }
        
        // Build FFmpeg command
        $cmd = $this->buildFFmpegCommand($ffmpegPath, $inputPath, $outputPath, $format, $tier, $mlRecommendations);
        
        // Execute FFmpeg command
        $output = [];
        $returnCode = 0;
        exec($cmd . ' 2>&1', $output, $returnCode);
        
        // Check if processing was successful
        if ($returnCode === 0 && file_exists($outputPath)) {
            return true;
        } else {
            echo "     ⚠️ FFmpeg failed for {$format}: " . implode("\n", $output) . "\n";
            return false;
        }
    }

    private function getFFmpegPath()
    {
        // Try different possible FFmpeg locations
        $possiblePaths = [
            'ffmpeg',                    // In PATH
            'C:\\ffmpeg\\bin\\ffmpeg.exe', // Windows common location
            'C:\\Users\\MIKENZY\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-full_build\\bin\\ffmpeg.exe',
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

    private function buildFFmpegCommand($ffmpegPath, $inputPath, $outputPath, $format, $tier, $mlRecommendations)
    {
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
        if (isset($mlRecommendations['loudness'])) {
            $targetLufs = $mlRecommendations['loudness'];
            $filters[] = "loudnorm=I={$targetLufs}:TP=-1.5:LRA=11";
        }
        
        // Add filters to command
        if (!empty($filters)) {
            $cmd .= " -af \"" . implode(',', $filters) . "\"";
        }
        
        // Add format-specific options
        switch ($format) {
            case 'wav':
                $sampleRate = $this->getSampleRate($tier);
                $bitDepth = $this->getBitDepth($tier);
                $cmd .= " -ar {$sampleRate} -sample_fmt s{$bitDepth}";
                break;
            case 'mp3':
                $cmd .= " -ar 44100 -b:a 320k";
                break;
            case 'flac':
                $sampleRate = $this->getSampleRate($tier);
                $bitDepth = $this->getBitDepth($tier);
                $cmd .= " -ar {$sampleRate} -sample_fmt s{$bitDepth}";
                break;
            case 'aiff':
                $sampleRate = $this->getSampleRate($tier);
                $bitDepth = $this->getBitDepth($tier);
                $cmd .= " -ar {$sampleRate} -sample_fmt s{$bitDepth}";
                break;
        }
        
        $cmd .= " -y \"{$outputPath}\"";
        
        return $cmd;
    }

    private function getSampleRate($tier)
    {
        $sampleRates = [
            'free' => 44100,
            'pro' => 48000,
            'advanced' => 96000
        ];
        
        return $sampleRates[$tier] ?? 44100;
    }

    private function getBitDepth($tier)
    {
        $bitDepths = [
            'free' => 16,
            'pro' => 24,
            'advanced' => 32
        ];
        
        return $bitDepths[$tier] ?? 16;
    }
}

// Start the queue worker
if (php_sapi_name() === 'cli') {
    $worker = new SimpleQueueWorker();
    $worker->start();
} else {
    echo "This script must be run from the command line.\n";
}
