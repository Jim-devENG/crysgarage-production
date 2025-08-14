import React from 'react';
import StudioRack from '../StudioRack';
import HardwareKnob from '../HardwareKnob';
import { Radio, Music } from 'lucide-react';

interface AdvancedFeaturesProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onToggleEffect: (effectType: string, enabled: boolean) => void;
  onManualInit?: () => void;
}

const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onToggleEffect,
  onManualInit
}) => {
  return (
    <div className="space-y-3">
      {/* G-Surround */}
      <StudioRack title="G-Surround">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Radio className="w-3 h-3 mr-1 text-crys-gold" />
              G-Surround
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gSurround?.enabled || false}
                onChange={(e) => onToggleEffect('gSurround', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gSurround?.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gSurround?.width || 0}
                  onChange={(value) => onUpdateEffectSettings('gSurround', { ...audioEffects.gSurround, width: value })}
                  min={0}
                  max={100}
                  step={1}
                  label="Width"
                  unit="%"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gSurround?.depth || 0}
                  onChange={(value) => onUpdateEffectSettings('gSurround', { ...audioEffects.gSurround, depth: value })}
                  min={0}
                  max={100}
                  step={1}
                  label="Depth"
                  unit="%"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
            </div>
          )}
        </div>
      </StudioRack>

      {/* G-Tuner */}
      <StudioRack title="G-Tuner">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Music className="w-3 h-3 mr-1 text-crys-gold" />
              G-Tuner (444Hz)
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gTuner?.enabled || false}
                onChange={(e) => onToggleEffect('gTuner', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gTuner?.enabled && (
            <div className="text-center">
              <div className="bg-gray-900 rounded-md p-3 mb-3">
                <div className="text-xl font-bold text-crys-gold mb-1">
                  {audioEffects.gTuner?.frequency || 444} Hz
                </div>
                <div className="text-xs text-gray-400">
                  Reference Frequency
                </div>
              </div>
              <div className="text-[10px] text-gray-500">
                Each use costs $3
              </div>
            </div>
          )}
        </div>
      </StudioRack>

      {/* Feature Information */}
      <div className="bg-gray-900 rounded-md p-3 border border-gray-600">
        <h6 className="text-white font-medium mb-2 text-sm">Advanced Features Info</h6>
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-crys-gold" />
            <span><strong>G-Surround:</strong> Create immersive surround sound experience</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Music className="w-3 h-3 text-crys-gold" />
            <span><strong>G-Tuner:</strong> 444Hz reference tuning for perfect pitch alignment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
