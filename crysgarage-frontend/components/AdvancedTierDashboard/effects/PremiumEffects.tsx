import React from 'react';
import StudioRack from '../StudioRack';
import HardwareKnob from '../HardwareKnob';
import { Zap, Settings, Target, Gauge, Activity } from 'lucide-react';

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
  return (
    <div className="space-y-3">
      {/* G-Mastering Compressor */}
      <StudioRack title="G-Mastering Compressor">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Zap className="w-3 h-3 mr-1 text-crys-gold" />
              G-Mastering Compressor
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gMasteringCompressor?.enabled || false}
                onChange={(e) => onTogglePremiumEffect('gMasteringCompressor', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gMasteringCompressor?.enabled && (
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gMasteringCompressor?.threshold || -20}
                  onChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, threshold: value })}
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
                  value={audioEffects.gMasteringCompressor?.ratio || 4}
                  onChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, ratio: value })}
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
                  value={audioEffects.gMasteringCompressor?.attack || 10}
                  onChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, attack: value })}
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
                  value={audioEffects.gMasteringCompressor?.release || 100}
                  onChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, release: value })}
                  min={10}
                  max={1000}
                  step={1}
                  label="Release"
                  unit="ms"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
              <div className="text-center col-span-2">
                <HardwareKnob
                  value={audioEffects.gMasteringCompressor?.makeup || 0}
                  onChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, makeup: value })}
                  min={0}
                  max={20}
                  step={0.1}
                  label="Makeup Gain"
                  unit="dB"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
            </div>
          )}
        </div>
      </StudioRack>

      {/* G-Precision EQ */}
      <StudioRack title="G-Precision EQ">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Settings className="w-3 h-3 mr-1 text-crys-gold" />
              G-Precision 8-Band EQ
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gPrecisionEQ?.enabled || false}
                onChange={(e) => onTogglePremiumEffect('gPrecisionEQ', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gPrecisionEQ?.enabled && (
            <div className="grid grid-cols-4 gap-1.5">
              {audioEffects.gPrecisionEQ.bands?.map((band: any, index: number) => (
                <div key={index} className="text-center">
                  <HardwareKnob
                    value={band.gain || 0}
                    onChange={(value) => {
                      const newBands = [...audioEffects.gPrecisionEQ.bands];
                      newBands[index] = { ...band, gain: value };
                      onUpdateEffectSettings('gPrecisionEQ', { ...audioEffects.gPrecisionEQ, bands: newBands });
                    }}
                    min={-12}
                    max={12}
                    step={0.5}
                    label={`${band.frequency}Hz`}
                    unit="dB"
                    size="small"
                    onKnobClick={onManualInit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </StudioRack>

      {/* G-Digital Tape */}
      <StudioRack title="G-Digital Tape">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Target className="w-3 h-3 mr-1 text-crys-gold" />
              G-Digital Tape Machine
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gDigitalTape?.enabled || false}
                onChange={(e) => onTogglePremiumEffect('gDigitalTape', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gDigitalTape?.enabled && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gDigitalTape?.saturation || 0}
                  onChange={(value) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, saturation: value })}
                  min={0}
                  max={100}
                  step={1}
                  label="Saturation"
                  unit="%"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gDigitalTape?.warmth || 0}
                  onChange={(value) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, warmth: value })}
                  min={0}
                  max={100}
                  step={1}
                  label="Warmth"
                  unit="%"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gDigitalTape?.compression || 0}
                  onChange={(value) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, compression: value })}
                  min={0}
                  max={100}
                  step={1}
                  label="Compression"
                  unit="%"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
            </div>
          )}
        </div>
      </StudioRack>

      {/* G-Limiter */}
      <StudioRack title="G-Limiter">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Gauge className="w-3 h-3 mr-1 text-crys-gold" />
              G-Limiter
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gLimiter?.enabled || false}
                onChange={(e) => onTogglePremiumEffect('gLimiter', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gLimiter?.enabled && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gLimiter?.threshold || -1}
                  onChange={(value) => onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, threshold: value })}
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
                  value={audioEffects.gLimiter?.ceiling || -0.1}
                  onChange={(value) => onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, ceiling: value })}
                  min={-1}
                  max={0}
                  step={0.01}
                  label="Ceiling"
                  unit="dB"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.gLimiter?.release || 50}
                  onChange={(value) => onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, release: value })}
                  min={1}
                  max={200}
                  step={1}
                  label="Release"
                  unit="ms"
                  size="small"
                  onKnobClick={onManualInit}
                />
              </div>
            </div>
          )}
        </div>
      </StudioRack>

      {/* G-Multi-Band */}
      <StudioRack title="G-Multi-Band">
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-medium text-sm flex items-center">
              <Activity className="w-3 h-3 mr-1 text-crys-gold" />
              G-Multi-Band Compressor
            </h5>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={audioEffects.gMultiBand?.enabled || false}
                onChange={(e) => onTogglePremiumEffect('gMultiBand', e.target.checked)}
                className="mr-1"
              />
              <span className="text-gray-300 text-xs">Enable</span>
            </label>
          </div>
          {audioEffects.gMultiBand?.enabled && (
            <div className="space-y-2">
              {/* Low Band */}
              <div className="bg-gray-900 rounded-md p-2">
                <h6 className="text-xs font-medium text-white mb-2">Low Band</h6>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand?.low?.threshold || -20}
                      onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        low: { ...audioEffects.gMultiBand.low, threshold: value }
                      })}
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
                      value={audioEffects.gMultiBand?.low?.ratio || 4}
                      onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        low: { ...audioEffects.gMultiBand.low, ratio: value }
                      })}
                      min={1}
                      max={20}
                      step={0.1}
                      label="Ratio"
                      size="small"
                      onKnobClick={onManualInit}
                    />
                  </div>
                </div>
              </div>

              {/* Mid Band */}
              <div className="bg-gray-900 rounded-md p-2">
                <h6 className="text-xs font-medium text-white mb-2">Mid Band</h6>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand?.mid?.threshold || -20}
                      onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        mid: { ...audioEffects.gMultiBand.mid, threshold: value }
                      })}
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
                      value={audioEffects.gMultiBand?.mid?.ratio || 4}
                      onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        mid: { ...audioEffects.gMultiBand.mid, ratio: value }
                      })}
                      min={1}
                      max={20}
                      step={0.1}
                      label="Ratio"
                      size="small"
                      onKnobClick={onManualInit}
                    />
                  </div>
                </div>
              </div>

              {/* High Band */}
              <div className="bg-gray-900 rounded-md p-2">
                <h6 className="text-xs font-medium text-white mb-2">High Band</h6>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand?.high?.threshold || -20}
                      onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        high: { ...audioEffects.gMultiBand.high, threshold: value }
                      })}
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
                      value={audioEffects.gMultiBand?.high?.ratio || 4}
                      onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        high: { ...audioEffects.gMultiBand.high, ratio: value }
                      })}
                      min={1}
                      max={20}
                      step={0.1}
                      label="Ratio"
                      size="small"
                      onKnobClick={onManualInit}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </StudioRack>
    </div>
  );
};

export default PremiumEffects;
