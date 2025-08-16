import React, { useState } from 'react';
import { Volume2, Settings, Zap, Gauge, Radio, Waves } from 'lucide-react';
import HardwareKnob from '../HardwareKnob';

interface BasicEffectsProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onToggleEffect: (effectType: string, enabled: boolean) => void;
  onManualInit?: () => void;
}

const BasicEffects: React.FC<BasicEffectsProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onToggleEffect,
  onManualInit
}) => {
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  const handleKnobChange = (effectType: string, setting: string, value: number) => {
    console.log(`Knob changed: ${effectType}.${setting} = ${value}`);
    onUpdateEffectSettings(effectType, { ...audioEffects[effectType], [setting]: value });
    // Remove onManualInit call to prevent parameter instability
  };

  const handleKnobClick = () => {
    // Only resume audio context when knob is clicked, not on every change
    onManualInit?.();
  };

  return (
    <div className="space-y-3">
      {/* Basic Effects Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Basic Effects</h3>
        <p className="text-sm text-gray-400">Essential mastering tools with real-time control</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 3-Band EQ - Enhanced with HardwareKnob */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Radio className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">3-BAND EQ</h3>
                    <p className="text-[9px] text-yellow-200">Frequency Control</p>
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

          {/* Main Content */}
          <div className="p-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">3-Band EQ</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.eq?.enabled || false}
                  onChange={(e) => onToggleEffect('eq', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.eq?.enabled && (
              <div className="grid grid-cols-3 gap-3">
                {/* Low Band */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.lowGain || 0}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="LOW"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('eq', 'lowGain', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'eq.lowGain'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'eq.lowGain' : null)}
                  />
                </div>

                {/* Mid Band */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.midGain || 0}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="MID"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('eq', 'midGain', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'eq.midGain'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'eq.midGain' : null)}
                  />
                </div>

                {/* High Band */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.highGain || 0}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="HIGH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('eq', 'highGain', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'eq.highGain'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'eq.highGain' : null)}
                  />
                </div>
              </div>
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
              <div className="text-[8px] text-yellow-200">3-Band EQ v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compressor */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Zap className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">COMPRESSOR</h3>
                    <p className="text-[9px] text-yellow-200">Dynamic Control</p>
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

          {/* Main Content */}
          <div className="p-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">Compressor</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.compressor?.enabled || false}
                  onChange={(e) => onToggleEffect('compressor', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.compressor?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                {/* Threshold */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.threshold || -20}
                    min={-60}
                    max={0}
                    step={0.1}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'compressor.threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'compressor.threshold' : null)}
                  />
                </div>

                {/* Ratio */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.ratio || 4}
                    min={1}
                    max={20}
                    step={0.1}
                    label="RATIO"
                    unit=":1"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'ratio', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'compressor.ratio'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'compressor.ratio' : null)}
                  />
                </div>
              </div>
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
              <div className="text-[8px] text-yellow-200">Compressor v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stereo Widener */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Waves className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">STEREO WIDENER</h3>
                    <p className="text-[9px] text-yellow-200">Width Control</p>
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

          {/* Main Content */}
          <div className="p-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">Stereo Widener</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.stereoWidener?.enabled || false}
                  onChange={(e) => onToggleEffect('stereoWidener', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.stereoWidener?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.stereoWidener.width || 0}
                  min={0}
                  max={100}
                  step={1}
                  label="WIDTH"
                  unit="%"
                  size="medium"
                  onChange={(value) => handleKnobChange('stereoWidener', 'width', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'stereoWidener.width'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'stereoWidener.width' : null)}
                />
              </div>
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
              <div className="text-[8px] text-yellow-200">Stereo Widener v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loudness */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Volume2 className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">LOUDNESS</h3>
                    <p className="text-[9px] text-yellow-200">Volume Control</p>
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

          {/* Main Content */}
          <div className="p-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">Loudness</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.loudness?.enabled || false}
                  onChange={(e) => onToggleEffect('loudness', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.loudness?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.loudness.gain || 0}
                  min={-20}
                  max={20}
                  step={0.1}
                  label="GAIN"
                  unit="dB"
                  size="medium"
                  onChange={(value) => handleKnobChange('loudness', 'gain', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'loudness.gain'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'loudness.gain' : null)}
                />
              </div>
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
              <div className="text-[8px] text-yellow-200">Loudness v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Limiter */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
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
                    <h3 className="text-sm font-bold text-white">LIMITER</h3>
                    <p className="text-[9px] text-yellow-200">Peak Control</p>
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

          {/* Main Content */}
          <div className="p-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">Limiter</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.limiter?.enabled || false}
                  onChange={(e) => onToggleEffect('limiter', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.limiter?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.limiter.threshold || -1}
                  min={-20}
                  max={0}
                  step={0.01}
                  label="THRESH"
                  unit="dB"
                  size="medium"
                  onChange={(value) => handleKnobChange('limiter', 'threshold', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'limiter.threshold'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'limiter.threshold' : null)}
                />
              </div>
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
              <div className="text-[8px] text-yellow-200">Limiter v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicEffects;
