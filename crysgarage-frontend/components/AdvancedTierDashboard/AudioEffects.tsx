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

interface AudioEffectsProps {
  audioEffects: {
    eq: { low: number; mid: number; high: number };
    compressor: { threshold: number; ratio: number; attack: number; release: number };
    stereoWidener: { width: number };
    loudness: { volume: number };
    limiter: { threshold: number; ceiling: number };
    gMasteringCompressor?: any;
    gPrecisionEQ?: any;
    gDigitalTape?: any;
    gLimiter?: any;
    gMultiBand?: any;
    gSurround?: boolean;
    gTuner?: { enabled: boolean; frequency: number };
    solfagio?: { enabled: boolean; frequency: number };
  };
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onTogglePremiumEffect: (effectType: string, enabled: boolean) => void;
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
  onUpdateEffectSettings,
  onTogglePremiumEffect,
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

  const getGenreGradient = (genreId: string) => {
    const gradients = {
      'afrobeats': 'from-orange-500 to-red-500',
      'amapiano': 'from-purple-500 to-pink-500',
      'hiphop': 'from-blue-500 to-purple-500',
      'rnb': 'from-pink-500 to-red-500',
      'pop': 'from-yellow-500 to-orange-500',
      'electronic': 'from-cyan-500 to-blue-500',
      'rock': 'from-red-500 to-orange-500',
      'jazz': 'from-green-500 to-blue-500',
      'classical': 'from-gray-500 to-blue-500',
      'country': 'from-green-500 to-yellow-500',
      'reggae': 'from-green-500 to-red-500',
      'blues': 'from-blue-500 to-purple-500',
      'folk': 'from-brown-500 to-green-500',
      'gospel': 'from-purple-500 to-blue-500',
      'latin': 'from-red-500 to-yellow-500',
      'world': 'from-rainbow-500 to-multicolor-500'
    };
    return gradients[genreId as keyof typeof gradients] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      {/* Section Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1">
        <button
          onClick={() => setActiveSection('effects')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'effects'
              ? 'bg-crys-gold text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 inline mr-2" />
          Effects
        </button>
        <button
          onClick={() => setActiveSection('genres')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'genres'
              ? 'bg-crys-gold text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4 inline mr-2" />
          Genres
        </button>
      </div>

      {activeSection === 'effects' && (
        <div className="space-y-6">
          {/* Free Effects */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              Free Effects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 3-Band EQ */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    3-Band EQ
                  </h4>
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === 'eq' ? null : 'eq')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                {expandedEffect === 'eq' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Low Band</label>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.1"
                        value={audioEffects.eq.low}
                        onChange={(e) => onUpdateEffectSettings('eq', { low: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.eq.low} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Mid Band</label>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.1"
                        value={audioEffects.eq.mid}
                        onChange={(e) => onUpdateEffectSettings('eq', { mid: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.eq.mid} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">High Band</label>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.1"
                        value={audioEffects.eq.high}
                        onChange={(e) => onUpdateEffectSettings('eq', { high: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.eq.high} dB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Compressor */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Gauge className="w-4 h-4 mr-2" />
                    Compressor
                  </h4>
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === 'compressor' ? null : 'compressor')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                {expandedEffect === 'compressor' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Threshold</label>
                      <input
                        type="range"
                        min="-60"
                        max="0"
                        step="1"
                        value={audioEffects.compressor.threshold}
                        onChange={(e) => onUpdateEffectSettings('compressor', { threshold: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.compressor.threshold} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Ratio</label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.1"
                        value={audioEffects.compressor.ratio}
                        onChange={(e) => onUpdateEffectSettings('compressor', { ratio: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.compressor.ratio}:1</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Attack</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={audioEffects.compressor.attack}
                        onChange={(e) => onUpdateEffectSettings('compressor', { attack: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.compressor.attack}ms</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Release</label>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={audioEffects.compressor.release}
                        onChange={(e) => onUpdateEffectSettings('compressor', { release: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.compressor.release}ms</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stereo Widener */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Stereo Widener
                  </h4>
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === 'stereoWidener' ? null : 'stereoWidener')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                {expandedEffect === 'stereoWidener' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Width</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={audioEffects.stereoWidener.width}
                        onChange={(e) => onUpdateEffectSettings('stereoWidener', { width: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.stereoWidener.width}%</span>
                    </div>
                    {/* Stereo Image Visualization */}
                    <div className="relative h-16 bg-gray-800 rounded border border-gray-600 overflow-hidden">
                      <div 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-crys-gold rounded-full"
                        style={{
                          left: `${50 + (audioEffects.stereoWidener.width / 200) * 40}%`,
                          width: `${Math.max(2, audioEffects.stereoWidener.width / 10)}px`
                        }}
                      />
                      <div 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-crys-gold rounded-full"
                        style={{
                          left: `${50 - (audioEffects.stereoWidener.width / 200) * 40}%`,
                          width: `${Math.max(2, audioEffects.stereoWidener.width / 10)}px`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Loudness */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Loudness
                  </h4>
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === 'loudness' ? null : 'loudness')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                {expandedEffect === 'loudness' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.01"
                        value={audioEffects.loudness.volume}
                        onChange={(e) => onUpdateEffectSettings('loudness', { volume: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{Math.round(audioEffects.loudness.volume * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Limiter */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Limiter
                  </h4>
                  <button
                    onClick={() => setExpandedEffect(expandedEffect === 'limiter' ? null : 'limiter')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                {expandedEffect === 'limiter' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Threshold</label>
                      <input
                        type="range"
                        min="-10"
                        max="0"
                        step="0.1"
                        value={audioEffects.limiter.threshold}
                        onChange={(e) => onUpdateEffectSettings('limiter', { threshold: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.limiter.threshold} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Ceiling</label>
                      <input
                        type="range"
                        min="-1"
                        max="0"
                        step="0.01"
                        value={audioEffects.limiter.ceiling}
                        onChange={(e) => onUpdateEffectSettings('limiter', { ceiling: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.limiter.ceiling} dB</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Effects */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
              Premium Effects ($5 each)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* G-Mastering Compressor */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Mastering Compressor</h4>
                  <button
                    onClick={() => onTogglePremiumEffect('gMasteringCompressor', !audioEffects.gMasteringCompressor)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      audioEffects.gMasteringCompressor
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {audioEffects.gMasteringCompressor ? 'Active' : 'Enable'}
                  </button>
                </div>
                {audioEffects.gMasteringCompressor && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Threshold</label>
                      <input
                        type="range"
                        min="-30"
                        max="0"
                        step="1"
                        value={audioEffects.gMasteringCompressor.threshold}
                        onChange={(e) => onUpdateEffectSettings('gMasteringCompressor', { threshold: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.gMasteringCompressor.threshold} dB</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Ratio</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={audioEffects.gMasteringCompressor.ratio}
                        onChange={(e) => onUpdateEffectSettings('gMasteringCompressor', { ratio: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.gMasteringCompressor.ratio}:1</span>
                    </div>
                  </div>
                )}
              </div>

              {/* G-Precision 8-Band EQ */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Precision 8-Band EQ</h4>
                  <button
                    onClick={() => onTogglePremiumEffect('gPrecisionEQ', !audioEffects.gPrecisionEQ)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      audioEffects.gPrecisionEQ
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {audioEffects.gPrecisionEQ ? 'Active' : 'Enable'}
                  </button>
                </div>
                {audioEffects.gPrecisionEQ && (
                  <div className="text-sm text-gray-400">
                    8-band parametric EQ with precise frequency control
                  </div>
                )}
              </div>

              {/* G-Digital Tape Machine */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Digital Tape Machine</h4>
                  <button
                    onClick={() => onTogglePremiumEffect('gDigitalTape', !audioEffects.gDigitalTape)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      audioEffects.gDigitalTape
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {audioEffects.gDigitalTape ? 'Active' : 'Enable'}
                  </button>
                </div>
                {audioEffects.gDigitalTape && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Saturation</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={audioEffects.gDigitalTape.saturation}
                        onChange={(e) => onUpdateEffectSettings('gDigitalTape', { saturation: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.gDigitalTape.saturation}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* G-Limiter */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Limiter</h4>
                  <button
                    onClick={() => onTogglePremiumEffect('gLimiter', !audioEffects.gLimiter)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      audioEffects.gLimiter
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {audioEffects.gLimiter ? 'Active' : 'Enable'}
                  </button>
                </div>
                {audioEffects.gLimiter && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Threshold</label>
                      <input
                        type="range"
                        min="-1"
                        max="0"
                        step="0.01"
                        value={audioEffects.gLimiter.threshold}
                        onChange={(e) => onUpdateEffectSettings('gLimiter', { threshold: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{audioEffects.gLimiter.threshold} dB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* G-Multi-Band */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Multi-Band</h4>
                  <button
                    onClick={() => onTogglePremiumEffect('gMultiBand', !audioEffects.gMultiBand)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      audioEffects.gMultiBand
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {audioEffects.gMultiBand ? 'Active' : 'Enable'}
                  </button>
                </div>
                {audioEffects.gMultiBand && (
                  <div className="text-sm text-gray-400">
                    3-band compression for precise frequency control
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 text-purple-400 mr-2" />
              Advanced Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* G-Surround */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Surround ($5)</h4>
                  <button
                    onClick={onToggleSurround}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      surroundEnabled
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {surroundEnabled ? 'Active' : 'Enable'}
                  </button>
                </div>
                <p className="text-sm text-gray-400">Create immersive surround sound experience</p>
              </div>

              {/* G-Tuner */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">G-Tuner ($5)</h4>
                  <button
                    onClick={onToggleTuner}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      tunerEnabled
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {tunerEnabled ? '444Hz' : 'Enable'}
                  </button>
                </div>
                <p className="text-sm text-gray-400">Tune to 444Hz frequency (pay per switch)</p>
              </div>

              {/* Solfagio Frequency Tuning */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Solfagio ($3)</h4>
                  <button
                    onClick={onToggleSolfagio}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      solfagioEnabled
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {solfagioEnabled ? '432Hz' : 'Enable'}
                  </button>
                </div>
                <p className="text-sm text-gray-400">Tune to 432Hz healing frequency</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'genres' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableGenres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onGenreSelect(genre.id)}
              className={`p-4 rounded-lg border transition-all ${
                selectedGenre === genre.id
                  ? 'border-crys-gold bg-gradient-to-r ' + getGenreGradient(genre.id)
                  : 'border-gray-600 bg-gray-900 hover:border-gray-500'
              }`}
            >
              <div className="text-left">
                <h4 className={`font-medium mb-2 ${
                  selectedGenre === genre.id ? 'text-white' : 'text-white'
                }`}>
                  {genre.name}
                </h4>
                <p className={`text-sm mb-2 ${
                  selectedGenre === genre.id ? 'text-gray-200' : 'text-gray-400'
                }`}>
                  {genre.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {genre.characteristics.map((char, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedGenre === genre.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioEffects;
