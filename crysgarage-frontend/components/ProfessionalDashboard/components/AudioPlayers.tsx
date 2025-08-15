import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import FrequencySpectrum from '../../FrequencySpectrum';
import { GenrePreset } from '../types';

interface AudioPlayersProps {
  selectedFile: File | null;
  selectedGenre: any;
  genrePresets: Record<string, GenrePreset>;
  onAudioReady: () => void;
  onProcessingComplete: (audioUrl: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AudioPlayers: React.FC<AudioPlayersProps> = ({
  selectedFile,
  selectedGenre,
  genrePresets,
  onAudioReady,
  onProcessingComplete,
  isProcessing,
  setIsProcessing
}) => {
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [compressorNode, setCompressorNode] = useState<DynamicsCompressorNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isProcessingReady, setIsProcessingReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize audio processing when component mounts
  useEffect(() => {
    try {
      initializeAudioProcessing();
    } catch (err) {
      console.error('Error initializing audio processing:', err);
      setError('Failed to initialize audio processing');
    }
  }, []);

  // Apply genre preset when genre changes - this is the key for real-time changes
  useEffect(() => {
    if (selectedGenre && isProcessingReady && gainNode && compressorNode) {
      console.log('Applying genre preset in real-time:', selectedGenre.name);
      applyGenrePreset(selectedGenre);
    }
  }, [selectedGenre, isProcessingReady, gainNode, compressorNode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        try {
          audioContext.close();
        } catch (error) {
          console.error('Error closing audio context:', error);
        }
      }
    };
  }, [audioContext]);

  const initializeAudioProcessing = async () => {
    try {
      console.log('Initializing audio processing...');
      
      // Create audio context
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Create processing nodes
      const gain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      const analyser = ctx.createAnalyser();
      
      // Configure analyzer
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // Connect processing chain: source -> compressor -> gain -> analyser -> destination
      compressor.connect(gain).connect(analyser).connect(ctx.destination);
      
      // Set initial values
      gain.gain.value = 1.0;
      compressor.threshold.value = -24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressor.knee.value = 10;
      
      setAudioContext(ctx);
      setGainNode(gain);
      setCompressorNode(compressor);
      setAnalyserNode(analyser);
      setIsProcessingReady(true);
      
      console.log('Audio processing initialized successfully');
      onAudioReady();
      
    } catch (error) {
      console.error('Error initializing audio processing:', error);
      setError('Failed to initialize audio processing');
    }
  };

  const applyGenrePreset = (genre: any) => {
    if (!gainNode || !compressorNode || !genre) {
      console.log('Cannot apply genre preset - missing nodes or genre');
      return;
    }
    
    try {
      const preset = genrePresets[genre.id] || genrePresets.afrobeats;
      console.log('Applying preset:', preset);
      
      // Apply gain with smooth transition
      gainNode.gain.setValueAtTime(gainNode.gain.value, gainNode.context.currentTime);
      gainNode.gain.linearRampToValueAtTime(preset.gain, gainNode.context.currentTime + 0.1);
      
      // Apply compression with smooth transitions
      compressorNode.threshold.setValueAtTime(compressorNode.threshold.value, compressorNode.context.currentTime);
      compressorNode.threshold.linearRampToValueAtTime(preset.compression.threshold, compressorNode.context.currentTime + 0.1);
      
      compressorNode.ratio.setValueAtTime(compressorNode.ratio.value, compressorNode.context.currentTime);
      compressorNode.ratio.linearRampToValueAtTime(preset.compression.ratio, compressorNode.context.currentTime + 0.1);
      
      compressorNode.attack.setValueAtTime(compressorNode.attack.value, compressorNode.context.currentTime);
      compressorNode.attack.linearRampToValueAtTime(preset.compression.attack, compressorNode.context.currentTime + 0.1);
      
      compressorNode.release.setValueAtTime(compressorNode.release.value, compressorNode.context.currentTime);
      compressorNode.release.linearRampToValueAtTime(preset.compression.release, compressorNode.context.currentTime + 0.1);
      
      compressorNode.knee.setValueAtTime(10, compressorNode.context.currentTime);
      
      console.log(`Applied ${genre.name} preset in real-time`);
    } catch (error) {
      console.error('Error applying genre preset:', error);
    }
  };

  const handleMasteredPlay = async () => {
    if (!isProcessingReady || !selectedFile) {
      console.log('Cannot play mastered audio - not ready or no file');
      return;
    }

    try {
      // Create a new audio element
      const audio = new Audio();
      audio.src = URL.createObjectURL(selectedFile);
      
      // Wait for audio to be loaded
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });

      // Create audio source only once
      if (!audioSource) {
        const source = audioContext!.createMediaElementSource(audio);
        source.connect(compressorNode!);
        setAudioSource(source);
      }

      setOriginalAudioElement(audio);

      // Apply current genre preset immediately
      if (selectedGenre) {
        applyGenrePreset(selectedGenre);
      }

      setIsPlayingMastered(true);
      
      // Play the audio
      await audio.play();
      console.log('Playing mastered audio');
      
    } catch (error) {
      console.error('Error playing mastered audio:', error);
      setIsPlayingMastered(false);
      setError('Failed to play mastered audio');
    }
  };

  const handleMasteredPause = () => {
    try {
      if (originalAudioElement) {
        originalAudioElement.pause();
      }
      setIsPlayingMastered(false);
    } catch (error) {
      console.error('Error pausing mastered audio:', error);
    }
  };

  if (error) {
    return (
      <div className="bg-gray-700 rounded-xl p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">⚠️</span>
          </div>
          <p className="text-sm text-red-400 mb-2">Audio Error</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializeAudioProcessing();
            }}
            className="mt-3 px-4 py-2 bg-crys-gold text-black rounded-lg text-sm hover:bg-yellow-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-xl p-6">
      <div className="space-y-4">
        {isProcessingReady ? (
          <>
            {/* Mastered audio controls */}
            <div className="bg-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={isPlayingMastered ? handleMasteredPause : handleMasteredPlay}
                  disabled={!selectedGenre}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isPlayingMastered
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-crys-gold hover:bg-yellow-400 text-black'
                  } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                >
                  {isPlayingMastered ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                
                {isPlayingMastered && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-medium">Live Processing</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">
                  {selectedGenre 
                    ? `${selectedGenre.name} preset applied in real-time`
                    : 'Select a genre to enable mastering'
                  }
                </p>
              </div>
            </div>
            
            <FrequencySpectrum
              audioElement={originalAudioElement}
              isPlaying={isPlayingMastered}
              title={`${selectedGenre?.name || 'Mastered'} Frequency Spectrum`}
              targetLufs={selectedGenre ? genrePresets[selectedGenre.id]?.targetLufs : undefined}
              targetTruePeak={selectedGenre ? genrePresets[selectedGenre.id]?.truePeak : undefined}
              isAudioConnected={true}
              analyserNode={analyserNode}
            />
          </>
        ) : (
          <div className="bg-gray-600 rounded-lg p-6 text-center">
            <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Initializing audio processing...</p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-xs text-crys-gold">
            {selectedGenre ? `Real-time ${selectedGenre.name} mastering` : 'Real-time audio processing'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayers;
