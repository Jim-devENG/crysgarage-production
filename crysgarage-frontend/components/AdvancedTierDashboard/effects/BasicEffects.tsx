import React from 'react';
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
  return (
    <div className="space-y-3">
      {/* Basic Effects Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Basic Effects</h3>
        <p className="text-sm text-gray-400">Essential mastering tools</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 3-Band EQ - Compact Card */}
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
                  <p className="text-[8px] text-gray-400">3-BAND EQUALIZER</p>
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
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.eq.low + 12) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.eq.low.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">LOW</div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={audioEffects.eq.low}
                  onChange={(e) => onUpdateEffectSettings('eq', { ...audioEffects.eq, low: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.eq.mid + 12) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.eq.mid.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">MID</div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={audioEffects.eq.mid}
                  onChange={(e) => onUpdateEffectSettings('eq', { ...audioEffects.eq, mid: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.eq.high + 12) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.eq.high.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">HIGH</div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={audioEffects.eq.high}
                  onChange={(e) => onUpdateEffectSettings('eq', { ...audioEffects.eq, high: parseFloat(e.target.value) })}
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE 3-BAND EQ v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Compressor - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Zap className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">COMPRESSOR</p>
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
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.compressor.threshold + 60) * 1.5}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.compressor.threshold.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">THRESH</div>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={audioEffects.compressor.threshold}
                  onChange={(e) => onUpdateEffectSettings('compressor', { ...audioEffects.compressor, threshold: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.compressor.ratio - 1) * 10}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.compressor.ratio.toFixed(1)}:1</div>
                <div className="text-gray-400 text-[8px]">RATIO</div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={audioEffects.compressor.ratio}
                  onChange={(e) => onUpdateEffectSettings('compressor', { ...audioEffects.compressor, ratio: parseFloat(e.target.value) })}
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE COMPRESSOR v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stereo Widener - Compact Card */}
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
                  <p className="text-[8px] text-gray-400">STEREO WIDENER</p>
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
            <h4 className="text-white font-semibold text-xs">Stereo Widener</h4>
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
              <div className="relative w-12 h-12 mx-auto mb-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                         style={{ transform: `rotate(${(audioEffects.stereoWidener.width + 100) * 1.8}deg)` }}></div>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
              </div>
              <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.stereoWidener.width.toFixed(1)}%</div>
              <div className="text-gray-400 text-[8px]">WIDTH</div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={audioEffects.stereoWidener.width}
                onChange={(e) => onUpdateEffectSettings('stereoWidener', { ...audioEffects.stereoWidener, width: parseFloat(e.target.value) })}
                className="w-full mt-1"
              />
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE STEREO WIDENER v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loudness - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Volume2 className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">LOUDNESS</p>
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
            <h4 className="text-white font-semibold text-xs">Loudness</h4>
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
              <div className="relative w-12 h-12 mx-auto mb-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                         style={{ transform: `rotate(${(audioEffects.loudness.volume * 100) * 1.8}deg)` }}></div>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
              </div>
              <div className="text-crys-gold font-mono text-xs mb-0.5">{(audioEffects.loudness.volume * 100).toFixed(0)}%</div>
              <div className="text-gray-400 text-[8px]">VOLUME</div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={audioEffects.loudness.volume}
                onChange={(e) => onUpdateEffectSettings('loudness', { ...audioEffects.loudness, volume: parseFloat(e.target.value) })}
                className="w-full mt-1"
              />
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE LOUDNESS v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Limiter - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Gauge className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">LIMITER</p>
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
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.limiter.threshold + 20) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.limiter.threshold.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">THRESH</div>
                <input
                  type="range"
                  min="-20"
                  max="0"
                  step="0.1"
                  value={audioEffects.limiter.threshold}
                  onChange={(e) => onUpdateEffectSettings('limiter', { ...audioEffects.limiter, threshold: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.limiter.ceiling + 20) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.limiter.ceiling.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">CEILING</div>
                <input
                  type="range"
                  min="-20"
                  max="0"
                  step="0.1"
                  value={audioEffects.limiter.ceiling}
                  onChange={(e) => onUpdateEffectSettings('limiter', { ...audioEffects.limiter, ceiling: parseFloat(e.target.value) })}
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE LIMITER v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default BasicEffects;
