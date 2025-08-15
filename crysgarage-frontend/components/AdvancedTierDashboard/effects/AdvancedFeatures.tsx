import React, { useState } from 'react';
import { Globe, Music, Settings } from 'lucide-react';
import StudioRack from '../StudioRack';
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
    // Ensure audio context is resumed for real-time control
    onManualInit?.();
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
        <StudioRack title="G-SURROUND" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Surround</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gSurround?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gSurround', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gSurround?.enabled && (
              <div className="grid grid-cols-2 gap-3">
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
                    isEditing={editingKnob === 'gSurround-width'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gSurround-width' : null)}
                  />
                </div>

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
                    isEditing={editingKnob === 'gSurround-depth'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gSurround-depth' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* G-Tuner - Enhanced with HardwareKnob */}
        <StudioRack title="G-TUNER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Tuner</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gTuner?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gTuner', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gTuner?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gTuner.frequency || 440}
                  min={20}
                  max={20000}
                  step={1}
                  label="FREQ"
                  unit="Hz"
                  size="medium"
                  onChange={(value) => handleKnobChange('gTuner', 'frequency', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'gTuner-frequency'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'gTuner-frequency' : null)}
                />
              </div>
            )}
          </div>
        </StudioRack>

        {/* G-Spectral Analyzer - Enhanced with HardwareKnob */}
        <StudioRack title="G-SPECTRAL ANALYZER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Spectral</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gSpectral?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gSpectral', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gSpectral?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gSpectral.resolution || 1024}
                    min={256}
                    max={4096}
                    step={256}
                    label="RES"
                    unit=""
                    size="small"
                    onChange={(value) => handleKnobChange('gSpectral', 'resolution', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gSpectral-resolution'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gSpectral-resolution' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gSpectral.smoothing || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="SMOOTH"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gSpectral', 'smoothing', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gSpectral-smoothing'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gSpectral-smoothing' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* G-Harmonic Exciter - Enhanced with HardwareKnob */}
        <StudioRack title="G-HARMONIC EXCITER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Harmonic</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gHarmonic?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gHarmonic', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gHarmonic?.enabled && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gHarmonic.amount || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="AMT"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gHarmonic', 'amount', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gHarmonic-amount'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gHarmonic-amount' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gHarmonic.frequency || 8000}
                    min={1000}
                    max={20000}
                    step={100}
                    label="FREQ"
                    unit="Hz"
                    size="small"
                    onChange={(value) => handleKnobChange('gHarmonic', 'frequency', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gHarmonic-frequency'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gHarmonic-frequency' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gHarmonic.mix || 50}
                    min={0}
                    max={100}
                    step={1}
                    label="MIX"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gHarmonic', 'mix', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gHarmonic-mix'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gHarmonic-mix' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* G-Stereo Imager - Enhanced with HardwareKnob */}
        <StudioRack title="G-STEREO IMAGER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Stereo</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gStereo?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gStereo', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gStereo?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gStereo.width || 0}
                    min={0}
                    max={200}
                    step={1}
                    label="WIDTH"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gStereo', 'width', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gStereo-width'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gStereo-width' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gStereo.midSide || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="M/S"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gStereo', 'midSide', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gStereo-midSide'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gStereo-midSide' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* G-Dynamic EQ - Enhanced with HardwareKnob */}
        <StudioRack title="G-DYNAMIC EQ" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Dynamic EQ</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gDynamicEQ?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gDynamicEQ', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gDynamicEQ?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gDynamicEQ.threshold || -20}
                    min={-60}
                    max={0}
                    step={1}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('gDynamicEQ', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gDynamicEQ-threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gDynamicEQ-threshold' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gDynamicEQ.ratio || 2}
                    min={1}
                    max={10}
                    step={0.1}
                    label="RATIO"
                    unit=":1"
                    size="small"
                    onChange={(value) => handleKnobChange('gDynamicEQ', 'ratio', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gDynamicEQ-ratio'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gDynamicEQ-ratio' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>
      </div>

      {/* Feature Info */}
      <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
        <h5 className="text-white font-medium text-xs mb-2 flex items-center">
          <Settings className="w-3 h-3 mr-1 text-crys-gold" />
          Advanced Features Info
        </h5>
        <div className="space-y-1 text-[10px] text-gray-300">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>G-Surround: Create immersive surround sound</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>G-Tuner: Professional 444Hz reference tuning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
