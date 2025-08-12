import React, { useState } from 'react';
import { 
  Sliders, 
  CheckCircle, 
  DollarSign, 
  Zap, 
  Settings,
  Volume2,
  Filter,
  Maximize2,
  Target,
  Gauge
} from 'lucide-react';

interface AudioEffect {
  id: string;
  name: string;
  type: 'free' | 'paid';
  price?: number;
  enabled: boolean;
  settings: any;
}

interface AudioEffectsProps {
  audioEffects: AudioEffect[];
  onToggleEffect: (effectId: string) => void;
  onUpdateEffectSettings: (effectId: string, settings: any) => void;
  surroundEnabled: boolean;
  tunerEnabled: boolean;
  solfagioEnabled: boolean;
  onToggleSurround: () => void;
  onToggleTuner: () => void;
  onToggleSolfagio: () => void;
}

const AudioEffects: React.FC<AudioEffectsProps> = ({
  audioEffects,
  onToggleEffect,
  onUpdateEffectSettings,
  surroundEnabled,
  tunerEnabled,
  solfagioEnabled,
  onToggleSurround,
  onToggleTuner,
  onToggleSolfagio
}) => {
  const [expandedEffect, setExpandedEffect] = useState<string | null>(null);

  const renderEffectControls = (effect: AudioEffect) => {
    switch (effect.id) {
      case 'eq3band':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Low Band</label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={effect.settings.low || 0}
                onChange={(e) => onUpdateEffectSettings(effect.id, { low: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.low || 0} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Mid Band</label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={effect.settings.mid || 0}
                onChange={(e) => onUpdateEffectSettings(effect.id, { mid: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.mid || 0} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">High Band</label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={effect.settings.high || 0}
                onChange={(e) => onUpdateEffectSettings(effect.id, { high: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.high || 0} dB</span>
            </div>
          </div>
        );

      case 'compressor':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Threshold</label>
              <input
                type="range"
                min="-60"
                max="0"
                step="0.1"
                value={effect.settings.threshold || -20}
                onChange={(e) => onUpdateEffectSettings(effect.id, { threshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.threshold || -20} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Ratio</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={effect.settings.ratio || 4}
                onChange={(e) => onUpdateEffectSettings(effect.id, { ratio: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.ratio || 4}:1</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Attack</label>
              <input
                type="range"
                min="0.001"
                max="1"
                step="0.001"
                value={effect.settings.attack || 0.01}
                onChange={(e) => onUpdateEffectSettings(effect.id, { attack: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.attack || 0.01}s</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Release</label>
              <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                value={effect.settings.release || 0.1}
                onChange={(e) => onUpdateEffectSettings(effect.id, { release: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.release || 0.1}s</span>
            </div>
          </div>
        );

      case 'stereoWidener':
        return (
          <div>
            <label className="text-sm text-gray-400">Width</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={effect.settings.width || 1.2}
              onChange={(e) => onUpdateEffectSettings(effect.id, { width: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{effect.settings.width || 1.2}x</span>
          </div>
        );

      case 'loudness':
        return (
          <div>
            <label className="text-sm text-gray-400">Gain</label>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.1"
              value={effect.settings.gain || 0}
              onChange={(e) => onUpdateEffectSettings(effect.id, { gain: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{effect.settings.gain || 0} dB</span>
          </div>
        );

      case 'limiter':
        return (
          <div>
            <label className="text-sm text-gray-400">Threshold</label>
            <input
              type="range"
              min="-3"
              max="0"
              step="0.1"
              value={effect.settings.threshold || -1.0}
              onChange={(e) => onUpdateEffectSettings(effect.id, { threshold: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{effect.settings.threshold || -1.0} dB</span>
          </div>
        );

      case 'gPrecisionEq':
        return (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">8-Band EQ</label>
            {[32, 64, 125, 250, 500, 1000, 2000, 4000].map((freq, index) => (
              <div key={freq}>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{freq}Hz</span>
                  <span>{effect.settings.bands?.[index] || 0} dB</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={effect.settings.bands?.[index] || 0}
                  onChange={(e) => {
                    const newBands = [...(effect.settings.bands || [0, 0, 0, 0, 0, 0, 0, 0])];
                    newBands[index] = parseFloat(e.target.value);
                    onUpdateEffectSettings(effect.id, { bands: newBands });
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        );

      case 'gDigitalTape':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Saturation</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effect.settings.saturation || 0.5}
                onChange={(e) => onUpdateEffectSettings(effect.id, { saturation: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.saturation || 0.5}</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Warmth</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effect.settings.warmth || 0.3}
                onChange={(e) => onUpdateEffectSettings(effect.id, { warmth: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{effect.settings.warmth || 0.3}</span>
            </div>
          </div>
        );

      case 'gMultiband':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Low Band</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="range"
                    min="-60"
                    max="0"
                    step="0.1"
                    value={effect.settings.low?.threshold || -20}
                    onChange={(e) => onUpdateEffectSettings(effect.id, { 
                      low: { 
                        ...effect.settings.low, 
                        threshold: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">Thresh: {effect.settings.low?.threshold || -20} dB</span>
                </div>
                <div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={effect.settings.low?.ratio || 4}
                    onChange={(e) => onUpdateEffectSettings(effect.id, { 
                      low: { 
                        ...effect.settings.low, 
                        ratio: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">Ratio: {effect.settings.low?.ratio || 4}:1</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Mid Band</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="range"
                    min="-60"
                    max="0"
                    step="0.1"
                    value={effect.settings.mid?.threshold || -20}
                    onChange={(e) => onUpdateEffectSettings(effect.id, { 
                      mid: { 
                        ...effect.settings.mid, 
                        threshold: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">Thresh: {effect.settings.mid?.threshold || -20} dB</span>
                </div>
                <div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={effect.settings.mid?.ratio || 4}
                    onChange={(e) => onUpdateEffectSettings(effect.id, { 
                      mid: { 
                        ...effect.settings.mid, 
                        ratio: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">Ratio: {effect.settings.mid?.ratio || 4}:1</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">High Band</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="range"
                    min="-60"
                    max="0"
                    step="0.1"
                    value={effect.settings.high?.threshold || -20}
                    onChange={(e) => onUpdateEffectSettings(effect.id, { 
                      high: { 
                        ...effect.settings.high, 
                        threshold: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">Thresh: {effect.settings.high?.threshold || -20} dB</span>
                </div>
                <div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={effect.settings.high?.ratio || 4}
                    onChange={(e) => onUpdateEffectSettings(effect.id, { 
                      high: { 
                        ...effect.settings.high, 
                        ratio: parseFloat(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">Ratio: {effect.settings.high?.ratio || 4}:1</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-400">
            Click to configure {effect.name}
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      <h3 className="text-xl font-bold text-crys-gold mb-4 flex items-center">
        <Sliders className="w-5 h-5 mr-2" />
        Audio Effects
      </h3>

      {/* Free Effects */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Free Effects
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audioEffects.filter(effect => effect.type === 'free').map((effect) => (
            <div key={effect.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => onToggleEffect(effect.id)}
                  className={`flex-1 text-left p-2 rounded border-2 transition-all ${
                    effect.enabled
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="text-sm font-medium">{effect.name}</div>
                </button>
                {effect.enabled && (
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === effect.id ? null : effect.id)}
                    className="ml-2 p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
              </div>
              {effect.enabled && expandedEffect === effect.id && (
                <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-600">
                  {renderEffectControls(effect)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Paid Effects */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Premium Effects ($5 each)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audioEffects.filter(effect => effect.type === 'paid').map((effect) => (
            <div key={effect.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => onToggleEffect(effect.id)}
                  className={`flex-1 text-left p-2 rounded border-2 transition-all ${
                    effect.enabled
                      ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="text-sm font-medium">{effect.name}</div>
                  <div className="text-xs text-gray-400">${effect.price}</div>
                </button>
                {effect.enabled && (
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === effect.id ? null : effect.id)}
                    className="ml-2 p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
              </div>
              {effect.enabled && expandedEffect === effect.id && (
                <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-600">
                  {renderEffectControls(effect)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Advanced Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={onToggleSurround}
            className={`p-3 rounded-lg border-2 transition-all ${
              surroundEnabled
                ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="text-sm font-medium">G-Surround</div>
            <div className="text-xs text-gray-400">$5</div>
          </button>
          
          <button
            onClick={onToggleTuner}
            className={`p-3 rounded-lg border-2 transition-all ${
              tunerEnabled
                ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="text-sm font-medium">G-Tuner (444Hz)</div>
            <div className="text-xs text-gray-400">$2</div>
          </button>
          
          <button
            onClick={onToggleSolfagio}
            className={`p-3 rounded-lg border-2 transition-all ${
              solfagioEnabled
                ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="text-sm font-medium">Solfagio Tuning</div>
            <div className="text-xs text-gray-400">$3</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioEffects;
