# Audio Mastering Microservice

A professional-grade FastAPI-based microservice for AI-powered audio mastering and format conversion, designed to integrate with your existing Laravel backend.

## 🎯 Features

- **AI-Powered Mastering**: Genre-specific EQ, compression, and loudness normalization
- **Multi-Format Support**: WAV, MP3, FLAC, AIFF, AAC, OGG conversion
- **Sample Rate Conversion**: 44.1kHz, 48kHz, 96kHz, 192kHz support
- **Tier-Based Processing**: Different quality levels for Free, Pro, and Advanced users
- **LUFS Normalization**: Industry-standard loudness targeting
- **Scalable Architecture**: Stateless design for horizontal scaling
- **Storage Integration**: S3 or local storage support
- **Comprehensive API**: RESTful endpoints with detailed documentation

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Laravel API    │    │  Python Service │
│                 │    │                  │    │                 │
│ • Upload UI     │───▶│ • Auth & Tiers   │───▶│ • ML Mastering  │
│ • Download UI   │    │ • Payment Logic  │    │ • Format Conv   │
│ • Preview UI    │    │ • File Metadata  │    │ • Storage Mgmt  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- FFmpeg
- Docker (optional)

### Installation

1. **Clone and setup**:
```bash
git clone <repository>
cd audio-mastering-service
pip install -r requirements.txt
```

2. **Install FFmpeg**:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run the service**:
```bash
uvicorn main:app --reload
```

### Docker Deployment

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t audio-mastering-service .
docker run -p 8000:8000 audio-mastering-service
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com`

### Interactive Docs
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

#### 1. Health Check
```http
GET /health
```

#### 2. Master Audio
```http
POST /master
Content-Type: application/json

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

#### 3. Get Supported Formats
```http
GET /formats
```

## 🎵 Genre Presets

The service includes AI-powered mastering presets for:

- **Hip-Hop**: Enhanced bass, punchy drums, bright highs
- **Afrobeats**: Warm low-end, crisp percussion, vocal clarity
- **Gospel**: Balanced dynamics, clear vocals, warm presence
- **Pop**: Commercial loudness, bright top-end, punchy mids
- **Rock**: Aggressive compression, enhanced guitars, tight low-end
- **Electronic**: Deep bass, wide stereo, crisp transients
- **Jazz**: Natural dynamics, warm tone, minimal processing
- **Classical**: Preserve dynamics, natural reverb, minimal EQ

## 🎚️ Tier Capabilities

### Free Tier
- Formats: WAV, MP3
- Sample Rates: 44.1kHz, 48kHz
- Processing: Basic mastering
- Max File Size: 50MB

### Pro Tier
- Formats: WAV, MP3, FLAC, AIFF
- Sample Rates: 44.1kHz, 48kHz, 96kHz
- Processing: Advanced mastering + stereo widening
- Max File Size: 200MB

### Advanced Tier
- Formats: All formats (WAV, MP3, FLAC, AIFF, AAC, OGG)
- Sample Rates: All rates (44.1kHz, 48kHz, 96kHz, 192kHz)
- Processing: Premium mastering + all advanced features
- Max File Size: 500MB

## 🔧 Configuration

### Environment Variables

```env
# Storage
STORAGE_TYPE=local  # or 's3'
LOCAL_STORAGE_PATH=/tmp/mastered_audio
S3_BUCKET=your-bucket
S3_REGION=us-east-1

# Service
BASE_URL=http://localhost:8000
LOG_LEVEL=INFO
MAX_FILE_SIZE_MB=500

# Audio Processing
DEFAULT_TARGET_LUFS=-14.0
DEFAULT_SAMPLE_RATE=44100

# Security
CORS_ORIGINS=["http://localhost:3000"]
API_KEY=your-secret-key
```

### Storage Options

#### Local Storage
```env
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=/path/to/storage
```

#### S3 Storage
```env
STORAGE_TYPE=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## 🧪 Testing

### Run Tests
```bash
python test_service.py
```

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Get formats
curl http://localhost:8000/formats

# Test mastering (replace with actual file URL)
curl -X POST http://localhost:8000/master \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "tier": "Pro",
    "genre": "Afrobeats",
    "target_format": "WAV",
    "target_sample_rate": 44100,
    "file_url": "https://example.com/audio.wav"
  }'
```

