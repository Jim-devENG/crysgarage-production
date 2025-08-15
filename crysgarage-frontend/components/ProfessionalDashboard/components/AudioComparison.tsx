import React from 'react';
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
            />
            
            {/* Frequency Spectrum Analysis for Original */}
            <FrequencySpectrum
              audioElement={null} // Will be connected later
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
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400 font-medium">Live Processing Ready</span>
                    </div>
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
                  audioElement={null} // Will be connected later
                  isPlaying={false}
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
