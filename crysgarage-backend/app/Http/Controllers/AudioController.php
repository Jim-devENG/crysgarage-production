<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Audio;
use App\Models\User;

class AudioController extends Controller
{
    private $rubyServiceUrl;
    private $maxFileSize;

    public function __construct()
    {
        $this->rubyServiceUrl = env('VITE_RUBY_SERVICE_URL', 'http://localhost:4567');
        $this->maxFileSize = env('MAX_FILE_SIZE', 200) * 1024 * 1024; // Convert MB to bytes
        
        // Apply rate limiting to all methods
        $this->middleware('throttle:60,1')->except(['getFeatures']);
        $this->middleware('auth:sanctum')->except(['getFeatures']);
    }

    /**
     * Get tier-specific features
     */
    private function getTierFeatures($tier)
    {
        $features = [
            'free' => [
                'max_file_size' => 50 * 1024, // 50 MB (50 * 1024 KB)
                'supported_formats' => ['wav', 'mp3'],
                'supported_genres' => ['hip_hop', 'r_b', 'afrobeats'],
                'max_tracks_per_month' => 3
            ],
            'professional' => [
                'max_file_size' => 200,
                'supported_formats' => ['wav', 'mp3', 'flac'],
                'supported_genres' => ['hip_hop', 'r_b', 'afrobeats', 'gospel', 'highlife'],
                'max_tracks_per_month' => 20
            ],
            'advanced' => [
                'max_file_size' => 500,
                'supported_formats' => ['wav', 'mp3', 'flac', 'aiff'],
                'supported_genres' => ['hip_hop', 'r_b', 'afrobeats', 'gospel', 'highlife'],
                'max_tracks_per_month' => -1 // Unlimited
            ]
        ];

        return $features[$tier] ?? $features['free'];
    }

    /**
     * Check if user has exceeded tier limits
     */
    private function checkTierLimits($user, $tier)
    {
        $features = $this->getTierFeatures($tier);
        
        // Check monthly track limit
        if ($features['max_tracks_per_month'] !== -1) {
            $monthlyTracks = Audio::where('user_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
                
            if ($monthlyTracks >= $features['max_tracks_per_month']) {
                return false;
            }
        }

        // Check credits for non-advanced tiers
        if ($tier !== 'advanced' && $user->credits <= 0) {
            return false;
        }

        return true;
    }

    /**
     * Upload audio file and start processing
     */
    public function upload(Request $request)
    {
        try {
        $user = $request->user();
            
            // Get user's tier and validate against it
            $userTier = $user->tier;
            $tierFeatures = $this->getTierFeatures($userTier);
            
            // Validate request with tier-specific limits
            $request->validate([
                'audio' => 'required|file|mimes:' . implode(',', $tierFeatures['supported_formats']) . '|max:' . $tierFeatures['max_file_size'],
                'genre' => 'required|string|in:' . implode(',', $tierFeatures['supported_genres']),
                'tier' => 'required|string|in:free,professional,advanced'
            ]);

            // Check tier limits
            if (!$this->checkTierLimits($user, $userTier)) {
            return response()->json([
                    'success' => false,
                    'error' => 'Tier limit exceeded. Please upgrade your plan.',
                    'upgrade_required' => true
                ], 403);
            }

            $file = $request->file('audio');
            
            // Generate unique audio ID
            $audioId = Str::uuid()->toString();
            $fileName = $audioId . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $filePath = $file->storeAs('uploads', $fileName, 'local');
            
            // Create audio record
            $audio = Audio::create([
                'id' => $audioId,
            'user_id' => $user->id,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
                'genre' => $request->genre,
                'tier' => $request->tier,
            'status' => 'pending',
                'progress' => 0
            ]);

            // Start processing
            $this->startProcessing($audioId, $request->genre, $request->tier);

            Log::info('Audio upload successful', [
                'audio_id' => $audioId,
                'user_id' => $user->id,
                'file_name' => $file->getClientOriginalName(),
                'genre' => $request->genre,
                'tier' => $request->tier
            ]);
        
        return response()->json([
                'success' => true,
            'audio_id' => $audioId,
                'message' => 'Audio uploaded and processing started'
            ]);

        } catch (\Exception $e) {
            Log::error('Audio upload failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start audio processing (internal method called by upload)
     */
    private function startProcessing($audioId, $genre, $tier)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            
            // Update status to processing
            $audio->update([
                'status' => 'processing',
                'processing_started_at' => now(),
                'progress' => 10
            ]);

            // Call Ruby service for processing
            $response = Http::post($this->rubyServiceUrl . '/process', [
                'audio_id' => $audioId,
                'genre' => $genre,
                'tier' => $tier,
                'file_path' => storage_path("app/uploads/{$audioId}.wav")
            ]);

            if ($response->successful()) {
                Log::info('Processing started successfully', [
                    'audio_id' => $audioId,
                    'genre' => $genre,
                    'tier' => $tier
                ]);
            } else {
                Log::error('Failed to start processing', [
                    'audio_id' => $audioId,
                    'response' => $response->body()
                ]);
                
                // Update status to failed
                $audio->update([
                    'status' => 'failed',
                    'progress' => 0
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error starting processing', [
                'audio_id' => $audioId,
                'error' => $e->getMessage()
            ]);
            
            // Update status to failed
            $audio->update([
                'status' => 'failed',
                'progress' => 0
            ]);
        }
    }

    /**
     * Start audio processing with Ruby service
     */
    public function startMastering($audioId, Request $request)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            
            // Validate user owns this audio
            if ($audio->user_id !== $request->user()->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $filePath = storage_path("app/uploads/{$audioId}.wav");
            
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'Audio file not found'], 404);
            }

            // Prepare processing configuration
            $config = [
                'input_file' => $filePath,
                'genre' => $audio->genre,
                'tier' => $audio->tier,
                    'config' => [
                    'target_lufs' => env('AUDIO_TARGET_LUFS', -14.0),
                    'true_peak' => env('AUDIO_TRUE_PEAK', -1.0),
                    'sample_rate' => env('AUDIO_SAMPLE_RATE', 44100),
                    'bit_depth' => env('AUDIO_BIT_DEPTH', 24)
                ]
            ];

            // Call Ruby service
            $response = Http::timeout(30)->post($this->rubyServiceUrl . '/process', $config);

            if ($response->successful()) {
                $result = $response->json();
            
            if ($result['success']) {
                    // Update audio record
                    $audio->update([
                        'status' => 'processing',
                        'session_id' => $result['session_id'],
                        'progress' => 10
                    ]);

                    // Store processing info
                    Storage::disk('local')->put(
                        "processing/{$audioId}.json",
                        json_encode([
                            'session_id' => $result['session_id'],
                            'output_files' => $result['output_files'] ?? [],
                            'started_at' => now()->toISOString(),
                            'status' => 'processing'
                        ])
                    );

                    Log::info('Audio processing started', [
                    'audio_id' => $audioId,
                        'session_id' => $result['session_id']
                    ]);

                    return response()->json([
                        'success' => true,
                    'session_id' => $result['session_id'],
                        'message' => 'Processing started successfully'
                ]);
            } else {
                    throw new \Exception($result['error'] ?? 'Processing failed');
                }
            } else {
                throw new \Exception('Ruby service error: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Audio processing start failed', [
                'audio_id' => $audioId,
                'error' => $e->getMessage()
            ]);

            // Update audio status to failed
            if (isset($audio)) {
                $audio->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()
                ]);
        }
        
