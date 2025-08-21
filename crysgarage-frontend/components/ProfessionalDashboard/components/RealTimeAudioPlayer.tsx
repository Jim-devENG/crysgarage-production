import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Zap } from 'lucide-react';
import { GENRE_PRESETS } from '../utils/genrePresets';
import FrequencySpectrum from '../../FrequencySpectrum';

interface AudioEffects {
  eq: {
    low: number;
    mid: number;
    high: number;
    enabled: boolean;
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    enabled: boolean;
  };
  loudness: {
    volume: number;
    enabled: boolean;
  };
  limiter: {
    threshold: number;
    ceiling: number;
    enabled: boolean;
  };
}

interface RealTimeAudioPlayerProps {
  audioFile: File | null;
  selectedGenre: any;
  onGenreChange: (genre: any) => void;
  className?: string;
}

// SINGLETON AUDIO MANAGER - BULLETPROOF SOLUTION
class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqNodes: BiquadFilterNode[] = [];
  private compressor: DynamicsCompressorNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private isInitialized = false;
  private currentFileId: string | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(audioFile: File): Promise<boolean> {
    const fileId = `${audioFile.name}-${audioFile.size}-${audioFile.lastModified}`;
    
    // If same file, don't reinitialize
    if (this.currentFileId === fileId && this.isInitialized) {
      console.log('✅ Audio manager already initialized for this file');
      return true;
    }

    console.log('=== INITIALIZING AUDIO MANAGER ===');
    
    // Complete cleanup
    await this.cleanup();
    
    try {
      // Create fresh audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create audio element
      const audioUrl = URL.createObjectURL(audioFile);
      this.audioElement = document.createElement('audio');
      this.audioElement.src = audioUrl;
      this.audioElement.preload = 'metadata';
      this.audioElement.style.display = 'none';
      this.audioElement.crossOrigin = 'anonymous';
      // Ensure browser begins loading the resource
      try {
        this.audioElement.load();
      } catch (e) {
        console.log('Audio load() call error (safe to ignore in some browsers):', e);
      }

      // Wait for media to be ready enough to build the graph
      await new Promise((resolve, reject) => {
        const onReady = () => { cleanup(); resolve(null as any); };
        const onError = () => { cleanup(); reject(new Error('Audio metadata failed to load')); };
        const timeout = setTimeout(() => { cleanup(); resolve(null as any); }, 3000);
        const cleanup = () => {
          clearTimeout(timeout);
          if (!this.audioElement) return;
          this.audioElement.removeEventListener('loadedmetadata', onReady as any);
          this.audioElement.removeEventListener('canplay', onReady as any);
          this.audioElement.removeEventListener('error', onError as any);
        };
        this.audioElement!.addEventListener('loadedmetadata', onReady as any, { once: true } as any);
        this.audioElement!.addEventListener('canplay', onReady as any, { once: true } as any);
        this.audioElement!.addEventListener('error', onError as any, { once: true } as any);
      });

      // Create MediaElementSource BEFORE appending to DOM
      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      
      // Now append to DOM
      let container = document.getElementById('audio-manager-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'audio-manager-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      container.appendChild(this.audioElement);

      // Create processing chain
      this.createProcessingChain();
      
      this.currentFileId = fileId;
      this.isInitialized = true;
      
      console.log('✅ Audio manager initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing audio manager:', error);
      await this.cleanup();
      return false;
    }
  }

  private createProcessingChain() {
    if (!this.audioContext || !this.sourceNode) return;

    // Create analyser
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Create gain node
    this.gainNode = this.audioContext.createGain();

    // Create EQ nodes
    this.eqNodes = [
      this.audioContext.createBiquadFilter(), // Low
      this.audioContext.createBiquadFilter(), // Mid
      this.audioContext.createBiquadFilter()  // High
    ];

    // Configure EQ
    this.eqNodes[0].type = 'lowshelf';
    this.eqNodes[0].frequency.value = 200;
    
    this.eqNodes[1].type = 'peaking';
    this.eqNodes[1].frequency.value = 1000;
    this.eqNodes[1].Q.value = 1;
    
    this.eqNodes[2].type = 'highshelf';
    this.eqNodes[2].frequency.value = 5000;

    // Create compressor
    this.compressor = this.audioContext.createDynamicsCompressor();

    // Create limiter
    this.limiter = this.audioContext.createDynamicsCompressor();
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;

    // Connect chain
    this.connectChain();
  }

  private connectChain() {
    if (!this.sourceNode || !this.analyserNode || !this.gainNode) return;

    // Disconnect existing connections
    try {
      this.sourceNode.disconnect();
      this.eqNodes.forEach(node => node.disconnect());
      if (this.compressor) this.compressor.disconnect();
      if (this.limiter) this.limiter.disconnect();
    } catch (error) {
      console.log('Error disconnecting nodes:', error);
    }

    // Connect: Source -> EQ -> Compressor -> Limiter -> Analyser -> Gain -> Output
    let currentNode: AudioNode = this.sourceNode;

    // EQ chain
    if (this.eqNodes.length >= 3) {
      this.eqNodes[0].connect(this.eqNodes[1]);
      this.eqNodes[1].connect(this.eqNodes[2]);
      currentNode.connect(this.eqNodes[0]);
      currentNode = this.eqNodes[2];
    }

    // Compressor
    if (this.compressor) {
      currentNode.connect(this.compressor);
      currentNode = this.compressor;
    }

    // Limiter
    if (this.limiter) {
      currentNode.connect(this.limiter);
      currentNode = this.limiter;
    }

    // Analyser and output
    currentNode.connect(this.analyserNode);
    this.analyserNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext!.destination);

    console.log('✅ Processing chain connected');
  }

  async play(): Promise<boolean> {
    if (!this.audioElement || !this.audioContext) return false;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      await this.audioElement.play();
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  updateEffects(audioEffects: AudioEffects, volume: number, isMuted: boolean): void {
    if (!this.audioContext || !this.eqNodes.length) return;

    const currentTime = this.audioContext.currentTime;

    // Update EQ
    if (audioEffects.eq?.enabled) {
      this.eqNodes[0].gain.setValueAtTime(audioEffects.eq.low, currentTime);
      this.eqNodes[1].gain.setValueAtTime(audioEffects.eq.mid, currentTime);
      this.eqNodes[2].gain.setValueAtTime(audioEffects.eq.high, currentTime);
    }

    // Update compressor
    if (this.compressor && audioEffects.compressor?.enabled) {
      this.compressor.threshold.setValueAtTime(audioEffects.compressor.threshold, currentTime);
      this.compressor.ratio.setValueAtTime(audioEffects.compressor.ratio, currentTime);
      this.compressor.attack.setValueAtTime(audioEffects.compressor.attack / 1000, currentTime);
      this.compressor.release.setValueAtTime(audioEffects.compressor.release / 1000, currentTime);
    }

    // Update volume
    if (this.gainNode && audioEffects.loudness?.enabled) {
      const newGain = audioEffects.loudness.volume * 1.2 * (isMuted ? 0 : volume);
      this.gainNode.gain.setValueAtTime(newGain, currentTime);
    }

    // Update limiter
    if (this.limiter && audioEffects.limiter?.enabled) {
      this.limiter.threshold.setValueAtTime(audioEffects.limiter.threshold, currentTime);
    }
  }

  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  isReady(): boolean {
    return this.isInitialized && this.audioElement !== null;
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up audio manager...');

    // Pause and cleanup audio element
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
        if (this.audioElement.parentNode) {
          this.audioElement.parentNode.removeChild(this.audioElement);
        }
      } catch (error) {
        console.log('Error cleaning up audio element:', error);
      }
      this.audioElement = null;
    }

    // Close audio context
    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.log('Error closing audio context:', error);
      }
      this.audioContext = null;
    }

    // Reset all nodes
    this.sourceNode = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.eqNodes = [];
    this.compressor = null;
    this.limiter = null;
    this.isInitialized = false;
    this.currentFileId = null;

    console.log('✅ Audio manager cleanup completed');
  }

  async destroy(): Promise<void> {
    await this.cleanup();
  }
}

