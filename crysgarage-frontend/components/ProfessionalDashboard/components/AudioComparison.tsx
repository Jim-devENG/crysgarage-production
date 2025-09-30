import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import StyledAudioPlayer from '../../StyledAudioPlayer';
import FrequencySpectrum from '../../FrequencySpectrum';
import { GenrePreset } from '../types';

interface AudioComparisonProps {
  selectedFile: File | null;
  selectedGenre: any;
  isRealTimeProcessing: boolean;
  setIsRealTimeProcessing: (processing: boolean) => void;
  isPlayingOriginal: boolean;
  setIsPlayingOriginal: (playing: boolean) => void;
  genrePresets: Record<string, GenrePreset>;
}

const AudioComparison: React.FC<AudioComparisonProps> = ({
  selectedFile,
  selectedGenre,
  isRealTimeProcessing,
  setIsRealTimeProcessing,
  isPlayingOriginal,
  setIsPlayingOriginal,
  genrePresets
}) => {
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [compressorNode, setCompressorNode] = useState<DynamicsCompressorNode | null>(null);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isProcessingReady, setIsProcessingReady] = useState(false);

  // Initialize audio processing only when needed
  const initializeAudioProcessing = async () => {
    if (!originalAudioElement || audioContext) {
      return;
    }

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
      
      // Connect processing chain
      compressor.connect(gain).connect(ctx.destination);
      
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
      setIsProcessingReady(true);
      
      console.log('Audio processing initialized successfully');
      
    } catch (error) {
      console.error('Error initializing audio processing:', error);
      setIsProcessingReady(false);
    }
  };

  // Apply genre preset
  const applyGenrePreset = (genre: any) => {
    if (!gainNode || !compressorNode || !genre) return;
    
    try {
      const preset = genrePresets[genre.id] || genrePresets.afrobeats;
      
      // Apply gain
      gainNode.gain.setValueAtTime(preset.gain, gainNode.context.currentTime);
      
      // Apply compression
      compressorNode.threshold.setValueAtTime(preset.compression.threshold, compressorNode.context.currentTime);
      compressorNode.ratio.setValueAtTime(preset.compression.ratio, compressorNode.context.currentTime);
      compressorNode.attack.setValueAtTime(preset.compression.attack, compressorNode.context.currentTime);
      compressorNode.release.setValueAtTime(preset.compression.release, compressorNode.context.currentTime);
      compressorNode.knee.setValueAtTime(10, compressorNode.context.currentTime);
      
      console.log(`Applied ${genre.name} preset`);
    } catch (error) {
      console.error('Error applying genre preset:', error);
    }
  };

  // Handle mastered audio play
  const handleMasteredPlay = async () => {
    if (!originalAudioElement || !isProcessingReady) {
      console.log('Cannot play mastered audio - not ready');
      return;
    }

    try {
      // Initialize processing if not done yet
      if (!audioContext) {
        await initializeAudioProcessing();
      }

      // Create audio source only once
      if (!audioSource) {
        const source = audioContext!.createMediaElementSource(originalAudioElement);
        source.connect(compressorNode!);
        setAudioSource(source);
      }

      // Apply current genre preset
      if (selectedGenre) {
        applyGenrePreset(selectedGenre);
      }

      setIsPlayingMastered(true);
      setIsPlayingOriginal(false);
      
      // Play the audio
      await originalAudioElement.play();
      console.log('Playing mastered audio');
      
    } catch (error) {
      console.error('Error playing mastered audio:', error);
      setIsPlayingMastered(false);
    }
  };

  // Handle mastered audio pause
  const handleMasteredPause = () => {
    if (originalAudioElement) {
      originalAudioElement.pause();
    }
    setIsPlayingMastered(false);
  };

  // Handle original audio play
  const handleOriginalPlay = () => {
    setIsPlayingOriginal(true);
    setIsPlayingMastered(false);
  };

  // Handle original audio pause
  const handleOriginalPause = () => {
    setIsPlayingOriginal(false);
  };

  // Set real-time processing when audio element is ready
  useEffect(() => {
    if (originalAudioElement && !isRealTimeProcessing) {
      setIsRealTimeProcessing(true);
    }
  }, [originalAudioElement, isRealTimeProcessing, setIsRealTimeProcessing]);

  // Apply genre preset when genre changes
  useEffect(() => {
    if (selectedGenre && isProcessingReady) {
      applyGenrePreset(selectedGenre);
    }
  }, [selectedGenre, isProcessingReady]);

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

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-crys-gold mb-2">Before & After Comparison</h2>
        <p className="text-gray-400">Compare your original audio with the mastered version</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Original Audio</h3>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">File</span>
                <span className="text-xs font-medium">{selectedFile?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Size</span>
                <span className="text-xs font-medium">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            
            <StyledAudioPlayer
              src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
              title="Original Audio"
              onPlay={handleOriginalPlay}
              onPause={handleOriginalPause}
              className="w-full"
              onAudioElementReady={(audioElement) => {
                setOriginalAudioElement(audioElement);
              }}
            />
            
            <FrequencySpectrum
              audioElement={originalAudioElement}
              isPlaying={isPlayingOriginal}
              title="Original Frequency Spectrum"
              targetLufs={selectedGenre ? genrePresets[selectedGenre.id]?.targetLufs : undefined}
              targetTruePeak={selectedGenre ? genrePresets[selectedGenre.id]?.truePeak : undefined}
            />
            
            <div className="text-center">
              <p className="text-xs text-gray-400">Original, unprocessed audio</p>
            </div>
          </div>
        </div>

        {/* Mastered Audio */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
            {selectedGenre ? `${selectedGenre.name} Mastered` : 'Mastered Audio'}
          </h3>
          <div className="space-y-4">
            {selectedGenre && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Processing</span>
                  <span className="text-xs font-medium text-crys-gold">{selectedGenre.name} preset</span>
                </div>
              </div>
            )}
            
            {isRealTimeProcessing ? (
              <>
                {/* Mastered audio controls */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={isPlayingMastered ? handleMasteredPause : handleMasteredPlay}
                      disabled={!selectedGenre || !originalAudioElement}
                      className={`p-3 rounded-full transition-all duration-300 ${
                        isPlayingMastered
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-crys-gold hover:bg-yellow-400 text-black'
                      } disabled:bg-gray-600 disabled:cursor-not-allowed`}
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
                />
              </>
            ) : (
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-gray-400">Initializing audio processing...</p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-crys-gold">
                {selectedGenre ? `${selectedGenre.name} mastering` : 'Real-time audio processing'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioComparison;
