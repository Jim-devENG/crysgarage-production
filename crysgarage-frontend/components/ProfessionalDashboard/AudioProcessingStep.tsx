import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import GenreGrid from './components/GenreGrid';
import RealTimeAudioPlayer from './components/RealTimeAudioPlayer';
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

  const handleGenreSelect = (genre: any) => {
    onGenreSelect(genre);
    setIsAudioReady(true);
  };

  const handleGenreChange = (newGenre: any) => {
    onGenreSelect(newGenre);
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
            <h2 className="text-2xl font-bold text-crys-gold">Real-Time Processing</h2>
            <p className="text-gray-400">Select genres and hear instant changes while playing</p>
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
              <span className="text-sm text-gray-400">Ready for real-time processing</span>
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
          isProcessing={isProcessing}
          isRealTimeProcessing={true}
          isPlayingOriginal={false}
        />
        
        {!selectedGenre && (
          <div className="mt-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🎵</span>
            </div>
            <p className="text-sm text-gray-400">
              Select a genre to start real-time processing
            </p>
          </div>
        )}
      </div>

      {/* Real-Time Audio Player */}
      <div className="max-w-4xl mx-auto">
        <RealTimeAudioPlayer
          audioFile={selectedFile}
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
          className="w-full"
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl">🎵</span>
            </div>
            <h4 className="font-medium">1. Select Genre</h4>
            <p className="text-sm text-gray-400">Choose from our professional mastering presets</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl">▶️</span>
            </div>
            <h4 className="font-medium">2. Start Playing</h4>
            <p className="text-sm text-gray-400">Click play to hear your audio with the selected effects</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl">⚡</span>
            </div>
            <h4 className="font-medium">3. Switch Genres</h4>
            <p className="text-sm text-gray-400">Change genres while playing to hear instant differences</p>
          </div>
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
