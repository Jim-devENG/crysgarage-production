import React from 'react';
import StudioRack from '../StudioRack';
import HardwareKnob from '../HardwareKnob';
import HardwareSlider from '../HardwareSlider';

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
  return (
    <div className="space-y-3">
      {/* 3-Band EQ */}
      <StudioRack title="3-Band EQ">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm">3-Band EQ</h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.eq?.enabled || false}
                onChange={(e) => onToggleEffect('eq', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.eq?.low || 0}
                onChange={(value) => onUpdateEffectSettings('eq', { ...audioEffects.eq, low: value })}
                min={-12}
                max={12}
                step={0.5}
                label="Low"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.eq?.mid || 0}
                onChange={(value) => onUpdateEffectSettings('eq', { ...audioEffects.eq, mid: value })}
                min={-12}
                max={12}
                step={0.5}
                label="Mid"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.eq?.high || 0}
                onChange={(value) => onUpdateEffectSettings('eq', { ...audioEffects.eq, high: value })}
                min={-12}
                max={12}
                step={0.5}
                label="High"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
          </div>
        </div>
      </StudioRack>

      {/* Compressor */}
      <StudioRack title="Compressor">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm">Compressor</h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.compressor?.enabled || false}
                onChange={(e) => onToggleEffect('compressor', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.compressor?.threshold || -20}
                onChange={(value) => onUpdateEffectSettings('compressor', { ...audioEffects.compressor, threshold: value })}
                min={-60}
                max={0}
                step={1}
                label="Threshold"
                unit="dB"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.compressor?.ratio || 4}
                onChange={(value) => onUpdateEffectSettings('compressor', { ...audioEffects.compressor, ratio: value })}
                min={1}
                max={20}
                step={0.1}
                label="Ratio"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.compressor?.attack || 10}
                onChange={(value) => onUpdateEffectSettings('compressor', { ...audioEffects.compressor, attack: value })}
                min={0.1}
                max={100}
                step={0.1}
                label="Attack"
                unit="ms"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.compressor?.release || 100}
                onChange={(value) => onUpdateEffectSettings('compressor', { ...audioEffects.compressor, release: value })}
                min={10}
                max={1000}
                step={1}
                label="Release"
                unit="ms"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
          </div>
        </div>
      </StudioRack>

      {/* Stereo Widener */}
      <StudioRack title="Stereo Widener">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm">Stereo Widener</h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.stereoWidener?.enabled || false}
                onChange={(e) => onToggleEffect('stereoWidener', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          <div className="text-center">
            <HardwareKnob
              value={audioEffects.stereoWidener?.width || 0}
              onChange={(value) => onUpdateEffectSettings('stereoWidener', { ...audioEffects.stereoWidener, width: value })}
              min={0}
              max={100}
              step={1}
              label="Width"
              unit="%"
              size="small"
              onKnobClick={onManualInit}
            />
          </div>
        </div>
      </StudioRack>

      {/* Loudness */}
      <StudioRack title="Loudness">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm">Loudness</h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.loudness?.enabled || false}
                onChange={(e) => onToggleEffect('loudness', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          <div className="text-center">
            <HardwareKnob
              value={audioEffects.loudness?.volume || 1}
              onChange={(value) => onUpdateEffectSettings('loudness', { ...audioEffects.loudness, volume: value })}
              min={0}
              max={2}
              step={0.01}
              label="Volume"
              size="small"
              onKnobClick={onManualInit}
            />
          </div>
        </div>
      </StudioRack>

      {/* Limiter */}
      <StudioRack title="Limiter">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm">Limiter</h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.limiter?.enabled || false}
                onChange={(e) => onToggleEffect('limiter', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.limiter?.threshold || -1}
                onChange={(value) => onUpdateEffectSettings('limiter', { ...audioEffects.limiter, threshold: value })}
                min={-10}
                max={0}
                step={0.1}
                label="Threshold"
                unit="dB"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
            <div className="text-center">
              <HardwareKnob
                value={audioEffects.limiter?.ceiling || -0.1}
                onChange={(value) => onUpdateEffectSettings('limiter', { ...audioEffects.limiter, ceiling: value })}
                min={-1}
                max={0}
                step={0.01}
                label="Ceiling"
                unit="dB"
                size="small"
                onKnobClick={onManualInit}
              />
            </div>
          </div>
        </div>
      </StudioRack>
    </div>
  );
};

export default BasicEffects;
