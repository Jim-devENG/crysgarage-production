import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import GenreGrid from './components/GenreGrid';
import AudioPlayers from './components/AudioPlayers';
import { availableGenres } from '../GenreDropdown';
import { GENRE_PRESETS } from './utils/genrePresets';

interface AudioProcessingStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  onGenreSelect: (genre: any) => void;
  onProcessingComplete: (audioUrl: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  onBack: () => void;
}

const AudioProcessingStep: React.FC<AudioProcessingStepProps> = ({
  selectedFile,
  selectedGenre,
  onGenreSelect,
  onProcessingComplete,
  isProcessing,
  setIsProcessing,
  onBack
}) => {
  const [isAudioReady, setIsAudioReady] = useState(false);

  const handleGenreSelect = (genre: any) => {
    onGenreSelect(genre);
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
        <h3 className="text-xl font-semibold mb-4 text-center">Choose Your Genre</h3>
        <GenreGrid
          genres={availableGenres}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
        />
      </div>

      {/* Audio Players - Only show when genre is selected */}
      {selectedGenre && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-crys-gold">
            {selectedGenre.name} Mastering
          </h3>
          <AudioPlayers
            selectedFile={selectedFile}
            selectedGenre={selectedGenre}
            genrePresets={GENRE_PRESETS}
            onAudioReady={() => setIsAudioReady(true)}
            onProcessingComplete={onProcessingComplete}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </div>
      )}

      {/* Instructions */}
      {!selectedGenre && (
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎵</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Genre</h3>
          <p className="text-gray-400">
            Choose a genre above to start real-time audio mastering. 
            The mastered player will appear and you can hear the changes instantly.
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioProcessingStep;
