# 🎵 Ruby Mastering API - Quick Reference

## 🚀 Quick Start

```bash
cd crysgarage-ruby
start_enhanced_server.bat
# Server runs on http://localhost:4567
```

## 🌐 API Endpoints

| Endpoint                  | Method | Description             |
| ------------------------- | ------ | ----------------------- |
| `/health`                 | GET    | Check server status     |
| `/process`                | POST   | Process audio file      |
| `/status/{id}`            | GET    | Check processing status |
| `/download/{id}/{format}` | GET    | Download processed file |

## 📝 Process Audio Request

```json
POST http://localhost:4567/process
{
  "file_path": "/path/to/audio.wav",
  "audio_id": "unique-id",
  "genre": "hip_hop",
  "tier": "professional",
  "config": {
    "target_lufs": -8.0,
    "true_peak": -0.3
  }
}
```

## 🎵 Supported Genres

- **hip_hop** - Bass boost, kick punch, vocal clarity
- **r_b** - Warm lows, vocal presence, mid clarity
- **afrobeats** - Low bass boost, kick drum enhance

## ⚙️ Configuration

```ruby
{
  sample_rate: 44100,
  bit_depth: 24,
  target_lufs: -8.0,      # Commercial loudness
  true_peak: -0.3,        # Tight limiting
  genre: 'hip_hop',       # Default genre
  tier: 'professional'
}
```

## 🔧 Processing Pipeline

1. **Noise Reduction** - Remove background noise
2. **EQ Adjustment** - Genre-specific shaping
3. **Compression** - Dynamic range control
4. **Stereo Enhancement** - Width and imaging
5. **Limiting** - Peak control
6. **Loudness Normalization** - LUFS targeting

## 📊 Response Format

```json
{
  "success": true,
  "session_id": "uuid",
  "output_files": {
    "wav": "/path/to/mastered.wav",
    "mp3": "/path/to/mastered.mp3",
    "flac": "/path/to/mastered.flac"
  },
  "metadata": {
    "final_lufs": -8.0,
    "dynamic_range": 6.5,
    "genre": "hip_hop"
  }
}
```

## 💻 Frontend Integration

```javascript
// Upload and process
const response = await fetch("http://localhost:4567/process", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    file_path: filePath,
    audio_id: audioId,
    genre: "hip_hop",
  }),
});

// Check status
const status = await fetch(`http://localhost:4567/status/${sessionId}`);

// Download result
window.open(`http://localhost:4567/download/${sessionId}/wav`);
```

## 🔍 Health Check

```bash
curl http://localhost:4567/health
```

Response:

```json
{
  "status": "ok",
  "enhanced_processing": true,
  "real_file_analysis": true,
  "genre_specific_processing": true
}
```

## 📁 File Structure

```
crysgarage-ruby/
├── mastering_server.rb          # HTTP server
├── enhanced_audio_processor.rb  # Processing engine
├── Gemfile                      # Dependencies
├── start_enhanced_server.bat    # Startup script
├── output/                      # Generated files
├── logs/                        # Processing logs
└── temp/                        # Temp files
```

## 🎯 Key Features

- ✅ Real file analysis and processing
- ✅ Pure Ruby (no external C-extensions)
- ✅ Genre-specific optimization
- ✅ LUFS -8 commercial loudness
- ✅ Multiple output formats
- ✅ Session management
- ✅ Comprehensive logging

## 🚨 Troubleshooting

- **Port 4567 in use:** Change port in `mastering_server.rb`
- **Ruby not found:** Install Ruby 3.4+ and add to PATH
- **Bundler missing:** `gem install bundler`
- **File permissions:** Ensure write access to output/, logs/, temp/

## 📞 Support

- Check logs in `logs/crysgarage_enhanced_*.log`
- Health endpoint: `http://localhost:4567/health`
- Server logs appear in console output
