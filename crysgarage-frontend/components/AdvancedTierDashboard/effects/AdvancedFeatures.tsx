import React, { useState } from 'react';
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

  return (
    <div className="space-y-3">
      {/* Advanced Features Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Advanced Features</h3>
        <p className="text-sm text-gray-400">Premium mastering capabilities</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* G-Surround - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">G-SURROUND</p>
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
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.gSurround.width + 100) * 1.8}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.gSurround.width.toFixed(1)}%</div>
                <div className="text-gray-400 text-[8px]">WIDTH</div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={audioEffects.gSurround.width}
                  onChange={(e) => onUpdateEffectSettings('gSurround', { ...audioEffects.gSurround, width: parseFloat(e.target.value) })}
                  className="w-full mt-1"
                />
              </div>

              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(audioEffects.gSurround.depth + 100) * 1.8}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{audioEffects.gSurround.depth.toFixed(1)}%</div>
                <div className="text-gray-400 text-[8px]">DEPTH</div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={audioEffects.gSurround.depth}
                  onChange={(e) => onUpdateEffectSettings('gSurround', { ...audioEffects.gSurround, depth: parseFloat(e.target.value) })}
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE G-SURROUND v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* G-Tuner - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">G-TUNER</p>
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
              {/* Frequency Display */}
              <div className="bg-gray-900 rounded-md p-3 mb-3">
                <div className="text-crys-gold font-mono text-xl mb-1">{audioEffects.gTuner.frequency}Hz</div>
                <div className="text-gray-400 text-[8px]">REFERENCE FREQUENCY</div>
              </div>

              {/* Depth Control */}
              <div className="relative w-12 h-12 mx-auto mb-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                         style={{ transform: `rotate(${(audioEffects.gTuner.depth || 0) * 3.6}deg)` }}></div>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
              </div>
              <div className="text-crys-gold font-mono text-xs mb-0.5">{(audioEffects.gTuner.depth || 0).toFixed(0)}%</div>
              <div className="text-gray-400 text-[8px]">DEPTH</div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={audioEffects.gTuner.depth || 0}
                onChange={(e) => onUpdateEffectSettings('gTuner', { ...audioEffects.gTuner, depth: parseFloat(e.target.value) })}
                className="w-full mt-1"
              />

              {/* Cost Info */}
              <div className="mt-3 text-center">
                <div className="text-[8px] text-gray-400">Cost per use: $3</div>
                <button
                  onClick={() => setShowCost(!showCost)}
                  className="text-[8px] text-crys-gold hover:text-yellow-400 mt-1"
                >
                  {showCost ? 'Hide Details' : 'Show Details'}
                </button>
                {showCost && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-[8px] text-gray-300">
                    <div>• 444Hz reference tone</div>
                    <div>• Professional tuning</div>
                    <div>• Real-time frequency analysis</div>
                  </div>
                )}
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
            <div className="text-[6px] text-gray-500">CRYS GARAGE G-TUNER v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Feature Info */}
      <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
        <h5 className="text-white font-medium text-xs mb-2 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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