const RealTimeAudioPlayer: React.FC<RealTimeAudioPlayerProps> = ({
  audioFile,
  selectedGenre,
  onGenreChange,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Audio effects state
  const [audioEffects, setAudioEffects] = useState<AudioEffects>({
    eq: { low: 0, mid: 0, high: 0, enabled: true },
    compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
    loudness: { volume: 1, enabled: true },
    limiter: { threshold: -1, ceiling: -0.1, enabled: true }
  });

  // Get singleton audio manager
  const audioManager = AudioManager.getInstance();

  // Test function
  const applyTestEffects = useCallback(() => {
    console.log('🧪 Applying test effects...');
    setAudioEffects(prev => ({
      ...prev,
      eq: { low: 6, mid: 3, high: 6, enabled: true },
      compressor: { threshold: -12, ratio: 4, attack: 10, release: 100, enabled: true },
      loudness: { volume: 2.0, enabled: true },
      limiter: { threshold: -1, ceiling: -0.1, enabled: true }
    }));
    setTestMode(true);
  }, []);

  // Apply genre effects
  const applyGenreEffects = useCallback(() => {
    console.log('🎵 Applying genre effects:', selectedGenre?.name);
    if (!selectedGenre) return;

    const preset = GENRE_PRESETS[selectedGenre.id];
    if (!preset) return;

    const multiplierToDb = (multiplier: number) => {
      return 20 * Math.log10(multiplier);
    };

    setAudioEffects(prev => ({
      ...prev,
      eq: { 
        ...prev.eq, 
        low: multiplierToDb(preset.eq.low), 
        mid: multiplierToDb(preset.eq.mid), 
        high: multiplierToDb(preset.eq.high), 
        enabled: true 
      },
      compressor: { 
        ...prev.compressor, 
        threshold: preset.compression.threshold, 
        ratio: preset.compression.ratio, 
        attack: Math.round(preset.compression.attack * 1000), 
        release: Math.round(preset.compression.release * 1000), 
        enabled: true 
      },
      loudness: { 
        ...prev.loudness, 
        volume: preset.gain, 
        enabled: true 
      },
      limiter: { 
        ...prev.limiter, 
        threshold: -1, 
        ceiling: preset.truePeak, 
        enabled: true 
      }
    }));

    setCurrentGenre(selectedGenre);
    setTestMode(false);
  }, [selectedGenre]);

  // Play audio
  const playAudio = useCallback(async () => {
    if (isPlaying) return;

    try {
      const success = await audioManager.play();
      if (success) {
        setIsPlaying(true);
        console.log('✅ Audio playback started');
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  }, [isPlaying]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    audioManager.pause();
    setIsPlaying(false);
    console.log('✅ Audio playback paused');
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Initialize when file changes
  useEffect(() => {
    if (audioFile) {
      setIsLoading(true);
      setIsInitialized(false);
      
      audioManager.initialize(audioFile).then(success => {
        setIsInitialized(success);
        setIsLoading(false);
        
        if (success) {
          const audioElement = audioManager.getAudioElement();
          if (audioElement) {
            setDuration(audioElement.duration);
          }
        }
      });
    }

    return () => {
      // Cleanup on unmount
      audioManager.destroy();
    };
  }, [audioFile]);

  // Apply genre effects when genre changes
  useEffect(() => {
    if (selectedGenre) {
      applyGenreEffects();
    }
  }, [selectedGenre, applyGenreEffects]);

  // Update effects when audio effects change
  useEffect(() => {
    if (audioManager.isReady()) {
      audioManager.updateEffects(audioEffects, volume, isMuted);
    }
  }, [audioEffects, volume, isMuted]);

  // Update progress
  useEffect(() => {
    const audioElement = audioManager.getAudioElement();
    if (!audioElement) return;

    const updateProgress = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isInitialized]);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-crys-gold">
            {selectedGenre ? `${selectedGenre.name} Real-Time Processing` : 'Real-Time Audio Player'}
          </h3>
          <p className="text-sm text-gray-400">
            Switch genres while playing to hear instant changes
          </p>
          {currentGenre && (
            <p className="text-xs text-green-400 mt-1">
              ⚡ Currently processing: {currentGenre.name}
            </p>
          )}
          {isInitialized && (
            <p className="text-xs text-blue-400 mt-1">
              🎛️ Effects: Active
            </p>
          )}
          {testMode && (
            <p className="text-xs text-blue-400 mt-1">
              🧪 Test mode active
            </p>
          )}
        </div>

        {/* Audio Controls */}
        <div className="space-y-4">
          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              disabled={!audioFile || isLoading || !isInitialized}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-crys-gold hover:bg-yellow-400 text-black'
              } ${(!audioFile || isLoading || !isInitialized) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
          </div>

          {/* Test Effects Button */}
          {isPlaying && (
            <div className="flex justify-center">
              <button
                onClick={applyTestEffects}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Test Effects</span>
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-crys-gold h-2 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm text-gray-400 w-12">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>

        {/* Frequency Spectrum */}
        <FrequencySpectrum
          audioElement={audioManager.getAudioElement()}
          isPlaying={isPlaying}
          title="Real-Time Frequency Spectrum"
          targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.targetLufs : undefined}
          targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.truePeak : undefined}
          analyserNode={audioManager.getAnalyserNode()}
        />

        {/* Status */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            {selectedGenre 
              ? `Currently processing with ${selectedGenre.name} effects`
              : 'Select a genre to start real-time processing'
            }
          </p>
          {isPlaying && (
            <p className="text-xs text-crys-gold mt-1">
              ⚡ Live processing - switch genres to hear instant changes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeAudioPlayer;
