<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Audio;
use App\Models\User;
use Exception;

class ProcessAudioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3;
    public $backoff = [30, 60, 120]; // Retry delays

    private $audioId;
    private $userId;
    private $tier;
    private $genre;
    private $originalFilePath;
    private $requestedFormats;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $audioId,
        int $userId,
        string $tier,
        string $genre = 'hip-hop',
        array $requestedFormats = ['wav']
    ) {
        $this->audioId = $audioId;
        $this->userId = $userId;
        $this->tier = $tier;
        $this->genre = $genre;
        $this->requestedFormats = $requestedFormats;
        
        // Set queue priority based on tier
        $this->onQueue($this->getQueueName());
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("🎵 Starting audio processing job", [
                'audio_id' => $this->audioId,
                'user_id' => $this->userId,
                'tier' => $this->tier,
                'genre' => $this->genre
            ]);

            // Update job status
            $this->updateJobStatus('processing');

            // Get user and audio record
            $user = User::find($this->userId);
            $audio = Audio::find($this->audioId);
            
            if (!$user || !$audio) {
                throw new Exception('User or audio record not found');
            }

            // Validate tier permissions
            $this->validateTierPermissions($user, $audio);

            // Get ML mastering parameters
            $mlParams = $this->getMLMasteringParameters($audio, $this->genre, $this->tier);

            // Process audio with FFmpeg
            $processedFiles = $this->processAudioWithFFmpeg($audio, $mlParams);

            // Store processed files
            $this->storeProcessedFiles($audio, $processedFiles);

            // Update job status to completed
            $this->updateJobStatus('completed', [
                'processed_files' => $processedFiles,
                'ml_parameters' => $mlParams
            ]);

            Log::info("✅ Audio processing completed successfully", [
                'audio_id' => $this->audioId,
                'processed_formats' => array_keys($processedFiles)
            ]);

        } catch (Exception $e) {
            Log::error("❌ Audio processing failed", [
                'audio_id' => $this->audioId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->updateJobStatus('failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Get queue name based on tier priority
     */
    private function getQueueName(): string
    {
        return match($this->tier) {
            'advanced' => 'high-priority',
            'pro' => 'medium-priority',
            'free' => 'low-priority',
            default => 'low-priority'
        };
    }

    /**
     * Validate tier permissions for file size, formats, etc.
     */
    private function validateTierPermissions(User $user, Audio $audio): void
    {
        $tierLimits = $this->getTierLimits($user->tier);
        
        // Check file size
        if ($audio->file_size > $tierLimits['max_file_size']) {
            throw new Exception("File size exceeds tier limit: {$tierLimits['max_file_size']}MB");
        }

        // Check requested formats
        $invalidFormats = array_diff($this->requestedFormats, $tierLimits['allowed_formats']);
        if (!empty($invalidFormats)) {
            throw new Exception("Formats not allowed for tier: " . implode(', ', $invalidFormats));
        }

        Log::info("✅ Tier permissions validated", [
            'tier' => $user->tier,
            'file_size' => $audio->file_size,
            'requested_formats' => $this->requestedFormats
        ]);
    }

    /**
     * Get tier-specific limits
     */
    private function getTierLimits(string $tier): array
    {
        return match($tier) {
            'free' => [
                'max_file_size' => 50, // MB
                'allowed_formats' => ['wav', 'mp3'],
                'max_sample_rate' => 48000,
                'processing_priority' => 'standard'
            ],
            'pro' => [
                'max_file_size' => 200, // MB
                'allowed_formats' => ['wav', 'mp3', 'flac'],
                'max_sample_rate' => 96000,
                'processing_priority' => 'faster'
            ],
            'advanced' => [
                'max_file_size' => 500, // MB
                'allowed_formats' => ['wav', 'mp3', 'flac', 'aiff'],
                'max_sample_rate' => 192000,
                'processing_priority' => 'highest'
            ],
            default => [
                'max_file_size' => 50,
                'allowed_formats' => ['wav', 'mp3'],
                'max_sample_rate' => 48000,
                'processing_priority' => 'standard'
            ]
        };
    }

    /**
     * Get ML mastering parameters from microservice
     */
    private function getMLMasteringParameters(Audio $audio, string $genre, string $tier): array
    {
        try {
            $mlServiceUrl = env('ML_SERVICE_URL', 'http://localhost:8001');
            
            // Prepare audio analysis request
            $requestData = [
                'audio_path' => Storage::path($audio->file_path),
                'genre' => $genre,
                'tier' => $tier,
                'file_size' => $audio->file_size,
                'duration' => $audio->duration ?? 0
            ];

            Log::info("🤖 Requesting ML parameters", $requestData);

            $response = Http::timeout(30)->post("{$mlServiceUrl}/analyze", $requestData);

            if ($response->successful()) {
                $mlParams = $response->json();
                Log::info("✅ ML parameters received", $mlParams);
                return $mlParams;
            } else {
                Log::warning("⚠️ ML service unavailable, using fallback presets");
                return $this->getFallbackPresets($genre, $tier);
            }

        } catch (Exception $e) {
            Log::warning("⚠️ ML service error, using fallback presets", [
                'error' => $e->getMessage()
            ]);
            return $this->getFallbackPresets($genre, $tier);
        }
    }

    /**
     * Fallback presets when ML service is unavailable
     */
    private function getFallbackPresets(string $genre, string $tier): array
    {
        $basePresets = [
            'hip-hop' => [
                'eq' => ['low' => 1.2, 'mid' => 1.0, 'high' => 0.9],
                'compression' => ['threshold' => -16, 'ratio' => 4, 'attack' => 0.001, 'release' => 0.1],
                'loudness' => ['target_lufs' => -7.8, 'true_peak' => -0.15]
            ],
            'afrobeats' => [
                'eq' => ['low' => 1.0, 'mid' => 1.0, 'high' => 1.2],
                'compression' => ['threshold' => -18, 'ratio' => 3, 'attack' => 0.002, 'release' => 0.15],
                'loudness' => ['target_lufs' => -7.0, 'true_peak' => -0.1]
            ],
            'gospel' => [
                'eq' => ['low' => 1.5, 'mid' => 2.0, 'high' => 1.0],
                'compression' => ['threshold' => -22, 'ratio' => 2.5, 'attack' => 0.01, 'release' => 0.15],
                'loudness' => ['target_lufs' => -8.5, 'true_peak' => -0.3]
            ]
        ];

        $preset = $basePresets[$genre] ?? $basePresets['hip-hop'];

        // Enhance based on tier
        if ($tier === 'advanced') {
            $preset['premium_effects'] = [
                'stereo_widener' => ['width' => 1.1],
                'harmonic_exciter' => ['amount' => 0.3],
                'multiband_compression' => [
                    'low' => ['threshold' => -20, 'ratio' => 4],
                    'mid' => ['threshold' => -20, 'ratio' => 4],
                    'high' => ['threshold' => -20, 'ratio' => 4]
                ]
            ];
        }

        return $preset;
    }

    /**
     * Process audio with FFmpeg using ML parameters
     */
    private function processAudioWithFFmpeg(Audio $audio, array $mlParams): array
    {
        $originalPath = Storage::path($audio->file_path);
        $outputDir = storage_path('app/public/masters/' . $this->audioId);
        
        // Create output directory
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $processedFiles = [];

        foreach ($this->requestedFormats as $format) {
            $outputPath = "{$outputDir}/mastered.{$format}";
            
            // Build FFmpeg command based on tier and ML parameters
            $ffmpegCmd = $this->buildFFmpegCommand(
                $originalPath, 
                $outputPath, 
                $format, 
                $mlParams, 
                $this->tier
            );

            Log::info("🎛️ Executing FFmpeg command", [
                'command' => $ffmpegCmd,
                'format' => $format,
                'tier' => $this->tier
            ]);

            // Execute FFmpeg command
            $output = [];
            $returnCode = 0;
            exec($ffmpegCmd . ' 2>&1', $output, $returnCode);

            if ($returnCode === 0 && file_exists($outputPath)) {
                $processedFiles[$format] = [
                    'path' => $outputPath,
                    'size' => filesize($outputPath),
                    'format' => $format
                ];
                Log::info("✅ Format processed successfully", ['format' => $format]);
            } else {
                Log::error("❌ FFmpeg processing failed", [
                    'format' => $format,
                    'return_code' => $returnCode,
                    'output' => implode("\n", $output)
                ]);
                throw new Exception("Failed to process {$format} format");
            }
        }

        return $processedFiles;
    }

    /**
     * Build FFmpeg command with tier-specific processing
     */
    private function buildFFmpegCommand(
        string $inputPath, 
        string $outputPath, 
        string $format, 
        array $mlParams, 
        string $tier
    ): string {
        $baseCmd = "ffmpeg -i " . escapeshellarg($inputPath);
        
        // Audio filters based on ML parameters and tier
        $filters = [];
        
        // EQ processing
        if (isset($mlParams['eq'])) {
            $eq = $mlParams['eq'];
            $filters[] = "equalizer=f=100:width_type=h:width=2:g={$eq['low']}";
            $filters[] = "equalizer=f=1000:width_type=h:width=2:g={$eq['mid']}";
            $filters[] = "equalizer=f=10000:width_type=h:width=2:g={$eq['high']}";
        }

        // Compression
        if (isset($mlParams['compression'])) {
            $comp = $mlParams['compression'];
            $filters[] = "acompressor=threshold={$comp['threshold']}dB:ratio={$comp['ratio']}:attack={$comp['attack']}:release={$comp['release']}";
        }

        // Loudness normalization
        if (isset($mlParams['loudness'])) {
            $loudness = $mlParams['loudness'];
            $filters[] = "loudnorm=I={$loudness['target_lufs']}:TP={$loudness['true_peak']}";
        }

        // Advanced tier premium effects
        if ($tier === 'advanced' && isset($mlParams['premium_effects'])) {
            $premium = $mlParams['premium_effects'];
            
            if (isset($premium['stereo_widener'])) {
                $filters[] = "stereowiden=amount={$premium['stereo_widener']['width']}";
            }
            
            if (isset($premium['multiband_compression'])) {
                $mb = $premium['multiband_compression'];
                $filters[] = "acompressor=threshold={$mb['low']['threshold']}dB:ratio={$mb['low']['ratio']}";
            }
        }

        // Combine filters
        if (!empty($filters)) {
            $baseCmd .= " -af " . escapeshellarg(implode(',', $filters));
        }

        // Output format and quality settings
        $formatSettings = $this->getFormatSettings($format, $tier);
        $baseCmd .= " " . $formatSettings;
        $baseCmd .= " " . escapeshellarg($outputPath);

        return $baseCmd;
    }

    /**
     * Get format-specific FFmpeg settings
     */
    private function getFormatSettings(string $format, string $tier): string
    {
        return match($format) {
            'wav' => match($tier) {
                'advanced' => '-c:a pcm_s24le -ar 96000', // High-res for advanced
                'pro' => '-c:a pcm_s24le -ar 48000',     // 24-bit for pro
                default => '-c:a pcm_s16le -ar 44100'    // Standard for free
            },
            'mp3' => match($tier) {
                'advanced' => '-c:a libmp3lame -b:a 320k -q:a 0',
                'pro' => '-c:a libmp3lame -b:a 256k -q:a 2',
                default => '-c:a libmp3lame -b:a 192k -q:a 4'
            },
            'flac' => match($tier) {
                'advanced' => '-c:a flac -compression_level 8 -ar 96000',
                'pro' => '-c:a flac -compression_level 5 -ar 48000',
                default => '-c:a flac -compression_level 2 -ar 44100'
            },
            'aiff' => match($tier) {
                'advanced' => '-c:a pcm_s24be -ar 96000',
                default => '-c:a pcm_s24be -ar 48000'
            },
            default => '-c:a copy'
        };
    }

    /**
     * Store processed files and update database
     */
    private function storeProcessedFiles(Audio $audio, array $processedFiles): void
    {
        $audio->update([
            'status' => 'completed',
            'processed_at' => now(),
            'processed_files' => json_encode($processedFiles),
            'download_urls' => $this->generateDownloadUrls($processedFiles)
        ]);

        Log::info("💾 Processed files stored", [
            'audio_id' => $this->audioId,
            'formats' => array_keys($processedFiles)
        ]);
    }

    /**
     * Generate secure download URLs
     */
    private function generateDownloadUrls(array $processedFiles): array
    {
        $urls = [];
        foreach ($processedFiles as $format => $file) {
            $urls[$format] = route('audio.download', [
                'audioId' => $this->audioId,
                'format' => $format
            ]);
        }
        return $urls;
    }

    /**
     * Update job status in database/cache
     */
    private function updateJobStatus(string $status, array $data = []): void
    {
        $statusData = [
            'status' => $status,
            'updated_at' => now()->toISOString(),
            'data' => $data
        ];

        // Store in cache for real-time status updates
        cache()->put("audio_job_{$this->audioId}", $statusData, 3600); // 1 hour

        // Update database if audio record exists
        $audio = Audio::find($this->audioId);
        if ($audio) {
            $audio->update(['processing_status' => $status]);
        }

        Log::info("📊 Job status updated", [
            'audio_id' => $this->audioId,
            'status' => $status
        ]);
    }

    /**
     * Handle job failure
     */
    public function failed(Exception $exception): void
    {
        Log::error("💥 Audio processing job failed permanently", [
            'audio_id' => $this->audioId,
            'error' => $exception->getMessage()
        ]);

        $this->updateJobStatus('failed', [
            'error' => $exception->getMessage(),
            'failed_at' => now()->toISOString()
        ]);

        // Update audio record
        $audio = Audio::find($this->audioId);
        if ($audio) {
            $audio->update(['status' => 'failed']);
        }
    }
}
