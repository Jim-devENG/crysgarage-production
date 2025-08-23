import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
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

export interface RealTimeAudioPlayerRef {
  getProcessedAudioUrl: (onProgress?: (progress: number, stage: string, chunks?: number, size?: number) => void) => Promise<string | null>;
  manualInitializeAudioContext: () => void;
}

// SINGLETON AUDIO MANAGER
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
    
    if (this.currentFileId === fileId && this.isInitialized) {
      console.log('✅ Audio manager already initialized for this file');
      return true;
    }

    console.log('=== INITIALIZING AUDIO MANAGER ===');
    
    await this.cleanup();
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audioUrl = URL.createObjectURL(audioFile);
      this.audioElement = document.createElement('audio');
      this.audioElement.src = audioUrl;
      this.audioElement.preload = 'metadata';
      this.audioElement.style.display = 'none';
      this.audioElement.crossOrigin = 'anonymous';
      
      try {
        this.audioElement.load();
      } catch (e) {
        console.log('Audio load() call error (safe to ignore in some browsers):', e);
      }

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

      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      
      let container = document.getElementById('audio-manager-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'audio-manager-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      container.appendChild(this.audioElement);

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

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioContext.createGain();

    this.eqNodes = [
      this.audioContext.createBiquadFilter(),
      this.audioContext.createBiquadFilter(),
      this.audioContext.createBiquadFilter()
    ];

    this.eqNodes[0].type = 'lowshelf';
    this.eqNodes[0].frequency.value = 200;
    
    this.eqNodes[1].type = 'peaking';
    this.eqNodes[1].frequency.value = 1000;
    this.eqNodes[1].Q.value = 1;
    
    this.eqNodes[2].type = 'highshelf';
    this.eqNodes[2].frequency.value = 5000;

    this.compressor = this.audioContext.createDynamicsCompressor();

    this.limiter = this.audioContext.createDynamicsCompressor();
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;

    this.connectChain();
  }

  private connectChain() {
    if (!this.sourceNode || !this.analyserNode || !this.gainNode) return;

    try {
      this.sourceNode.disconnect();
      this.eqNodes.forEach(node => node.disconnect());
      if (this.compressor) this.compressor.disconnect();
      if (this.limiter) this.limiter.disconnect();
    } catch (error) {
      console.log('Error disconnecting nodes:', error);
    }

    let currentNode: AudioNode = this.sourceNode;

    if (this.eqNodes.length >= 3) {
      this.eqNodes[0].connect(this.eqNodes[1]);
      this.eqNodes[1].connect(this.eqNodes[2]);
      currentNode.connect(this.eqNodes[0]);
      currentNode = this.eqNodes[2];
    }

    if (this.compressor) {
      currentNode.connect(this.compressor);
      currentNode = this.compressor;
    }

    if (this.limiter) {
      currentNode.connect(this.limiter);
      currentNode = this.limiter;
    }

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

    if (audioEffects.eq?.enabled) {
      this.eqNodes[0].gain.setValueAtTime(audioEffects.eq.low, currentTime);
      this.eqNodes[1].gain.setValueAtTime(audioEffects.eq.mid, currentTime);
      this.eqNodes[2].gain.setValueAtTime(audioEffects.eq.high, currentTime);
    }

    if (this.compressor && audioEffects.compressor?.enabled) {
      this.compressor.threshold.setValueAtTime(audioEffects.compressor.threshold, currentTime);
      this.compressor.ratio.setValueAtTime(audioEffects.compressor.ratio, currentTime);
      this.compressor.attack.setValueAtTime(audioEffects.compressor.attack / 1000, currentTime);
      this.compressor.release.setValueAtTime(audioEffects.compressor.release / 1000, currentTime);
    }

    if (this.gainNode && audioEffects.loudness?.enabled) {
      const newGain = audioEffects.loudness.volume * 1.2 * (isMuted ? 0 : volume);
      this.gainNode.gain.setValueAtTime(newGain, currentTime);
    }

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

    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.log('Error closing audio context:', error);
      }
      this.audioContext = null;
    }

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

