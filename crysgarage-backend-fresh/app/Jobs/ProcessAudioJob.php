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

class ProcessAudioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes
    public $tries = 3;

    protected $audioId;

    public function __construct(int $audioId)
    {
        $this->audioId = $audioId;
    }

    public function handle(): void
    {
        try {
            Log::info("Starting audio processing for Audio ID: {$this->audioId}");

            $audio = Audio::findOrFail($this->audioId);
            $user = $audio->user;

            // Update status to processing
            $audio->update([
                'status' => Audio::STATUS_PROCESSING,
                'processing_started_at' => now(),
            ]);

            // Get ML recommendations
            $mlRecommendations = $this->getMLRecommendations($audio);

            // Process audio with FFmpeg
            $processedFiles = $this->processAudioWithFFmpeg($audio, $mlRecommendations);

            // Store processed files
            $audio->update([
                'processed_files' => $processedFiles,
                'ml_recommendations' => $mlRecommendations,
                'status' => Audio::STATUS_COMPLETED,
                'processing_completed_at' => now(),
            ]);

            // Deduct credits for non-free tiers
            if ($user->tier !== User::TIER_FREE) {
                $user->deductCredits(1);
            }

            Log::info("Audio processing completed for Audio ID: {$this->audioId}");

        } catch (\Exception $e) {
            Log::error("Audio processing failed for Audio ID: {$this->audioId}. Error: " . $e->getMessage());
            
            $audio = Audio::find($this->audioId);
            if ($audio) {
                $audio->update([
                    'status' => Audio::STATUS_FAILED,
                    'error_message' => $e->getMessage(),
                    'processing_completed_at' => now(),
                ]);
            }
            
            throw $e;
        }
    }

    private function getMLRecommendations(Audio $audio): array
    {
        try {
            // Use our working ML service from the standalone pipeline
            $mlServiceUrl = env('ML_SERVICE_URL', 'http://localhost:5000');
            $audioPath = Storage::path($audio->original_path);
            
            if (!file_exists($audioPath)) {
                throw new \Exception("Audio file not found: {$audioPath}");
            }

            // Call our working ML service
            $response = Http::timeout(30)->attach(
                'audio', file_get_contents($audioPath), $audio->original_filename
            )->post("{$mlServiceUrl}/analyze", [
                'tier' => $audio->tier,
                'genre' => $audio->genre
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info("ML recommendations received", $data);
                
                // Extract recommendations from our ML service response
                if (isset($data['recommendations'])) {
                    return $data['recommendations'];
                } elseif (isset($data['eq']) || isset($data['compression'])) {
                    // Handle direct response format from our ML service
                    return [
                        'eq' => $data['eq'] ?? ['low' => 1.0, 'mid' => 1.0, 'high' => 1.0],
                        'compression' => $data['compression'] ?? ['ratio' => 2.0, 'threshold' => -12.0],
                        'genre' => $audio->genre,
                        'tier' => $audio->tier
                    ];
                }
            }

        } catch (\Exception $e) {
            Log::warning("ML service failed, using default recommendations: " . $e->getMessage());
        }

        return $this->getDefaultRecommendations($audio->tier, $audio->genre);
    }

    private function getDefaultRecommendations(string $tier, string $genre): array
    {
        // Use our working ML pipeline's genre-specific recommendations
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

    private function processAudioWithFFmpeg(Audio $audio, array $recommendations): array
    {
        $inputPath = Storage::path($audio->original_path);
        $outputDir = storage_path('app/public/masters/' . $audio->id);
        
        // Create output directory
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $processedFiles = [];
        $outputFormats = $this->getOutputFormats($audio->tier);

        foreach ($outputFormats as $format => $config) {
            $outputPath = "{$outputDir}/mastered.{$format}";
            
            // Build FFmpeg command
            $ffmpegCmd = $this->buildFFmpegCommand($inputPath, $outputPath, $format, $config, $recommendations);
            
            Log::info("Running FFmpeg command: {$ffmpegCmd}");
            
            // Execute FFmpeg
            $output = [];
            $returnCode = 0;
            exec($ffmpegCmd . ' 2>&1', $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($outputPath)) {
                $processedFiles[$format] = $outputPath;
                Log::info("Successfully processed {$format} format");
            } else {
                Log::error("FFmpeg failed for {$format}: " . implode("\n", $output));
            }
        }

        return $processedFiles;
    }

    private function getOutputFormats(string $tier): array
    {
        $formats = [
            'free' => [
                'wav' => ['sample_rate' => 44100, 'bit_depth' => 16],
                'mp3' => ['bitrate' => 320]
            ],
            'pro' => [
                'wav' => ['sample_rate' => 48000, 'bit_depth' => 24],
                'mp3' => ['bitrate' => 320],
                'flac' => ['sample_rate' => 48000, 'bit_depth' => 24]
            ],
            'advanced' => [
                'wav' => ['sample_rate' => 96000, 'bit_depth' => 32],
                'mp3' => ['bitrate' => 320],
                'flac' => ['sample_rate' => 96000, 'bit_depth' => 32],
                'aiff' => ['sample_rate' => 96000, 'bit_depth' => 32]
            ]
        ];

        return $formats[$tier] ?? $formats['free'];
    }

    private function buildFFmpegCommand(string $inputPath, string $outputPath, string $format, array $config, array $recommendations): string
    {
        $cmd = "ffmpeg -i \"{$inputPath}\"";
        
        // Add audio filters based on recommendations
        $filters = [];
        
        // EQ filter
        if (isset($recommendations['eq'])) {
            $eq = $recommendations['eq'];
            $filters[] = "equalizer=f=100:width_type=h:width=100:g=" . ($eq['low'] - 1);
            $filters[] = "equalizer=f=1000:width_type=h:width=1000:g=" . ($eq['mid'] - 1);
            $filters[] = "equalizer=f=10000:width_type=h:width=10000:g=" . ($eq['high'] - 1);
        }
        
        // Compression filter
        if (isset($recommendations['compression'])) {
            $comp = $recommendations['compression'];
            $filters[] = "acompressor=threshold={$comp['threshold']}dB:ratio={$comp['ratio']}:attack=5:release=50";
        }
        
        // Loudness normalization (LUFS)
        if (isset($recommendations['loudness'])) {
            $targetLufs = $recommendations['loudness'];
            $filters[] = "loudnorm=I={$targetLufs}:TP=-1.5:LRA=11";
        }
        
        // Add filters to command
        if (!empty($filters)) {
            $cmd .= " -af \"" . implode(',', $filters) . "\"";
        }
        
        // Add format-specific options
        switch ($format) {
            case 'wav':
                $cmd .= " -ar {$config['sample_rate']} -sample_fmt s{$config['bit_depth']}";
                break;
            case 'mp3':
                $cmd .= " -ar 44100 -b:a {$config['bitrate']}k";
                break;
            case 'flac':
                $cmd .= " -ar {$config['sample_rate']} -sample_fmt s{$config['bit_depth']}";
                break;
            case 'aiff':
                $cmd .= " -ar {$config['sample_rate']} -sample_fmt s{$config['bit_depth']}";
                break;
        }
        
        $cmd .= " -y \"{$outputPath}\"";
        
        return $cmd;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessAudioJob failed for Audio ID: {$this->audioId}", [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
        
        $audio = Audio::find($this->audioId);
        if ($audio) {
            $audio->update([
                'status' => Audio::STATUS_FAILED,
                'error_message' => $exception->getMessage(),
                'processing_completed_at' => now(),
            ]);
        }
    }
}
