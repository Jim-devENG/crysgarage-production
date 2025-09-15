# Laravel Integration Guide

This guide explains how to integrate the Audio Mastering Microservice with your existing Laravel backend.

## Overview

The Python microservice handles audio processing while Laravel remains the controller for:
- User authentication and tier validation
- Credit deduction and payment processing
- File management and metadata storage
- API responses to the React frontend

## API Endpoints

### Base URL
```
http://localhost:8000  # Development
https://your-domain.com  # Production
```

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "audio_processor": true,
    "ml_engine": true,
    "storage_manager": true,
    "ffmpeg_converter": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Master Audio
```http
POST /master
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": 123,
  "tier": "Pro",
  "genre": "Afrobeats",
  "target_format": "FLAC",
  "target_sample_rate": 96000,
  "file_url": "https://s3.com/input.wav",
  "target_lufs": -14.0
}
```

**Response:**
```json
{
  "status": "done",
  "url": "https://s3.com/output.flac",
  "lufs": -14.0,
  "format": "FLAC",
  "duration": 210.5,
  "sample_rate": 96000,
  "file_size": 52428800,
  "processing_time": 45.2
}
```

### 3. Get Supported Formats
```http
GET /formats
```

**Response:**
```json
{
  "input_formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
  "output_formats": ["WAV", "MP3", "FLAC", "AIFF", "AAC", "OGG"],
  "sample_rates": [44100, 48000, 96000, 192000],
  "genres": ["Hip-Hop", "Afrobeats", "Gospel", "Pop", "Rock", "Electronic", "Jazz", "Classical"]
}
```

## Laravel Integration Example

### 1. Create a Service Class

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AudioMasteringService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.audio_mastering.url');
        $this->apiKey = config('services.audio_mastering.api_key');
    }

    public function masterAudio(array $data): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(300)->post($this->baseUrl . '/master', $data);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception('Audio mastering failed: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('Audio mastering service error', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function getHealthStatus(): array
    {
        try {
            $response = Http::timeout(10)->get($this->baseUrl . '/health');
            return $response->json();
        } catch (\Exception $e) {
            Log::error('Audio mastering health check failed', [
                'error' => $e->getMessage()
            ]);
            return ['status' => 'unhealthy'];
        }
    }
}
```

### 2. Update Laravel Controller

```php
<?php

namespace App\Http\Controllers;

