# Crys Garage Audio Mastering Engine

🎵 **Professional audio mastering with African music focus**

A Ruby-based audio mastering engine designed specifically for African music genres including Afrobeats, Gospel, Hip-Hop, and Highlife. Built for the Crys Garage platform to provide professional-quality audio mastering with cultural understanding.

## 🚀 Features

### **Genre-Specific Processing**

- **Afrobeats**: Optimized bass boost, kick drum enhancement, vocal clarity
- **Gospel**: Warm lows, vocal presence, choir clarity, organ enhancement
- **Hip-Hop**: Bass boost, kick punch, snare crack, vocal clarity
- **Highlife**: Percussion enhancement, guitar clarity, brass presence

### **Multi-Tier Support**

- **Free Tier**: Basic processing with MP3 output
- **Professional Tier**: Advanced processing with multiple formats
- **Advanced Tier**: Manual controls with unlimited processing

### **Professional Audio Processing**

- Noise reduction with spectral subtraction
- Multi-band EQ adjustment (10 bands)
- Dynamic compression with lookahead
- Stereo enhancement with phase correction
- True peak limiting with oversampling
- EBU R128 loudness normalization

## 📋 Requirements

### **System Requirements**

- Ruby 3.0 or higher
- Windows 10/11, macOS, or Linux
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

### **Ruby Installation**

#### **Windows**

1. Download RubyInstaller from https://rubyinstaller.org/downloads/
2. Run the installer with these options:
   - ✅ Add Ruby executables to your PATH
   - ✅ Associate .rb and .rbw files with this Ruby installation
   - ✅ Use UTF-8 as default external encoding

#### **macOS**

```bash
# Using Homebrew
brew install ruby

# Or using rbenv
brew install rbenv
rbenv install 3.2.2
rbenv global 3.2.2
```

#### **Linux (Ubuntu/Debian)**

```bash
sudo apt update
sudo apt install ruby-full
```

## 🛠️ Installation

1. **Clone or download the project**
2. **Navigate to the crysgarage-ruby directory**
3. **Verify Ruby installation**:
   ```bash
   ruby --version
   ```

## 📖 Usage

### **Basic Usage**

```bash
# Process an audio file with default settings
ruby master_audio.rb input.wav

# Process with specific genre
ruby master_audio.rb input.wav --genre afrobeats

# Process with specific tier
ruby master_audio.rb input.wav --tier professional

# Process with custom LUFS target
ruby master_audio.rb input.wav --lufs -16.0

# Load custom configuration
ruby master_audio.rb input.wav --config custom_config.json
```

### **Command Line Options**

| Option     | Description                                      | Default      |
| ---------- | ------------------------------------------------ | ------------ |
| `--genre`  | Set genre (afrobeats, gospel, hip_hop, highlife) | afrobeats    |
| `--tier`   | Set tier (free, professional, advanced)          | professional |
| `--lufs`   | Set target LUFS value                            | -14.0        |
| `--config` | Load configuration from JSON file                | config.json  |

### **Supported File Formats**

**Input Formats:**

- WAV (16-bit, 24-bit)
- MP3 (128kbps - 320kbps)
- FLAC (lossless)
- AIFF (16-bit, 24-bit)

**Output Formats:**

- WAV (24-bit, 44.1kHz/48kHz)
- MP3 (320kbps)
- FLAC (lossless)
- AIFF (24-bit)

## 🎛️ Configuration

### **Genre Configurations**

Each genre has optimized settings for the best results:

#### **Afrobeats**

- Low bass boost: +2.0dB
- Kick drum enhancement: +1.5dB
- Vocal clarity: +1.0dB
- High-end sparkle: +0.5dB
- Compression ratio: 3:1
- Stereo width: 1.2x

#### **Gospel**

- Warm lows: +1.5dB
- Vocal presence: +2.0dB
- Choir clarity: +1.5dB
- Organ enhancement: +1.0dB
- Compression ratio: 2.5:1
- Stereo width: 1.1x

#### **Hip-Hop**

- Bass boost: +3.0dB
- Kick punch: +2.0dB
- Snare crack: +1.5dB
- Vocal clarity: +1.0dB
- Compression ratio: 4:1
- Stereo width: 1.3x

#### **Highlife**

- Percussion enhancement: +1.8dB
- Guitar clarity: +1.2dB
- Brass presence: +1.5dB
- Vocal warmth: +1.0dB
- Compression ratio: 2.8:1
- Stereo width: 1.15x

## 📊 Processing Pipeline

The mastering engine follows a professional processing chain:

1. **Noise Reduction** - Spectral subtraction algorithm
2. **EQ Adjustment** - 10-band parametric equalizer
3. **Compression** - Multi-band dynamic compression
4. **Stereo Enhancement** - Width and phase correction
5. **Limiting** - True peak limiting with oversampling
6. **Loudness Normalization** - EBU R128 compliance

## 📁 Output Structure

```
output/
└── {session_id}/
    ├── {filename}_mastered.wav
    ├── {filename}_mastered.mp3
    ├── {filename}_mastered.flac
    └── {filename}_metadata.json
```

## 📝 Logging

All processing activities are logged to:

```
logs/crysgarage_YYYY-MM-DD.log
```

Log entries include:

- Processing start/end times
- Audio analysis results
- Processing step completion
- Error messages and debugging info

## 🔧 Integration with Crys Garage Platform

This Ruby engine is designed to integrate with the Crys Garage web platform:

### **API Integration**

- JSON-based configuration
- Session-based processing
- Progress tracking
- Error handling

### **Web Platform Features**

- Real-time processing status
- Genre-specific presets
- Tier-based limitations
- Download management

## 🧪 Testing

### **Test Audio Files**

Create test files to verify processing:

```bash
# Test with different genres
ruby master_audio.rb test_afrobeats.wav --genre afrobeats
ruby master_audio.rb test_gospel.wav --genre gospel
ruby master_audio.rb test_hiphop.wav --genre hip_hop
```

### **Validation**

- File format validation
- Size limits (50MB-200MB based on tier)
- Processing time tracking
- Output quality verification

## 🐛 Troubleshooting

### **Common Issues**

**Ruby not found:**

```bash
# Windows - Add Ruby to PATH
# macOS/Linux - Install Ruby via package manager
```

**File format errors:**

- Ensure input files are WAV, MP3, FLAC, or AIFF
- Check file size limits for your tier
- Verify file integrity

**Processing errors:**

- Check available disk space
- Ensure sufficient RAM
- Review log files for detailed error messages

## 📈 Performance

### **Processing Times**

- **Free Tier**: ~30-60 seconds
- **Professional Tier**: ~60-120 seconds
- **Advanced Tier**: ~90-180 seconds

### **Resource Usage**

- **CPU**: 2-4 cores recommended
- **RAM**: 4-8GB recommended
- **Storage**: 2GB free space minimum

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Crys Garage platform and is proprietary software.

## 🎵 About Crys Garage

Crys Garage is a professional audio mastering platform focused on African music styles. Our engine combines traditional mastering techniques with cultural understanding to deliver exceptional results for Afrobeats, Gospel, Hip-Hop, and other African music genres.

**"Craft the sound, Unleash the future"** 🎶

---

_For support and questions, contact the Crys Garage development team._
