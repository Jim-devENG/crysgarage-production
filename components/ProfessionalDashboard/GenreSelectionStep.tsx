import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { availableGenres } from '../GenreDropdown';
import GenreGrid from './components/GenreGrid';
import AudioComparison from './components/AudioComparison';
import AnalysisSummary from './components/AnalysisSummary';
import { GENRE_PRESETS } from './utils/genrePresets';

interface GenreSelectionStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  setSelectedGenre: (genre: any) => void;
  processedAudioUrl: string | null;
  setProcessedAudioUrl: (url: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}

const GenreSelectionStep: React.FC<GenreSelectionStepProps> = ({
  selectedFile,
  selectedGenre,
  setSelectedGenre,
  processedAudioUrl,
  setProcessedAudioUrl,
  isProcessing,
  setIsProcessing,
  onNext,
  onPrev
}) => {
  const [isRealTimeProcessing, setIsRealTimeProcessing] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);

  const handleGenreSelect = async (genre: any) => {
    if (!selectedFile) return;
    
    console.log('Genre selected:', genre.name);
    setSelectedGenre(genre);
    
    // For now, just set the processed audio URL to the original file
    // This will be replaced with actual processing later
    setProcessedAudioUrl(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="space-y-8">
      {/* Genre Selection */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-crys-gold mb-2">Select Genre & Process</h2>
          <p className="text-gray-400">Click a genre to apply its preset and process your audio</p>
          {isRealTimeProcessing && isPlayingOriginal && (
            <div className="mt-2 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Real-time processing active</span>
            </div>
          )}
        </div>
        
        <GenreGrid
          genres={availableGenres}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
          isProcessing={isProcessing}
          isRealTimeProcessing={isRealTimeProcessing}
          isPlayingOriginal={isPlayingOriginal}
        />
      </div>

      {/* Audio Comparison */}
      <AudioComparison
        selectedFile={selectedFile}
        selectedGenre={selectedGenre}
        isRealTimeProcessing={isRealTimeProcessing}
        setIsRealTimeProcessing={setIsRealTimeProcessing}
        isPlayingOriginal={isPlayingOriginal}
        setIsPlayingOriginal={setIsPlayingOriginal}
        genrePresets={GENRE_PRESETS}
      />

      {/* Analysis Summary */}
      {processedAudioUrl && selectedGenre && (
        <AnalysisSummary
          selectedGenre={selectedGenre}
          genrePresets={GENRE_PRESETS}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onPrev}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        {selectedGenre && (
          <button
            onClick={onNext}
            className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
          >
            <span>Continue to Download</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GenreSelectionStep;