use App\Services\AudioMasteringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AudioController extends Controller
{
    private AudioMasteringService $audioMasteringService;

    public function __construct(AudioMasteringService $audioMasteringService)
    {
        $this->audioMasteringService = $audioMasteringService;
    }

    public function requestMastering(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'file_url' => 'required|url',
            'target_format' => 'required|in:WAV,MP3,FLAC,AIFF,AAC,OGG',
            'target_sample_rate' => 'required|in:44100,48000,96000,192000',
            'genre' => 'required|in:Hip-Hop,Afrobeats,Gospel,Pop,Rock,Electronic,Jazz,Classical',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Get user and validate tier
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check tier permissions
        if (!$this->validateTierPermissions($user, $request->target_format, $request->target_sample_rate)) {
            return response()->json(['error' => 'Insufficient tier permissions'], 403);
        }

        // Deduct credits or charge payment
        if (!$this->processPayment($user, $request->target_format)) {
            return response()->json(['error' => 'Payment failed'], 402);
        }

        try {
            // Call Python microservice
            $result = $this->audioMasteringService->masterAudio([
                'user_id' => $user->id,
                'tier' => $user->tier,
                'genre' => $request->genre,
                'target_format' => $request->target_format,
                'target_sample_rate' => $request->target_sample_rate,
                'file_url' => $request->file_url,
                'target_lufs' => $request->get('target_lufs', -14.0)
            ]);

            // Store result in database
            $this->storeMasteringResult($user, $result, $request->all());

            return response()->json($result);

        } catch (\Exception $e) {
            // Refund credits on failure
            $this->refundPayment($user, $request->target_format);
            
            return response()->json([
                'error' => 'Mastering failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function validateTierPermissions($user, $format, $sampleRate): bool
    {
        $tierLimits = [
            'Free' => [
                'formats' => ['WAV', 'MP3'],
                'sample_rates' => [44100, 48000]
            ],
            'Pro' => [
                'formats' => ['WAV', 'MP3', 'FLAC', 'AIFF'],
                'sample_rates' => [44100, 48000, 96000]
            ],
            'Advanced' => [
                'formats' => ['WAV', 'MP3', 'FLAC', 'AIFF', 'AAC', 'OGG'],
                'sample_rates' => [44100, 48000, 96000, 192000]
            ]
        ];

        $userTier = $user->tier ?? 'Free';
        $limits = $tierLimits[$userTier] ?? $tierLimits['Free'];

        return in_array($format, $limits['formats']) && 
               in_array($sampleRate, $limits['sample_rates']);
    }

    private function processPayment($user, $format): bool
    {
        // Implement your existing payment logic
        // For Free tier: charge $2.99
        // For Pro/Advanced: deduct credits
        
        if ($user->tier === 'Free') {
            return $this->chargePaystack($user, 2.99);
        } else {
            return $this->deductCredits($user, $this->getCreditCost($format));
        }
    }

    private function storeMasteringResult($user, $result, $request): void
    {
        // Store in your existing database
        \DB::table('mastered_files')->insert([
            'user_id' => $user->id,
            'original_file_url' => $request['file_url'],
            'mastered_file_url' => $result['url'],
            'format' => $result['format'],
            'sample_rate' => $result['sample_rate'],
            'lufs' => $result['lufs'],
            'duration' => $result['duration'],
            'file_size' => $result['file_size'],
            'processing_time' => $result['processing_time'],
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
```

### 3. Configuration

Add to `config/services.php`:

```php
'audio_mastering' => [
    'url' => env('AUDIO_MASTERING_URL', 'http://localhost:8000'),
    'api_key' => env('AUDIO_MASTERING_API_KEY'),
],
```

Add to `.env`:

```env
AUDIO_MASTERING_URL=http://localhost:8000
AUDIO_MASTERING_API_KEY=your_api_key_here
```

### 4. Update Routes

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/audio/master', [AudioController::class, 'requestMastering']);
    Route::get('/audio/formats', [AudioController::class, 'getSupportedFormats']);
});
```

## Error Handling

The microservice returns standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid API key)
- `500`: Internal Server Error (processing failed)

## Deployment

### Development
```bash
# Start the microservice
cd audio-mastering-service
docker-compose up -d

# Or run directly
pip install -r requirements.txt
uvicorn main:app --reload
```

### Production
```bash
# Build and deploy
docker build -t audio-mastering-service .
docker run -d -p 8000:8000 audio-mastering-service
```

## Monitoring

The service provides health check endpoints for monitoring:

```bash
# Check service health
curl http://localhost:8000/health

# Check supported formats
curl http://localhost:8000/formats
```

## Security Considerations

1. **API Authentication**: Use API keys or JWT tokens
2. **Rate Limiting**: Implement rate limiting in Laravel
3. **File Validation**: Validate file URLs and sizes
4. **CORS**: Configure CORS appropriately for production
5. **HTTPS**: Use HTTPS in production

## Performance Optimization

1. **Queue System**: Use Laravel queues for async processing
2. **Caching**: Cache format/genre information
3. **Load Balancing**: Deploy multiple microservice instances
4. **Resource Limits**: Set appropriate memory/CPU limits

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install FFmpeg on the server
2. **Memory issues**: Increase Docker memory limits
3. **File download fails**: Check network connectivity and file URLs
4. **Processing timeout**: Increase timeout values

### Logs

Check logs in the `logs/` directory or Docker logs:

```bash
docker logs audio-mastering-service
```