const RealTimeAudioPlayer = forwardRef<RealTimeAudioPlayerRef, RealTimeAudioPlayerProps>(({
  audioFile,
  selectedGenre,
  onGenreChange,
  className = ''
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const [audioEffects, setAudioEffects] = useState<AudioEffects>({
    eq: { low: 0, mid: 0, high: 0, enabled: true },
    compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
    loudness: { volume: 1, enabled: true },
    limiter: { threshold: -1, ceiling: -0.1, enabled: true }
  });

  const audioManager = AudioManager.getInstance();

  useImperativeHandle(ref, () => ({
    getProcessedAudioUrl: async (onProgress?: (progress: number, stage: string, chunks?: number, size?: number) => void) => {
      try {
        console.log('🎵 Capturing processed audio directly from professional player...');
        console.log('Current genre:', selectedGenre);

        onProgress?.(10, 'Initializing audio capture...');

        if (!audioFile) {
          console.error('No audio file available');
          return null;
        }

        if (!selectedGenre) {
          console.log('No genre selected, returning original audio');
          return URL.createObjectURL(audioFile);
        }

        console.log('🎵 === DEBUG: STARTING AUDIO CAPTURE ===');
        console.log('🎵 Genre:', selectedGenre.name);
        console.log('🎵 Audio file:', audioFile?.name, 'Size:', audioFile?.size);

        onProgress?.(20, 'Capturing from professional processing chain...');

        return new Promise((resolve, reject) => {
          try {
            const captureContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioUrl = URL.createObjectURL(audioFile);
            const audioElement = document.createElement('audio');
            audioElement.src = audioUrl;
            audioElement.preload = 'auto';
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);

            onProgress?.(30, 'Setting up audio capture...');

            const mediaStreamDestination = captureContext.createMediaStreamDestination();
            const source = captureContext.createMediaElementSource(audioElement);
            
            let currentNode: AudioNode = source;
            
            const preset = GENRE_PRESETS[selectedGenre.id];
            if (preset) {
              if (preset.eq) {
                if (preset.eq.low !== 1) {
                  const lowEqNode = captureContext.createBiquadFilter();
                  lowEqNode.type = 'lowshelf';
                  lowEqNode.frequency.value = 200;
                  lowEqNode.gain.value = (preset.eq.low - 1) * 12;
                  currentNode.connect(lowEqNode);
                  currentNode = lowEqNode;
                }
                
                if (preset.eq.mid !== 1) {
                  const midEqNode = captureContext.createBiquadFilter();
                  midEqNode.type = 'peaking';
                  midEqNode.frequency.value = 1000;
                  midEqNode.gain.value = (preset.eq.mid - 1) * 12;
                  midEqNode.Q.value = 1;
                  currentNode.connect(midEqNode);
                  currentNode = midEqNode;
                }
                
                if (preset.eq.high !== 1) {
                  const highEqNode = captureContext.createBiquadFilter();
                  highEqNode.type = 'highshelf';
                  highEqNode.frequency.value = 5000;
                  highEqNode.gain.value = (preset.eq.high - 1) * 12;
                  currentNode.connect(highEqNode);
                  currentNode = highEqNode;
                }
              }
              
              if (preset.compression) {
                const compressorNode = captureContext.createDynamicsCompressor();
                compressorNode.threshold.value = preset.compression.threshold;
                compressorNode.ratio.value = preset.compression.ratio;
                compressorNode.attack.value = preset.compression.attack;
                compressorNode.release.value = preset.compression.release;
                currentNode.connect(compressorNode);
                currentNode = compressorNode;
              }
              
              if (preset.gain !== 1) {
                const gainNode = captureContext.createGain();
                gainNode.gain.value = preset.gain;
                currentNode.connect(gainNode);
                currentNode = gainNode;
              }
              
              if (preset.truePeak !== 0) {
                const limiterNode = captureContext.createDynamicsCompressor();
                limiterNode.threshold.value = -1;
                limiterNode.ratio.value = 20;
                limiterNode.attack.value = 0.001;
                limiterNode.release.value = 0.1;
                currentNode.connect(limiterNode);
                currentNode = limiterNode;
              }
            }
            
            currentNode.connect(mediaStreamDestination);
            currentNode.connect(captureContext.destination);

            onProgress?.(40, 'Recording processed audio...');

            console.log('🎵 DEBUG: Creating MediaRecorder...');
            const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
              mimeType: 'audio/webm;codecs=opus'
            });

            console.log('✅ DEBUG: MediaRecorder created');
            console.log('🎵 DEBUG: MediaRecorder state:', mediaRecorder.state);

            const chunks: Blob[] = [];
            let totalChunksSize = 0;
            let chunkCount = 0;
            const startTime = Date.now();

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
                totalChunksSize += event.data.size;
                chunkCount++;

                const elapsed = Date.now() - startTime;
                const audioDuration = audioElement.duration || 0;
                const estimatedProgress = Math.min((elapsed / (audioDuration * 1000)) * 100, 95);

                console.log('🎵 DEBUG: Audio chunk captured:', event.data.size, 'bytes, Total:', totalChunksSize, 'bytes, Chunk:', chunkCount);
                onProgress?.(estimatedProgress, `Processing audio in real-time... (${chunkCount} chunks captured)`, chunkCount, totalChunksSize);
              }
            };

            mediaRecorder.onstop = () => {
              onProgress?.(80, 'Finalizing captured audio...');

              console.log('🎵 DEBUG: MediaRecorder stopped');
              console.log('🎵 DEBUG: Total chunks collected:', chunks.length);
              console.log('🎵 DEBUG: Total size collected:', totalChunksSize, 'bytes');

              clearTimeout(safetyTimeout);

              try {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const processedAudioUrl = URL.createObjectURL(audioBlob);

                console.log('✅ DEBUG: Processed audio captured successfully:', processedAudioUrl);
                console.log('🎵 DEBUG: Final blob size:', audioBlob.size, 'bytes');

                if (audioElement && audioElement.parentNode) {
                  document.body.removeChild(audioElement);
                }
                URL.revokeObjectURL(audioUrl);

                console.log('🎵 DEBUG: Resolving promise with processed audio URL');
                resolve(processedAudioUrl);
              } catch (error) {
                console.error('❌ Error in onstop callback:', error);
                reject(error);
              }
            };

            mediaRecorder.onerror = (error) => {
              console.error('❌ MediaRecorder error:', error);
              if (audioElement && audioElement.parentNode) {
                document.body.removeChild(audioElement);
              }
              URL.revokeObjectURL(audioUrl);
              reject(error);
            };

            const safetyTimeout = setTimeout(() => {
              console.log('⚠️ Safety timeout reached, forcing resolution...');
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
              if (chunks.length > 0) {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const processedAudioUrl = URL.createObjectURL(audioBlob);
                resolve(processedAudioUrl);
              } else {
                resolve(URL.createObjectURL(audioFile));
              }
            }, (audioElement.duration || 300) * 1000 + 10000);

            mediaRecorder.start();
            onProgress?.(50, 'Recording processed audio...');

            if (audioElement) {
              console.log('🎵 DEBUG: Starting audio playback for capture...');
              audioElement.currentTime = 0;

              audioElement.play().then(() => {
                console.log('✅ DEBUG: Audio playback started for capture');

                audioElement.onended = () => {
                  console.log('🎵 DEBUG: Audio playback ended, stopping capture...');
                  if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                  }
                  audioElement.pause();
                  audioElement.currentTime = 0;
                };

                audioElement.ontimeupdate = () => {
                  if (audioElement.currentTime >= audioElement.duration - 0.1) {
                    console.log('🎵 DEBUG: Audio near end, stopping capture...');
                    if (mediaRecorder.state === 'recording') {
                      mediaRecorder.stop();
                    }
                    audioElement.pause();
                    audioElement.currentTime = 0;
                  }
                };

                const timeoutDuration = (audioElement.duration || 300) * 1000 + 5000;
                console.log('🎵 DEBUG: Setting timeout for:', timeoutDuration, 'ms');

                setTimeout(() => {
                  if (mediaRecorder.state === 'recording') {
                    console.log('⏰ DEBUG: Timeout reached, stopping capture...');
                    mediaRecorder.stop();
                    audioElement.pause();
                    audioElement.currentTime = 0;
                  }
                }, timeoutDuration);

              }).catch((error) => {
                console.error('❌ DEBUG: Error starting audio playback:', error);
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
                reject(error);
              });
            } else {
              console.error('❌ DEBUG: Audio element not available');
              reject(new Error('Audio element not available'));
            }

          } catch (error) {
            console.error('❌ Error capturing audio stream:', error);
            reject(error);
          }
        });

      } catch (error) {
        console.error('Error in getProcessedAudioUrl:', error);
        return null;
      }
    },
    manualInitializeAudioContext: () => {
      console.log('🎵 Manual audio context initialization for professional player...');
      if (audioFile) {
        audioManager.initialize(audioFile);
      }
    }
  }));

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

  const pauseAudio = useCallback(() => {
    audioManager.pause();
    setIsPlaying(false);
    console.log('✅ Audio playback paused');
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

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
      audioManager.destroy();
    };
  }, [audioFile]);

  useEffect(() => {
    if (selectedGenre) {
      applyGenreEffects();
    }
  }, [selectedGenre, applyGenreEffects]);

  useEffect(() => {
    if (audioManager.isReady()) {
      audioManager.updateEffects(audioEffects, volume, isMuted);
    }
  }, [audioEffects, volume, isMuted]);

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 ${className}`}>
      <div className="space-y-4">
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

        <div className="space-y-4">
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

        <FrequencySpectrum
          audioElement={audioManager.getAudioElement()}
          isPlaying={isPlaying}
          title="Real-Time Frequency Spectrum"
          targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.targetLufs : undefined}
          targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.truePeak : undefined}
          analyserNode={audioManager.getAnalyserNode()}
        />

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
});

export default RealTimeAudioPlayer;
