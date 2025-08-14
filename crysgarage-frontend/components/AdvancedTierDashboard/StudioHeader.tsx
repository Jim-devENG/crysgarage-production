import React from 'react';

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
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-crys-gold to-yellow-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-black rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-crys-gold">Advanced Studio</h1>
              <p className="text-sm text-gray-400">Professional Audio Mastering Suite</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-300">Credits: </span>
              <span className="text-crys-gold font-bold">{credits}</span>
            </div>
            {currentStep > 1 && (
              <>
                <button
                  onClick={onNewSession}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  New Session
                </button>
                <button
                  onClick={onNewSession}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
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
