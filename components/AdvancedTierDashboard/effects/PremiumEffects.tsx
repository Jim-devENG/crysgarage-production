import React, { useState } from 'react';
import { Settings, Volume2, Zap, Gauge, Radio, Waves, Activity, BarChart3, Mic, Layers } from 'lucide-react';
import HardwareKnob from '../HardwareKnob';
import AdvancedLimiter from './AdvancedLimiter';
import GMasteringCompressor from './GMasteringCompressor';

interface PremiumEffectsProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onTogglePremiumEffect: (effectType: string, enabled: boolean) => void;
  onManualInit?: () => void;
}

const PremiumEffects: React.FC<PremiumEffectsProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onTogglePremiumEffect,
  onManualInit
}) => {
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  const handleKnobChange = (effectType: string, setting: string, value: number) => {
    console.log(`Premium knob changed: ${effectType}.${setting} = ${value}`);
    onUpdateEffectSettings(effectType, { ...audioEffects[effectType], [setting]: value });
    // Remove onManualInit call to prevent parameter instability
  };

  const handleKnobClick = () => {
    // Only resume audio context when knob is clicked, not on every change
    onManualInit?.();
  };

  return (
    <div className="space-y-3">
      {/* Premium Effects Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Premium Effects</h3>
        <p className="text-sm text-gray-400">Professional G-Series mastering tools</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* G-Precision EQ */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <BarChart3 className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">G-PRECISION EQ</h3>
                    <p className="text-[9px] text-yellow-200">Surgical EQ</p>
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
              <h4 className="text-white font-semibold text-sm">G-Precision EQ</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gPrecisionEQ?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gPrecisionEQ', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.gPrecisionEQ?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gPrecisionEQ.bands?.[0]?.gain || 0}
                  min={-12}
                  max={12}
                  step={0.1}
                  label="BAND 1"
                  unit="dB"
                  size="medium"
                  onChange={(value) => {
                    const bands = [...(audioEffects.gPrecisionEQ.bands || [])];
                    if (bands[0]) bands[0].gain = value;
                    onUpdateEffectSettings('gPrecisionEQ', { ...audioEffects.gPrecisionEQ, bands });
                  }}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'gPrecisionEQ.band1'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'gPrecisionEQ.band1' : null)}
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
              <div className="text-[8px] text-yellow-200">G-Precision EQ v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* G-Mastering Compressor */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Activity className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">G-MASTERING COMP</h3>
                    <p className="text-[9px] text-yellow-200">Dynamic Processing</p>
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
              <h4 className="text-white font-semibold text-sm">G-Mastering Comp</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gMasteringCompressor?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gMasteringCompressor', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.gMasteringCompressor?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                {/* Threshold */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gMasteringCompressor.threshold || -20}
                    min={-60}
                    max={0}
                    step={0.1}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('gMasteringCompressor', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gMasteringCompressor.threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gMasteringCompressor.threshold' : null)}
                  />
                </div>

                {/* Ratio */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gMasteringCompressor.ratio || 4}
                    min={1}
                    max={20}
                    step={0.1}
                    label="RATIO"
                    unit=":1"
                    size="small"
                    onChange={(value) => handleKnobChange('gMasteringCompressor', 'ratio', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gMasteringCompressor.ratio'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gMasteringCompressor.ratio' : null)}
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
              <div className="text-[8px] text-yellow-200">G-Mastering Comp v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* G-Multi-Band */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Layers className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">G-MULTI-BAND</h3>
                    <p className="text-[9px] text-yellow-200">Frequency Split</p>
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
              <h4 className="text-white font-semibold text-sm">G-Multi-Band</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gMultiBand?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gMultiBand', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.gMultiBand?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gMultiBand.thresholds?.[0] || -20}
                  min={-60}
                  max={0}
                  step={0.1}
                  label="THRESH 1"
                  unit="dB"
                  size="medium"
                  onChange={(value) => {
                    const thresholds = [...(audioEffects.gMultiBand.thresholds || [])];
                    if (thresholds[0] !== undefined) thresholds[0] = value;
                    onUpdateEffectSettings('gMultiBand', { ...audioEffects.gMultiBand, thresholds });
                  }}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'gMultiBand.threshold1'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.threshold1' : null)}
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
              <div className="text-[8px] text-yellow-200">G-Multi-Band v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* G-Digital Tape */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Mic className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">G-DIGITAL TAPE</h3>
                    <p className="text-[9px] text-yellow-200">Analog Warmth</p>
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
              <h4 className="text-white font-semibold text-sm">G-Digital Tape</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gDigitalTape?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gDigitalTape', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.gDigitalTape?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gDigitalTape.saturation || 0}
                  min={0}
                  max={100}
                  step={1}
                  label="SAT"
                  unit="%"
                  size="medium"
                  onChange={(value) => handleKnobChange('gDigitalTape', 'saturation', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'gDigitalTape.saturation'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'gDigitalTape.saturation' : null)}
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
              <div className="text-[8px] text-yellow-200">G-Digital Tape v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* G-Limiter */}
        <div className="md:col-span-1 lg:col-span-1">
          <AdvancedLimiter
            limitLevel={audioEffects.gLimiter?.threshold || -1}
            inputGain={audioEffects.gLimiter?.inputGain || 0}
            outputGain={audioEffects.gLimiter?.outputGain || 0}
            reduction={audioEffects.gLimiter?.reduction || 0}
            outputPeak={audioEffects.gLimiter?.outputPeak || -20}
            onLimitLevelChange={(value) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, threshold: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            onInputGainChange={(value) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, inputGain: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            onOutputGainChange={(value) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, outputGain: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            enabled={audioEffects.gLimiter?.enabled || false}
            onToggle={(enabled) => onTogglePremiumEffect('gLimiter', enabled)}
            onManualInit={onManualInit}
            // Control button handlers
            onChannelModeChange={(mode) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, channelMode: mode });
              // Remove onManualInit call to prevent parameter instability
            }}
            onShapeChange={(shape) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, shape: shape });
              // Remove onManualInit call to prevent parameter instability
            }}
            onOversamplingChange={(oversampling) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, oversampling: oversampling });
              // Remove onManualInit call to prevent parameter instability
            }}
            onLatencyChange={(latency) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, latency: latency });
              // Remove onManualInit call to prevent parameter instability
            }}
            onOvershootChange={(overshoot) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, overshoot: overshoot });
              // Remove onManualInit call to prevent parameter instability
            }}
            channelMode={audioEffects.gLimiter?.channelMode}
            shape={audioEffects.gLimiter?.shape}
            oversampling={audioEffects.gLimiter?.oversampling}
            latency={audioEffects.gLimiter?.latency}
            overshoot={audioEffects.gLimiter?.overshoot}
          />
        </div>

      </div>
    </div>
  );
};

export default PremiumEffects;
