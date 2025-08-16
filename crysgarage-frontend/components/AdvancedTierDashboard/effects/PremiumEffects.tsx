import React, { useState } from 'react';
import { Zap, Settings, Target, Gauge, Activity } from 'lucide-react';
import StudioRack from '../StudioRack';
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
        <h3 className="text-lg font-bold text-white mb-2">Premium G-Series Effects</h3>
        <p className="text-sm text-gray-400">Professional-grade mastering tools with real-time control</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. G-Precision EQ - Enhanced with HardwareKnob */}
        <StudioRack title="G-PRECISION 8-BAND EQ" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Precision EQ</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gPrecisionEQ?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gPrecisionEQ', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gPrecisionEQ?.enabled && (
              <div className="grid grid-cols-4 gap-1.5">
                {audioEffects.gPrecisionEQ.bands?.map((band: any, index: number) => (
                  <div key={index} className="text-center">
                    <HardwareKnob
                      value={band.gain}
                      min={-12}
                      max={12}
                      step={0.5}
                      label={`${band.frequency}Hz`}
                      unit="dB"
                      size="small"
                      onChange={(value) => {
                        const newBands = [...audioEffects.gPrecisionEQ.bands];
                        newBands[index] = { ...band, gain: value };
                        onUpdateEffectSettings('gPrecisionEQ', { ...audioEffects.gPrecisionEQ, bands: newBands });
                        // Remove onManualInit call to prevent parameter instability
                      }}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === `gPrecisionEQ-band-${index}`}
                      onEditingChange={(editing) => setEditingKnob(editing ? `gPrecisionEQ-band-${index}` : null)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </StudioRack>

        {/* 2. G-Multi-Band - Enhanced with HardwareKnob */}
        <StudioRack title="G-MULTI-BAND" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Multi-Band</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gMultiBand?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gMultiBand', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gMultiBand?.enabled && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gMultiBand.low?.threshold || -20}
                    min={-60}
                    max={0}
                    step={1}
                    label="LOW"
                    unit="dB"
                    size="small"
                    onChange={(value) => {
                      onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        low: { ...audioEffects.gMultiBand.low, threshold: value }
                      });
                      // Remove onManualInit call to prevent parameter instability
                    }}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gMultiBand-low-threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand-low-threshold' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gMultiBand.mid?.threshold || -20}
                    min={-60}
                    max={0}
                    step={1}
                    label="MID"
                    unit="dB"
                    size="small"
                    onChange={(value) => {
                      onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        mid: { ...audioEffects.gMultiBand.mid, threshold: value }
                      });
                      // Remove onManualInit call to prevent parameter instability
                    }}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gMultiBand-mid-threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand-mid-threshold' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gMultiBand.high?.threshold || -20}
                    min={-60}
                    max={0}
                    step={1}
                    label="HIGH"
                    unit="dB"
                    size="small"
                    onChange={(value) => {
                      onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        high: { ...audioEffects.gMultiBand.high, threshold: value }
                      });
                      // Remove onManualInit call to prevent parameter instability
                    }}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gMultiBand-high-threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand-high-threshold' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* 3. G-Mastering Compressor - Enhanced */}
        <div className="md:col-span-1 lg:col-span-1">
          <GMasteringCompressor
            threshold={audioEffects.gMasteringCompressor?.threshold || -20}
            ratio={audioEffects.gMasteringCompressor?.ratio || 4}
            attack={audioEffects.gMasteringCompressor?.attack || 10}
            release={audioEffects.gMasteringCompressor?.release || 100}
            makeup={audioEffects.gMasteringCompressor?.makeup || 0}
            reduction={audioEffects.gMasteringCompressor?.reduction || 0}
            outputLevel={audioEffects.gMasteringCompressor?.outputLevel || -20}
            onThresholdChange={(value) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, threshold: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            onRatioChange={(value) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, ratio: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            onAttackChange={(value) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, attack: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            onReleaseChange={(value) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, release: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            onMakeupChange={(value) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, makeup: value });
              // Remove onManualInit call to prevent parameter instability
            }}
            enabled={audioEffects.gMasteringCompressor?.enabled || false}
            onToggle={(enabled) => onTogglePremiumEffect('gMasteringCompressor', enabled)}
            onManualInit={onManualInit}
            // Control button handlers
            onKneeChange={(knee) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, knee: knee });
              // Remove onManualInit call to prevent parameter instability
            }}
            onLookaheadChange={(lookahead) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, lookahead: lookahead });
              // Remove onManualInit call to prevent parameter instability
            }}
            onStereoLinkChange={(stereoLink) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, stereoLink: stereoLink });
              // Remove onManualInit call to prevent parameter instability
            }}
            onSidechainChange={(sidechain) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, sidechain: sidechain });
              // Remove onManualInit call to prevent parameter instability
            }}
            onAutoReleaseChange={(autoRelease) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, autoRelease: autoRelease });
              // Remove onManualInit call to prevent parameter instability
            }}
            onRMSDetectionChange={(rmsDetection) => {
              onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, rmsDetection: rmsDetection });
              // Remove onManualInit call to prevent parameter instability
            }}
            // Current settings
            knee={audioEffects.gMasteringCompressor?.knee || 'Soft'}
            lookahead={audioEffects.gMasteringCompressor?.lookahead || 'Off'}
            stereoLink={audioEffects.gMasteringCompressor?.stereoLink || 'Low'}
            sidechain={audioEffects.gMasteringCompressor?.sidechain || 'Off'}
            autoRelease={audioEffects.gMasteringCompressor?.autoRelease || false}
            rmsDetection={audioEffects.gMasteringCompressor?.rmsDetection || false}
          />
        </div>

        {/* 4. G-Widener - Enhanced with HardwareKnob */}
        <StudioRack title="G-WIDENER" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Widener</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gWidener?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gWidener', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gWidener?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gWidener.width || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="WIDTH"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gWidener', 'width', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gWidener-width'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gWidener-width' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gWidener.depth || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="DEPTH"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gWidener', 'depth', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gWidener-depth'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gWidener-depth' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* 5. G-Digital Tape - Enhanced with HardwareKnob */}
        <StudioRack title="G-DIGITAL TAPE" subtitle="CRYS GARAGE STUDIO">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold text-xs">G-Digital Tape</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.gDigitalTape?.enabled || false}
                  onChange={(e) => onTogglePremiumEffect('gDigitalTape', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-gray-300 text-[10px]">Enable</span>
              </label>
            </div>

            {audioEffects.gDigitalTape?.enabled && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gDigitalTape.saturation || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="SAT"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gDigitalTape', 'saturation', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gDigitalTape-saturation'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gDigitalTape-saturation' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gDigitalTape.warmth || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="WARM"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gDigitalTape', 'warmth', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gDigitalTape-warmth'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gDigitalTape-warmth' : null)}
                  />
                </div>

                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.gDigitalTape.compression || 0}
                    min={0}
                    max={100}
                    step={1}
                    label="COMP"
                    unit="%"
                    size="small"
                    onChange={(value) => handleKnobChange('gDigitalTape', 'compression', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'gDigitalTape-compression'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'gDigitalTape-compression' : null)}
                  />
                </div>
              </div>
            )}
          </div>
        </StudioRack>

        {/* 6. Advanced Limiter - Enhanced */}
        <div className="md:col-span-1 lg:col-span-1">
          <AdvancedLimiter
            limitLevel={audioEffects.gLimiter?.threshold || -1}
            inputGain={audioEffects.gLimiter?.inputGain || 0}
            outputGain={audioEffects.gLimiter?.outputGain || 0}
            reduction={audioEffects.gLimiter?.reduction || 0}
            outputPeak={audioEffects.gLimiter?.outputPeak || -20}
            onLimitLevelChange={(value) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, threshold: value });
              onManualInit?.();
            }}
            onInputGainChange={(value) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, inputGain: value });
              onManualInit?.();
            }}
            onOutputGainChange={(value) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, outputGain: value });
              onManualInit?.();
            }}
            enabled={audioEffects.gLimiter?.enabled || false}
            onToggle={(enabled) => onTogglePremiumEffect('gLimiter', enabled)}
            onManualInit={onManualInit}
            // Control button handlers
            onChannelModeChange={(mode) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, channelMode: mode });
              onManualInit?.();
            }}
            onShapeChange={(shape) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, shape: shape });
              onManualInit?.();
            }}
            onOversamplingChange={(oversampling) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, oversampling: oversampling });
              onManualInit?.();
            }}
            onLatencyChange={(latency) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, latency: latency });
              onManualInit?.();
            }}
            onOvershootChange={(overshoot) => {
              onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, overshoot: overshoot });
              onManualInit?.();
            }}
            // Current settings
            channelMode={audioEffects.gLimiter?.channelMode || 'L/R'}
            shape={audioEffects.gLimiter?.shape || 'Linear'}
            oversampling={audioEffects.gLimiter?.oversampling || 'x1'}
            latency={audioEffects.gLimiter?.latency || 'Normal'}
            overshoot={audioEffects.gLimiter?.overshoot || 'Clip'}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumEffects;
