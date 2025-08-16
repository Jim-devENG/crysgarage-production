import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, Settings, Target, Gauge, Activity, Radio, Zap, Volume2, Waves } from 'lucide-react';
import FrequencyMeter from './meters/FrequencyMeter';
import Goniometer from './meters/Goniometer';
import CorrelationMeter from './meters/CorrelationMeter';
import LUFSMeter from './meters/LUFSMeter';
import StereoMeter from './meters/StereoMeter';

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftLevel: number;
  rightLevel: number;
  frequencyData: number[];
  goniometerData: number[];
}

interface RealTimeMetersProps {
  meterData: MeterData;
  audioEffects?: any;
  onUpdateEffectSettings?: (effectType: string, settings: any) => void;
  onManualInit?: () => void;
}

const RealTimeMeters: React.FC<RealTimeMetersProps> = ({ 
  meterData, 
  audioEffects, 
  onUpdateEffectSettings,
  onManualInit 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'stereo'>('overview');
  const [meterSettings, setMeterSettings] = useState({
    lufsTarget: -14,
    peakTarget: -1,
    rmsTarget: -12,
    correlationTarget: 0.8,
    refreshRate: 60,
    smoothing: 0.1
  });

  const [autoAdjust, setAutoAdjust] = useState({
    lufs: true,
    peak: true,
    rms: true,
    correlation: false
  });

  // Auto-adjust audio effects based on meter targets
  const updateMeterSetting = (key: string, value: number) => {
    setMeterSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Auto-adjust audio effects to achieve meter targets
    if (audioEffects && onUpdateEffectSettings && onManualInit) {
      switch (key) {
        case 'lufsTarget':
          if (autoAdjust.lufs) {
            // Adjust limiter threshold and makeup gain to achieve LUFS target
            const lufsDiff = meterData.lufs - value;
            if (Math.abs(lufsDiff) > 0.5) {
              // Adjust limiter threshold
              const newThreshold = Math.max(-20, Math.min(0, (audioEffects.limiter?.threshold || -1) + (lufsDiff * 0.5)));
              onUpdateEffectSettings('limiter', { 
                ...audioEffects.limiter, 
                threshold: newThreshold 
              });

              // Adjust G-Mastering Compressor makeup gain
              if (audioEffects.gMasteringCompressor?.enabled) {
                const newMakeup = Math.max(-20, Math.min(20, (audioEffects.gMasteringCompressor.makeup || 0) + (lufsDiff * 0.3)));
                onUpdateEffectSettings('gMasteringCompressor', {
                  ...audioEffects.gMasteringCompressor,
                  makeup: newMakeup
                });
              }

              onManualInit();
            }
          }
          break;

        case 'peakTarget':
          if (autoAdjust.peak) {
            // Adjust limiter threshold to achieve peak target
            const peakDiff = meterData.peak - value;
            if (Math.abs(peakDiff) > 0.1) {
              const newThreshold = Math.max(-20, Math.min(0, (audioEffects.limiter?.threshold || -1) + (peakDiff * 0.8)));
              onUpdateEffectSettings('limiter', { 
                ...audioEffects.limiter, 
                threshold: newThreshold 
              });

              // Remove G-Limiter auto-adjustment to prevent knob movement
              // if (audioEffects.gLimiter?.enabled) {
              //   onUpdateEffectSettings('gLimiter', {
              //     ...audioEffects.gLimiter,
              //     threshold: newThreshold
              //   });
              // }

              onManualInit();
            }
          }
          break;

        case 'rmsTarget':
          if (autoAdjust.rms) {
            // Adjust compressor settings to achieve RMS target
            const rmsDiff = meterData.rms - value;
            if (Math.abs(rmsDiff) > 0.5) {
              // Adjust compressor ratio
              if (audioEffects.compressor?.enabled) {
                const newRatio = Math.max(1, Math.min(20, (audioEffects.compressor.ratio || 4) + (rmsDiff * 0.2)));
                onUpdateEffectSettings('compressor', {
                  ...audioEffects.compressor,
                  ratio: newRatio
                });
              }

              // Adjust G-Mastering Compressor
              if (audioEffects.gMasteringCompressor?.enabled) {
                const newRatio = Math.max(1, Math.min(20, (audioEffects.gMasteringCompressor.ratio || 4) + (rmsDiff * 0.15)));
                onUpdateEffectSettings('gMasteringCompressor', {
                  ...audioEffects.gMasteringCompressor,
                  ratio: newRatio
                });
              }

              onManualInit();
            }
          }
          break;

        case 'correlationTarget':
          if (autoAdjust.correlation) {
            // Adjust stereo widener to achieve correlation target
            const correlationDiff = meterData.correlation - value;
            if (Math.abs(correlationDiff) > 0.05) {
              if (audioEffects.stereoWidener?.enabled) {
                const currentWidth = audioEffects.stereoWidener.width || 0;
                const newWidth = Math.max(0, Math.min(100, currentWidth + (correlationDiff * 20)));
                onUpdateEffectSettings('stereoWidener', {
                  ...audioEffects.stereoWidener,
                  width: newWidth
                });
              }

              // Also adjust G-Widener if enabled
              if (audioEffects.gWidener?.enabled) {
                const currentWidth = audioEffects.gWidener.width || 0;
                const newWidth = Math.max(0, Math.min(100, currentWidth + (correlationDiff * 15)));
                onUpdateEffectSettings('gWidener', {
                  ...audioEffects.gWidener,
                  width: newWidth
                });
              }

              onManualInit();
            }
          }
          break;
      }
    }
  };

  // Real-time auto-adjustment based on current meter readings
  useEffect(() => {
    if (!audioEffects || !onUpdateEffectSettings || !onManualInit) return;

    const autoAdjustInterval = setInterval(() => {
      // Auto-adjust LUFS
      if (autoAdjust.lufs && Math.abs(meterData.lufs - meterSettings.lufsTarget) > 0.5) {
        const lufsDiff = meterData.lufs - meterSettings.lufsTarget;
        const adjustment = lufsDiff * 0.1; // Gradual adjustment

        // Adjust limiter threshold
        if (audioEffects.limiter?.enabled) {
          const newThreshold = Math.max(-20, Math.min(0, (audioEffects.limiter.threshold || -1) + adjustment));
          onUpdateEffectSettings('limiter', { 
            ...audioEffects.limiter, 
            threshold: newThreshold 
          });
        }

        // Adjust G-Mastering Compressor makeup
        if (audioEffects.gMasteringCompressor?.enabled) {
          const newMakeup = Math.max(-20, Math.min(20, (audioEffects.gMasteringCompressor.makeup || 0) + (adjustment * 0.6)));
          onUpdateEffectSettings('gMasteringCompressor', {
            ...audioEffects.gMasteringCompressor,
            makeup: newMakeup
          });
        }

        onManualInit();
      }

      // Auto-adjust Peak
      if (autoAdjust.peak && Math.abs(meterData.peak - meterSettings.peakTarget) > 0.1) {
        const peakDiff = meterData.peak - meterSettings.peakTarget;
        const adjustment = peakDiff * 0.2;

        if (audioEffects.limiter?.enabled) {
          const newThreshold = Math.max(-20, Math.min(0, (audioEffects.limiter.threshold || -1) + adjustment));
          onUpdateEffectSettings('limiter', { 
            ...audioEffects.limiter, 
            threshold: newThreshold 
          });
        }

        onManualInit();
      }

      // Auto-adjust RMS
      if (autoAdjust.rms && Math.abs(meterData.rms - meterSettings.rmsTarget) > 0.5) {
        const rmsDiff = meterData.rms - meterSettings.rmsTarget;
        const adjustment = rmsDiff * 0.05;

        if (audioEffects.compressor?.enabled) {
          const newRatio = Math.max(1, Math.min(20, (audioEffects.compressor.ratio || 4) + adjustment));
          onUpdateEffectSettings('compressor', {
            ...audioEffects.compressor,
            ratio: newRatio
          });
        }

        if (audioEffects.gMasteringCompressor?.enabled) {
          const newRatio = Math.max(1, Math.min(20, (audioEffects.gMasteringCompressor.ratio || 4) + adjustment));
          onUpdateEffectSettings('gMasteringCompressor', {
            ...audioEffects.gMasteringCompressor,
            ratio: newRatio
          });
        }

        onManualInit();
      }

      // Auto-adjust Correlation
      if (autoAdjust.correlation && Math.abs(meterData.correlation - meterSettings.correlationTarget) > 0.05) {
        const correlationDiff = meterData.correlation - meterSettings.correlationTarget;
        const adjustment = correlationDiff * 2;

        if (audioEffects.stereoWidener?.enabled) {
          const newWidth = Math.max(0, Math.min(100, (audioEffects.stereoWidener.width || 0) + adjustment));
          onUpdateEffectSettings('stereoWidener', {
            ...audioEffects.stereoWidener,
            width: newWidth
          });
        }

        if (audioEffects.gWidener?.enabled) {
          const newWidth = Math.max(0, Math.min(100, (audioEffects.gWidener.width || 0) + adjustment));
          onUpdateEffectSettings('gWidener', {
            ...audioEffects.gWidener,
            width: newWidth
          });
        }

        onManualInit();
      }
    }, 1000); // Check every second

    return () => clearInterval(autoAdjustInterval);
  }, [meterData, meterSettings, autoAdjust, audioEffects, onUpdateEffectSettings, onManualInit]);

  return (
    <div className="backdrop-blur-md bg-black bg-opacity-30 rounded-xl p-6 border border-gray-500 border-opacity-50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-2 rounded-lg">
            <Gauge className="w-5 h-5 text-gray-900" />
          </div>
          <h3 className="text-xl font-bold text-white">Real-Time Meters</h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-1 border border-gray-600 border-opacity-50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'detailed'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Detailed
          </button>
          <button
            onClick={() => setActiveTab('stereo')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stereo'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Stereo
          </button>
        </div>
      </div>

      {/* Meter Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LUFS Meter */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <LUFSMeter 
                value={meterData.lufs} 
                target={meterSettings.lufsTarget}
                label="LUFS"
              />
            </div>

            {/* Stereo Meter */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <StereoMeter 
                leftLevel={meterData.leftLevel}
                rightLevel={meterData.rightLevel}
                peak={meterData.peak}
                rms={meterData.rms}
              />
            </div>

            {/* Correlation Meter */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <CorrelationMeter 
                value={meterData.correlation}
                target={meterSettings.correlationTarget}
              />
            </div>

            {/* Frequency Meter */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <FrequencyMeter 
                frequencyData={meterData.frequencyData}
                title="Frequency Spectrum"
              />
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {/* Detailed LUFS Analysis */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4">LUFS Analysis</h4>
              <LUFSMeter 
                value={meterData.lufs} 
                target={meterSettings.lufsTarget}
                detailed={true}
                label="Integrated LUFS"
              />
            </div>

            {/* Detailed Stereo Analysis */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Analysis</h4>
              <StereoMeter 
                leftLevel={meterData.leftLevel}
                rightLevel={meterData.rightLevel}
                peak={meterData.peak}
                rms={meterData.rms}
                detailed={true}
              />
            </div>

            {/* Detailed Frequency Analysis */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4">Frequency Analysis</h4>
              <FrequencyMeter 
                frequencyData={meterData.frequencyData}
                title="Detailed Spectrum"
                detailed={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'stereo' && (
          <div className="space-y-6">
            {/* Goniometer */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Field (Goniometer)</h4>
              <Goniometer 
                goniometerData={meterData.goniometerData}
              />
            </div>

            {/* Correlation Meter */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Correlation</h4>
              <CorrelationMeter 
                value={meterData.correlation}
                target={meterSettings.correlationTarget}
                detailed={true}
              />
            </div>

            {/* Stereo Balance */}
            <div className="backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Balance</h4>
              <StereoMeter 
                leftLevel={meterData.leftLevel}
                rightLevel={meterData.rightLevel}
                peak={meterData.peak}
                rms={meterData.rms}
                showBalance={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <div className="mt-6 backdrop-blur-sm bg-black bg-opacity-20 rounded-lg p-4 border border-gray-600 border-opacity-30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Meter Settings & Auto-Adjustment
        </h4>
        
        {/* Auto-Adjustment Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAdjust.lufs}
              onChange={(e) => setAutoAdjust(prev => ({ ...prev, lufs: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Auto LUFS</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAdjust.peak}
              onChange={(e) => setAutoAdjust(prev => ({ ...prev, peak: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Auto Peak</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAdjust.rms}
              onChange={(e) => setAutoAdjust(prev => ({ ...prev, rms: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Auto RMS</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAdjust.correlation}
              onChange={(e) => setAutoAdjust(prev => ({ ...prev, correlation: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Auto Correlation</span>
          </div>
        </div>

        {/* Meter Targets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">LUFS Target</label>
            <input
              type="range"
              min="-30"
              max="-5"
              step="0.1"
              value={meterSettings.lufsTarget}
              onChange={(e) => updateMeterSetting('lufsTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.lufsTarget} dB</span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Peak Target</label>
            <input
              type="range"
              min="-10"
              max="0"
              step="0.1"
              value={meterSettings.peakTarget}
              onChange={(e) => updateMeterSetting('peakTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.peakTarget} dB</span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">RMS Target</label>
            <input
              type="range"
              min="-20"
              max="-5"
              step="0.1"
              value={meterSettings.rmsTarget}
              onChange={(e) => updateMeterSetting('rmsTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.rmsTarget} dB</span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Correlation Target</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={meterSettings.correlationTarget}
              onChange={(e) => updateMeterSetting('correlationTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.correlationTarget}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMeters;
