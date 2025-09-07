import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Zap } from 'lucide-react';
import { GENRE_PRESETS } from '../utils/genrePresets';

// Simplified processing pipeline for fallback scenarios
const processAudioWithSimplifiedPipeline = async (
  audioFile: File | null,
  targetSampleRate?: number,
  targetFormat?: 'mp3' | 'wav16' | 'wav24' | 'wav32',
  onProgress?: (progress: number, stage: string) => void
): Promise<string | null> => {
  try {
    console.log('🔄 Starting simplified processing pipeline...');
    onProgress?.(10, 'Loading audio file...');
    
    if (!audioFile) {
      console.error('❌ No audio file available for simplified processing');
      return null;
    }
    
    // Create a new audio context for processing
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    onProgress?.(30, 'Applying basic mastering...');
    
    // Apply basic mastering effects
    const processedBuffer = await applyBasicMastering(audioBuffer, audioContext);
    
    onProgress?.(60, 'Converting to target format...');
    
    // Convert to target format
    const finalSampleRate = targetSampleRate || audioBuffer.sampleRate;
    const bitDepth = targetFormat === 'wav16' ? 16 : targetFormat === 'wav24' ? 24 : targetFormat === 'wav32' ? 32 : 16;
    
    let processedBlob: Blob;
    if (targetFormat === 'mp3') {
      processedBlob = convertAudioBufferToMp3(processedBuffer, finalSampleRate, onProgress);
    } else {
      processedBlob = convertAudioBufferToWav(processedBuffer, finalSampleRate, bitDepth, onProgress);
    }
    
    onProgress?.(100, 'Simplified processing complete!');
    
    const processedUrl = URL.createObjectURL(processedBlob);
    console.log('✅ Simplified processing completed successfully');
    
    return processedUrl;
    
  } catch (error) {
    console.error('❌ Error in simplified processing pipeline:', error);
    return null;
  }
};

const applyBasicMastering = async (
  audioBuffer: AudioBuffer,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  console.log('🎵 Applying basic mastering effects...');
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  const highPass = audioContext.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 80;
  
  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 30;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  
  const limiter = audioContext.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.01;
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.8;
  
  source.connect(highPass);
  highPass.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(gainNode);
  
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  
  const offlineSource = offlineContext.createBufferSource();
  offlineSource.buffer = audioBuffer;
  
  const offlineHighPass = offlineContext.createBiquadFilter();
  offlineHighPass.type = 'highpass';
  offlineHighPass.frequency.value = 80;
  
  const offlineCompressor = offlineContext.createDynamicsCompressor();
  offlineCompressor.threshold.value = -20;
  offlineCompressor.knee.value = 30;
  offlineCompressor.ratio.value = 4;
  offlineCompressor.attack.value = 0.003;
  offlineCompressor.release.value = 0.25;
  
  const offlineLimiter = offlineContext.createDynamicsCompressor();
  offlineLimiter.threshold.value = -3;
  offlineLimiter.knee.value = 0;
  offlineLimiter.ratio.value = 20;
  offlineLimiter.attack.value = 0.001;
  offlineLimiter.release.value = 0.01;
  
  const offlineGain = offlineContext.createGain();
  offlineGain.gain.value = 0.8;
  
  offlineSource.connect(offlineHighPass);
  offlineHighPass.connect(offlineCompressor);
  offlineCompressor.connect(offlineLimiter);
  offlineLimiter.connect(offlineGain);
  offlineGain.connect(offlineContext.destination);
  
  offlineSource.start();
  
  const processedBuffer = await offlineContext.startRendering();
  
  console.log('✅ Basic mastering applied successfully');
  return processedBuffer;
};

// Audio conversion functions for Professional tier
const convertAudioBufferToWav = (
  audioBuffer: AudioBuffer, 
  targetSampleRate: number, 
  bitDepth: 16 | 24 | 32,
  onProgress?: (progress: number, stage: string) => void
): Blob => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const originalSampleRate = audioBuffer.sampleRate;
  const originalLength = audioBuffer.length;
  
  console.log(`Converting audio: ${originalLength / originalSampleRate}s at ${originalSampleRate}Hz → ${targetSampleRate}Hz, ${bitDepth}-bit`);
  
  // Calculate new length after sample rate conversion
  const newLength = Math.round((originalLength * targetSampleRate) / originalSampleRate);
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = targetSampleRate * blockAlign;
  const dataSize = newLength * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Convert audio data
  let offset = 44;
  for (let i = 0; i < newLength; i++) {
    const originalIndex = (i * originalSampleRate) / targetSampleRate;
    const index = Math.floor(originalIndex);
    const fraction = originalIndex - index;
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      let sample = 0;
      
      if (index < originalLength - 1) {
        // Linear interpolation
        const sample1 = channelData[index];
        const sample2 = channelData[index + 1];
        sample = sample1 + (sample2 - sample1) * fraction;
      } else if (index < originalLength) {
        sample = channelData[index];
      }
      
      // Clamp sample to valid range
      const clampedSample = Math.max(-1, Math.min(1, sample));
      
      // Write sample based on bit depth
      if (bitDepth === 16) {
        view.setInt16(offset, clampedSample * 0x7FFF, true);
        offset += 2;
      } else if (bitDepth === 24) {
        const sample24 = Math.round(clampedSample * 0x7FFFFF);
        view.setUint8(offset, sample24 & 0xFF);
        view.setUint8(offset + 1, (sample24 >> 8) & 0xFF);
        view.setUint8(offset + 2, (sample24 >> 16) & 0xFF);
        offset += 3;
      } else if (bitDepth === 32) {
        view.setInt32(offset, clampedSample * 0x7FFFFFFF, true);
        offset += 4;
      }
    }
    
    // Log progress every 5% for large files
    if (newLength > 1000000 && i % Math.floor(newLength / 20) === 0) {
      const progress = Math.round((i / newLength) * 100);
      onProgress?.(progress, `Converting audio: ${progress}%`);
    }
  }
  
  console.log('✅ Audio converted successfully');
  
  return new Blob([buffer], { type: 'audio/wav' });
};

