import React from 'react';
import { Music } from 'lucide-react';

interface StudioHeaderProps {
  credits: number;
  currentStep: number;
  onNewSession: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({ 
  credits, 
  currentStep, 
  onNewSession 
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-crys-gold to-yellow-500 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-crys-gold">Advanced Studio</h1>
              <p className="text-xs text-gray-400">Professional Audio Mastering Suite</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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
