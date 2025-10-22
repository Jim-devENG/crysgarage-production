import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, ArrowLeft, RotateCcw, Activity, Zap, BarChart3 } from 'lucide-react';
import DownloadStep from './DownloadStep';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface ComparisonPlayerProps {
  originalFile: AudioFile | null;
  masteredAudioUrl: string | null;
  selectedGenre: Genre | null;
  mlSummary?: any;
  appliedParams?: any;
  originalLufs?: number;
  masteredLufs?: number;
  onBack: () => void;
  onNewUpload: () => void;
  onDownload: () => void | Promise<void>;
  downloadFormat: 'mp3' | 'wav16' | 'wav24';
  onFormatChange: (format: 'mp3' | 'wav16' | 'wav24') => void;
  downloadSampleRate: 44100 | 48000;
  onSampleRateChange: (sr: 44100 | 48000) => void;
  tier: string;
}

const ComparisonPlayerFixed: React.FC<ComparisonPlayerProps> = ({
  originalFile,
  masteredAudioUrl,
  selectedGenre,
  mlSummary,
  appliedParams,
  originalLufs,
  masteredLufs,
  onBack,
  onNewUpload,
  onDownload,
  downloadFormat,
  onFormatChange,
  downloadSampleRate,
  onSampleRateChange,
  tier
}) => {
  // Web Audio API implementation for seamless A/B switching
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSource, setActiveSource] = useState<'original' | 'mastered'>('original');
  const [isDownloading, setIsDownloading] = useState(false);

  // Audio elements and Web Audio context
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const masteredSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const originalGainRef = useRef<GainNode | null>(null);
  const masteredGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize Web Audio API
  const initializeWebAudio = async () => {
    if (isInitializedRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      masterGainRef.current.gain.value = 1.0;

      // Create gain nodes for each source
      originalGainRef.current = audioContextRef.current.createGain();
      masteredGainRef.current = audioContextRef.current.createGain();
      
      originalGainRef.current.connect(masterGainRef.current);
      masteredGainRef.current.connect(masterGainRef.current);

      // Set initial gains (original active, mastered muted)
      originalGainRef.current.gain.value = 1.0;
      masteredGainRef.current.gain.value = 0.0;

      isInitializedRef.current = true;
      console.log('Web Audio API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
    }
  };

  // Setup audio sources
  const setupAudioSources = () => {
    if (!audioContextRef.current || !originalGainRef.current || !masteredGainRef.current) return;

    // Setup original audio source
    if (originalAudioRef.current && !originalSourceRef.current) {
      try {
        originalSourceRef.current = audioContextRef.current.createMediaElementSource(originalAudioRef.current);
        originalSourceRef.current.connect(originalGainRef.current);
        console.log('Original audio source connected');
      } catch (error) {
        console.error('Failed to setup original audio source:', error);
      }
    }

    // Setup mastered audio source
    if (masteredAudioRef.current && !masteredSourceRef.current) {
      try {
        masteredSourceRef.current = audioContextRef.current.createMediaElementSource(masteredAudioRef.current);
        masteredSourceRef.current.connect(masteredGainRef.current);
        console.log('Mastered audio source connected');
      } catch (error) {
        console.error('Failed to setup mastered audio source:', error);
      }
    }
  };

  // Crossfade between sources
  const crossfadeTo = (targetSource: 'original' | 'mastered', duration: number = 0.1) => {
    if (!audioContextRef.current || !originalGainRef.current || !masteredGainRef.current) return;

    const currentTime = audioContextRef.current.currentTime;
    const originalGain = originalGainRef.current.gain;
    const masteredGain = masteredGainRef.current.gain;

    if (targetSource === 'original') {
      // Fade out mastered, fade in original
      masteredGain.cancelScheduledValues(currentTime);
      masteredGain.setValueAtTime(masteredGain.value, currentTime);
      masteredGain.linearRampToValueAtTime(0.0, currentTime + duration);

      originalGain.cancelScheduledValues(currentTime);
      originalGain.setValueAtTime(originalGain.value, currentTime);
      originalGain.linearRampToValueAtTime(1.0, currentTime + duration);
    } else {
      // Fade out original, fade in mastered
      originalGain.cancelScheduledValues(currentTime);
      originalGain.setValueAtTime(originalGain.value, currentTime);
      originalGain.linearRampToValueAtTime(0.0, currentTime + duration);

      masteredGain.cancelScheduledValues(currentTime);
      masteredGain.setValueAtTime(masteredGain.value, currentTime);
      masteredGain.linearRampToValueAtTime(1.0, currentTime + duration);
    }

    setActiveSource(targetSource);
  };

  // Sync currentTime between both audio elements
  const syncCurrentTime = (sourceTime: number) => {
    if (activeSource === 'original' && masteredAudioRef.current) {
      masteredAudioRef.current.currentTime = sourceTime;
    } else if (activeSource === 'mastered' && originalAudioRef.current) {
      originalAudioRef.current.currentTime = sourceTime;
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeWebAudio();
  }, []);

  // Setup audio sources when URLs are available
  useEffect(() => {
    if (isInitializedRef.current) {
      setupAudioSources();
    }
  }, [originalFile?.url, masteredAudioUrl]);

  // Audio event handlers
  useEffect(() => {
    const originalAudio = originalAudioRef.current;
    const masteredAudio = masteredAudioRef.current;

    if (originalAudio) {
      const handleTimeUpdate = () => {
        if (activeSource === 'original') {
          setCurrentTime(originalAudio.currentTime);
          syncCurrentTime(originalAudio.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(originalAudio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      originalAudio.addEventListener('timeupdate', handleTimeUpdate);
      originalAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
      originalAudio.addEventListener('ended', handleEnded);

      return () => {
        originalAudio.removeEventListener('timeupdate', handleTimeUpdate);
        originalAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        originalAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, [activeSource]);

  useEffect(() => {
    const masteredAudio = masteredAudioRef.current;

    if (masteredAudio) {
      const handleTimeUpdate = () => {
        if (activeSource === 'mastered') {
          setCurrentTime(masteredAudio.currentTime);
          syncCurrentTime(masteredAudio.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        if (!duration) setDuration(masteredAudio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      masteredAudio.addEventListener('timeupdate', handleTimeUpdate);
      masteredAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
      masteredAudio.addEventListener('ended', handleEnded);

      return () => {
        masteredAudio.removeEventListener('timeupdate', handleTimeUpdate);
        masteredAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        masteredAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, [activeSource, duration]);

  // Play/pause handler
  const handlePlayPause = async () => {
    if (!audioContextRef.current) {
      await initializeWebAudio();
    }

    const originalAudio = originalAudioRef.current;
    const masteredAudio = masteredAudioRef.current;

    if (isPlaying) {
      // Pause both
      if (originalAudio) originalAudio.pause();
      if (masteredAudio) masteredAudio.pause();
      setIsPlaying(false);
    } else {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Start both audio elements (they're connected to gain nodes)
      if (originalAudio) {
        originalAudio.currentTime = currentTime;
        await originalAudio.play();
      }
      if (masteredAudio) {
        masteredAudio.currentTime = currentTime;
        await masteredAudio.play();
      }
      setIsPlaying(true);
    }
  };

  // Switch to original
  const switchToOriginal = () => {
    crossfadeTo('original');
  };

  // Switch to mastered
  const switchToMastered = () => {
    crossfadeTo('mastered');
  };

  // Seek handler
  const handleSeek = (newTime: number) => {
    const originalAudio = originalAudioRef.current;
    const masteredAudio = masteredAudioRef.current;

    if (originalAudio) originalAudio.currentTime = newTime;
    if (masteredAudio) masteredAudio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crys-dark text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-crys-gold hover:text-crys-gold-light transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Upload</span>
            </button>
            <div className="h-6 w-px bg-gray-600" />
            <h1 className="text-2xl font-bold">A/B Comparison</h1>
          </div>
          <button
            onClick={onNewUpload}
            className="flex items-center space-x-2 bg-crys-gold text-crys-dark px-4 py-2 rounded-lg hover:bg-crys-gold-light transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Upload</span>
          </button>
        </div>

        {/* Genre Info */}
        {selectedGenre && (
          <div className="mb-8 p-6 bg-crys-dark-light rounded-xl border border-crys-gold/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${selectedGenre.color}`} />
              <h2 className="text-xl font-semibold">{selectedGenre.name}</h2>
            </div>
            <p className="text-gray-300">{selectedGenre.description}</p>
          </div>
        )}

        {/* A/B Switch Controls */}
        <div className="mb-8 p-6 bg-crys-dark-light rounded-xl border border-crys-gold/20">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={switchToOriginal}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeSource === 'original'
                  ? 'bg-crys-gold text-crys-dark'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Original Audio
            </button>
            <button
              onClick={switchToMastered}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeSource === 'mastered'
                  ? 'bg-crys-gold text-crys-dark'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Mastered Audio
            </button>
          </div>

          {/* Unified Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-crys-gold text-crys-dark rounded-full flex items-center justify-center hover:bg-crys-gold-light transition-colors"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
          </div>
        </div>

        {/* Audio Elements (Hidden) */}
        <div style={{ display: 'none' }}>
          <audio
            ref={originalAudioRef}
            src={originalFile?.url}
            preload="auto"
            playsInline
            crossOrigin="anonymous"
          />
          <audio
            ref={masteredAudioRef}
            src={masteredAudioUrl || undefined}
            preload="auto"
            playsInline
            crossOrigin="anonymous"
          />
        </div>

        {/* Audio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Original Audio Stats */}
          <div className="p-6 bg-crys-dark-light rounded-xl border border-crys-gold/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Original Audio
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">LUFS:</span>
                <span className="text-crys-gold">{originalLufs?.toFixed(1) || 'N/A'} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={activeSource === 'original' ? 'text-green-400' : 'text-gray-400'}>
                  {activeSource === 'original' ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>

          {/* Mastered Audio Stats */}
          <div className="p-6 bg-crys-dark-light rounded-xl border border-crys-gold/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Mastered Audio
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">LUFS:</span>
                <span className="text-crys-gold">{masteredLufs?.toFixed(1) || 'N/A'} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={activeSource === 'mastered' ? 'text-green-400' : 'text-gray-400'}>
                  {activeSource === 'mastered' ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ML Analysis */}
        {mlSummary && (
          <div className="mb-8 p-6 bg-crys-dark-light rounded-xl border border-crys-gold/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              ML Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mlSummary.map((item: any, index: number) => (
                <div key={index} className="p-4 bg-crys-dark rounded-lg">
                  <div className="font-medium text-crys-gold">{item.area}</div>
                  <div className="text-sm text-gray-300">{item.action}</div>
                  {item.reason && (
                    <div className="text-xs text-gray-400 mt-1">{item.reason}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Section */}
        <div className="p-6 bg-crys-dark-light rounded-xl border border-crys-gold/20">
          <DownloadStep
            downloadFormat={downloadFormat}
            onFormatChange={onFormatChange}
            onDownload={handleDownload}
            isDownloading={isDownloading}
            originalFile={originalFile?.file}
            processedAudioUrl={masteredAudioUrl}
            genre={selectedGenre?.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ComparisonPlayerFixed;
