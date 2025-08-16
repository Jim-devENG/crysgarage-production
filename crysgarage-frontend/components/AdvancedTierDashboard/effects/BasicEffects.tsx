import React, { useState } from 'react';
import { Settings, Volume2, Zap, Target, Gauge } from 'lucide-react';
import StudioRack from '../StudioRack';
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
        <StudioRack title="3-BAND EQUALIZER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">3-Band EQ</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.eq?.enabled || false}
                  onChange={(e) => onToggleEffect('eq', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.eq?.enabled && (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.low}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="LOW"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('eq', 'low', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'eq-low'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'eq-low' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.mid}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="MID"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('eq', 'mid', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'eq-mid'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'eq-mid' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.high}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="HIGH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('eq', 'high', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'eq-high'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'eq-high' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* Compressor - Enhanced with HardwareKnob */}
        <StudioRack title="COMPRESSOR" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">Compressor</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.compressor?.enabled || false}
                  onChange={(e) => onToggleEffect('compressor', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.compressor?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.threshold}
                    min={-60}
                    max={0}
                    step={1}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'comp-threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'comp-threshold' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.ratio}
                    min={1}
                    max={20}
                    step={0.1}
                    label="RATIO"
                    unit=":1"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'ratio', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'comp-ratio'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'comp-ratio' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.attack}
                    min={0.1}
                    max={100}
                    step={0.1}
                    label="ATTACK"
                    unit="ms"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'attack', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'comp-attack'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'comp-attack' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.release}
                    min={10}
                    max={1000}
                    step={1}
                    label="RELEASE"
                    unit="ms"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'release', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'comp-release'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'comp-release' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* Stereo Widener - Enhanced with HardwareKnob */}
        <StudioRack title="STEREO WIDENER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">Stereo Width</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.stereoWidener?.enabled || false}
                  onChange={(e) => onToggleEffect('stereoWidener', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.stereoWidener?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.stereoWidener.width}
                  min={0}
                  max={100}
                  step={1}
                  label="WIDTH"
                  unit="%"
                  size="medium"
                  onChange={(value) => handleKnobChange('stereoWidener', 'width', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'stereo-width'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'stereo-width' : null)}
                />
              </div>
            )}
          </div>
        </StudioRack>

        {/* Loudness - Enhanced with HardwareKnob */}
        <StudioRack title="LOUDNESS" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">Volume</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.loudness?.enabled || false}
                  onChange={(e) => onToggleEffect('loudness', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.loudness?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.loudness.volume}
                  min={0}
                  max={2}
                  step={0.01}
                  label="VOLUME"
                  unit="x"
                  size="medium"
                  onChange={(value) => handleKnobChange('loudness', 'volume', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'loudness-volume'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'loudness-volume' : null)}
                />
              </div>
            )}
          </div>
        </StudioRack>

        {/* Limiter - Enhanced with HardwareKnob */}
        <StudioRack title="LIMITER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">Limiter</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.limiter?.enabled || false}
                  onChange={(e) => onToggleEffect('limiter', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.limiter?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.limiter.threshold}
                    min={-20}
                    max={0}
                    step={0.1}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('limiter', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'limiter-threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'limiter-threshold' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.limiter.ceiling}
                    min={-1}
                    max={0}
                    step={0.01}
                    label="CEILING"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('limiter', 'ceiling', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'limiter-ceiling'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'limiter-ceiling' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>
      </div>
    </div>
  );
};

export default BasicEffects;
