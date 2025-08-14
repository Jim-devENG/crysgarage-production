import React from 'react';
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
  return (
    <div className="space-y-3">
      {/* Premium Effects Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Premium G-Series Effects</h3>
        <p className="text-sm text-gray-400">Professional-grade mastering tools</p>
      </div>

      {/* Compact Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* G-Mastering Compressor */}
        <GMasteringCompressor
          threshold={audioEffects.gMasteringCompressor?.threshold || -20}
          ratio={audioEffects.gMasteringCompressor?.ratio || 4}
          attack={audioEffects.gMasteringCompressor?.attack || 10}
          release={audioEffects.gMasteringCompressor?.release || 100}
          makeup={audioEffects.gMasteringCompressor?.makeup || 0}
          reduction={audioEffects.gMasteringCompressor?.reduction || 0}
          outputLevel={audioEffects.gMasteringCompressor?.outputLevel || -20}
          onThresholdChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, threshold: value })}
          onRatioChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, ratio: value })}
          onAttackChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, attack: value })}
          onReleaseChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, release: value })}
          onMakeupChange={(value) => onUpdateEffectSettings('gMasteringCompressor', { ...audioEffects.gMasteringCompressor, makeup: value })}
          enabled={audioEffects.gMasteringCompressor?.enabled || false}
          onToggle={(enabled) => onTogglePremiumEffect('gMasteringCompressor', enabled)}
        />

        {/* Advanced Limiter */}
        <AdvancedLimiter
          limitLevel={audioEffects.gLimiter?.threshold || -1}
          inputGain={audioEffects.gLimiter?.inputGain || 0}
          outputGain={audioEffects.gLimiter?.outputGain || 0}
          reduction={audioEffects.gLimiter?.reduction || 0}
          outputPeak={audioEffects.gLimiter?.outputPeak || -20}
          onLimitLevelChange={(value) => onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, threshold: value })}
          onInputGainChange={(value) => onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, inputGain: value })}
          onOutputGainChange={(value) => onUpdateEffectSettings('gLimiter', { ...audioEffects.gLimiter, outputGain: value })}
          enabled={audioEffects.gLimiter?.enabled || false}
          onToggle={(enabled) => onTogglePremiumEffect('gLimiter', enabled)}
        />
      </div>

      {/* G-Precision EQ - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Settings className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">G-PRECISION 8-BAND EQ</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
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
                  <div className="relative w-10 h-10 mx-auto mb-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                        <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                             style={{ transform: `rotate(${(band.gain + 12) * 3}deg)` }}></div>
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                  </div>
                  <div className="text-crys-gold font-mono text-[8px] mb-0.5">{band.gain.toFixed(1)}dB</div>
                  <div className="text-gray-400 text-[6px]">{band.frequency}Hz</div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={band.gain}
                    onChange={(e) => {
                      const newBands = [...audioEffects.gPrecisionEQ.bands];
                      newBands[index] = { ...band, gain: parseFloat(e.target.value) };
                      onUpdateEffectSettings('gPrecisionEQ', { ...audioEffects.gPrecisionEQ, bands: newBands });
                    }}
                    className="w-full mt-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="text-[6px] text-gray-500">CRYS GARAGE G-PRECISION EQ v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* G-Digital Tape - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Target className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">G-DIGITAL TAPE MACHINE</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
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
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.gDigitalTape.saturation) * 3.6}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.gDigitalTape.saturation}%</div>
                <div className="text-gray-400 text-[8px]">SAT</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={audioEffects.gDigitalTape.saturation}
                  onChange={(e) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, saturation: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.gDigitalTape.warmth) * 3.6}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.gDigitalTape.warmth}%</div>
                <div className="text-gray-400 text-[8px]">WARM</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={audioEffects.gDigitalTape.warmth}
                  onChange={(e) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, warmth: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.gDigitalTape.compression) * 3.6}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.gDigitalTape.compression}%</div>
                <div className="text-gray-400 text-[8px]">COMP</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={audioEffects.gDigitalTape.compression}
                  onChange={(e) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, compression: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="text-[6px] text-gray-500">CRYS GARAGE G-DIGITAL TAPE v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* G-Multi-Band - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Activity className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">G-MULTI-BAND COMPRESSOR</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
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
            <div className="space-y-2">
              {/* Low Band */}
              <div className="bg-gray-900 rounded-md p-2">
                <h6 className="text-xs font-medium text-white mb-2">Low Band</h6>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                               style={{ transform: `rotate(${(audioEffects.gMultiBand.low.threshold + 60) * 1.5}deg)` }}></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                    </div>
                    <div className="text-crys-gold font-mono text-[8px] mb-0.5">{audioEffects.gMultiBand.low.threshold.toFixed(1)}dB</div>
                    <div className="text-gray-400 text-[6px]">THRESH</div>
                    <input
                      type="range"
                      min="-60"
                      max="0"
                      step="1"
                      value={audioEffects.gMultiBand.low.threshold}
                      onChange={(e) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        low: { ...audioEffects.gMultiBand.low, threshold: parseFloat(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                               style={{ transform: `rotate(${(audioEffects.gMultiBand.low.ratio - 1) * 10}deg)` }}></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                    </div>
                    <div className="text-crys-gold font-mono text-[8px] mb-0.5">{audioEffects.gMultiBand.low.ratio.toFixed(1)}:1</div>
                    <div className="text-gray-400 text-[6px]">RATIO</div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={audioEffects.gMultiBand.low.ratio}
                      onChange={(e) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        low: { ...audioEffects.gMultiBand.low, ratio: parseFloat(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Mid Band */}
              <div className="bg-gray-900 rounded-md p-2">
                <h6 className="text-xs font-medium text-white mb-2">Mid Band</h6>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                               style={{ transform: `rotate(${(audioEffects.gMultiBand.mid.threshold + 60) * 1.5}deg)` }}></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                    </div>
                    <div className="text-crys-gold font-mono text-[8px] mb-0.5">{audioEffects.gMultiBand.mid.threshold.toFixed(1)}dB</div>
                    <div className="text-gray-400 text-[6px]">THRESH</div>
                    <input
                      type="range"
                      min="-60"
                      max="0"
                      step="1"
                      value={audioEffects.gMultiBand.mid.threshold}
                      onChange={(e) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        mid: { ...audioEffects.gMultiBand.mid, threshold: parseFloat(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                               style={{ transform: `rotate(${(audioEffects.gMultiBand.mid.ratio - 1) * 10}deg)` }}></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                    </div>
                    <div className="text-crys-gold font-mono text-[8px] mb-0.5">{audioEffects.gMultiBand.mid.ratio.toFixed(1)}:1</div>
                    <div className="text-gray-400 text-[6px]">RATIO</div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={audioEffects.gMultiBand.mid.ratio}
                      onChange={(e) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        mid: { ...audioEffects.gMultiBand.mid, ratio: parseFloat(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* High Band */}
              <div className="bg-gray-900 rounded-md p-2">
                <h6 className="text-xs font-medium text-white mb-2">High Band</h6>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                               style={{ transform: `rotate(${(audioEffects.gMultiBand.high.threshold + 60) * 1.5}deg)` }}></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                    </div>
                    <div className="text-crys-gold font-mono text-[8px] mb-0.5">{audioEffects.gMultiBand.high.threshold.toFixed(1)}dB</div>
                    <div className="text-gray-400 text-[6px]">THRESH</div>
                    <input
                      type="range"
                      min="-60"
                      max="0"
                      step="1"
                      value={audioEffects.gMultiBand.high.threshold}
                      onChange={(e) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        high: { ...audioEffects.gMultiBand.high, threshold: parseFloat(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                               style={{ transform: `rotate(${(audioEffects.gMultiBand.high.ratio - 1) * 10}deg)` }}></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                    </div>
                    <div className="text-crys-gold font-mono text-[8px] mb-0.5">{audioEffects.gMultiBand.high.ratio.toFixed(1)}:1</div>
                    <div className="text-gray-400 text-[6px]">RATIO</div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={audioEffects.gMultiBand.high.ratio}
                      onChange={(e) => onUpdateEffectSettings('gMultiBand', { 
                        ...audioEffects.gMultiBand, 
                        high: { ...audioEffects.gMultiBand.high, ratio: parseFloat(e.target.value) }
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="text-[6px] text-gray-500">CRYS GARAGE G-MULTI-BAND v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumEffects;