        return response()->json([
                'success' => false,
                'error' => 'Processing start failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get audio processing status
     */
    public function getStatus($audioId)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            
            // Check if processing file exists
            $processingFile = storage_path("app/processing/{$audioId}.json");
            
            if (file_exists($processingFile)) {
                $processingData = json_decode(file_get_contents($processingFile), true);
                
                // Check Ruby service for current status
                if (isset($processingData['session_id'])) {
                    $statusResponse = Http::get($this->rubyServiceUrl . '/status/' . $processingData['session_id']);
                    
                    if ($statusResponse->successful()) {
                        $statusData = $statusResponse->json();
                        
                        // Update processing data
                        $processingData['status'] = $statusData['status'] ?? 'processing';
                        $processingData['progress'] = $statusData['progress'] ?? 50;
                        
                        if (isset($statusData['output_files'])) {
                            $processingData['output_files'] = $statusData['output_files'];
                        }
                        
                        // Save updated data
                        Storage::disk('local')->put(
                            "processing/{$audioId}.json",
                            json_encode($processingData)
                        );
                        
                        // Update audio record
                        $audio->update([
            'status' => $processingData['status'],
                            'progress' => $processingData['progress']
                        ]);
                    }
                }
                
                return response()->json([
                    'success' => true,
            'audio_id' => $audioId,
                    'status' => $processingData['status'] ?? 'unknown',
                    'progress' => $processingData['progress'] ?? 0,
                    'output_files' => $processingData['output_files'] ?? [],
                    'session_id' => $processingData['session_id'] ?? null,
                    'started_at' => $processingData['started_at'] ?? null
                ]);
            }

            return response()->json([
                'success' => true,
                'audio_id' => $audioId,
                'status' => $audio->status,
                'progress' => $audio->progress,
                'error_message' => $audio->error_message
            ]);

        } catch (\Exception $e) {
            Log::error('Get status failed', [
                'audio_id' => $audioId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to get status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get mastering results with audio URLs
     */
    public function getMasteringResults($audioId)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            $processingFile = storage_path("app/processing/{$audioId}.json");
            
            if (!file_exists($processingFile)) {
                return response()->json(['error' => 'Processing data not found'], 404);
            }
            
            $processingData = json_decode(file_get_contents($processingFile), true);
            
            if ($processingData['status'] !== 'completed') {
                return response()->json(['error' => 'Processing not completed'], 400);
            }
            
            // Generate download URLs
            $downloadUrls = [];
            if (isset($processingData['output_files'])) {
                foreach ($processingData['output_files'] as $format => $filePath) {
                    $downloadUrls[$format] = url("/api/audio/{$audioId}/download/{$format}");
                }
            }
            
            return response()->json([
                'success' => true,
                'audio_id' => $audioId,
                'session_id' => $processingData['session_id'],
                'output_files' => $processingData['output_files'] ?? [],
                'download_urls' => $downloadUrls,
                'metadata' => $processingData['metadata'] ?? [],
                'processing_time' => $processingData['processing_time'] ?? 0
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get mastering results failed', [
                'audio_id' => $audioId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to get results: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download processed audio file
     */
    public function download($audioId, $format)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            $processingFile = storage_path("app/processing/{$audioId}.json");
        
        if (!file_exists($processingFile)) {
                return response()->json(['error' => 'Processing data not found'], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
            if (!isset($processingData['output_files'][$format])) {
                return response()->json(['error' => "Format {$format} not available"], 404);
            }
            
            $filePath = $processingData['output_files'][$format];
            
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'Audio file not found'], 404);
            }
            
            $mimeType = match($format) {
                'wav' => 'audio/wav',
                'mp3' => 'audio/mpeg',
                'flac' => 'audio/flac',
                'aiff' => 'audio/aiff',
                default => 'audio/wav'
            };
            
            return response()->file($filePath, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => "attachment; filename=\"{$audio->file_name}_{$format}.{$format}\""
            ]);

        } catch (\Exception $e) {
            Log::error('Audio download failed', [
                'audio_id' => $audioId,
                'format' => $format,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Download failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get original audio file
     */
    public function getOriginalAudio($audioId)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            $filePath = storage_path("app/uploads/{$audioId}.wav");
            
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'Original audio not found'], 404);
            }
            
            return response()->file($filePath, [
                'Content-Type' => 'audio/wav',
                'Content-Disposition' => "attachment; filename=\"{$audio->file_name}\""
            ]);

        } catch (\Exception $e) {
            Log::error('Get original audio failed', [
                'audio_id' => $audioId,
                'error' => $e->getMessage()
            ]);
        
        return response()->json([
                'success' => false,
                'error' => 'Failed to get original audio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get download URLs for all formats
     */
    public function getDownloadUrls($audioId)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            $processingFile = storage_path("app/processing/{$audioId}.json");
        
        if (!file_exists($processingFile)) {
                return response()->json(['error' => 'Processing data not found'], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
            $downloadUrls = [];
            if (isset($processingData['output_files'])) {
                foreach ($processingData['output_files'] as $format => $filePath) {
                    $downloadUrls[$format] = url("/api/audio/{$audioId}/download/{$format}");
                }
            }
        
        return response()->json([
            'success' => true,
                'audio_id' => $audioId,
                'download_urls' => $downloadUrls,
                'available_formats' => array_keys($downloadUrls)
            ]);

        } catch (\Exception $e) {
            Log::error('Get download URLs failed', [
                'audio_id' => $audioId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to get download URLs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint for immediate mastering completion (development only)
     */
    public function testCompleteMastering($audioId)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            
            // Simulate completed processing
            $processingData = [
                'session_id' => 'test-session-' . $audioId,
                'status' => 'completed',
                'progress' => 100,
            'output_files' => [
                    'wav' => storage_path("app/uploads/{$audioId}.wav"),
                    'mp3' => storage_path("app/uploads/{$audioId}.wav"),
                    'flac' => storage_path("app/uploads/{$audioId}.wav")
            ],
            'metadata' => [
                'processing_time' => 120,
                    'final_lufs' => -14.0,
                    'true_peak' => -1.0,
                    'dynamic_range' => 12.5
                ],
                'started_at' => now()->subMinutes(2)->toISOString(),
                'completed_at' => now()->toISOString()
            ];
            
            // Save processing data
            Storage::disk('local')->put(
                "processing/{$audioId}.json",
                json_encode($processingData)
            );
            
            // Update audio record
            $audio->update([
                'status' => 'completed',
                'progress' => 100
            ]);
        
        return response()->json([
            'success' => true,
                'message' => 'Test mastering completed',
                'audio_id' => $audioId,
                'session_id' => $processingData['session_id']
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Test completion failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public upload endpoint (no auth required for testing)
     */
    public function publicUpload(Request $request)
    {
        try {
            // Create a unique temporary user for each public upload to avoid tier limits
            $uniqueId = Str::uuid()->toString();
            $tempUser = User::create([
                'name' => 'Public User ' . substr($uniqueId, 0, 8),
                'email' => 'public_' . $uniqueId . '@crysgarage.studio',
                'password' => bcrypt('temp-password'),
                'tier' => 'free',
                'credits' => 10 // Give some credits for demo
            ]);
            
            // Set the user for this request
            $request->setUserResolver(function () use ($tempUser) {
                return $tempUser;
            });
            
            // Add missing required parameters for free tier
            $request->merge([
                'tier' => 'free',
                'genre' => $request->genre ?? 'hip_hop'
            ]);
            
            return $this->upload($request);
            
        } catch (\Exception $e) {
            Log::error('Public upload failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

                    return response()->json([
                'success' => false,
                'error' => 'Public upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public status endpoint (no auth required)
     */
    public function getPublicStatus($audioId)
    {
        return $this->getStatus($audioId);
    }

    /**
     * Public result endpoint (no auth required)
     */
    public function getPublicResult($audioId)
    {
        return $this->getMasteringResults($audioId);
    }

    /**
     * Clean up completed audio files (called automatically by scheduler)
     */
    public function cleanupCompletedFiles()
    {
        try {
            $cutoffTime = now()->subMinutes(10); // 10 minutes after completion
            
            $completedAudios = Audio::where('status', 'done')
                ->where('processing_completed_at', '<', $cutoffTime)
                ->get();

            $deletedCount = 0;
            
            foreach ($completedAudios as $audio) {
                try {
                    // Delete original file
                    $originalPath = "uploads/{$audio->id}.wav";
                    if (Storage::disk('local')->exists($originalPath)) {
                        Storage::disk('local')->delete($originalPath);
                    }

                    // Delete processed files
                    if ($audio->output_files) {
                        $outputFiles = json_decode($audio->output_files, true);
                        if (is_array($outputFiles)) {
                            foreach ($outputFiles as $format => $path) {
                                if (Storage::disk('local')->exists($path)) {
                                    Storage::disk('local')->delete($path);
                                }
                            }
                        }
                    }

                    // Delete processing status file
                    $processingPath = "processing/{$audio->id}.json";
                    if (Storage::disk('local')->exists($processingPath)) {
                        Storage::disk('local')->delete($processingPath);
                    }

                    // Delete database record
                    $audio->delete();
                    $deletedCount++;

                    Log::info('Cleaned up completed audio file', [
                        'audio_id' => $audio->id,
                        'file_name' => $audio->file_name
                    ]);

                } catch (\Exception $e) {
                    Log::error('Error cleaning up audio file', [
                        'audio_id' => $audio->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('Audio cleanup completed', [
                'deleted_count' => $deletedCount
            ]);

            return response()->json([
                'success' => true,
                'deleted_count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Audio cleanup failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Cleanup failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Manual cleanup endpoint for immediate cleanup
     */
    public function manualCleanup(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'older_than_minutes' => 'integer|min:1|max:60'
            ]);

            $olderThan = $request->input('older_than_minutes', 10);
            $cutoffTime = now()->subMinutes($olderThan);
            
            $completedAudios = Audio::where('status', 'done')
                ->where('processing_completed_at', '<', $cutoffTime)
                ->get();

            $deletedCount = 0;
            
            foreach ($completedAudios as $audio) {
                try {
                    // Delete original file
                    $originalPath = "uploads/{$audio->id}.wav";
                    if (Storage::disk('local')->exists($originalPath)) {
                        Storage::disk('local')->delete($originalPath);
                    }

                    // Delete processed files
                    if ($audio->output_files) {
                        $outputFiles = json_decode($audio->output_files, true);
                        if (is_array($outputFiles)) {
                            foreach ($outputFiles as $format => $path) {
                                if (Storage::disk('local')->exists($path)) {
                                    Storage::disk('local')->delete($path);
                                }
                            }
                        }
                    }

                    // Delete processing status file
                    $processingPath = "processing/{$audio->id}.json";
                    if (Storage::disk('local')->exists($processingPath)) {
                        Storage::disk('local')->delete($processingPath);
                    }

                    // Delete database record
                    $audio->delete();
                    $deletedCount++;

                } catch (\Exception $e) {
                    Log::error('Error cleaning up audio file', [
                        'audio_id' => $audio->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'deleted_count' => $deletedCount,
                'message' => "Cleaned up {$deletedCount} audio files older than {$olderThan} minutes"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Manual cleanup failed: ' . $e->getMessage()
            ], 500);
        }
    }
} 