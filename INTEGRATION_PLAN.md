# Crys Garage Integration Plan

## Overview

This document outlines the complete integration of the three main components:

- **Frontend**: React/TypeScript application
- **Backend**: Laravel PHP API
- **Ruby Service**: Audio processing engine

## Current Architecture

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   Frontend      │ ──────────────► │   Laravel       │ ──────────────► │   Ruby Audio    │
│   (React/TS)    │                 │   Backend       │                 │   Processor     │
│   Port: 5173    │                 │   Port: 8000    │                 │   Port: 4567    │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
```

## Integration Strategy

### 1. Unified Configuration Management

#### Environment Variables

Create a unified `.env` file at the root level:

```env
# Application
APP_NAME="Crys Garage"
APP_ENV=production
APP_URL=https://crysgarage.studio

# Frontend
VITE_API_URL=https://crysgarage.studio/api
VITE_RUBY_SERVICE_URL=https://crysgarage.studio:4567

# Backend
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
APP_KEY=base64:KRtGK//XKqZFWtzDwczbqrKu9tYBZZitqJ4cMPdI1BA=

# Ruby Service
RUBY_SERVICE_PORT=4567
RUBY_SERVICE_HOST=0.0.0.0
AUDIO_PROCESSING_TIMEOUT=300
MAX_FILE_SIZE=200

# Shared
CORS_ORIGINS=https://crysgarage.studio,http://localhost:5173
```

### 2. Service Communication Flow

#### Audio Processing Pipeline

```
1. User uploads audio → Frontend
2. Frontend → Laravel API (upload endpoint)
3. Laravel → Ruby Service (process endpoint)
4. Ruby Service → Laravel (status updates)
5. Laravel → Frontend (WebSocket/API updates)
6. Frontend displays results
```

#### Authentication Flow

```
1. User login → Frontend
2. Frontend → Laravel API (auth endpoint)
3. Laravel returns JWT token
4. Frontend stores token
5. All subsequent requests include token
```

### 3. Unified Deployment Strategy

#### Development Environment

- Frontend: `npm run dev` (Port 5173)
- Backend: `php artisan serve` (Port 8000)
- Ruby: `ruby mastering_server.rb` (Port 4567)

#### Production Environment

- Nginx reverse proxy
- Laravel backend as primary API
- Ruby service as internal audio processor
- Frontend served as static files

### 4. Data Flow Integration

#### File Upload Process

```typescript
// Frontend upload flow
const uploadAudio = async (file: File, genre: string, tier: string) => {
  // 1. Upload to Laravel
  const uploadResponse = await api.post("/upload", formData);
  const {audio_id} = uploadResponse.data;

  // 2. Start processing
  const processResponse = await api.post(`/mastering/${audio_id}/start`, {
    genre,
    tier,
    config: {
      /* processing options */
    },
  });

  // 3. Monitor progress
  return audio_id;
};
```

#### Laravel Backend Integration

```php
// Laravel controller handling Ruby service communication
public function startMastering($audioId, Request $request)
{
    // 1. Get audio file path
    $audioPath = storage_path("app/uploads/{$audioId}.wav");

    // 2. Call Ruby service
    $rubyResponse = Http::post('http://localhost:4567/process', [
        'input_file' => $audioPath,
        'genre' => $request->genre,
        'tier' => $request->tier,
        'config' => $request->config
    ]);

    // 3. Store session info
    $sessionId = $rubyResponse->json('session_id');

    // 4. Update database
    Audio::where('id', $audioId)->update([
        'status' => 'processing',
        'session_id' => $sessionId
    ]);

    return response()->json(['session_id' => $sessionId]);
}
```

#### Ruby Service Integration

```ruby
# Ruby service processing endpoint
post '/process' do
  content_type :json

  # 1. Parse request
  request_payload = JSON.parse(request.body.read)

  # 2. Process audio
  result = @@mastering_engine.process_audio(
    request_payload['input_file'],
    request_payload['config']
  )

  # 3. Return session info
  {
    success: true,
    session_id: result[:session_id],
    output_files: result[:output_files]
  }.to_json
end
```

### 5. Error Handling & Monitoring

#### Unified Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "AUDIO_PROCESSING_FAILED",
    "message": "Audio processing failed due to invalid format",
    "details": {
      "file_size": "50MB",
      "max_allowed": "100MB"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Health Check Endpoints

- Frontend: `GET /health` (returns build info)
- Backend: `GET /api/health` (returns service status)
- Ruby: `GET /health` (returns processing status)

### 6. Security Integration

#### CORS Configuration

```php
// Laravel CORS config
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://crysgarage.studio',
        'http://localhost:5173'
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

#### Authentication Flow

```typescript
// Frontend auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crysgarage_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 7. Performance Optimization

#### File Processing Optimization

- Implement chunked uploads for large files
- Use background jobs for audio processing
- Implement caching for processed results
- Add progress tracking with WebSockets

#### Database Optimization

- Use database transactions for data consistency
- Implement proper indexing for audio records
- Add database connection pooling

### 8. Testing Strategy

#### Integration Tests

```php
// Laravel integration test
public function test_audio_processing_flow()
{
    // 1. Upload audio file
    $response = $this->post('/api/upload', [
        'audio' => UploadedFile::fake()->create('test.wav', 1024)
    ]);

    // 2. Start processing
    $audioId = $response->json('audio_id');
    $processResponse = $this->post("/api/mastering/{$audioId}/start");

    // 3. Check status
    $statusResponse = $this->get("/api/status/{$audioId}");

    $this->assertEquals('processing', $statusResponse->json('status'));
}
```

### 9. Deployment Checklist

#### Pre-deployment

- [ ] All services tested locally
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Nginx configuration updated

#### Post-deployment

- [ ] Health checks passing
- [ ] File uploads working
- [ ] Audio processing functional
- [ ] Authentication working
- [ ] Error monitoring active

### 10. Monitoring & Logging

#### Unified Logging

```php
// Laravel logging to Ruby service
Log::channel('audio_processing')->info('Audio processing started', [
    'audio_id' => $audioId,
    'user_id' => $userId,
    'genre' => $genre,
    'tier' => $tier
]);
```

#### Performance Monitoring

- Track processing times
- Monitor file upload success rates
- Alert on service failures
- Monitor resource usage

## Implementation Steps

1. **Phase 1**: Unified configuration and environment setup
2. **Phase 2**: Service communication integration
3. **Phase 3**: Error handling and monitoring
4. **Phase 4**: Performance optimization
5. **Phase 5**: Testing and deployment

## Success Metrics

- Audio processing success rate > 95%
- Average processing time < 5 minutes
- API response time < 500ms
- Zero data loss during processing
- 99.9% uptime for all services
