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
  const [unityGainMonitoring, setUnityGainMonitoring] = useState(false);
  const [bypass, setBypass] = useState(false);
  
  // Use external state if provided, otherwise use local state
  const [localChannelMode, setLocalChannelMode] = useState<'L/R' | 'M/S'>(externalChannelMode);
  const [localShape, setLocalShape] = useState<'Linear' | 'Soft'>(externalShape);
  const [localOversampling, setLocalOversampling] = useState<'x1' | 'x2' | 'x4'>(externalOversampling);
  const [localLatency, setLocalLatency] = useState<'Normal' | 'Low'>(externalLatency);
  const [localOvershoot, setLocalOvershoot] = useState<'Clip' | 'Soft'>(externalOvershoot);
  
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  // Use external state if available, otherwise use local state
  const channelMode = externalChannelMode || localChannelMode;
  const shape = externalShape || localShape;
  const oversampling = externalOversampling || localOversampling;
  const latency = externalLatency || localLatency;
  const overshoot = externalOvershoot || localOvershoot;

  const handleKnobChange = (setting: string, value: number) => {
    console.log(`A.O.M. Limiter knob changed: ${setting} = ${value}`);
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
    onManualInit?.();
  };

  const handleKnobClick = () => {
    onManualInit?.();
  };

  const handleChannelModeChange = () => {
    const newMode = channelMode === 'L/R' ? 'M/S' : 'L/R';
    if (onChannelModeChange) {
      onChannelModeChange(newMode);
    } else {
      setLocalChannelMode(newMode);
    }
    onManualInit?.();
  };

  const handleShapeChange = () => {
    const newShape = shape === 'Linear' ? 'Soft' : 'Linear';
    if (onShapeChange) {
      onShapeChange(newShape);
    } else {
      setLocalShape(newShape);
    }
    onManualInit?.();
  };

  const handleOversamplingChange = () => {
    const newOversampling = oversampling === 'x1' ? 'x2' : oversampling === 'x2' ? 'x4' : 'x1';
    if (onOversamplingChange) {
      onOversamplingChange(newOversampling);
    } else {
      setLocalOversampling(newOversampling);
    }
    onManualInit?.();
  };

  const handleLatencyChange = () => {
    const newLatency = latency === 'Normal' ? 'Low' : 'Normal';
    if (onLatencyChange) {
      onLatencyChange(newLatency);
    } else {
      setLocalLatency(newLatency);
    }
    onManualInit?.();
  };

  const handleOvershootChange = () => {
    const newOvershoot = overshoot === 'Clip' ? 'Soft' : 'Clip';
    if (onOvershootChange) {
      onOvershootChange(newOvershoot);
    } else {
      setLocalOvershoot(newOvershoot);
    }
    onManualInit?.();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header - Compact A.O.M. Style */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-1">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                <Gauge className="w-2.5 h-2.5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">A.O.M. MUSICIANS' ALLY</h3>
                <p className="text-[8px] text-gray-400">A.O.M. INVISIBLE LIMITER</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="p-3">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold text-xs">Advanced Limiter</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="mr-1"
            />
            <span className="text-gray-300 text-[10px]">Enable</span>
          </label>
        </div>

        {enabled && (
          <>
            {/* Main Control Knobs - Enhanced with HardwareKnob */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Limit Level Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={limitLevel}
                  min={-20}
                  max={0}
                  step={0.01}
                  label="LIMIT"
                  unit="dB"
                  size="small"
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
                  size="small"
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
                  size="small"
                  onChange={(value) => handleKnobChange('outputGain', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'outputGain'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'outputGain' : null)}
                />
              </div>
            </div>

            {/* Monitoring & Bypass Buttons - Compact */}
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={() => setUnityGainMonitoring(!unityGainMonitoring)}
                className={`px-2 py-1.5 rounded text-[8px] font-medium transition-colors ${
                  unityGainMonitoring
                    ? 'bg-crys-gold text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${unityGainMonitoring ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>UNITY</span>
                </div>
              </button>
              
              <button
                onClick={() => setBypass(!bypass)}
                className={`px-2 py-1.5 rounded text-[8px] font-medium transition-colors ${
                  bypass
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${bypass ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>BYPASS</span>
                </div>
              </button>
            </div>

            {/* Meters - Compact */}
            <div className="flex justify-center space-x-4 mb-4">
              {/* Reduction Meter */}
              <div className="text-center">
                <div className="w-6 h-16 bg-gray-800 rounded border border-gray-600 relative mb-1">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (reduction + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-[8px]">{reduction.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-[8px]">REDUCTION</div>
              </div>

              {/* Output Peak Meter */}
              <div className="text-center">
                <div className="w-6 h-16 bg-gray-800 rounded border border-gray-600 relative mb-1">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (outputPeak + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-[8px]">{outputPeak.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-[8px]">PEAK</div>
              </div>
            </div>

            {/* Bottom Control Buttons - Enhanced with Audio Processing */}
            <div className="grid grid-cols-5 gap-1">
              <div className="text-center">
                <button
                  onClick={handleChannelModeChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    channelMode === 'L/R' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {channelMode}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">CH</div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleShapeChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    shape === 'Linear' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {shape}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">SHAPE</div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleOversamplingChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    oversampling === 'x1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {oversampling}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">OS</div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleLatencyChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    latency === 'Normal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {latency}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">LAT</div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleOvershootChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    overshoot === 'Clip' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {overshoot}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">OS</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Compact */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
          <div className="text-[6px] text-gray-500">A.O.M. Invisible Limiter v1.15.6</div>
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedLimiter;
