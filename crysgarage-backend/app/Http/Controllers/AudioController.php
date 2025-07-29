<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AudioController extends Controller
{
    /**
     * Public upload for testing (no auth required)
     */
    public function publicUpload(Request $request)
    {
        // Log the request for debugging
        \Log::info('Public upload request received', [
            'has_file' => $request->hasFile('audio'),
            'file_name' => $request->file('audio')?->getClientOriginalName(),
            'file_size' => $request->file('audio')?->getSize(),
            'file_type' => $request->file('audio')?->getMimeType(),
            'genre' => $request->input('genre'),
            'headers' => $request->headers->all()
        ]);

        try {
            $request->validate([
                'audio' => 'required|file|max:102400', // 100MB max, allow any file type for testing
                'genre' => 'sometimes|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Public upload validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        // Create a test user for public uploads
        $user = User::where('email', 'demo.free@crysgarage.com')->first();
        if (!$user) {
            return response()->json(['error' => 'Demo user not found'], 404);
        }

        $file = $request->file('audio');
        $audioId = Str::uuid();
        
        // Store the file
        $path = $file->storeAs('uploads/' . $user->id, $audioId . '.' . $file->getClientOriginalExtension(), 'local');
        $fullPath = Storage::disk('local')->path($path);
        
        // Create processing record
        $processingData = [
            'audio_id' => $audioId,
            'user_id' => $user->id,
            'file_path' => $fullPath,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'genre' => $request->input('genre', 'afrobeats'),
            'tier' => $user->tier,
            'status' => 'uploaded',
            'progress' => 0,
            'current_step' => 'File uploaded successfully',
            'created_at' => now(),
            'updated_at' => now()
        ];
        
        // Save processing data
        Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        
        // Start processing
        $this->startRubyProcessing($audioId, $processingData);
        
        return response()->json([
            'success' => true,
            'audio_id' => $audioId,
            'message' => 'Audio uploaded and processing started',
            'status' => 'processing'
        ]);
    }

    /**
     * Upload audio file
     */
    public function upload(Request $request)
    {
        // Log the request for debugging
        \Log::info('Upload request received', [
            'has_file' => $request->hasFile('audio'),
            'file_name' => $request->file('audio')?->getClientOriginalName(),
            'file_size' => $request->file('audio')?->getSize(),
            'file_type' => $request->file('audio')?->getMimeType(),
            'genre' => $request->input('genre'),
            'headers' => $request->headers->all()
        ]);

        try {
            $request->validate([
                'audio' => 'required|file|mimes:mp3,wav,flac,aac,m4a|max:102400', // 100MB max
                'genre' => 'sometimes|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Upload validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        $user = $request->user();
        $file = $request->file('audio');
        $audioId = Str::uuid();
        
        // Log initial credit state
        \Log::info("Credit consumption - User: {$user->email}, Tier: {$user->tier}, Initial credits: {$user->credits}");
        
        // Check if user has enough credits for basic mastering
        $creditsRequired = 0; // Default to 0
        
        // Set credit requirements based on tier (only for mastering, not Processing Options)
        if ($user->tier === 'advanced') {
            $creditsRequired = 0; // Advanced tier is unlimited subscription
        } elseif ($user->tier === 'professional') {
            $creditsRequired = 1; // Professional tier uses 1 credit for mastering
        } else {
            $creditsRequired = 1; // Free tier uses 1 credit for mastering
        }
        
        // Note: Processing Options (Noise Reduction, Tuning Correction) are dollar payments, not credit consumption
        // They are handled separately in the frontend payment flow
        
        // Reduce credit consumption for demo accounts (except advanced which is unlimited)
        if (str_contains($user->email, 'demo@crysgarage.com') && $user->tier !== 'advanced') {
            $originalCreditsRequired = $creditsRequired;
            $creditsRequired = 0.2; // Only consume 0.2 credits for demo accounts
            \Log::info("Demo account - reducing credits from {$originalCreditsRequired} to {$creditsRequired}");
        }
        
        \Log::info("Credit calculation - Credits required for mastering: {$creditsRequired}");
        
        // Only check credits for non-advanced tiers
        if ($user->tier !== 'advanced' && $user->credits < $creditsRequired) {
            \Log::warning("Insufficient credits - Required: {$creditsRequired}, Available: {$user->credits}");
            return response()->json([
                'error' => 'Insufficient credits',
                'required' => $creditsRequired,
                'available' => $user->credits
            ], 402);
        }
        
        // Deduct credits (only for non-advanced tiers)
        if ($user->tier !== 'advanced') {
            $oldCredits = $user->credits;
            $user->credits -= $creditsRequired;
            \Log::info("Credits deducted - Old: {$oldCredits}, Deducted: {$creditsRequired}, New: {$user->credits}");
        } else {
            \Log::info("No credits deducted - Advanced tier unlimited");
        }
        
        $user->total_tracks += 1;
        $user->save();
        
        // Store the file
        $path = $file->storeAs('uploads/' . $user->id, $audioId . '.' . $file->getClientOriginalExtension(), 'local');
        $fullPath = Storage::disk('local')->path($path);
        
        // Create processing record
        $processingData = [
            'audio_id' => $audioId,
            'user_id' => $user->id,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'genre' => $request->input('genre', 'afrobeats'),
            'tier' => $user->tier,
            'status' => 'pending',
            'progress' => 0,
            'file_path' => $fullPath,
            'credits_used' => $creditsRequired,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        
        // Store processing data
        Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        
        // Start processing with Ruby service
        $this->startRubyProcessing($audioId, $processingData);
        
        return response()->json([
            'audio_id' => $audioId,
            'credits_deducted' => $creditsRequired,
            'remaining_credits' => $user->credits,
        ]);
    }

    /**
     * Get audio processing status (public - no auth required)
     */
    public function getPublicStatus($audioId)
    {
        // Get processing data from the correct path - use storage_path directly
        $processingFile = storage_path('app/private/processing/' . $audioId . '.json');
        
        // Debug logging
        \Log::info('Public status check', [
            'audio_id' => $audioId,
            'processing_file_path' => $processingFile,
            'file_exists' => file_exists($processingFile)
        ]);
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Audio not found',
                'debug' => [
                    'path' => $processingFile,
                    'exists' => file_exists($processingFile)
                ]
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        // Check if processing is in progress and get real-time status from Ruby
        if ($processingData['status'] === 'processing' && isset($processingData['session_id'])) {
            $rubyStatus = $this->checkRubyStatus($audioId);
            
            if ($rubyStatus) {
                // Update processing data with real status from Ruby
                $processingData['progress'] = $rubyStatus['progress'] ?? $processingData['progress'];
                $processingData['status'] = $rubyStatus['status'] ?? $processingData['status'];
                $processingData['current_step'] = $rubyStatus['message'] ?? $processingData['current_step'];
                
                if ($rubyStatus['status'] === 'done') {
                    $processingData['output_files'] = [
                        'wav' => '/api/public/audio/' . $audioId . '/download/wav',
                        'mp3' => '/api/public/audio/' . $audioId . '/download/mp3',
                        'flac' => '/api/public/audio/' . $audioId . '/download/flac'
                    ];
                    $processingData['metadata'] = $rubyStatus['metadata'] ?? [
                        'processing_time' => 180,
                        'final_lufs' => -14.2,
                        'true_peak' => -0.8,
                        'dynamic_range' => 12.5,
                        'genre' => $processingData['genre'],
                        'tier' => $processingData['tier']
                    ];
                }
                
                if ($rubyStatus['status'] === 'failed') {
                    $processingData['error_message'] = $rubyStatus['error'] ?? 'Processing failed';
                }
                
                $processingData['updated_at'] = now()->toISOString();
                file_put_contents($processingFile, json_encode($processingData));
            }
        }
        
        return response()->json([
            'audio_id' => $audioId,
            'status' => $processingData['status'],
            'progress' => $processingData['progress'] ?? 0,
            'genre' => $processingData['genre'],
            'tier' => $processingData['tier'],
            'file_name' => $processingData['original_name'],
            'output_files' => $processingData['output_files'] ?? [],
            'metadata' => $processingData['metadata'] ?? [],
            'error_message' => $processingData['error_message'] ?? null,
            'created_at' => $processingData['created_at'],
            'updated_at' => $processingData['updated_at']
        ]);
    }

    /**
     * Get audio processing status
     */
    public function getStatus($audioId)
    {
        $user = request()->user();
        
        // Get processing data from the correct path
        $processingFile = Storage::disk('local')->path('private/processing/' . $audioId . '.json');
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Audio not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        // Check if processing is in progress and get real-time status from Ruby
        if ($processingData['status'] === 'processing' && isset($processingData['session_id'])) {
            $rubyStatus = $this->checkRubyStatus($audioId);
            
            if ($rubyStatus) {
                // Update processing data with real status from Ruby
                $processingData['progress'] = $rubyStatus['progress'] ?? $processingData['progress'];
                $processingData['status'] = $rubyStatus['status'] ?? $processingData['status'];
                $processingData['current_step'] = $rubyStatus['message'] ?? $processingData['current_step'];
                
                if ($rubyStatus['status'] === 'done') {
                    $processingData['output_files'] = [
                        'wav' => '/api/audio/' . $audioId . '/download/wav',
                        'mp3' => '/api/audio/' . $audioId . '/download/mp3',
                        'flac' => '/api/audio/' . $audioId . '/download/flac'
                    ];
                    $processingData['metadata'] = $rubyStatus['metadata'] ?? [
                        'processing_time' => 180,
                        'final_lufs' => -14.2,
                        'true_peak' => -0.8,
                        'dynamic_range' => 12.5,
                        'genre' => $processingData['genre'],
                        'tier' => $processingData['tier']
                    ];
                }
                
                if ($rubyStatus['status'] === 'failed') {
                    $processingData['error_message'] = $rubyStatus['error'] ?? 'Processing failed';
                }
                
                $processingData['updated_at'] = now()->toISOString();
                Storage::disk('local')->put('private/processing/' . $audioId . '.json', json_encode($processingData));
            }
        }
        
        return response()->json([
            'audio_id' => $audioId,
            'status' => $processingData['status'],
            'progress' => $processingData['progress'] ?? 0,
            'genre' => $processingData['genre'],
            'tier' => $processingData['tier'],
            'file_name' => $processingData['original_name'],
            'output_files' => $processingData['output_files'] ?? [],
            'metadata' => $processingData['metadata'] ?? [],
            'error_message' => $processingData['error_message'] ?? null,
            'created_at' => $processingData['created_at'],
            'updated_at' => $processingData['updated_at']
        ]);
    }

    /**
     * Start Ruby processing
     */
    private function startRubyProcessing($audioId, $processingData)
    {
        try {
            $client = new \GuzzleHttp\Client();
            
            // Get genre-specific configuration
            $genreConfig = $this->getGenreConfig($processingData['genre']);
            
            $response = $client->post('http://localhost:4567/process', [
                'json' => [
                    'input_file' => $processingData['file_path'],
                    'audio_id' => $audioId,
                    'genre' => $processingData['genre'],
                    'tier' => $processingData['tier'],
                    'config' => [
                        'target_lufs' => $genreConfig['target_lufs'],
                        'true_peak' => $genreConfig['true_peak'],
                        'sample_rate' => 44100,
                        'bit_depth' => 24,
                        'eq_settings' => $genreConfig['eq'],
                        'compression_settings' => $genreConfig['compression'],
                        'stereo_width' => $genreConfig['stereo_width'],
                        'processing_steps' => [
                            'noise_reduction',
                            'eq_adjustment', 
                            'compression',
                            'stereo_enhancement',
                            'limiting',
                            'loudness_normalization'
                        ]
                    ]
                ]
                // No timeout - let it process as long as needed
            ]);
            
            $result = json_decode($response->getBody(), true);
            
            if ($result['success']) {
                $processingData['status'] = 'processing';
                $processingData['session_id'] = $result['session_id'];
                $processingData['updated_at'] = now()->toISOString();
                
                Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
                
                \Log::info('Ruby processing started successfully', [
                    'audio_id' => $audioId,
                    'session_id' => $result['session_id'],
                    'genre' => $processingData['genre']
                ]);
            } else {
                throw new \Exception('Ruby processing failed: ' . ($result['error'] ?? 'Unknown error'));
            }
        } catch (\Exception $e) {
            \Log::error('Ruby processing failed: ' . $e->getMessage());
            
            // Update processing status to failed
            $processingData['status'] = 'failed';
            $processingData['error_message'] = $e->getMessage();
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        }
    }

    /**
     * Start direct Laravel processing (alternative to Ruby)
     */
    private function startDirectProcessing($audioId, $processingData)
    {
        try {
            \Log::info('Starting direct Laravel processing', [
                'audio_id' => $audioId,
                'genre' => $processingData['genre']
            ]);
            
            // Update status to processing
            $processingData['status'] = 'processing';
            $processingData['progress'] = 0;
            $processingData['session_id'] = Str::uuid();
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
            
            // Start background processing
            dispatch(function () use ($audioId, $processingData) {
                $this->simulateMasteringProcess($audioId, $processingData);
            })->afterResponse();
            
        } catch (\Exception $e) {
            \Log::error('Direct processing failed: ' . $e->getMessage());
            
            $processingData['status'] = 'failed';
            $processingData['error_message'] = $e->getMessage();
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        }
    }

    /**
     * Complete mastering immediately (no processing delay)
     */
    private function completeMasteringImmediately($audioId, $processingData)
    {
        try {
            \Log::info('Completing mastering immediately', [
                'audio_id' => $audioId,
                'genre' => $processingData['genre']
            ]);
            
            // Mark as complete immediately
            $processingData['status'] = 'done';
            $processingData['progress'] = 100;
            $processingData['current_step'] = 'Mastering completed!';
            $processingData['session_id'] = Str::uuid();
            $processingData['completed_at'] = now()->toISOString();
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
            
            \Log::info('Mastering completed immediately', [
                'audio_id' => $audioId,
                'genre' => $processingData['genre']
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Immediate completion failed: ' . $e->getMessage());
            
            $processingData['status'] = 'failed';
            $processingData['error_message'] = $e->getMessage();
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        }
    }

    /**
     * Simulate mastering process with realistic timing
     */
    private function simulateMasteringProcess($audioId, $processingData)
    {
        $steps = [
            ['progress' => 10, 'message' => 'Analyzing audio...', 'duration' => 2],
            ['progress' => 20, 'message' => 'Applying noise reduction...', 'duration' => 3],
            ['progress' => 35, 'message' => 'EQ adjustment...', 'duration' => 2],
            ['progress' => 50, 'message' => 'Compression...', 'duration' => 3],
            ['progress' => 65, 'message' => 'Stereo enhancement...', 'duration' => 2],
            ['progress' => 80, 'message' => 'Limiting...', 'duration' => 2],
            ['progress' => 90, 'message' => 'Loudness normalization...', 'duration' => 2],
            ['progress' => 100, 'message' => 'Finalizing...', 'duration' => 1]
        ];
        
        foreach ($steps as $step) {
            // Update progress
            $processingData['progress'] = $step['progress'];
            $processingData['current_step'] = $step['message'];
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
            
            \Log::info("Processing step: {$step['progress']}% - {$step['message']}", [
                'audio_id' => $audioId
            ]);
            
            // Simulate processing time
            sleep($step['duration']);
        }
        
        // Mark as complete
        $processingData['status'] = 'done';
        $processingData['progress'] = 100;
        $processingData['current_step'] = 'Processing complete!';
        $processingData['completed_at'] = now()->toISOString();
        $processingData['updated_at'] = now()->toISOString();
        
        Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        
        \Log::info('Direct processing completed successfully', [
            'audio_id' => $audioId,
            'genre' => $processingData['genre']
        ]);
    }

    /**
     * Get genre-specific processing configuration
     */
    private function getGenreConfig($genre)
    {
        $configs = [
            'afrobeats' => [
                'eq' => ['low' => '+2dB', 'mid' => '+1dB', 'high' => '+3dB'],
                'compression' => ['ratio' => '4:1', 'threshold' => '-20dB'],
                'stereo_width' => 1.2,
                'target_lufs' => -12.0,
                'true_peak' => -0.8
            ],
            'hiphop' => [
                'eq' => ['low' => '+3dB', 'mid' => '+1dB', 'high' => '+2dB'],
                'compression' => ['ratio' => '6:1', 'threshold' => '-18dB'],
                'stereo_width' => 1.1,
                'target_lufs' => -10.0,
                'true_peak' => -0.5
            ],
            'pop' => [
                'eq' => ['low' => '+1dB', 'mid' => '+2dB', 'high' => '+2dB'],
                'compression' => ['ratio' => '3:1', 'threshold' => '-22dB'],
                'stereo_width' => 1.3,
                'target_lufs' => -14.0,
                'true_peak' => -1.0
            ],
            'rock' => [
                'eq' => ['low' => '+2dB', 'mid' => '+1dB', 'high' => '+1dB'],
                'compression' => ['ratio' => '5:1', 'threshold' => '-20dB'],
                'stereo_width' => 1.1,
                'target_lufs' => -12.0,
                'true_peak' => -0.8
            ],
            'reggae' => [
                'eq' => ['low' => '+3dB', 'mid' => '+1dB', 'high' => '+1dB'],
                'compression' => ['ratio' => '4:1', 'threshold' => '-18dB'],
                'stereo_width' => 1.0,
                'target_lufs' => -13.0,
                'true_peak' => -0.9
            ],
            'electronic' => [
                'eq' => ['low' => '+2dB', 'mid' => '+1dB', 'high' => '+3dB'],
                'compression' => ['ratio' => '4:1', 'threshold' => '-20dB'],
                'stereo_width' => 1.4,
                'target_lufs' => -11.0,
                'true_peak' => -0.7
            ],
            'jazz' => [
                'eq' => ['low' => '+1dB', 'mid' => '+1dB', 'high' => '+1dB'],
                'compression' => ['ratio' => '2:1', 'threshold' => '-24dB'],
                'stereo_width' => 1.0,
                'target_lufs' => -16.0,
                'true_peak' => -1.0
            ]
        ];
        
        return $configs[$genre] ?? $configs['pop'];
    }

    /**
     * Check Ruby service status
     */
    private function checkRubyStatus($audioId)
    {
        try {
            // Read processing data from the correct path
            $processingFile = storage_path('app/private/processing/' . $audioId . '.json');
            
            if (!file_exists($processingFile)) {
                \Log::error('Processing file not found for Ruby status check', [
                    'audio_id' => $audioId,
                    'file_path' => $processingFile
                ]);
                return null;
            }
            
            $processingData = json_decode(file_get_contents($processingFile), true);
            
            if (!isset($processingData['session_id'])) {
                \Log::error('No session_id found in processing data', [
                    'audio_id' => $audioId
                ]);
                return null;
            }
            
            $client = new \GuzzleHttp\Client();
            $response = $client->get('http://localhost:4567/status/' . $processingData['session_id']);
            
            $result = json_decode($response->getBody(), true);
            
            \Log::info('Ruby status check result', [
                'audio_id' => $audioId,
                'session_id' => $processingData['session_id'],
                'result' => $result
            ]);
            
            return $result;
            
        } catch (\Exception $e) {
            \Log::error('Ruby status check failed: ' . $e->getMessage(), [
                'audio_id' => $audioId
            ]);
            return null;
        }
    }

    /**
     * Download processed audio
     */
    public function download($audioId, $format)
    {
        $user = request()->user();
        
        // For public endpoints, use a default user if no user is authenticated
        if (!$user) {
            $user = User::where('tier', 'professional')->first();
            if (!$user) {
                return response()->json(['message' => 'No user available'], 500);
            }
        }
        
        \Log::info('Download request', [
            'audio_id' => $audioId,
            'format' => $format,
            'user_id' => $user->id
        ]);
        
        // Validate format
        if (!in_array($format, ['wav', 'mp3', 'flac'])) {
            return response()->json([
                'message' => 'Invalid format'
            ], 400);
        }
        
        // Get processing data
        $processingFile = Storage::disk('local')->path('processing/' . $audioId . '.json');
        
        if (!file_exists($processingFile)) {
            \Log::error('Processing file not found', ['file' => $processingFile]);
            return response()->json([
                'message' => 'Audio not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        if ($processingData['status'] !== 'done') {
            \Log::warning('Audio processing not complete', ['status' => $processingData['status']]);
            return response()->json([
                'message' => 'Audio processing not complete'
            ], 400);
        }
        
        // For demo purposes, we'll return the original file as "mastered"
        // In production, this would be the actual processed file
        $originalFile = Storage::disk('local')->path('uploads/' . $user->id . '/' . $audioId . '.' . pathinfo($processingData['file_name'], PATHINFO_EXTENSION));
        
        \Log::info('Looking for audio file', [
            'file_path' => $originalFile,
            'exists' => file_exists($originalFile),
            'file_name' => $processingData['file_name']
        ]);
        
        if (!file_exists($originalFile)) {
            // Try alternative path without user ID
            $originalFile = Storage::disk('local')->path('uploads/' . $audioId . '.' . pathinfo($processingData['file_name'], PATHINFO_EXTENSION));
            
            if (!file_exists($originalFile)) {
                // Use test audio file as fallback for demo
                $testAudioFile = Storage::disk('local')->path('test_audio.wav');
                
                if (file_exists($testAudioFile)) {
                    \Log::info('Using test audio file as fallback', ['file' => $testAudioFile]);
                    $originalFile = $testAudioFile;
                } else {
                    return response()->json([
                        'message' => 'Audio file not found at: ' . $originalFile . ' and no test file available'
                    ], 404);
                }
            }
        }
        
        // Set proper headers for audio streaming
        $headers = [
            'Content-Type' => $this->getMimeType($format),
            'Content-Disposition' => 'inline; filename="mastered_audio.' . $format . '"',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
        ];
        
        \Log::info('Serving audio file', [
            'file' => $originalFile,
            'headers' => $headers
        ]);
        
        return response()->file($originalFile, $headers);
    }
    
    /**
     * Get MIME type for audio format
     */
    private function getMimeType($format)
    {
        switch ($format) {
            case 'wav':
                return 'audio/wav';
            case 'mp3':
                return 'audio/mpeg';
            case 'flac':
                return 'audio/flac';
            default:
                return 'audio/wav';
        }
    }

    /**
     * Get download URLs
     */
    public function getDownloadUrls($audioId)
    {
        $user = request()->user();
        
        // Get processing data
        $processingFile = Storage::disk('local')->path('processing/' . $audioId . '.json');
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Audio not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        if ($processingData['status'] !== 'done') {
            return response()->json([
                'message' => 'Audio processing not complete'
            ], 400);
        }
        
        $baseUrl = url('/api/audio/' . $audioId . '/download');
        
        return response()->json([
            'wav' => $baseUrl . '/wav',
            'mp3' => $baseUrl . '/mp3',
            'flac' => $baseUrl . '/flac',
        ]);
    }

    /**
     * Start mastering process (for advanced controls)
     */
    public function startMastering($audioId, Request $request)
    {
        $request->validate([
            'genre' => 'required|string',
            'config' => 'required|array',
        ]);
        
        // In a real app, you'd send this to your Ruby processing service
        // For now, we'll just update the status
        
        $processingFile = Storage::disk('local')->path('processing/' . $audioId . '.json');
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Audio not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        $processingData['status'] = 'processing';
        $processingData['progress'] = 50;
        $processingData['updated_at'] = now()->toISOString();
        
        Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
        
        return response()->json([
            'success' => true,
            'message' => 'Mastering started successfully',
        ]);
    }

    /**
     * Get mastering session
     */
    public function getSession($sessionId)
    {
        $processingFile = Storage::disk('local')->path('processing/' . $sessionId . '.json');
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Session not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        return response()->json([
            'id' => $sessionId,
            'user_id' => $processingData['user_id'],
            'file_name' => $processingData['file_name'],
            'file_size' => $processingData['file_size'],
            'genre' => $processingData['genre'],
            'tier' => 'advanced',
            'status' => $processingData['status'],
            'progress' => $processingData['progress'],
            'created_at' => $processingData['created_at'],
            'updated_at' => $processingData['updated_at'],
        ]);
    }

    /**
     * Get mastering result
     */
    public function getResult($sessionId)
    {
        $processingFile = Storage::disk('local')->path('processing/' . $sessionId . '.json');
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Session not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        $baseUrl = url('/api/audio/' . $sessionId . '/download');
        
        return response()->json([
            'session_id' => $sessionId,
            'output_files' => [
                'wav' => $baseUrl . '/wav',
                'mp3' => $baseUrl . '/mp3',
                'flac' => $baseUrl . '/flac',
            ],
            'metadata' => [
                'processing_time' => 120,
                'final_lufs' => -14.2,
                'true_peak' => -0.8,
                'dynamic_range' => 12.5,
            ],
            'download_urls' => [
                'wav' => $baseUrl . '/wav',
                'mp3' => $baseUrl . '/mp3',
                'flac' => $baseUrl . '/flac',
            ],
        ]);
    }

    /**
     * Cancel mastering process
     */
    public function cancelMastering($sessionId)
    {
        $processingFile = Storage::disk('local')->path('processing/' . $sessionId . '.json');
        
        if (!file_exists($processingFile)) {
            return response()->json([
                'message' => 'Session not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        $processingData['status'] = 'failed';
        $processingData['updated_at'] = now()->toISOString();
        
        Storage::disk('local')->put('processing/' . $sessionId . '.json', json_encode($processingData));
        
        return response()->json([
            'success' => true,
            'message' => 'Mastering cancelled successfully',
        ]);
    }

    /**
     * Get mastering results with audio URLs
     */
    public function getMasteringResults($audioId)
    {
        $user = request()->user();
        
        // Get processing data
        $processingFile = Storage::disk('local')->path('processing/' . $audioId . '.json');
        
        if (!file_exists($processingFile)) {
            \Log::error("Processing file not found for audio ID: {$audioId}");
            return response()->json([
                'message' => 'Audio not found',
                'error' => 'Processing file not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        \Log::info("Processing data for audio ID {$audioId}:", $processingData);
        
        // Check if processing is complete
        if ($processingData['status'] !== 'done') {
            \Log::warning("Processing not complete for audio ID {$audioId}. Status: {$processingData['status']}, Progress: {$processingData['progress']}");
            return response()->json([
                'message' => 'Audio processing not complete',
                'status' => $processingData['status'],
                'progress' => $processingData['progress'],
                'error' => 'Processing not complete'
            ], 400);
        }
        
        // Create audio URLs
        $baseUrl = url('/api/audio/' . $audioId . '/download');
        $originalUrl = url('/api/audio/' . $audioId . '/original');
        
        $response = [
            'audio_id' => $audioId,
            'file_name' => $processingData['file_name'],
            'genre' => $processingData['genre'],
            'tier' => $processingData['tier'] ?? 'professional',
            'original_audio_url' => $originalUrl,
            'mastered_audio_url' => $baseUrl . '/wav',
            'output_files' => [
                'wav' => $baseUrl . '/wav',
                'mp3' => $baseUrl . '/mp3',
                'flac' => $baseUrl . '/flac',
            ],
            'metadata' => [
                'processing_time' => 120,
                'final_lufs' => -14.2,
                'true_peak' => -0.8,
                'dynamic_range' => 12.5,
            ],
            'download_urls' => [
                'wav' => $baseUrl . '/wav',
                'mp3' => $baseUrl . '/mp3',
                'flac' => $baseUrl . '/flac',
            ],
        ];
        
        \Log::info("Returning mastering results for audio ID {$audioId}:", $response);
        
        return response()->json($response);
    }

    /**
     * Get original audio file
     */
    public function getOriginalAudio($audioId)
    {
        $user = request()->user();
        
        // For public endpoints, use a default user if no user is authenticated
        if (!$user) {
            $user = User::where('tier', 'professional')->first();
            if (!$user) {
                return response()->json(['message' => 'No user available'], 500);
            }
        }
        
        \Log::info('Original audio request', [
            'audio_id' => $audioId,
            'user_id' => $user->id
        ]);
        
        // Get processing data
        $processingFile = Storage::disk('local')->path('processing/' . $audioId . '.json');
        
        if (!file_exists($processingFile)) {
            \Log::error('Processing file not found for original audio', ['file' => $processingFile]);
            return response()->json([
                'message' => 'Audio not found'
            ], 404);
        }
        
        $processingData = json_decode(file_get_contents($processingFile), true);
        
        // Get original file path
        $originalFile = Storage::disk('local')->path('uploads/' . $user->id . '/' . $audioId . '.' . pathinfo($processingData['file_name'], PATHINFO_EXTENSION));
        
        \Log::info('Looking for original audio file', [
            'file_path' => $originalFile,
            'exists' => file_exists($originalFile),
            'file_name' => $processingData['file_name']
        ]);
        
        if (!file_exists($originalFile)) {
            // Try alternative path without user ID
            $originalFile = Storage::disk('local')->path('uploads/' . $audioId . '.' . pathinfo($processingData['file_name'], PATHINFO_EXTENSION));
            
            if (!file_exists($originalFile)) {
                // Use test audio file as fallback for demo
                $testAudioFile = Storage::disk('local')->path('test_audio.wav');
                
                if (file_exists($testAudioFile)) {
                    \Log::info('Using test audio file as fallback for original', ['file' => $testAudioFile]);
                    $originalFile = $testAudioFile;
                } else {
                    return response()->json([
                        'message' => 'Original audio file not found at: ' . $originalFile . ' and no test file available'
                    ], 404);
                }
            }
        }
        
        // Set proper headers for audio streaming
        $headers = [
            'Content-Type' => 'audio/wav',
            'Content-Disposition' => 'inline; filename="original_audio.wav"',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
        ];
        
        \Log::info('Serving original audio file', [
            'file' => $originalFile,
            'headers' => $headers
        ]);
        
        return response()->file($originalFile, $headers);
    }

    /**
     * Test endpoint to immediately complete mastering
     */
    public function testCompleteMastering($audioId)
    {
        try {
            $processingFile = Storage::disk('local')->path('processing/' . $audioId . '.json');
            
            if (!file_exists($processingFile)) {
                return response()->json([
                    'error' => 'Audio not found'
                ], 404);
            }
            
            $processingData = json_decode(file_get_contents($processingFile), true);
            
            // Complete immediately
            $processingData['status'] = 'done';
            $processingData['progress'] = 100;
            $processingData['current_step'] = 'Mastering completed!';
            $processingData['session_id'] = Str::uuid();
            $processingData['completed_at'] = now()->toISOString();
            $processingData['updated_at'] = now()->toISOString();
            
            Storage::disk('local')->put('processing/' . $audioId . '.json', json_encode($processingData));
            
            return response()->json([
                'success' => true,
                'message' => 'Mastering completed immediately',
                'audio_id' => $audioId,
                'status' => 'done'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to complete mastering: ' . $e->getMessage()
            ], 500);
        }
    }
} 