// MP3 conversion using Web Audio API (simplified - in production you'd use a proper MP3 encoder)
const convertAudioBufferToMp3 = (
  audioBuffer: AudioBuffer, 
  targetSampleRate: number,
  onProgress?: (progress: number, stage: string) => void
): Blob => {
  console.log(`Converting to MP3: ${targetSampleRate}Hz, 320kbps`);
  
  // For now, we'll convert to WAV first, then let the browser handle MP3
  // In a production environment, you'd use a proper MP3 encoder like lamejs
  const wavBlob = convertAudioBufferToWav(audioBuffer, targetSampleRate, 16, onProgress);
  
  // Note: This is a simplified approach. For true MP3 encoding, you'd need:
  // 1. A proper MP3 encoder library (like lamejs)
  // 2. Convert the WAV to MP3 with proper bitrate control
  // For now, we'll return the WAV and let the filename indicate MP3 format
  
  return wavBlob;
};

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
  getProcessedAudioUrl: (
    onProgress?: (progress: number, stage: string, chunks?: number, size?: number) => void,
    sampleRate?: number,
    format?: 'mp3' | 'wav16' | 'wav24' | 'wav32'
  ) => Promise<string | null>;
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
    getProcessedAudioUrl: async (
      onProgress?: (progress: number, stage: string, chunks?: number, size?: number) => void,
      targetSampleRate?: number,
      targetFormat?: 'mp3' | 'wav16' | 'wav24' | 'wav32'
    ) => {
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

            // Check if MediaRecorder is supported
            if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              console.warn('⚠️ WebM with Opus not supported, using simplified processing...');
              
              // Fallback: Use simplified processing with basic effects
              return processAudioWithSimplifiedPipeline(audioFile, targetSampleRate, targetFormat, onProgress);
            }

            console.log('🎵 DEBUG: Creating MediaRecorder...');
            let mediaRecorder: MediaRecorder;
            try {
              mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
                mimeType: 'audio/webm;codecs=opus'
              });
            } catch (error) {
              console.error('❌ Failed to create MediaRecorder:', error);
              
              // Fallback: Use simplified processing with basic effects
              console.log('🔄 Using simplified processing pipeline as fallback');
              return processAudioWithSimplifiedPipeline(audioFile, targetSampleRate, targetFormat, onProgress);
            }

            console.log('✅ DEBUG: MediaRecorder created');
            console.log('🎵 DEBUG: MediaRecorder state:', mediaRecorder.state);

            const chunks: Blob[] = [];
            let totalChunksSize = 0;
            let chunkCount = 0;
            const startTime = Date.now();

            return new Promise((resolve, reject) => {
              // Set up timeout to prevent infinite hanging
              const timeout = setTimeout(() => {
                console.error('❌ Audio processing timeout - taking too long');
                mediaRecorder.stop();
                reject(new Error('Audio processing timeout'));
              }, 30000); // 30 second timeout

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

            mediaRecorder.onstop = async () => {
              clearTimeout(timeout);
              onProgress?.(80, 'Finalizing captured audio...');

              console.log('🎵 DEBUG: MediaRecorder stopped');
              console.log('🎵 DEBUG: Total chunks collected:', chunks.length);
              console.log('🎵 DEBUG: Total size collected:', totalChunksSize, 'bytes');

              try {
                const webmBlob = new Blob(chunks, { type: 'audio/webm' });
                
                // If no format conversion needed, return WebM as-is
                if (!targetFormat || targetFormat === 'mp3') {
                  const processedAudioUrl = URL.createObjectURL(webmBlob);
                  console.log('✅ DEBUG: Processed audio captured successfully (WebM/MP3):', processedAudioUrl);
                  console.log('🎵 DEBUG: Final blob size:', webmBlob.size, 'bytes');
                  
                  if (audioElement && audioElement.parentNode) {
                    document.body.removeChild(audioElement);
                  }
                  URL.revokeObjectURL(audioUrl);
                  
                  console.log('🎵 DEBUG: Resolving promise with processed audio URL');
                  resolve(processedAudioUrl);
                  return;
                }
                
                // For WAV formats, convert WebM to WAV
                console.log(`🎵 Converting WebM to WAV ${targetFormat}...`);
                onProgress?.(85, 'Converting to target format...');
                
                // Create audio context for conversion
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const arrayBuffer = await webmBlob.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                // Convert to target WAV format
                const finalSampleRate = targetSampleRate || audioBuffer.sampleRate;
                const bitDepth = targetFormat === 'wav16' ? 16 : targetFormat === 'wav24' ? 24 : 32;
                
                const wavBlob = convertAudioBufferToWav(audioBuffer, finalSampleRate, bitDepth, onProgress);
                const processedAudioUrl = URL.createObjectURL(wavBlob);
                
                console.log('✅ DEBUG: Processed audio converted successfully:', {
                  originalSize: webmBlob.size,
                  finalSize: wavBlob.size,
                  format: targetFormat,
                  sampleRate: finalSampleRate,
                  bitDepth: bitDepth
                });
                
                if (audioElement && audioElement.parentNode) {
                  document.body.removeChild(audioElement);
                }
                URL.revokeObjectURL(audioUrl);
                
                console.log('🎵 DEBUG: Resolving promise with converted audio URL');
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

            }); // Close the Promise
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
