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

  // Audio elements and context
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  
  // Effect nodes
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);

  // Track if audio element has been connected
  const hasBeenConnectedRef = useRef(false);

  // Audio effects state - structured like Advanced tier
  const [audioEffects, setAudioEffects] = useState<AudioEffects>({
    eq: { low: 0, mid: 0, high: 0, enabled: true },
    compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
    loudness: { volume: 1, enabled: true },
    limiter: { threshold: -1, ceiling: -0.1, enabled: true }
  });

  // Test function to apply moderate effects - INDUSTRY STANDARD TEST
  // Updated for deployment testing - SSH authentication fix
  // Enhanced debugging deployment test
  // SSH keys configured - deployment test
  const applyTestEffects = useCallback(() => {
    if (!audioContextRef.current) {
      console.log('❌ No audio context for test effects');
      return;
    }

    console.log('🧪 Applying MODERATE test effects...');
    const currentTime = audioContextRef.current.currentTime;

    // MODERATE TEST: Apply industry-standard effects
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(2.0, currentTime); // Moderate boost
      console.log('✅ Applied moderate gain: 2.0');
    } else {
      console.log('❌ No gain node for test');
    }

    if (compressorRef.current) {
      compressorRef.current.threshold.setValueAtTime(-12, currentTime);
      compressorRef.current.ratio.setValueAtTime(4, currentTime);
      compressorRef.current.attack.setValueAtTime(0.01, currentTime);
      compressorRef.current.release.setValueAtTime(0.1, currentTime);
      console.log('✅ Applied moderate compression');
    } else {
      console.log('❌ No compressor node for test');
    }

    if (eqNodesRef.current.length >= 3) {
      // Moderate EQ boost
      eqNodesRef.current[0].gain.setValueAtTime(6, currentTime);  // +6dB low
      eqNodesRef.current[1].gain.setValueAtTime(3, currentTime);  // +3dB mid
      eqNodesRef.current[2].gain.setValueAtTime(6, currentTime);  // +6dB high
      console.log('✅ Applied moderate EQ effects');
    } else {
      console.log('❌ No EQ nodes for test');
    }

    setTestMode(true);
  }, []);

    // Initialize Web Audio API - COMPLETELY ISOLATED VERSION
  const initializeAudioContext = useCallback(async () => {
    if (!audioFile) return;

    try {
      setIsLoading(true);
      console.log('=== INITIALIZING AUDIO CONTEXT ===');

      // COMPLETE CLEANUP: Remove ALL existing audio elements from DOM
      const existingAudioElements = document.querySelectorAll('audio[id^="audio-"]');
      existingAudioElements.forEach(element => {
        try {
          element.pause();
          element.src = '';
          element.remove();
          console.log('🧹 Cleaned up existing audio element:', element.id);
        } catch (error) {
          console.log('Error cleaning up audio element:', error);
        }
      });

      // Create fresh audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.log('Error closing previous audio context:', error);
        }
      }
      
      console.log('Creating new audio context...');
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await audioContextRef.current.resume();
      }

      // Create COMPLETELY FRESH audio element with unique ID
      const audioUrl = URL.createObjectURL(audioFile);
      const newAudioElement = document.createElement('audio');
      const uniqueId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newAudioElement.id = uniqueId;
      newAudioElement.src = audioUrl;
      newAudioElement.preload = 'metadata';
      newAudioElement.style.display = 'none';
      newAudioElement.crossOrigin = 'anonymous';
      
      // Append to a dedicated container to avoid conflicts
      let audioContainer = document.getElementById('audio-container');
      if (!audioContainer) {
        audioContainer = document.createElement('div');
        audioContainer.id = 'audio-container';
        audioContainer.style.display = 'none';
        document.body.appendChild(audioContainer);
      }
      audioContainer.appendChild(newAudioElement);
      audioElementRef.current = newAudioElement;
      
      console.log('✅ New audio element created with ID:', uniqueId);

      // Wait for audio to be loaded
      await new Promise((resolve) => {
        newAudioElement.addEventListener('loadedmetadata', resolve, { once: true });
      });
      
      console.log('✅ Audio element loaded');

      // Create Web Audio API nodes
      if (audioElementRef.current && audioContextRef.current) {
        console.log('Creating audio processing chain...');
        
        // Create MediaElementSource for the fresh audio element
        try {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(newAudioElement);
          hasBeenConnectedRef.current = true;
          console.log('✅ MediaElementSource created successfully');
        } catch (error) {
          console.error('❌ Error creating MediaElementSource:', error);
          throw error;
        }
        
        // Create analyser
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        analyserNodeRef.current.fftSize = 2048;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
        console.log('✅ Analyser created');
        
        // Create gain node for volume control
        gainNodeRef.current = audioContextRef.current.createGain();
        console.log('✅ Gain node created');
        
        // Create effect nodes
        createEffectNodes();
        
        // Set initial duration
        setDuration(audioElementRef.current.duration);
        
        console.log('✅ Audio processing chain created successfully');
      }

      setIsInitialized(true);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error initializing audio context:', error);
      setIsLoading(false);
      setIsInitialized(false);
    }
  }, [audioFile]);

  // Create all effect nodes
  const createEffectNodes = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Create EQ nodes (3-band)
    eqNodesRef.current = [
      ctx.createBiquadFilter(), // Low
      ctx.createBiquadFilter(), // Mid
      ctx.createBiquadFilter()  // High
    ];
    
    // Set EQ types
    eqNodesRef.current[0].type = 'lowshelf';
    eqNodesRef.current[0].frequency.value = 200;
    
    eqNodesRef.current[1].type = 'peaking';
    eqNodesRef.current[1].frequency.value = 1000;
    eqNodesRef.current[1].Q.value = 1;
    
    eqNodesRef.current[2].type = 'highshelf';
    eqNodesRef.current[2].frequency.value = 5000;

    // Create compressor
    compressorRef.current = ctx.createDynamicsCompressor();
    
    // Create limiter
    limiterRef.current = ctx.createDynamicsCompressor();
    limiterRef.current.ratio.value = 20;
    limiterRef.current.attack.value = 0.001;
    
    console.log('✅ Effect nodes created');
  }, []);

  // Connect the processing chain - FIXED VERSION
  const connectProcessingChain = useCallback(() => {
    if (!sourceNodeRef.current || !analyserNodeRef.current || !gainNodeRef.current) {
      console.log('❌ Audio nodes not available for connection');
      return;
    }
    
    console.log('🔗 Connecting processing chain...');

    // Disconnect all existing connections
    try {
      sourceNodeRef.current.disconnect();
      eqNodesRef.current.forEach(node => node.disconnect());
      if (compressorRef.current) compressorRef.current.disconnect();
      if (limiterRef.current) limiterRef.current.disconnect();
    } catch (error) {
      console.log('Error disconnecting nodes:', error);
    }

    let currentNode: AudioNode = sourceNodeRef.current;
    console.log('🔗 Starting with source node');

    // ALWAYS connect EQ chain (don't check audioEffects.eq.enabled during init)
    if (eqNodesRef.current.length >= 3) {
      eqNodesRef.current[0].connect(eqNodesRef.current[1]);
      eqNodesRef.current[1].connect(eqNodesRef.current[2]);
      currentNode.connect(eqNodesRef.current[0]);
      currentNode = eqNodesRef.current[2];
      console.log('✅ EQ chain connected');
    }

    // ALWAYS connect compressor (don't check audioEffects.compressor.enabled during init)
    if (compressorRef.current) {
      currentNode.connect(compressorRef.current);
      currentNode = compressorRef.current;
      console.log('✅ Compressor connected');
    }

    // ALWAYS connect limiter (don't check audioEffects.limiter.enabled during init)
    if (limiterRef.current) {
      currentNode.connect(limiterRef.current);
      currentNode = limiterRef.current;
      console.log('✅ Limiter connected');
    }

    // Connect to analyser and output
    currentNode.connect(analyserNodeRef.current);
    analyserNodeRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current!.destination);

    console.log('✅ Processing chain connected successfully');
  }, []);

  // Update effect parameters in real-time
  const updateEffectParameters = useCallback(() => {
    if (!audioContextRef.current || !eqNodesRef.current) {
      console.log('❌ Audio context or EQ nodes not ready');
      return;
    }
    
    console.log('🔄 Updating effect parameters:', audioEffects);
    
    // Update EQ with industry standard values (no extreme multipliers)
    if (eqNodesRef.current.length >= 3 && audioEffects.eq?.enabled) {
      // Use standard EQ values without extreme multipliers
      const lowGain = audioEffects.eq.low;
      const midGain = audioEffects.eq.mid;
      const highGain = audioEffects.eq.high;
      
      eqNodesRef.current[0].gain.setValueAtTime(lowGain, audioContextRef.current.currentTime);
      eqNodesRef.current[1].gain.setValueAtTime(midGain, audioContextRef.current.currentTime);
      eqNodesRef.current[2].gain.setValueAtTime(highGain, audioContextRef.current.currentTime);
      console.log('🎛️ EQ updated:', { low: lowGain, mid: midGain, high: highGain });
    }

    // Update compressor
    if (compressorRef.current && audioEffects.compressor?.enabled) {
      compressorRef.current.threshold.setValueAtTime(audioEffects.compressor.threshold, audioContextRef.current.currentTime);
      compressorRef.current.ratio.setValueAtTime(audioEffects.compressor.ratio, audioContextRef.current.currentTime);
      compressorRef.current.attack.setValueAtTime(audioEffects.compressor.attack / 1000, audioContextRef.current.currentTime);
      compressorRef.current.release.setValueAtTime(audioEffects.compressor.release / 1000, audioContextRef.current.currentTime);
      console.log('🎛️ Compressor updated:', audioEffects.compressor);
    }

    // Update volume with slightly more gain
    if (gainNodeRef.current && audioEffects.loudness?.enabled) {
      const newGain = audioEffects.loudness.volume * 1.2 * (isMuted ? 0 : volume); // 20% more volume
      gainNodeRef.current.gain.setValueAtTime(newGain, audioContextRef.current.currentTime);
      console.log('🎛️ Volume updated:', newGain);
    }

    // Update limiter
    if (limiterRef.current && audioEffects.limiter?.enabled) {
      limiterRef.current.threshold.setValueAtTime(audioEffects.limiter.threshold, audioContextRef.current.currentTime);
      console.log('🎛️ Limiter updated:', audioEffects.limiter);
    }
  }, [audioEffects, volume, isMuted]);

  // Apply genre effects to audio effects state
  const applyGenreEffects = useCallback(() => {
    console.log('🎵 applyGenreEffects called with genre:', selectedGenre?.name);
    if (!selectedGenre) {
      console.log('❌ No genre selected');
      return;
    }

    const preset = GENRE_PRESETS[selectedGenre.id];
    if (!preset) {
      console.log('❌ No preset found for genre:', selectedGenre.id);
      return;
    }

    console.log('🎵 Applying genre effects:', selectedGenre.name, preset);

    // Convert multiplier values to dB for EQ - industry standard conversion
    const multiplierToDb = (multiplier: number) => {
      return 20 * Math.log10(multiplier); // Standard conversion, no extreme multipliers
    };

    // Update audio effects state with genre preset
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
    if (!audioElementRef.current || isPlaying) return;

    try {
      console.log('=== STARTING PLAYBACK ===');
      
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('Audio context resumed');
      }

      // Ensure the processing chain is connected
      if (audioContextRef.current && sourceNodeRef.current && !hasBeenConnectedRef.current) {
        console.log('🔗 Connecting processing chain before playback...');
        connectProcessingChain();
      }
      
      // Play the audio
      await audioElementRef.current.play();
      setIsPlaying(true);
      console.log('✅ Audio playback started');
      
    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  }, [isPlaying, connectProcessingChain]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      console.log('✅ Audio playback paused');
    }
  }, [isPlaying]);

  // Handle genre change while playing
  const handleGenreChange = useCallback((newGenre: any) => {
    console.log('🔄 Genre changed to:', newGenre?.name);
    onGenreChange(newGenre);
    
    // The useEffect will handle applying the effects when selectedGenre changes
    console.log('⚡ Genre change triggered, effects will be applied automatically');
  }, [onGenreChange]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      const newGain = audioEffects.loudness.volume * newVolume;
      gainNodeRef.current.gain.setValueAtTime(newGain, audioContextRef.current.currentTime);
      console.log('Volume changed to:', newVolume, 'Gain:', newGain);
    }
  }, [audioEffects.loudness.volume]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      if (isMuted) {
        const newGain = audioEffects.loudness.volume * volume;
        gainNodeRef.current.gain.setValueAtTime(newGain, audioContextRef.current.currentTime);
        setIsMuted(false);
        console.log('Unmuted, gain:', newGain);
      } else {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        setIsMuted(true);
        console.log('Muted');
      }
    }
  }, [isMuted, audioEffects.loudness.volume, volume]);

  // Initialize audio context when file changes
  useEffect(() => {
    if (audioFile) {
      // Always reset connection flag and create fresh audio context
      hasBeenConnectedRef.current = false;
      setIsInitialized(false);
      setIsLoading(true);
      
      // COMPLETE CLEANUP: Remove ALL existing audio elements from DOM
      const existingAudioElements = document.querySelectorAll('audio[id^="audio-"]');
      existingAudioElements.forEach(element => {
        try {
          element.pause();
          element.src = '';
          element.remove();
          console.log('🧹 Cleaned up existing audio element:', element.id);
        } catch (error) {
          console.log('Error cleaning up audio element:', error);
        }
      });
      
      // Clean up previous audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.log('Error closing previous audio context:', error);
        }
        audioContextRef.current = null;
      }
      
      // Clean up previous audio element
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
          audioElementRef.current.src = '';
          if (audioElementRef.current.parentNode) {
            audioElementRef.current.parentNode.removeChild(audioElementRef.current);
          }
        } catch (error) {
          console.log('Error cleaning up previous audio element:', error);
        }
        audioElementRef.current = null;
      }
      
      // Reset all nodes
      sourceNodeRef.current = null;
      gainNodeRef.current = null;
      analyserNodeRef.current = null;
      eqNodesRef.current = [];
      compressorRef.current = null;
      limiterRef.current = null;
      
      initializeAudioContext();
    }
    
    return () => {
      // Clean up on unmount
      const existingAudioElements = document.querySelectorAll('audio[id^="audio-"]');
      existingAudioElements.forEach(element => {
        try {
          element.pause();
          element.src = '';
          element.remove();
        } catch (error) {
          console.log('Error cleaning up audio element on unmount:', error);
        }
      });
    };
  }, [audioFile, initializeAudioContext]);

  // Apply effects when genre changes
  useEffect(() => {
    console.log('🎵 Genre effect useEffect triggered:', selectedGenre?.name);
    if (selectedGenre) {
      console.log('🎵 Genre effect triggered for:', selectedGenre.name);
      applyGenreEffects();
    } else {
      console.log('❌ No genre selected in useEffect');
    }
  }, [selectedGenre, applyGenreEffects]);

  // Update effect parameters when audio effects change
  useEffect(() => {
    console.log('🎛️ Audio effects changed, updating parameters:', audioEffects);
    if (audioContextRef.current && eqNodesRef.current) {
      console.log('🎛️ Calling updateEffectParameters...');
      updateEffectParameters();
    } else {
      console.log('❌ Cannot update effect parameters - missing context or nodes');
    }
  }, [audioEffects, updateEffectParameters]);

  // Update progress
  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (!audioElement) return;

    const updateProgress = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 ${className}`}>
      <div className="space-y-4">
        {/* Audio element is created dynamically */}

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
              🧪 Industry test mode active - moderate effects applied
            </p>
          )}
        </div>

        {/* Audio Controls */}
        <div className="space-y-4">
          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              disabled={!audioFile || isLoading}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-crys-gold hover:bg-yellow-400 text-black'
              } ${(!audioFile || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <span>Test Industry Effects</span>
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
          audioElement={audioElementRef.current}
          isPlaying={isPlaying}
          title="Real-Time Frequency Spectrum"
          targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.targetLufs : undefined}
          targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.truePeak : undefined}
          analyserNode={analyserNodeRef.current}
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
