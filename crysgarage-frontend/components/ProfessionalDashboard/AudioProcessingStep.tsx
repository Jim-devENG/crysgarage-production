import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import GenreGrid from './components/GenreGrid';
import AudioPlayers from './components/AudioPlayers';
import { availableGenres } from '../GenreDropdown';
import { GENRE_PRESETS } from './utils/genrePresets';
import StyledAudioPlayer from '../StyledAudioPlayer';
import FrequencySpectrum from '../FrequencySpectrum';

interface AudioProcessingStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  onGenreSelect: (genre: any) => void;
  onProcessingComplete: (audioUrl: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

const AudioProcessingStep: React.FC<AudioProcessingStepProps> = ({
  selectedFile,
  selectedGenre,
  onGenreSelect,
  onProcessingComplete,
  isProcessing,
  setIsProcessing,
  onBack,
  onNext
}) => {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleGenreSelect = (genre: any) => {
    onGenreSelect(genre);
  };

  const handleOriginalPlay = () => {
    setIsPlayingOriginal(true);
  };

  const handleOriginalPause = () => {
    setIsPlayingOriginal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-crys-gold">Process & Master</h2>
            <p className="text-gray-400">Select a genre and hear real-time mastering</p>
          </div>
        </div>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Selected File</h3>
              <p className="text-gray-400">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400">Ready for processing</span>
            </div>
          </div>
        </div>
      )}

      {/* Genre Selection */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Choose Your Genre</h3>
        <GenreGrid
          genres={availableGenres}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
        />
        
        {!selectedGenre && (
          <div className="mt-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🎵</span>
            </div>
            <p className="text-sm text-gray-400">
              Select a genre to start real-time mastering
            </p>
          </div>
        )}
      </div>

      {/* Audio Players - Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Audio Player */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Original Audio</h3>
          <div className="space-y-4">
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
              targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.targetLufs : undefined}
              targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.truePeak : undefined}
            />
            
            <div className="text-center">
              <p className="text-xs text-gray-400">Original, unprocessed audio</p>
            </div>
          </div>
        </div>

        {/* Mastered Audio Player */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
            {selectedGenre ? `${selectedGenre.name} Mastered` : 'Mastered Audio'}
          </h3>
          {selectedGenre ? (
            <AudioPlayers
              selectedFile={selectedFile}
              selectedGenre={selectedGenre}
              genrePresets={GENRE_PRESETS}
              onAudioReady={() => setIsAudioReady(true)}
              onProcessingComplete={onProcessingComplete}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🎚️</span>
                </div>
                <p className="text-sm text-gray-400">
                  Select a genre above to enable mastered audio
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-crys-gold">Real-time audio processing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Button */}
      {selectedGenre && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-8 py-4 bg-crys-gold hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors flex items-center space-x-3"
          >
            <span>Next: Download Your Mastered Audio</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioProcessingStep;
