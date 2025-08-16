import React, { useState } from 'react';
import { Settings, Volume2, Zap, Gauge, Radio, Waves, Activity, BarChart3, Target, Mic, Headphones, Layers, Globe, Cpu } from 'lucide-react';
import HardwareKnob from '../HardwareKnob';

interface AdvancedFeaturesProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onTogglePremiumEffect: (effectType: string, enabled: boolean) => void;
  onManualInit?: () => void;
}

const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onTogglePremiumEffect,
  onManualInit
}) => {
  const [showCost, setShowCost] = useState(false);
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  const handleKnobChange = (effectType: string, setting: string, value: number) => {
    console.log(`Advanced knob changed: ${effectType}.${setting} = ${value}`);
    onUpdateEffectSettings(effectType, { ...audioEffects[effectType], [setting]: value });
    // Remove onManualInit call to prevent parameter instability
  };

  const handleKnobClick = () => {
    // Resume audio context when knob is clicked
    onManualInit?.();
  };

  return (
    <div className="space-y-3">
      {/* Advanced Features Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Advanced Features</h3>
        <p className="text-sm text-gray-400">Premium mastering capabilities with real-time control</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* G-Surround - Enhanced with HardwareKnob */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Globe className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">G-SURROUND</h3>
                    <p className="text-[9px] text-yellow-200">3D Spatial Audio</p>
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
              <h4 className="text-white font-semibold text-sm">G-Surround</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gSurround?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gSurround', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.gSurround?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                {/* Width */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gSurround.width || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="WIDTH"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gSurround', 'width', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gSurround.width'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gSurround.width' : null)}
                  />
                </div>

                {/* Depth */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gSurround.depth || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="DEPTH"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gSurround', 'depth', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gSurround.depth'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gSurround.depth' : null)}
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
              <div className="text-[8px] text-yellow-200">G-Surround v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* G-Tuner - Static with fixed 444Hz */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Cpu className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">G-TUNER</h3>
                    <p className="text-[9px] text-yellow-200">444Hz Reference</p>
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
              <h4 className="text-white font-semibold text-sm">G-Tuner</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gTuner?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gTuner', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.gTuner?.enabled && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 rounded-lg p-4 border border-yellow-600">
                  <div className="text-yellow-200 text-lg font-bold mb-2">444 Hz</div>
                  <div className="text-yellow-300 text-xs">Reference Frequency</div>
                  <div className="text-yellow-400 text-[10px] mt-1">Auto-Applied</div>
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
              <div className="text-[8px] text-yellow-200">G-Tuner v1.0</div>
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

export default AdvancedFeatures;
