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
  const [currentGenre, setCurrentGenre] = useState<any>(null);

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
      console.log('Initializing audio context...');

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
        console.log('Creating audio processing chain...');
        
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
        
        console.log('Audio processing chain created successfully');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing audio context:', error);
      setIsLoading(false);
    }
  }, [audioFile]);

  // Apply genre effects in real-time with immediate changes
  const applyGenreEffects = useCallback(() => {
    if (!selectedGenre || !audioContextRef.current) {
      console.log('No genre selected or audio context not ready');
      return;
    }

    const preset = GENRE_PRESETS[selectedGenre.id];
    if (!preset) {
      console.log('No preset found for genre:', selectedGenre.id);
      return;
    }

    console.log('Applying genre effects:', selectedGenre.name, preset);
    const currentTime = audioContextRef.current.currentTime;

    // Apply gain with immediate effect
    if (gainNodeRef.current) {
      const newGain = preset.gain * volume;
      gainNodeRef.current.gain.setValueAtTime(newGain, currentTime);
      console.log('Applied gain:', newGain);
    }

    // Apply compression with immediate effect
    if (compressorNodeRef.current) {
      compressorNodeRef.current.threshold.setValueAtTime(preset.compression.threshold, currentTime);
      compressorNodeRef.current.ratio.setValueAtTime(preset.compression.ratio, currentTime);
      compressorNodeRef.current.attack.setValueAtTime(preset.compression.attack, currentTime);
      compressorNodeRef.current.release.setValueAtTime(preset.compression.release, currentTime);
      compressorNodeRef.current.knee.setValueAtTime(10, currentTime);
      console.log('Applied compression:', preset.compression);
    }

    // Apply EQ with more dramatic effects
    if (lowPassFilterRef.current && highPassFilterRef.current) {
      // Low frequency boost/cut - more dramatic
      const lowFreq = preset.eq.low > 1 ? 300 : 80;
      const lowQ = preset.eq.low > 1 ? 2 : 0.3;
      const lowGain = (preset.eq.low - 1) * 20; // More dramatic gain changes
      
      lowPassFilterRef.current.frequency.setValueAtTime(lowFreq, currentTime);
      lowPassFilterRef.current.Q.setValueAtTime(lowQ, currentTime);
      lowPassFilterRef.current.gain.setValueAtTime(lowGain, currentTime);

      // High frequency boost/cut - more dramatic
      const highFreq = preset.eq.high > 1 ? 10000 : 3000;
      const highQ = preset.eq.high > 1 ? 2 : 0.3;
      const highGain = (preset.eq.high - 1) * 20; // More dramatic gain changes
      
      highPassFilterRef.current.frequency.setValueAtTime(highFreq, currentTime);
      highPassFilterRef.current.Q.setValueAtTime(highQ, currentTime);
      highPassFilterRef.current.gain.setValueAtTime(highGain, currentTime);
      
      console.log('Applied EQ - Low:', { freq: lowFreq, gain: lowGain }, 'High:', { freq: highFreq, gain: highGain });
    }

    setCurrentGenre(selectedGenre);
  }, [selectedGenre, volume]);

  // Play audio
  const playAudio = useCallback(async () => {
    if (!audioElementRef.current || isPlaying) return;

    try {
      console.log('Starting playback...');
      
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('Audio context resumed');
      }

      // Apply current genre effects
      applyGenreEffects();
      
      // Play the audio
      await audioElementRef.current.play();
      setIsPlaying(true);
      console.log('Audio playback started');
      
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [isPlaying, applyGenreEffects]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      console.log('Audio playback paused');
    }
  }, [isPlaying]);

  // Handle genre change while playing
  const handleGenreChange = useCallback((newGenre: any) => {
    console.log('Genre changed to:', newGenre?.name);
    onGenreChange(newGenre);
    
    // Apply new effects immediately if playing
    if (isPlaying && audioContextRef.current) {
      console.log('Applying new genre effects while playing...');
      // Apply effects immediately for instant change
      setTimeout(() => {
        applyGenreEffects();
      }, 10);
    }
  }, [onGenreChange, isPlaying, applyGenreEffects]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      const preset = selectedGenre ? GENRE_PRESETS[selectedGenre.id] : { gain: 1.0 };
      const newGain = preset.gain * newVolume;
      gainNodeRef.current.gain.setValueAtTime(newGain, audioContextRef.current.currentTime);
      console.log('Volume changed to:', newVolume, 'Gain:', newGain);
    }
  }, [selectedGenre]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      if (isMuted) {
        const preset = selectedGenre ? GENRE_PRESETS[selectedGenre.id] : { gain: 1.0 };
        const newGain = preset.gain * volume;
        gainNodeRef.current.gain.setValueAtTime(newGain, audioContextRef.current.currentTime);
        setIsMuted(false);
        console.log('Unmuted, gain:', newGain);
      } else {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        setIsMuted(true);
        console.log('Muted');
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
    if (selectedGenre && audioContextRef.current) {
      console.log('Genre effect triggered for:', selectedGenre.name);
      applyGenreEffects();
    }
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
          {currentGenre && (
            <p className="text-xs text-green-400 mt-1">
              ⚡ Currently processing: {currentGenre.name}
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
