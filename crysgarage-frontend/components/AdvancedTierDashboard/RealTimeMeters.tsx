import React, { useState } from 'react';
import { BarChart3, Settings, Target, Gauge } from 'lucide-react';

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftPeak: number;
  rightPeak: number;
  leftRms: number;
  rightRms: number;
}

interface RealTimeMetersProps {
  meterData: MeterData;
}

const RealTimeMeters: React.FC<RealTimeMetersProps> = ({ meterData }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [meterSettings, setMeterSettings] = useState({
    lufsTarget: -14,
    peakTarget: -1,
    rmsTarget: -12,
    correlationTarget: 0.8,
    refreshRate: 60,
    smoothing: 0.1
  });

  const updateMeterSetting = (key: string, value: number) => {
    setMeterSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-crys-gold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Real-Time Analysis
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Meter Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h4 className="text-lg font-semibold text-crys-gold mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Meter Settings
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">LUFS Target</label>
              <input
                type="range"
                min="-30"
                max="-10"
                step="0.1"
                value={meterSettings.lufsTarget}
                onChange={(e) => updateMeterSetting('lufsTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.lufsTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Peak Target</label>
              <input
                type="range"
                min="-3"
                max="0"
                step="0.1"
                value={meterSettings.peakTarget}
                onChange={(e) => updateMeterSetting('peakTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.peakTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">RMS Target</label>
              <input
                type="range"
                min="-20"
                max="-8"
                step="0.1"
                value={meterSettings.rmsTarget}
                onChange={(e) => updateMeterSetting('rmsTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.rmsTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Correlation Target</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={meterSettings.correlationTarget}
                onChange={(e) => updateMeterSetting('correlationTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.correlationTarget}</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Refresh Rate (Hz)</label>
              <input
                type="range"
                min="30"
                max="120"
                step="1"
                value={meterSettings.refreshRate}
                onChange={(e) => updateMeterSetting('refreshRate', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.refreshRate} Hz</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Smoothing</label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={meterSettings.smoothing}
                onChange={(e) => updateMeterSetting('smoothing', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.smoothing}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* LUFS Meter */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">LUFS</span>
            <div className="text-xs text-gray-500">Target: {meterSettings.lufsTarget}dB</div>
          </div>
          <div className="bg-gray-800 rounded h-32 relative">
            <div 
              className="bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
              style={{ height: `${Math.max(0, Math.min(100, (meterData.lufs + 60) * 1.67))}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-lg font-bold">{meterData.lufs.toFixed(1)}</span>
            </div>
            {/* Target line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-white border-dashed"
              style={{ bottom: `${Math.max(0, Math.min(100, (meterSettings.lufsTarget + 60) * 1.67))}%` }}
            />
          </div>
        </div>

        {/* Peak Meter */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">Peak</span>
            <div className="text-xs text-gray-500">Target: {meterSettings.peakTarget}dB</div>
          </div>
          <div className="bg-gray-800 rounded h-32 relative">
            <div 
              className="bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
              style={{ height: `${Math.max(0, Math.min(100, (meterData.peak + 60) * 1.67))}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-lg font-bold">{meterData.peak.toFixed(1)}</span>
            </div>
            {/* Target line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-white border-dashed"
              style={{ bottom: `${Math.max(0, Math.min(100, (meterSettings.peakTarget + 60) * 1.67))}%` }}
            />
          </div>
        </div>

        {/* Correlation Meter */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">Correlation</span>
            <div className="text-xs text-gray-500">Target: {meterSettings.correlationTarget}</div>
          </div>
          <div className="bg-gray-800 rounded h-32 relative">
            <div 
              className="bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
              style={{ height: `${meterData.correlation * 100}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-lg font-bold">{meterData.correlation.toFixed(2)}</span>
            </div>
            {/* Target line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-white border-dashed"
              style={{ bottom: `${meterSettings.correlationTarget * 100}%` }}
            />
          </div>
        </div>

        {/* RMS Meter */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">RMS</span>
            <div className="text-xs text-gray-500">Target: {meterSettings.rmsTarget}dB</div>
          </div>
          <div className="bg-gray-800 rounded h-32 relative">
            <div 
              className="bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
              style={{ height: `${Math.max(0, Math.min(100, (meterData.rms + 60) * 1.67))}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-lg font-bold">{meterData.rms.toFixed(1)}</span>
            </div>
            {/* Target line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-white border-dashed"
              style={{ bottom: `${Math.max(0, Math.min(100, (meterSettings.rmsTarget + 60) * 1.67))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Left/Right Meters */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">Left Channel</span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 bg-gray-800 rounded h-24 relative">
              <div 
                className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                style={{ height: `${Math.max(0, Math.min(100, (meterData.leftPeak + 60) * 1.67))}%` }}
              />
            </div>
            <div className="flex-1 bg-gray-800 rounded h-24 relative">
              <div 
                className="bg-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                style={{ height: `${Math.max(0, Math.min(100, (meterData.leftRms + 60) * 1.67))}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Peak: {meterData.leftPeak.toFixed(1)}</span>
            <span>RMS: {meterData.leftRms.toFixed(1)}</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">Right Channel</span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 bg-gray-800 rounded h-24 relative">
              <div 
                className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                style={{ height: `${Math.max(0, Math.min(100, (meterData.rightPeak + 60) * 1.67))}%` }}
              />
            </div>
            <div className="flex-1 bg-gray-800 rounded h-24 relative">
              <div 
                className="bg-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                style={{ height: `${Math.max(0, Math.min(100, (meterData.rightRms + 60) * 1.67))}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Peak: {meterData.rightPeak.toFixed(1)}</span>
            <span>RMS: {meterData.rightRms.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMeters;
