import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { GENRE_PRESETS } from '../utils/genrePresets';
import FrequencySpectrum from '../../FrequencySpectrum';

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

  // Audio elements and context
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const lowPassFilterRef = useRef<BiquadFilterNode | null>(null);
  const highPassFilterRef = useRef<BiquadFilterNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(async () => {
    if (!audioFile) return;

    try {
      setIsLoading(true);

      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
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
        // Create source from audio element
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
        
        // Create processing nodes
        gainNodeRef.current = audioContextRef.current.createGain();
        compressorNodeRef.current = audioContextRef.current.createDynamicsCompressor();
        lowPassFilterRef.current = audioContextRef.current.createBiquadFilter();
        highPassFilterRef.current = audioContextRef.current.createBiquadFilter();
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        
        // Set up filter types
        lowPassFilterRef.current.type = 'lowpass';
        highPassFilterRef.current.type = 'highpass';
        
        // Set up analyser
        analyserNodeRef.current.fftSize = 256;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
        
        // Connect the processing chain
        sourceNodeRef.current.connect(highPassFilterRef.current);
        highPassFilterRef.current.connect(lowPassFilterRef.current);
        lowPassFilterRef.current.connect(compressorNodeRef.current);
        compressorNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(analyserNodeRef.current);
        analyserNodeRef.current.connect(audioContextRef.current.destination);
        
        // Set initial duration
        setDuration(audioElementRef.current.duration);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing audio context:', error);
      setIsLoading(false);
    }
  }, [audioFile]);

  // Apply genre effects in real-time
  const applyGenreEffects = useCallback(() => {
    if (!selectedGenre || !audioContextRef.current) return;

    const preset = GENRE_PRESETS[selectedGenre.id];
    if (!preset) return;

    const currentTime = audioContextRef.current.currentTime;

    // Apply gain
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(preset.gain * volume, currentTime);
    }

    // Apply compression
    if (compressorNodeRef.current) {
      compressorNodeRef.current.threshold.setValueAtTime(preset.compression.threshold, currentTime);
      compressorNodeRef.current.ratio.setValueAtTime(preset.compression.ratio, currentTime);
      compressorNodeRef.current.attack.setValueAtTime(preset.compression.attack, currentTime);
      compressorNodeRef.current.release.setValueAtTime(preset.compression.release, currentTime);
      compressorNodeRef.current.knee.setValueAtTime(10, currentTime);
    }

    // Apply EQ (using filters)
    if (lowPassFilterRef.current && highPassFilterRef.current) {
      // Low frequency boost/cut
      const lowFreq = preset.eq.low > 1 ? 200 : 100;
      const lowQ = preset.eq.low > 1 ? 1 : 0.5;
      lowPassFilterRef.current.frequency.setValueAtTime(lowFreq, currentTime);
      lowPassFilterRef.current.Q.setValueAtTime(lowQ, currentTime);
      lowPassFilterRef.current.gain.setValueAtTime((preset.eq.low - 1) * 12, currentTime);

      // High frequency boost/cut
      const highFreq = preset.eq.high > 1 ? 8000 : 4000;
      const highQ = preset.eq.high > 1 ? 1 : 0.5;
      highPassFilterRef.current.frequency.setValueAtTime(highFreq, currentTime);
      highPassFilterRef.current.Q.setValueAtTime(highQ, currentTime);
      highPassFilterRef.current.gain.setValueAtTime((preset.eq.high - 1) * 12, currentTime);
    }
  }, [selectedGenre, volume]);

  // Play audio
  const playAudio = useCallback(async () => {
    if (!audioElementRef.current || isPlaying) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Apply current genre effects
      applyGenreEffects();
      
      // Play the audio
      await audioElementRef.current.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [isPlaying, applyGenreEffects]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Handle genre change while playing
  const handleGenreChange = useCallback((newGenre: any) => {
    onGenreChange(newGenre);
    
    // Apply new effects immediately if playing
    if (isPlaying && audioContextRef.current) {
      // Schedule effect changes for smooth transition
      setTimeout(() => {
        applyGenreEffects();
      }, 50);
    }
  }, [onGenreChange, isPlaying, applyGenreEffects]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      const preset = selectedGenre ? GENRE_PRESETS[selectedGenre.id] : { gain: 1.0 };
      gainNodeRef.current.gain.setValueAtTime(preset.gain * newVolume, audioContextRef.current.currentTime);
    }
  }, [selectedGenre]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      if (isMuted) {
        const preset = selectedGenre ? GENRE_PRESETS[selectedGenre.id] : { gain: 1.0 };
        gainNodeRef.current.gain.setValueAtTime(preset.gain * volume, audioContextRef.current.currentTime);
        setIsMuted(false);
      } else {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        setIsMuted(true);
      }
    }
  }, [isMuted, selectedGenre, volume]);

  // Initialize audio context when file changes
  useEffect(() => {
    if (audioFile) {
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
    applyGenreEffects();
  }, [selectedGenre, applyGenreEffects]);

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
