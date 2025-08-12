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
  Gauge,
  Music,
  Music2,
  Music3,
  Music4,
  Palette
} from 'lucide-react';
import { availableGenres } from '../GenreDropdown';

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
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
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
  onToggleSolfagio,
  selectedGenre,
  onGenreSelect
}) => {
  const [expandedEffect, setExpandedEffect] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'effects' | 'genres'>('effects');

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
          <div className="space-y-4">
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
            
            {/* Stereo Image Visualization */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-400">Stereo Image</span>
              </div>
              <div className="relative h-20 bg-gray-900 rounded overflow-hidden">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600"></div>
                
                {/* Left channel */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-blue-500/30 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(50, (effect.settings.width || 1.2) * 25)}%`,
                    right: '50%'
                  }}
                ></div>
                
                {/* Right channel */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-red-500/30 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(50, (effect.settings.width || 1.2) * 25)}%`,
                    left: '50%'
                  }}
                ></div>
                
                {/* Stereo field indicator */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-crys-gold rounded-full transition-all duration-300"
                  style={{ 
                    left: `${50 - ((effect.settings.width || 1.2) - 1) * 25}%`
                  }}
                ></div>
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-crys-gold rounded-full transition-all duration-300"
                  style={{ 
                    right: `${50 - ((effect.settings.width || 1.2) - 1) * 25}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-400">L</span>
                <span className="text-gray-400">Center</span>
                <span className="text-red-400">R</span>
              </div>
            </div>
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

  const getGenreGradient = (genreId: string) => {
    const colorMap: Record<string, string> = {
      // RED - High Energy, Bass Heavy
      afrobeats: 'from-red-500 to-red-700',
      trap: 'from-red-600 to-red-800',
      drill: 'from-red-700 to-red-900',
      dubstep: 'from-red-500 to-red-700',
      
      // BLUE - Smooth, Melodic
      gospel: 'from-blue-500 to-blue-700',
      'r-b': 'from-blue-600 to-blue-800',
      'lofi-hiphop': 'from-blue-700 to-blue-900',
      
      // ORANGE - Energetic, Dynamic
      'hip-hop': 'from-orange-500 to-orange-700',
      house: 'from-orange-600 to-orange-800',
      techno: 'from-orange-700 to-orange-900',
      
      // GREEN - Natural, Organic
      highlife: 'from-green-500 to-green-700',
      instrumentals: 'from-green-600 to-green-800',
      beats: 'from-green-700 to-green-900',
      
      // PURPLE - Creative, Artistic
      amapiano: 'from-purple-500 to-purple-700',
      trance: 'from-purple-600 to-purple-800',
      'drum-bass': 'from-purple-700 to-purple-900',
      
      // YELLOW - Bright, Clear
      reggae: 'from-yellow-500 to-yellow-700',
      'voice-over': 'from-yellow-600 to-yellow-800',
      journalist: 'from-yellow-700 to-yellow-900',
      
      // PINK - Warm, Emotional
      soul: 'from-pink-500 to-pink-700',
      'content-creator': 'from-pink-600 to-pink-800',
      pop: 'from-pink-700 to-pink-900',
      
      // INDIGO - Sophisticated, Complex
      jazz: 'from-indigo-500 to-indigo-700'
    };
    
    return colorMap[genreId] || 'from-gray-500 to-gray-700';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      <h3 className="text-xl font-bold text-crys-gold mb-4 flex items-center">
        <Sliders className="w-5 h-5 mr-2" />
        Audio Effects & Genres
      </h3>

      {/* Section Tabs */}
      <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveSection('effects')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeSection === 'effects' ? 'bg-crys-gold text-gray-900' : 'text-gray-400 hover:text-white'
          }`}
        >
          Effects
        </button>
        <button
          onClick={() => setActiveSection('genres')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeSection === 'genres' ? 'bg-crys-gold text-gray-900' : 'text-gray-400 hover:text-white'
          }`}
        >
          Genres
        </button>
      </div>

      {/* Effects Section */}
      {activeSection === 'effects' && (
        <>
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
        </>
      )}

      {/* Genres Section */}
      {activeSection === 'genres' && (
        <div>
          <h4 className="text-lg font-semibold text-crys-gold mb-4 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Professional Genres
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableGenres.map((genre) => {
              const isSelected = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  onClick={() => onGenreSelect(genre.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? `border-crys-gold bg-gradient-to-br ${getGenreGradient(genre.id)} text-white`
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Music className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{genre.name}</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">{genre.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {genre.characteristics.slice(0, 2).map((char, index) => (
                      <span key={index} className="text-xs bg-black/20 px-1 py-0.5 rounded">
                        {char}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioEffects;
