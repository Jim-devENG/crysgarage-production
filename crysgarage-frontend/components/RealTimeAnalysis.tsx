import React from 'react';

interface RealTimeAnalysisProps {
  analysis: {
    dominantFrequencies: number[];
    dynamicRange: number;
    bassContent: number;
    midContent: number;
    trebleContent: number;
    rhythmComplexity: number;
    vocalPresence: number;
    appliedSettings?: {
      gain: number;
      bassBoost: number;
      midCut: number;
      presenceBoost: number;
      clarityBoost: number;
      airBoost: number;
      compressionThreshold: number;
      compressionRatio: number;
    };
  } | null;
  title: string;
  color: string;
}

const RealTimeAnalysis: React.FC<RealTimeAnalysisProps> = ({ analysis, title, color }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <h4 className={`text-lg font-semibold mb-3 ${color}`}>{title}</h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Frequency Analysis */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Bass Content:</span>
            <span className="text-white">{analysis.bassContent.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mid Content:</span>
            <span className="text-white">{analysis.midContent.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Treble Content:</span>
            <span className="text-white">{analysis.trebleContent.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dynamic Range:</span>
            <span className="text-white">{analysis.dynamicRange.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Vocal Presence:</span>
            <span className="text-white">{analysis.vocalPresence.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rhythm Complexity:</span>
            <span className="text-white">{analysis.rhythmComplexity.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dominant Freq:</span>
            <span className="text-white">{analysis.dominantFrequencies[0]?.toFixed(0) || 'N/A'} Hz</span>
          </div>
        </div>
      </div>

      {/* Applied Settings (if available) */}
      {analysis.appliedSettings && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h5 className="text-md font-semibold mb-2 text-gray-300">Applied Settings</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Gain:</span>
              <span className="text-white">{analysis.appliedSettings.gain.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bass Boost:</span>
              <span className="text-white">{analysis.appliedSettings.bassBoost.toFixed(1)}dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mid Cut:</span>
              <span className="text-white">{analysis.appliedSettings.midCut.toFixed(1)}dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Presence:</span>
              <span className="text-white">{analysis.appliedSettings.presenceBoost.toFixed(1)}dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Clarity:</span>
              <span className="text-white">{analysis.appliedSettings.clarityBoost.toFixed(1)}dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Air:</span>
              <span className="text-white">{analysis.appliedSettings.airBoost.toFixed(1)}dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Comp Threshold:</span>
              <span className="text-white">{analysis.appliedSettings.compressionThreshold.toFixed(1)}dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Comp Ratio:</span>
              <span className="text-white">{analysis.appliedSettings.compressionRatio.toFixed(1)}:1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAnalysis; 