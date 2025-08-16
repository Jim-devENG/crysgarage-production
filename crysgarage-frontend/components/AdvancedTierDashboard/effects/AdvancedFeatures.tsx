import React, { useState } from 'react';
import { Settings, Volume2, Zap, Gauge, Radio, Waves, Activity, BarChart3, Target, Mic, Headphones, Layers, Globe, Cpu, Download, Play, Square } from 'lucide-react';
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
  const [editingKnob, setEditingKnob] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    sampleRate: 44100,
    bitDepth: 24,
    format: 'WAV'
  });

  const handleKnobChange = (effectType: string, setting: string, value: number) => {
    console.log(`Advanced knob changed: ${effectType}.${setting} = ${value}`);
    onUpdateEffectSettings(effectType, { ...audioEffects[effectType], [setting]: value });
    // Remove onManualInit call to prevent parameter instability
  };

  const handleKnobClick = () => {
    // Resume audio context when knob is clicked
    onManualInit?.();
  };

  const handlePlayback = () => {
    setIsPlaying(!isPlaying);
    // Add playback logic here
    console.log('Playback toggled:', !isPlaying);
  };

  const handleDownload = () => {
    // Add download logic here
    console.log('Downloading with settings:', exportSettings);
  };

  return (
    <div className="space-y-3">
      {/* Advanced Features Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Advanced Features</h3>
        <p className="text-sm text-gray-400">Premium mastering capabilities with real-time control</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Export Gate - Final Processing & Download */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden md:col-span-2">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Download className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">EXPORT GATE</h3>
                    <p className="text-[9px] text-yellow-200">Final Processing & Download</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-300"></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4">
            {/* G-Tuner Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold text-sm">G-Tuner (444Hz Reference)</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={audioEffects.gTuner?.enabled || false}
                    onChange={(e) => onTogglePremiumEffect('gTuner', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-300 text-xs">Enable</span>
                </label>
              </div>

              {audioEffects.gTuner?.enabled && (
                <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 rounded-lg p-3 border border-yellow-600 mb-3">
                  <div className="text-center">
                    <div className="text-yellow-200 text-lg font-bold mb-1">444 Hz</div>
                    <div className="text-yellow-300 text-xs">Reference Frequency</div>
                    <div className="text-yellow-400 text-[10px] mt-1">Auto-Applied</div>
                  </div>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="mb-4">
              <h4 className="text-white font-semibold text-sm mb-3">Playback & Preview</h4>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayback}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4" />
                      <span className="text-sm">Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="text-sm">Play</span>
                    </>
                  )}
                </button>
                <div className="text-gray-300 text-xs">
                  {isPlaying ? 'Playing with effects...' : 'Click to preview with effects'}
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="mb-4">
              <h4 className="text-white font-semibold text-sm mb-3">Export Settings</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 text-xs mb-1">Sample Rate</label>
                  <select
                    value={exportSettings.sampleRate}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, sampleRate: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value={44100}>44.1 kHz</option>
                    <option value={48000}>48 kHz</option>
                    <option value={96000}>96 kHz</option>
                    <option value={192000}>192 kHz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1">Bit Depth</label>
                  <select
                    value={exportSettings.bitDepth}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, bitDepth: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value={16}>16-bit</option>
                    <option value={24}>24-bit</option>
                    <option value={32}>32-bit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1">Format</label>
                  <select
                    value={exportSettings.format}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="WAV">WAV</option>
                    <option value="FLAC">FLAC</option>
                    <option value="AIFF">AIFF</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <Download className="w-5 h-5" />
                <span>Download Mastered Track</span>
              </button>
              <div className="text-gray-400 text-xs mt-2">
                {exportSettings.sampleRate/1000}kHz • {exportSettings.bitDepth}-bit • {exportSettings.format}
              </div>
            </div>
          </div>

          {/* Footer - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="text-[8px] text-yellow-200">Export Gate v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
