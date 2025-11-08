import React from 'react';
import { GenrePreset } from '../types';

interface AnalysisSummaryProps {
  selectedGenre: any;
  genrePresets: Record<string, GenrePreset>;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  selectedGenre,
  genrePresets
}) => {
  const preset = selectedGenre ? genrePresets[selectedGenre.id] : null;

  if (!preset) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
        Mastering Analysis Summary
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-medium text-white">Applied Processing</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Genre Preset:</span>
              <span className="text-crys-gold font-medium">{selectedGenre.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Processing:</span>
              <span className="text-green-400 font-medium">Complete</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-white">Frequency Enhancements</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Low Frequencies:</span>
              <span className="text-crys-gold font-medium">
                +{Math.round(preset.eq.low * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Mid Frequencies:</span>
              <span className="text-crys-gold font-medium">
                +{Math.round(preset.eq.mid * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">High Frequencies:</span>
              <span className="text-crys-gold font-medium">
                +{Math.round(preset.eq.high * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Processing:</span>
              <span className="text-green-400 font-medium">Complete</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Target LUFS:</span>
              <span className="text-crys-gold font-medium">{preset.targetLufs} dB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">True Peak:</span>
              <span className="text-crys-gold font-medium">{preset.truePeak} dB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummary;
