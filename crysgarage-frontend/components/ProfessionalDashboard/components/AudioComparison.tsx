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

  // Initialize real-time audio processing
  const initializeRealTimeProcessing = async () => {
    if (!selectedFile || !originalAudioElement) {
      console.log('Cannot initialize real-time processing - missing file or audio element');
      return;
    }
    
    try {
      console.log('Initializing real-time processing...');
      
      // Create audio context
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      setAudioContext(ctx);
      
      // Create gain node
      const gain = ctx.createGain();
      setGainNode(gain);
      
      // Create compressor node
      const compressor = ctx.createDynamicsCompressor();
      setCompressorNode(compressor);
      
      // Connect the processing chain (we'll connect the source when needed)
      compressor.connect(gain).connect(ctx.destination);
      
      console.log('Real-time audio processing initialized successfully');
      
      // Apply current genre preset if one is selected
      if (selectedGenre) {
        applyGenrePresetRealTime(selectedGenre);
      }
      
    } catch (error) {
      console.error('Error initializing real-time processing:', error);
    }
  };

  // Apply genre preset in real-time
  const applyGenrePresetRealTime = (genre: any) => {
    if (!gainNode || !compressorNode) return;
    
    const preset = genrePresets[genre.id] || genrePresets.afrobeats;
    
    // Apply gain changes
    gainNode.gain.setValueAtTime(preset.gain, gainNode.context.currentTime);
    
    // Apply compression changes
    compressorNode.threshold.setValueAtTime(preset.compression.threshold, compressorNode.context.currentTime);
    compressorNode.ratio.setValueAtTime(preset.compression.ratio, compressorNode.context.currentTime);
    compressorNode.attack.setValueAtTime(preset.compression.attack, compressorNode.context.currentTime);
    compressorNode.release.setValueAtTime(preset.compression.release, compressorNode.context.currentTime);
    compressorNode.knee.setValueAtTime(10, compressorNode.context.currentTime);
    
    console.log(`Applied ${genre.name} preset in real-time`);
  };

  // Handle real-time mastered audio playback
  const handleRealTimeMasteredPlay = () => {
    if (!originalAudioElement || !audioContext || !compressorNode) {
      console.log('Cannot play real-time mastered audio - missing audio element or processing not initialized');
      return;
    }
    
    try {
      // Create audio source from the original audio element (only when needed)
      const source = audioContext.createMediaElementSource(originalAudioElement);
      setAudioSource(source);
      
      // Connect the source to the processing chain
      source.connect(compressorNode);
      
      setIsPlayingMastered(true);
      setIsPlayingOriginal(false);
      
      // Play the original audio with real-time processing applied
      originalAudioElement.play().catch(console.error);
      console.log('Playing real-time mastered audio with current genre preset');
    } catch (error) {
      console.error('Error setting up real-time mastered playback:', error);
      setIsPlayingMastered(false);
    }
  };

  const handleRealTimeMasteredPause = () => {
    if (originalAudioElement) {
      originalAudioElement.pause();
    }
    setIsPlayingMastered(false);
    console.log('Paused real-time mastered audio');
  };

  // Initialize real-time processing when audio element is ready
  useEffect(() => {
    if (originalAudioElement && !audioContext) {
      initializeRealTimeProcessing();
    }
  }, [originalAudioElement]);

  // Apply genre preset when genre changes
  useEffect(() => {
    if (selectedGenre && gainNode && compressorNode) {
      applyGenrePresetRealTime(selectedGenre);
    }
  }, [selectedGenre, gainNode, compressorNode]);

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
              onPlay={() => {
                setIsPlayingOriginal(true);
                setIsPlayingMastered(false);
                // Initialize real-time processing when audio starts playing
                if (!isRealTimeProcessing) {
                  console.log('Audio started playing, initializing real-time processing...');
                  setTimeout(() => {
                    setIsRealTimeProcessing(true);
                  }, 100);
                }
              }}
              onPause={() => setIsPlayingOriginal(false)}
              className="w-full"
              onAudioElementReady={(audioElement) => {
                console.log('Original audio element ready:', audioElement);
                setOriginalAudioElement(audioElement);
              }}
            />
            
            {/* Frequency Spectrum Analysis for Original */}
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

        {/* Real-time Mastered Audio */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
            {selectedGenre ? `${selectedGenre.name} Mastered` : 'Real-time Mastered Audio'}
          </h3>
          <div className="space-y-4">
            {selectedGenre && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Processing</span>
                  <span className="text-xs font-medium text-crys-gold">Real-time {selectedGenre.name} preset</span>
                </div>
              </div>
            )}
            
            {isRealTimeProcessing ? (
              <>
                {/* Real-time mastered audio controls */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={isPlayingMastered ? handleRealTimeMasteredPause : handleRealTimeMasteredPlay}
                      disabled={!selectedGenre || !audioContext}
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
                        : 'Select a genre to enable real-time mastering'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Frequency Spectrum Analysis for Real-time Mastered */}
                <FrequencySpectrum
                  audioElement={originalAudioElement}
                  isPlaying={isPlayingMastered}
                  title={`${selectedGenre?.name || 'Real-time'} Frequency Spectrum`}
                  targetLufs={selectedGenre ? genrePresets[selectedGenre.id]?.targetLufs : undefined}
                  targetTruePeak={selectedGenre ? genrePresets[selectedGenre.id]?.truePeak : undefined}
                />
              </>
            ) : (
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-gray-400">Initializing real-time processing...</p>
                <p className="text-xs text-crys-gold mt-1">Please wait for audio context to be ready</p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-crys-gold">
                {selectedGenre ? `Real-time ${selectedGenre.name} mastering` : 'Real-time audio processing'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioComparison;
