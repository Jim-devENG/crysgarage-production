import React, { useState } from 'react';
import { Gauge, Volume2, Settings, Zap } from 'lucide-react';
import HardwareKnob from '../HardwareKnob';

interface AdvancedLimiterProps {
  limitLevel: number;
  inputGain: number;
  outputGain: number;
  reduction: number;
  outputPeak: number;
  onLimitLevelChange: (value: number) => void;
  onInputGainChange: (value: number) => void;
  onOutputGainChange: (value: number) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onManualInit?: () => void;
  // New props for control buttons
  onChannelModeChange?: (mode: 'L/R' | 'M/S') => void;
  onShapeChange?: (shape: 'Linear' | 'Soft') => void;
  onOversamplingChange?: (oversampling: 'x1' | 'x2' | 'x4') => void;
  onLatencyChange?: (latency: 'Normal' | 'Low') => void;
  onOvershootChange?: (overshoot: 'Clip' | 'Soft') => void;
  // Current settings from audio effects
  channelMode?: 'L/R' | 'M/S';
  shape?: 'Linear' | 'Soft';
  oversampling?: 'x1' | 'x2' | 'x4';
  latency?: 'Normal' | 'Low';
  overshoot?: 'Clip' | 'Soft';
}

const AdvancedLimiter: React.FC<AdvancedLimiterProps> = ({
  limitLevel,
  inputGain,
  outputGain,
  reduction,
  outputPeak,
  onLimitLevelChange,
  onInputGainChange,
  onOutputGainChange,
  enabled,
  onToggle,
  onManualInit,
  onChannelModeChange,
  onShapeChange,
  onOversamplingChange,
  onLatencyChange,
  onOvershootChange,
  channelMode: externalChannelMode = 'L/R',
  shape: externalShape = 'Linear',
  oversampling: externalOversampling = 'x1',
  latency: externalLatency = 'Normal',
  overshoot: externalOvershoot = 'Clip'
}) => {
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  const handleKnobChange = (setting: string, value: number) => {
    console.log(`G-Limiter knob changed: ${setting} = ${value}`);
    switch (setting) {
      case 'limitLevel':
        onLimitLevelChange(value);
        break;
      case 'inputGain':
        onInputGainChange(value);
        break;
      case 'outputGain':
        onOutputGainChange(value);
        break;
    }
    // Remove onManualInit call to prevent parameter instability
  };

  const handleKnobClick = () => {
    onManualInit?.();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header - Gold Style */}
      <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                <Gauge className="w-3 h-3 text-yellow-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">G-LIMITER</h3>
                <p className="text-[9px] text-yellow-200">Ultra-Maximizer</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
          </div>
        </div>
      </div>

      {/* Main Content - Gold Layout */}
      <div className="p-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-sm">Ultra-Maximizer</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-300 text-xs">Enable</span>
          </label>
        </div>

        {enabled && (
          <>
            {/* Main Control Knobs - Gold Style */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Limit Level Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={limitLevel}
                  min={-20}
                  max={0}
                  step={0.01}
                  label="LIMIT"
                  unit="dB"
                  size="medium"
                  onChange={(value) => handleKnobChange('limitLevel', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'limitLevel'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'limitLevel' : null)}
                />
              </div>

              {/* Input Gain Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={inputGain}
                  min={-20}
                  max={20}
                  step={0.01}
                  label="INPUT"
                  unit="dB"
                  size="medium"
                  onChange={(value) => handleKnobChange('inputGain', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'inputGain'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'inputGain' : null)}
                />
              </div>

              {/* Output Gain Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={outputGain}
                  min={-20}
                  max={20}
                  step={0.01}
                  label="OUTPUT"
                  unit="dB"
                  size="medium"
                  onChange={(value) => handleKnobChange('outputGain', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'outputGain'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'outputGain' : null)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Gold Style */}
      <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
          </div>
          <div className="text-[8px] text-yellow-200">Ultra-Maximizer v2.0</div>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedLimiter;