## 🔗 Laravel Integration

See [LARAVEL_INTEGRATION.md](LARAVEL_INTEGRATION.md) for detailed integration instructions.

### Quick Integration

1. **Install HTTP client**:
```bash
composer require guzzlehttp/guzzle
```

2. **Create service class**:
```php
class AudioMasteringService
{
    public function masterAudio(array $data): array
    {
        $response = Http::post('http://localhost:8000/master', $data);
        return $response->json();
    }
}
```

3. **Update controller**:
```php
public function requestMastering(Request $request)
{
    $result = $this->audioMasteringService->masterAudio([
        'user_id' => auth()->id(),
        'tier' => auth()->user()->tier,
        'genre' => $request->genre,
        'target_format' => $request->format,
        'target_sample_rate' => $request->sample_rate,
        'file_url' => $request->file_url
    ]);
    
    return response()->json($result);
}
```

## 📊 Monitoring

### Health Checks
```bash
# Service health
curl http://localhost:8000/health

# Docker health
docker ps
docker logs audio-mastering-service
```

### Logs
```bash
# Application logs
tail -f logs/audio_mastering_*.log

# Docker logs
docker logs -f audio-mastering-service
```

### Metrics
- Processing time per request
- Success/failure rates
- File size distributions
- Genre processing statistics

## 🚀 Production Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  audio-mastering:
    image: audio-mastering-service:latest
    ports:
      - "8000:8000"
    environment:
      - STORAGE_TYPE=s3
      - S3_BUCKET=your-production-bucket
    restart: unless-stopped
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: audio-mastering
spec:
  replicas: 3
  selector:
    matchLabels:
      app: audio-mastering
  template:
    metadata:
      labels:
        app: audio-mastering
    spec:
      containers:
      - name: audio-mastering
        image: audio-mastering-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: STORAGE_TYPE
          value: "s3"
```

### Load Balancing
```nginx
upstream audio_mastering {
    server audio-mastering-1:8000;
    server audio-mastering-2:8000;
    server audio-mastering-3:8000;
}

server {
    location /master {
        proxy_pass http://audio_mastering;
        proxy_timeout 300s;
    }
}
```

## 🔒 Security

### API Authentication
```python
# Add to main.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    if token.credentials != "your-secret-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    return token

# Apply to endpoints
@app.post("/master", dependencies=[Depends(verify_token)])
```

### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/master")
@limiter.limit("10/minute")
async def master_audio(request: Request, ...):
```

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```bash
   # Install FFmpeg
   sudo apt install ffmpeg
   # Or add to Dockerfile
   RUN apt-get update && apt-get install -y ffmpeg
   ```

2. **Memory issues**
   ```bash
   # Increase Docker memory
   docker run -m 4g audio-mastering-service
   ```

3. **File download fails**
   - Check network connectivity
   - Verify file URLs are accessible
   - Check file size limits

4. **Processing timeout**
   ```python
   # Increase timeout in client
   timeout=aiohttp.ClientTimeout(total=300)
   ```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
uvicorn main:app --reload --log-level debug
```

## 📈 Performance Optimization

### Horizontal Scaling
```bash
# Run multiple instances
docker run -p 8001:8000 audio-mastering-service &
docker run -p 8002:8000 audio-mastering-service &
docker run -p 8003:8000 audio-mastering-service &
```

### Caching
```python
# Add Redis caching
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Cache genre presets
@lru_cache(maxsize=128)
def get_genre_preset(genre: str):
    return self.genre_presets.get(genre)
```

### Resource Limits
```yaml
# Docker Compose
services:
  audio-mastering:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and LARAVEL_INTEGRATION.md
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions

## 🎉 Acknowledgments

- **Librosa**: Audio analysis and processing
- **FFmpeg**: Audio format conversion
- **FastAPI**: Modern web framework
- **TensorFlow/PyTorch**: Machine learning capabilities

---

**Built with ❤️ for the Crys Garage audio mastering platform**


