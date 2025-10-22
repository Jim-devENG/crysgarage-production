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
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-2 rounded-lg">
                      <Filter className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">G-Precision 8-Band EQ</h4>
                      <p className="text-sm text-gray-400">Professional Parametric Equalizer</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onTogglePremiumEffect('gPrecisionEQ', !audioEffects.gPrecisionEQ)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      audioEffects.gPrecisionEQ
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {audioEffects.gPrecisionEQ ? 'ACTIVE' : 'ENABLE'}
                  </button>
                </div>
                
                {audioEffects.gPrecisionEQ && (
                  <div className="space-y-6">
                    {/* EQ Rack Unit */}
                    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 shadow-inner">
                      {/* EQ Bands */}
                      <div className="grid grid-cols-8 gap-4 mb-6">
                        {audioEffects.gPrecisionEQ.bands.map((band, index) => (
                          <div key={index} className="flex flex-col items-center">
                            {/* Frequency Display */}
                            <div className="bg-black rounded-lg p-2 mb-2 w-full text-center">
                              <div className="text-xs text-gray-400">FREQ</div>
                              <div className="text-sm font-bold text-crys-gold">
                                {band.frequency >= 1000 
                                  ? `${(band.frequency / 1000).toFixed(1)}k` 
                                  : band.frequency}
                              </div>
                            </div>
                            
                            {/* Gain Slider */}
                            <div className="relative h-32 mb-3">
                              <input
                                type="range"
                                min="-12"
                                max="12"
                                step="0.1"
                                value={band.gain}
                                onChange={(e) => {
                                  const newBands = [...audioEffects.gPrecisionEQ.bands];
                                  newBands[index].gain = parseFloat(e.target.value);
                                  onUpdateEffectSettings('gPrecisionEQ', { bands: newBands });
                                }}
                                className="slider-vertical"
                                style={{
                                  background: `linear-gradient(to top, 
                                    ${band.gain > 0 ? '#10b981' : '#ef4444'} 0%, 
                                    ${band.gain > 0 ? '#10b981' : '#ef4444'} ${Math.abs(band.gain) / 12 * 100}%, 
                                    #374151 ${Math.abs(band.gain) / 12 * 100}%, 
                                    #374151 100%)`
                                }}
                              />
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-600">
                                  <span className="text-xs font-bold text-white">
                                    {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Q Control Knob */}
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center shadow-inner">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full border border-gray-500 relative">
                                  <input
                                    type="range"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                    value={band.q}
                                    onChange={(e) => {
                                      const newBands = [...audioEffects.gPrecisionEQ.bands];
                                      newBands[index].q = parseFloat(e.target.value);
                                      onUpdateEffectSettings('gPrecisionEQ', { bands: newBands });
                                    }}
                                    className="knob-input"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1 h-3 bg-crys-gold rounded-full transform origin-bottom" 
                                         style={{ transform: `rotate(${(band.q / 10) * 270 - 135}deg)` }}>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center mt-1">
                                <div className="text-xs text-gray-400">Q</div>
                                <div className="text-xs font-bold text-white">{band.q.toFixed(1)}</div>
                              </div>
                            </div>
                            
                            {/* Frequency Control Knob */}
                            <div className="relative mt-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center shadow-inner">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full border border-gray-500 relative">
                                  <input
                                    type="range"
                                    min="20"
                                    max="20000"
                                    step="1"
                                    value={band.frequency}
                                    onChange={(e) => {
                                      const newBands = [...audioEffects.gPrecisionEQ.bands];
                                      newBands[index].frequency = parseFloat(e.target.value);
                                      onUpdateEffectSettings('gPrecisionEQ', { bands: newBands });
                                    }}
                                    className="knob-input"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1 h-3 bg-blue-500 rounded-full transform origin-bottom" 
                                         style={{ transform: `rotate(${(Math.log10(band.frequency) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * 270 - 135}deg)` }}>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center mt-1">
                                <div className="text-xs text-gray-400">FREQ</div>
                              </div>
                            </div>
                            
                            {/* Band Type Selector */}
                            <div className="mt-2">
                              <select
                                value={band.type}
                                onChange={(e) => {
                                  const newBands = [...audioEffects.gPrecisionEQ.bands];
                                  newBands[index].type = e.target.value as 'peaking' | 'lowshelf' | 'highshelf';
                                  onUpdateEffectSettings('gPrecisionEQ', { bands: newBands });
                                }}
                                className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:border-crys-gold focus:outline-none"
                              >
                                <option value="peaking">PEAK</option>
                                <option value="lowshelf">LOW</option>
                                <option value="highshelf">HIGH</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* EQ Response Display */}
                      <div className="bg-black rounded-lg p-4 border border-gray-700">
                        <div className="text-center mb-2">
                          <span className="text-sm font-medium text-gray-300">FREQUENCY RESPONSE</span>
                        </div>
                        <div className="h-24 bg-gradient-to-b from-gray-900 to-gray-800 rounded border border-gray-700 relative overflow-hidden">
                          {/* Simulated EQ curve */}
                          <svg className="w-full h-full" viewBox="0 0 100 24">
                            <path
                              d="M 0 12 Q 10 8 20 10 Q 30 12 40 8 Q 50 4 60 6 Q 70 8 80 4 Q 90 2 100 6"
                              stroke="#f59e0b"
                              strokeWidth="0.5"
                              fill="none"
                            />
                            <path
                              d="M 0 12 Q 10 16 20 14 Q 30 12 40 16 Q 50 20 60 18 Q 70 16 80 20 Q 90 22 100 18"
                              stroke="#ef4444"
                              strokeWidth="0.5"
                              fill="none"
                            />
                          </svg>
                          {/* Frequency markers */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                            <span>20Hz</span>
                            <span>200Hz</span>
                            <span>2kHz</span>
                            <span>20kHz</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preset Buttons */}
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => {
                          const presets = [
                            { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
                            { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 12000, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
                          ];
                          onUpdateEffectSettings('gPrecisionEQ', { bands: presets });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded border border-gray-600 transition-colors"
                      >
                        FLAT
                      </button>
                      <button
                        onClick={() => {
                          const presets = [
                            { frequency: 60, gain: 3, q: 1, type: 'lowshelf' as const },
                            { frequency: 150, gain: 2, q: 1, type: 'peaking' as const },
                            { frequency: 400, gain: 1, q: 1, type: 'peaking' as const },
                            { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 2500, gain: 1, q: 1, type: 'peaking' as const },
                            { frequency: 6000, gain: 2, q: 1, type: 'peaking' as const },
                            { frequency: 12000, gain: 3, q: 1, type: 'peaking' as const },
                            { frequency: 16000, gain: 2, q: 1, type: 'highshelf' as const }
                          ];
                          onUpdateEffectSettings('gPrecisionEQ', { bands: presets });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded border border-gray-600 transition-colors"
                      >
                        SMILE
                      </button>
                      <button
                        onClick={() => {
                          const presets = [
                            { frequency: 60, gain: -2, q: 1, type: 'lowshelf' as const },
                            { frequency: 150, gain: -1, q: 1, type: 'peaking' as const },
                            { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 1000, gain: 2, q: 1, type: 'peaking' as const },
                            { frequency: 2500, gain: 3, q: 1, type: 'peaking' as const },
                            { frequency: 6000, gain: 2, q: 1, type: 'peaking' as const },
                            { frequency: 12000, gain: -1, q: 1, type: 'peaking' as const },
                            { frequency: 16000, gain: -2, q: 1, type: 'highshelf' as const }
                          ];
                          onUpdateEffectSettings('gPrecisionEQ', { bands: presets });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded border border-gray-600 transition-colors"
                      >
                        PRESENCE
                      </button>
                      <button
                        onClick={() => {
                          const presets = [
                            { frequency: 60, gain: 4, q: 1, type: 'lowshelf' as const },
                            { frequency: 150, gain: 2, q: 1, type: 'peaking' as const },
                            { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 1000, gain: -1, q: 1, type: 'peaking' as const },
                            { frequency: 2500, gain: -2, q: 1, type: 'peaking' as const },
                            { frequency: 6000, gain: -1, q: 1, type: 'peaking' as const },
                            { frequency: 12000, gain: 0, q: 1, type: 'peaking' as const },
                            { frequency: 16000, gain: 1, q: 1, type: 'highshelf' as const }
                          ];
                          onUpdateEffectSettings('gPrecisionEQ', { bands: presets });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded border border-gray-600 transition-colors"
                      >
                        BASS
                      </button>
                    </div>
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

      {/* Hardware EQ Styles */}
      <style>{`
        .slider-vertical {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 8px;
          height: 128px;
          background: #374151;
          outline: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .slider-vertical::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid #d97706;
        }
        
        .slider-vertical::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          border: 2px solid #d97706;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .knob-input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 100%;
          background: transparent;
          outline: none;
          cursor: pointer;
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
        }
        
        .knob-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
          background: transparent;
          cursor: pointer;
        }
        
        .knob-input::-moz-range-thumb {
          width: 0;
          height: 0;
          background: transparent;
          cursor: pointer;
          border: none;
        }
        
        .knob-input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default AudioEffects;
