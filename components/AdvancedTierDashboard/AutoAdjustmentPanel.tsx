import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftLevel: number;
  rightLevel: number;
  frequencyData: number[];
}

interface MeterSettings {
  lufsTarget: number;
  peakTarget: number;
  rmsTarget: number;
  correlationTarget: number;
}

interface AutoAdjust {
  lufs: boolean;
  peak: boolean;
  rms: boolean;
  correlation: boolean;
}

interface AutoAdjustmentPanelProps {
  meterData: MeterData;
  meterSettings: MeterSettings;
  autoAdjust: AutoAdjust;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
}

const AutoAdjustmentPanel: React.FC<AutoAdjustmentPanelProps> = ({
  meterData,
  meterSettings,
  autoAdjust,
  onUpdateEffectSettings
}) => {
  const [autoAdjustStatus, setAutoAdjustStatus] = useState({
    lufs: { active: false, adjustment: 0 },
    peak: { active: false, adjustment: 0 },
    rms: { active: false, adjustment: 0 }
  });

  // Auto-adjustment logic
  useEffect(() => {
    const autoAdjustInterval = setInterval(() => {
      if (!autoAdjust.lufs && !autoAdjust.peak && !autoAdjust.rms) {
        setAutoAdjustStatus({
          lufs: { active: false, adjustment: 0 },
          peak: { active: false, adjustment: 0 },
          rms: { active: false, adjustment: 0 }
        });
        return;
      }

      let newStatus = {
        lufs: { active: false, adjustment: 0 },
        peak: { active: false, adjustment: 0 },
        rms: { active: false, adjustment: 0 }
      };

      // LUFS auto-adjustment
      if (autoAdjust.lufs && meterData.lufs !== 0) {
        const lufsDiff = meterSettings.lufsTarget - meterData.lufs;
        if (Math.abs(lufsDiff) > 0.5) {
          const gainAdjustment = Math.max(-6, Math.min(6, lufsDiff * 0.5));
          onUpdateEffectSettings('loudness', { volume: 1 + (gainAdjustment / 20) });
          
          if (lufsDiff > 2) {
            onUpdateEffectSettings('compressor', { 
              makeup: Math.min(10, lufsDiff * 0.3),
              threshold: Math.max(-30, meterSettings.lufsTarget - 10)
            });
          }
          
          newStatus.lufs = { active: true, adjustment: gainAdjustment };
        }
      }

      // Peak auto-adjustment
      if (autoAdjust.peak && meterData.peak !== 0) {
        const peakDiff = meterSettings.peakTarget - meterData.peak;
        if (Math.abs(peakDiff) > 0.5) {
          const newThreshold = Math.max(-10, Math.min(0, peakDiff));
          onUpdateEffectSettings('limiter', { 
            threshold: newThreshold,
            ceiling: Math.max(-0.5, newThreshold + 0.1)
          });
          
          if (peakDiff < -2) {
            onUpdateEffectSettings('compressor', { 
              threshold: Math.max(-30, meterData.peak - 5),
              ratio: Math.min(10, 4 + Math.abs(peakDiff) * 0.5)
            });
          }
          
          newStatus.peak = { active: true, adjustment: peakDiff };
        }
      }

      // RMS auto-adjustment
      if (autoAdjust.rms && meterData.rms !== 0) {
        const rmsDiff = meterSettings.rmsTarget - meterData.rms;
        if (Math.abs(rmsDiff) > 1) {
          const newRatio = Math.max(1, Math.min(8, 4 + rmsDiff * 0.2));
          const newThreshold = Math.max(-30, meterData.rms - 5);
          
          onUpdateEffectSettings('compressor', { 
            ratio: newRatio,
            threshold: newThreshold,
            attack: rmsDiff > 0 ? 5 : 20,
            release: rmsDiff > 0 ? 50 : 200
          });
          
          newStatus.rms = { active: true, adjustment: rmsDiff };
        }
      }

      setAutoAdjustStatus(newStatus);
    }, 500);

    return () => clearInterval(autoAdjustInterval);
  }, [meterData, meterSettings, autoAdjust, onUpdateEffectSettings]);

  return (
    <div className="bg-black bg-opacity-20 rounded-lg p-3 border border-gray-600 border-opacity-30">
      <h4 className="text-xs font-semibold text-white mb-3 flex items-center">
        <Settings className="w-3 h-3 mr-2" />
        Auto-Adjustment
      </h4>
      
      {/* Auto-Adjustment Status */}
      {(autoAdjustStatus.lufs.active || autoAdjustStatus.peak.active || autoAdjustStatus.rms.active) && (
        <div className="mb-3 p-2 bg-green-900/30 border border-green-500/30 rounded text-xs">
          <div className="text-green-400 font-medium mb-1">Active Adjustments:</div>
          <div className="space-y-1">
            {autoAdjustStatus.lufs.active && (
              <div className="flex justify-between">
                <span className="text-gray-300">LUFS:</span>
                <span className="text-green-400">
                  {autoAdjustStatus.lufs.adjustment > 0 ? '+' : ''}{autoAdjustStatus.lufs.adjustment.toFixed(1)}dB
                </span>
              </div>
            )}
            {autoAdjustStatus.peak.active && (
              <div className="flex justify-between">
                <span className="text-gray-300">Peak:</span>
                <span className="text-blue-400">
                  {autoAdjustStatus.peak.adjustment > 0 ? '+' : ''}{autoAdjustStatus.peak.adjustment.toFixed(1)}dB
                </span>
              </div>
            )}
            {autoAdjustStatus.rms.active && (
              <div className="flex justify-between">
                <span className="text-gray-300">RMS:</span>
                <span className="text-yellow-400">
                  {autoAdjustStatus.rms.adjustment > 0 ? '+' : ''}{autoAdjustStatus.rms.adjustment.toFixed(1)}dB
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Auto-Adjustment Toggles */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoAdjust.lufs}
            onChange={(e) => onUpdateEffectSettings('autoAdjust', { lufs: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span className="text-xs text-gray-300">LUFS</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoAdjust.peak}
            onChange={(e) => onUpdateEffectSettings('autoAdjust', { peak: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span className="text-xs text-gray-300">Peak</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoAdjust.rms}
            onChange={(e) => onUpdateEffectSettings('autoAdjust', { rms: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span className="text-xs text-gray-300">RMS</span>
        </div>
      </div>

      {/* Target Settings */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">LUFS Target:</span>
          <input
            type="number"
            value={meterSettings.lufsTarget}
            onChange={(e) => onUpdateEffectSettings('meterSettings', { lufsTarget: parseFloat(e.target.value) })}
            className="w-16 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
            step="0.1"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Peak Target:</span>
          <input
            type="number"
            value={meterSettings.peakTarget}
            onChange={(e) => onUpdateEffectSettings('meterSettings', { peakTarget: parseFloat(e.target.value) })}
            className="w-16 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );
};

export default AutoAdjustmentPanel;
