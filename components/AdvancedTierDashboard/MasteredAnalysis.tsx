import React from 'react';
import { CheckCircle, TrendingUp, BarChart3, Target, Zap } from 'lucide-react';

interface MasteredAnalysisData {
  original: {
    lufs: number;
    peak: number;
    rms: number;
    dynamicRange: number;
  };
  mastered: {
    lufs: number;
    peak: number;
    rms: number;
    dynamicRange: number;
  };
  changes: {
    lufsChange: number;
    peakChange: number;
    rmsChange: number;
    dynamicRangeChange: number;
  };
  effectsApplied: string[];
}

interface MasteredAnalysisProps {
  analysisData: MasteredAnalysisData;
}

const MasteredAnalysis: React.FC<MasteredAnalysisProps> = ({ analysisData }) => {
  const getImprovementColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getImprovementIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <BarChart3 className="w-4 h-4 text-red-400" />;
    return <CheckCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-black bg-opacity-20 rounded-lg p-6 border border-gray-600 border-opacity-30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          Mastered Analysis Summary
        </h3>
        <span className="text-sm text-green-400 font-medium">✓ Processing Complete</span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Original Analysis */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Original Audio
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">LUFS:</span>
              <span className="text-sm font-bold text-gray-300">
                {analysisData.original.lufs.toFixed(1)} LUFS
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Peak:</span>
              <span className="text-sm font-bold text-gray-300">
                {analysisData.original.peak.toFixed(1)} dB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">RMS:</span>
              <span className="text-sm font-bold text-gray-300">
                {analysisData.original.rms.toFixed(1)} dB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Dynamic Range:</span>
              <span className="text-sm font-bold text-gray-300">
                {analysisData.original.dynamicRange.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>

        {/* Mastered Analysis */}
        <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-500 border-opacity-30">
          <h4 className="text-sm font-semibold text-green-400 mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Mastered Audio
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">LUFS:</span>
              <span className="text-sm font-bold text-green-400">
                {analysisData.mastered.lufs.toFixed(1)} LUFS
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Peak:</span>
              <span className="text-sm font-bold text-green-400">
                {analysisData.mastered.peak.toFixed(1)} dB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">RMS:</span>
              <span className="text-sm font-bold text-green-400">
                {analysisData.mastered.rms.toFixed(1)} dB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Dynamic Range:</span>
              <span className="text-sm font-bold text-green-400">
                {analysisData.mastered.dynamicRange.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvements Section */}
      <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-500 border-opacity-30 mb-6">
        <h4 className="text-sm font-semibold text-blue-400 mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Improvements Made
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              {getImprovementIcon(analysisData.changes.lufsChange)}
            </div>
            <div className={`text-lg font-bold ${getImprovementColor(analysisData.changes.lufsChange)}`}>
              {analysisData.changes.lufsChange > 0 ? '+' : ''}{analysisData.changes.lufsChange.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">LUFS</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              {getImprovementIcon(analysisData.changes.peakChange)}
            </div>
            <div className={`text-lg font-bold ${getImprovementColor(analysisData.changes.peakChange)}`}>
              {analysisData.changes.peakChange > 0 ? '+' : ''}{analysisData.changes.peakChange.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Peak</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              {getImprovementIcon(analysisData.changes.rmsChange)}
            </div>
            <div className={`text-lg font-bold ${getImprovementColor(analysisData.changes.rmsChange)}`}>
              {analysisData.changes.rmsChange > 0 ? '+' : ''}{analysisData.changes.rmsChange.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">RMS</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              {getImprovementIcon(analysisData.changes.dynamicRangeChange)}
            </div>
            <div className={`text-lg font-bold ${getImprovementColor(analysisData.changes.dynamicRangeChange)}`}>
              {analysisData.changes.dynamicRangeChange > 0 ? '+' : ''}{analysisData.changes.dynamicRangeChange.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Dynamic</div>
          </div>
        </div>
      </div>

      {/* Effects Applied */}
      <div className="bg-purple-900 bg-opacity-20 rounded-lg p-4 border border-purple-500 border-opacity-30">
        <h4 className="text-sm font-semibold text-purple-400 mb-4 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Effects Applied
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {analysisData.effectsApplied.map((effect, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-gray-300">{effect}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasteredAnalysis;
