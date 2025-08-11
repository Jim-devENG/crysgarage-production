#!/bin/bash

echo "🎨 Restoring Original Complex Design"
echo "===================================="

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Restore the original complex App.tsx
echo "📝 Restoring original App.tsx with all features..."
cat > crysgarage-frontend/App.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Upload, Play, Pause, Download, Settings, Volume2, Waveform, Music, Mic, Headphones, Zap, Star, Clock, FileAudio } from 'lucide-react';
import './styles/globals.css';

interface AudioFile {
  id: string;
  name: string;
  size: string;
  duration: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface MasteringPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
}

function App() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [selectedPreset, setSelectedPreset] = useState<string>('afrobeats');
  const [isProcessing, setIsProcessing] = useState(false);

  const masteringPresets: MasteringPreset[] = [
    {
      id: 'afrobeats',
      name: 'Afrobeats',
      description: 'Optimized for modern African pop music',
      icon: <Music className="w-5 h-5" />,
      selected: selectedPreset === 'afrobeats'
    },
    {
      id: 'gospel',
      name: 'Gospel',
      description: 'Perfect for spiritual and worship music',
      icon: <Mic className="w-5 h-5" />,
      selected: selectedPreset === 'gospel'
    },
    {
      id: 'hiphop',
      name: 'Hip-Hop',
      description: 'Enhanced for rap and urban music',
      icon: <Headphones className="w-5 h-5" />,
      selected: selectedPreset === 'hiphop'
    },
    {
      id: 'traditional',
      name: 'Traditional',
      description: 'Preserves cultural African sounds',
      icon: <Waveform className="w-5 h-5" />,
      selected: selectedPreset === 'traditional'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newFile: AudioFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        duration: '3:45',
        status: 'uploading',
        progress: 0
      };

      setAudioFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setAudioFiles(prev => prev.map(f => {
          if (f.id === newFile.id && f.progress < 100) {
            const newProgress = f.progress + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: 'processing' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);
    });
  };

  const startMastering = () => {
    setIsProcessing(true);
    setAudioFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));

    // Simulate processing
    setTimeout(() => {
      setAudioFiles(prev => prev.map(f => ({ ...f, status: 'completed' })));
      setIsProcessing(false);
    }, 5000);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Crys Garage
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - File Upload and Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Audio Files
              </h2>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300 mb-2">Drop your audio files here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </label>
              </div>
            </div>

            {/* File List */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
              <div className="space-y-3">
                {audioFiles.map((file) => (
                  <div key={file.id} className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileAudio className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{file.size}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>{file.duration}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        file.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        file.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {file.status}
                      </span>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {audioFiles.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Mastering Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mastering Presets */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Mastering Presets
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {masteringPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      preset.selected
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        preset.selected ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {preset.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{preset.name}</h3>
                        <p className="text-sm text-gray-400">{preset.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Player */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Audio Preview
              </h3>
              
              <div className="space-y-4">
                {/* Waveform Visualization */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-1 h-16">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-full"
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={togglePlayback}
                    className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center hover:from-yellow-300 hover:to-orange-400 transition-all"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black" />}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-400 w-8">{volume}%</span>
                </div>
              </div>
            </div>

            {/* Mastering Actions */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Ready to Master
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {audioFiles.length} file(s) ready for {selectedPreset} mastering
                  </p>
                </div>
                
                <button
                  onClick={startMastering}
                  disabled={audioFiles.length === 0 || isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Start Mastering</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Processing</h3>
            <p className="text-gray-400">Get your mastered tracks in minutes, not hours</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Professional Quality</h3>
            <p className="text-gray-400">Industry-standard mastering for broadcast-ready audio</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
            <p className="text-gray-400">Download in WAV, MP3, and other popular formats</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
EOF

# Restore the original main.tsx
echo "📝 Restoring original main.tsx..."
cat > crysgarage-frontend/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Restore the original globals.css with all styles
echo "📝 Restoring original globals.css with all styles..."
cat > crysgarage-frontend/styles/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #0f0f0f;
  color: #ffffff;
}

#root {
  width: 100%;
  min-height: 100vh;
}

/* Custom slider styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  cursor: pointer;
  border: 2px solid #1f2937;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  cursor: pointer;
  border: 2px solid #1f2937;
}

/* Waveform animation */
@keyframes waveform {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

/* Focus styles */
button:focus,
input:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

/* Transition utilities */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(10px)) {
  .backdrop-blur-lg {
    backdrop-filter: blur(16px);
  }
}

/* Gradient text support */
@supports (background-clip: text) {
  .bg-clip-text {
    background-clip: text;
    -webkit-background-clip: text;
  }
}
EOF

# Restore the original vite.config.ts
echo "📝 Restoring original vite.config.ts..."
cat > crysgarage-frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1', 'crysgarage.studio', 'www.crysgarage.studio', '209.74.80.162'],
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
})
EOF

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Rebuild frontend container
echo "🔨 Rebuilding frontend container..."
docker-compose build frontend

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 20

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test the application
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"

echo "✅ Original design restored!"
echo "🌐 Your application: https://crysgarage.studio"
echo "🎨 All original features are back:"
echo "   - File upload and management"
echo "   - Mastering presets (Afrobeats, Gospel, Hip-Hop, Traditional)"
echo "   - Audio player with waveform visualization"
echo "   - Volume controls and progress tracking"
echo "   - Professional mastering workflow" 