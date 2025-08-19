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

  // Test function to apply extreme effects - DIRECT TEST
  const applyTestEffects = useCallback(() => {
    if (!audioContextRef.current) {
      console.log('❌ No audio context for test effects');
      return;
    }

    console.log('🧪 Applying DIRECT test effects...');
    const currentTime = audioContextRef.current.currentTime;

    // DIRECT TEST: Apply extreme effects immediately
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(5.0, currentTime); // Very loud
      console.log('✅ Applied extreme gain: 5.0');
    } else {
      console.log('❌ No gain node for test');
    }

    if (compressorRef.current) {
      compressorRef.current.threshold.setValueAtTime(-6, currentTime);
      compressorRef.current.ratio.setValueAtTime(10, currentTime);
      compressorRef.current.attack.setValueAtTime(0.001, currentTime);
      compressorRef.current.release.setValueAtTime(0.01, currentTime);
      console.log('✅ Applied extreme compression');
    } else {
      console.log('❌ No compressor node for test');
    }

    if (eqNodesRef.current.length >= 3) {
      // Extreme EQ boost
      eqNodesRef.current[0].gain.setValueAtTime(30, currentTime);
      eqNodesRef.current[1].gain.setValueAtTime(20, currentTime);
      eqNodesRef.current[2].gain.setValueAtTime(30, currentTime);
      console.log('✅ Applied extreme EQ effects');
    } else {
      console.log('❌ No EQ nodes for test');
    }

    setTestMode(true);
  }, []);

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(async () => {
    if (!audioFile) return;

    try {
      setIsLoading(true);
      console.log('=== INITIALIZING AUDIO CONTEXT ===');

      // Create audio context
      if (!audioContextRef.current) {
        console.log('Creating new audio context...');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await audioContextRef.current.resume();
      }

      // Create audio element
      const audioUrl = URL.createObjectURL(audioFile);
      if (audioElementRef.current) {
        audioElementRef.current.src = audioUrl;
        audioElementRef.current.load();
      }

      // Wait for audio to be loaded
      await new Promise((resolve) => {
        if (audioElementRef.current) {
          audioElementRef.current.addEventListener('loadedmetadata', resolve, { once: true });
        }
      });

      // Create Web Audio API nodes
      if (audioElementRef.current && audioContextRef.current) {
        console.log('Creating audio processing chain...');
        
        // Create source from audio element - ONLY IF NOT ALREADY CONNECTED
        if (!hasBeenConnectedRef.current) {
          try {
            sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
            hasBeenConnectedRef.current = true;
            console.log('✅ MediaElementSource created');
          } catch (error) {
            console.log('⚠️ MediaElementSource already exists, reusing...');
            // If already connected, we need to create a new audio element
            const newAudioElement = new Audio();
            newAudioElement.src = audioUrl;
            newAudioElement.load();
            audioElementRef.current = newAudioElement;
            
            // Wait for new audio to load
            await new Promise((resolve) => {
              newAudioElement.addEventListener('loadedmetadata', resolve, { once: true });
            });
            
            sourceNodeRef.current = audioContextRef.current.createMediaElementSource(newAudioElement);
            hasBeenConnectedRef.current = true;
            console.log('✅ New MediaElementSource created');
          }
        } else {
          console.log('✅ MediaElementSource already exists');
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
    
    // Update EQ with more dramatic values
    if (eqNodesRef.current.length >= 3 && audioEffects.eq?.enabled) {
      // Make EQ changes more dramatic
      const lowGain = audioEffects.eq.low * 2; // Double the effect
      const midGain = audioEffects.eq.mid * 2;
      const highGain = audioEffects.eq.high * 2;
      
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

    // Update volume
    if (gainNodeRef.current && audioEffects.loudness?.enabled) {
      const newGain = audioEffects.loudness.volume * (isMuted ? 0 : volume);
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

    // Convert multiplier values to dB for EQ - make more dramatic
    const multiplierToDb = (multiplier: number) => {
      return 20 * Math.log10(multiplier) * 2; // Double the effect
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
      if (audioContextRef.current && sourceNodeRef.current) {
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
    
    // Apply new effects immediately
    if (isPlaying && audioContextRef.current) {
      console.log('⚡ Applying new genre effects while playing...');
      applyGenreEffects();
    }
  }, [onGenreChange, isPlaying, applyGenreEffects]);

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
      // Reset connection flag when file changes
      hasBeenConnectedRef.current = false;
      initializeAudioContext();
    }
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [audioFile, initializeAudioContext]);

  // Apply effects when genre changes
  useEffect(() => {
    if (selectedGenre) {
      console.log('🎵 Genre effect triggered for:', selectedGenre.name);
      applyGenreEffects();
    }
  }, [selectedGenre, applyGenreEffects]);

  // Update effect parameters when audio effects change
  useEffect(() => {
    if (audioContextRef.current && eqNodesRef.current) {
      updateEffectParameters();
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
        {/* Hidden audio element */}
        <audio
          ref={audioElementRef}
          preload="metadata"
          style={{ display: 'none' }}
        />

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
            <p className="text-xs text-red-400 mt-1">
              🧪 Test mode active - extreme effects applied
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Test Extreme Effects</span>
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
