<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Audio;
use App\Models\User;
use App\Jobs\ProcessAudioJob;

class AudioController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['uploadAudio', 'processAudio', 'getProcessingStatus', 'downloadProcessed', 'processFreeDownload']);
    }

    /**
     * Upload audio file
     */
    public function uploadAudio(Request $request)
    {
        try {
            $request->validate([
                'audio' => 'required|file|mimes:wav,mp3,flac,aiff|max:500000', // 500MB max
                'tier' => 'required|in:free,professional,advanced,one_on_one',
                'genre' => 'required|string|max:50',
            ]);

            $user = auth()->user();
            $tier = $request->input('tier');
            $genre = $request->input('genre');
            
            // For testing without authentication, create a temporary user
            if (!$user) {
                $user = User::firstOrCreate(
                    ['email' => 'test@crysgarage.com'],
                    [
                        'name' => 'Test User',
                        'tier' => $tier,
                        'credits' => 100,
                        'password' => bcrypt('password')
                    ]
                );
            }

            // Check tier limits
            $tierLimits = $this->getTierLimits($tier);
            $file = $request->file('audio');
            
            if ($file->getSize() > $tierLimits['max_file_size']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File size exceeds tier limit',
                    'max_size' => $tierLimits['max_file_size'],
                    'file_size' => $file->getSize()
                ], 400);
            }

            $fileExtension = $file->getClientOriginalExtension();
            if (!in_array($fileExtension, $tierLimits['supported_formats'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File format not supported for this tier',
                    'supported_formats' => $tierLimits['supported_formats']
                ], 400);
            }

            // Store the file
            $filename = Str::uuid() . '.' . $fileExtension;
            $path = $file->storeAs('uploads', $filename, 'local');

            // Create audio record
            $audio = Audio::create([
                'user_id' => $user->id,
                'original_filename' => $file->getClientOriginalName(),
                'original_path' => $path,
                'file_size' => $file->getSize(),
                'format' => $fileExtension,
                'genre' => $genre,
                'tier' => $tier,
                'status' => Audio::STATUS_UPLOADED,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Audio uploaded successfully',
                'audio_id' => $audio->id,
                'estimated_processing_time' => $this->getEstimatedProcessingTime($tier)
            ]);

        } catch (\Exception $e) {
            Log::error('Audio upload failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process audio with ML pipeline
     */
    public function processAudio(Request $request)
    {
        try {
            $request->validate([
                'audio_id' => 'required|exists:audio,id',
            ]);

            $audio = Audio::findOrFail($request->input('audio_id'));
            $user = $audio->user;

            // Check if user can process audio
            if (!$user->canProcessAudio()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient credits or processing limit reached'
                ], 400);
            }

            // Check if already processing or completed
            if ($audio->isProcessing()) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'Audio is already being processed'
                ]);
            }

            if ($audio->isCompleted()) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'Audio processing already completed'
                ]);
            }

            // Dispatch the job
            ProcessAudioJob::dispatch($audio->id);

            return response()->json([
                'status' => 'success',
                'message' => 'Audio processing started',
                'audio_id' => $audio->id,
                'estimated_processing_time' => $this->getEstimatedProcessingTime($audio->tier)
            ]);

        } catch (\Exception $e) {
            Log::error('Audio processing failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Processing failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get processing status
     */
    public function getProcessingStatus(Request $request, $audioId)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            $user = auth()->user();

            // For testing without authentication, allow access to test user's audio
            if (!$user) {
                $user = User::where('email', 'test@crysgarage.com')->first();
            }

            // Check if user owns this audio
            if ($user && $audio->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $response = [
                'status' => 'success',
                'audio_id' => $audio->id,
                'processing_status' => $audio->status,
                'progress' => $this->getProcessingProgress($audio),
            ];

            if ($audio->isCompleted()) {
                $response['download_urls'] = [];
                foreach ($audio->getAvailableFormats() as $format) {
                    $response['download_urls'][$format] = $audio->getDownloadUrl($format);
                }
                $response['processing_duration'] = $audio->processing_duration;
            }

            if ($audio->isFailed()) {
                $response['error_message'] = $audio->error_message;
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Get processing status failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download processed audio
     */
    public function downloadProcessed(Request $request, $audioId, $format)
    {
        try {
            $audio = Audio::findOrFail($audioId);
            $user = auth()->user();

            // For testing without authentication, allow access to test user's audio
            if (!$user) {
                $user = User::where('email', 'test@crysgarage.com')->first();
            }

            // Check if user owns this audio
            if ($user && $audio->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Check if processing is complete
            if (!$audio->isCompleted()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Audio processing not completed'
                ], 400);
            }

            // Check if format is available
            if (!in_array($format, $audio->getAvailableFormats())) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Format not available',
                    'available_formats' => $audio->getAvailableFormats()
                ], 400);
            }

            $filePath = $audio->processed_files[$format];
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File not found'
                ], 404);
            }

            return response()->download($filePath, "mastered_{$audio->id}.{$format}");

        } catch (\Exception $e) {
            Log::error('Download failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Download failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process free tier download (with payment)
     */
    public function processFreeDownload(Request $request)
    {
        try {
            $request->validate([
                'audio_id' => 'required|exists:audio,id',
                'format' => 'required|string',
                'payment_reference' => 'required|string',
            ]);

            $audio = Audio::findOrFail($request->input('audio_id'));
            $user = $audio->user;

            // Check if it's free tier
            if ($user->tier !== User::TIER_FREE) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This endpoint is only for free tier users'
                ], 400);
            }

            // Here you would verify the payment with Paystack
            // For now, we'll assume payment is verified
            
            // Check if processing is complete
            if (!$audio->isCompleted()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Audio processing not completed'
                ], 400);
            }

            $format = $request->input('format');
            
            // Check if format is available
            if (!in_array($format, $audio->getAvailableFormats())) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Format not available',
                    'available_formats' => $audio->getAvailableFormats()
                ], 400);
            }

            $filePath = $audio->processed_files[$format];
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File not found'
                ], 404);
            }

            return response()->download($filePath, "mastered_{$audio->id}.{$format}");

        } catch (\Exception $e) {
            Log::error('Free download failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Download failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tier limits
     */
    private function getTierLimits(string $tier): array
    {
        $user = new User();
        $user->tier = $tier;
        return $user->getTierLimits();
    }

    /**
     * Get estimated processing time
     */
    private function getEstimatedProcessingTime(string $tier): string
    {
        return match($tier) {
            'free' => '2-5 minutes',
            'professional' => '1-3 minutes',
            'advanced' => '30 seconds - 2 minutes',
            'one_on_one' => 'Manual processing',
            default => '2-5 minutes',
        };
    }

    /**
     * Get processing progress
     */
    private function getProcessingProgress(Audio $audio): int
    {
        if ($audio->isCompleted()) {
            return 100;
        }
        
        if ($audio->isFailed()) {
            return 0;
        }
        
        if ($audio->isProcessing()) {
            // Estimate progress based on time elapsed
            $startTime = $audio->processing_started_at;
            if ($startTime) {
                $elapsed = now()->diffInSeconds($startTime);
                $estimated = $this->getEstimatedProcessingTime($audio->tier);
                // Rough estimation - could be improved with actual progress tracking
                return min(90, ($elapsed / 60) * 20); // 20% per minute
            }
        }
        
        return 0;
    }
}
