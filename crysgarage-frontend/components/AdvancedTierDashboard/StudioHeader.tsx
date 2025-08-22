import React from 'react';
import { Music, Upload, Settings, BarChart3, Download, Lock, Unlock } from 'lucide-react';
import { GenreDropdown } from '../GenreDropdown';

interface StudioHeaderProps {
  credits: number;
  currentStep: number;
  onNewSession: () => void;
  selectedGenre: string;
  onGenreSelect: (genreId: string, price: number) => void;
  genreLocked: boolean;
  onToggleGenreLock: () => void;
  manualAdjustments: Set<string>;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({ 
  credits, 
  currentStep, 
  onNewSession,
  selectedGenre,
  onGenreSelect,
  genreLocked,
  onToggleGenreLock,
  manualAdjustments
}) => {
  const getStepInfo = (step: number) => {
    switch (step) {
      case 1:
        return { icon: Upload, label: 'Upload', color: 'text-blue-400' };
      case 2:
        return { icon: Settings, label: 'Mastering', color: 'text-amber-400' };
      case 3:
        return { icon: BarChart3, label: 'Analysis', color: 'text-purple-400' };
      case 4:
        return { icon: Download, label: 'Export', color: 'text-green-400' };
      default:
        return { icon: Upload, label: 'Upload', color: 'text-gray-400' };
    }
  };

  const currentStepInfo = getStepInfo(currentStep);

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Genre Selector - Only show in mastering step */}
          {currentStep === 2 && (
            <div className="absolute top-full left-0 right-0 bg-gray-800 border-b border-gray-600 p-4 z-10">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-crys-gold">Genre Selection</h3>
                  <p className="text-sm text-gray-400">Select a genre to automatically apply professional mastering presets</p>
                </div>
                <GenreDropdown
                  selectedGenre={selectedGenre}
                  onGenreSelect={onGenreSelect}
                  disabled={false}
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-crys-gold to-yellow-500 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-crys-gold">Advanced Studio</h1>
              <p className="text-xs text-gray-400">Professional Audio Mastering Suite</p>
            </div>
          </div>
          
          {/* Step Indicator */}
          {currentStep > 1 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}>
                  <Upload className="w-3 h-3 text-white" />
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-amber-500' : 'bg-gray-600'}`}>
                  <Settings className="w-3 h-3 text-white" />
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-600'}`}>
                  <BarChart3 className="w-3 h-3 text-white" />
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <Download className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-xs text-gray-300">
                Step {currentStep}: <span className={currentStepInfo.color}>{currentStepInfo.label}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {/* Genre Selection */}
            {currentStep >= 2 && (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-gray-300">Genre: </span>
                  <span className="text-crys-gold font-bold text-sm">
                    {selectedGenre ? selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1) : 'None'}
                  </span>
                </div>
                {selectedGenre && (
                  <button
                    onClick={onToggleGenreLock}
                    className={`p-1.5 rounded-lg transition-colors ${
                      genreLocked 
                        ? 'bg-crys-gold text-black' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                    title={genreLocked ? 'Genre Locked' : 'Genre Unlocked'}
                  >
                    {genreLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                )}
                {manualAdjustments.size > 0 && (
                  <div className="bg-yellow-600 px-2 py-1 rounded-lg">
                    <span className="text-xs text-black font-bold">
                      {manualAdjustments.size} Modified
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gray-700 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-gray-300">Credits: </span>
              <span className="text-crys-gold font-bold text-sm">{credits}</span>
            </div>
            {currentStep > 1 && (
              <>
                <button
                  onClick={onNewSession}
                  className="bg-gray-700 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                >
                  New Session
                </button>
                <button
                  onClick={onNewSession}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioHeader;
