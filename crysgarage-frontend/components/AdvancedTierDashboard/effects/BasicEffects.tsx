import React, { useState } from 'react';
import { Volume2, Settings, Zap, Gauge, Radio, Waves, Layers, Mic } from 'lucide-react';
import HardwareKnob from '../HardwareKnob';

interface BasicEffectsProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onToggleEffect: (effectType: string, enabled: boolean) => void;
  onManualInit?: () => void;
  manualAdjustments?: Set<string>;
  lockedEffectValues?: Record<string, any>;
}

const BasicEffects: React.FC<BasicEffectsProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onToggleEffect,
  onManualInit,
  manualAdjustments = new Set(),
  lockedEffectValues = {}
}) => {
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  const handleKnobChange = (effectType: string, setting: string, value: number) => {
    console.log(`Knob changed: ${effectType}.${setting} = ${value}`);
    onUpdateEffectSettings(effectType, { ...audioEffects[effectType], [setting]: value });
    // Remove onManualInit call to prevent parameter instability
  };

  const handleKnobClick = () => {
    // Only resume audio context when knob is clicked, not on every change
    onManualInit?.();
  };

  return (
    <div className="space-y-3">
      {/* Basic Effects Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Basic Effects</h3>
        <p className="text-sm text-gray-400">Essential mastering tools with real-time control</p>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                 {/* 8-Band EQ - Enhanced with HardwareKnob */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Radio className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-white">8-BAND EQ</h3>
                     <p className="text-[9px] text-yellow-200">Surgical Frequency Control</p>
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
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2">
                 <h4 className="text-white font-semibold text-sm">8-Band EQ</h4>
                 {manualAdjustments.has('eq') && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                     <span className="text-yellow-400 text-xs">Modified</span>
                   </div>
                 )}
               </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.eq?.enabled || false}
                  onChange={(e) => onToggleEffect('eq', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.eq?.enabled && (
               <div className="grid grid-cols-4 gap-2">
                 {/* Band 1 - Low Shelf */}
                 <div className="text-center">
                   <HardwareKnob
                     value={audioEffects.eq.bands?.[0]?.gain || 0}
                     min={-12}
                     max={12}
                     step={0.1}
                     label="60Hz"
                     unit="dB"
                     size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[0]) bands[0].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                     onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band1'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band1' : null)}
                   />
                 </div>

                 {/* Band 2 */}
                 <div className="text-center">
                   <HardwareKnob
                     value={audioEffects.eq.bands?.[1]?.gain || 0}
                     min={-12}
                     max={12}
                     step={0.1}
                     label="150Hz"
                     unit="dB"
                     size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[1]) bands[1].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                     onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band2'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band2' : null)}
                   />
                 </div>

                 {/* Band 3 */}
                 <div className="text-center">
                   <HardwareKnob
                     value={audioEffects.eq.bands?.[2]?.gain || 0}
                     min={-12}
                     max={12}
                     step={0.1}
                     label="400Hz"
                     unit="dB"
                     size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[2]) bands[2].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                     onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band3'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band3' : null)}
                   />
                 </div>

                 {/* Band 4 */}
                 <div className="text-center">
                   <HardwareKnob
                     value={audioEffects.eq.bands?.[3]?.gain || 0}
                     min={-12}
                     max={12}
                     step={0.1}
                     label="1kHz"
                     unit="dB"
                     size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[3]) bands[3].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                     onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band4'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band4' : null)}
                   />
                 </div>

                 {/* Band 5 */}
                 <div className="text-center">
                   <HardwareKnob
                     value={audioEffects.eq.bands?.[4]?.gain || 0}
                     min={-12}
                     max={12}
                     step={0.1}
                     label="2.5kHz"
                     unit="dB"
                     size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[4]) bands[4].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                     onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band5'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band5' : null)}
                   />
                 </div>

                 {/* Band 6 */}
                <div className="text-center">
                  <HardwareKnob
                     value={audioEffects.eq.bands?.[5]?.gain || 0}
                    min={-12}
                    max={12}
                    step={0.1}
                     label="6kHz"
                    unit="dB"
                    size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[5]) bands[5].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                    onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band6'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band6' : null)}
                  />
                </div>

                 {/* Band 7 */}
                <div className="text-center">
                  <HardwareKnob
                     value={audioEffects.eq.bands?.[6]?.gain || 0}
                    min={-12}
                    max={12}
                    step={0.1}
                     label="10kHz"
                    unit="dB"
                    size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[6]) bands[6].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                    onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band7'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band7' : null)}
                  />
                </div>

                 {/* Band 8 - High Shelf */}
                <div className="text-center">
                  <HardwareKnob
                     value={audioEffects.eq.bands?.[7]?.gain || 0}
                    min={-12}
                    max={12}
                    step={0.1}
                     label="16kHz"
                    unit="dB"
                    size="small"
                     onChange={(value) => {
                       const bands = [...(audioEffects.eq.bands || [])];
                       if (bands[7]) bands[7].gain = value;
                       onUpdateEffectSettings('eq', { ...audioEffects.eq, bands });
                     }}
                    onKnobClick={handleKnobClick}
                     isEditing={editingKnob === 'eq.band8'}
                     onEditingChange={(editing) => setEditingKnob(editing ? 'eq.band8' : null)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
               <div className="text-[8px] text-yellow-200">8-Band EQ v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compressor */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                    <Zap className="w-3 h-3 text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">COMPRESSOR</h3>
                    <p className="text-[9px] text-yellow-200">Dynamic Control</p>
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
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
              <h4 className="text-white font-semibold text-sm">Compressor</h4>
                {manualAdjustments.has('compressor') && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-xs">Modified</span>
                  </div>
                )}
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.compressor?.enabled || false}
                  onChange={(e) => onToggleEffect('compressor', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.compressor?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                {/* Threshold */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.threshold || -20}
                    min={-60}
                    max={0}
                    step={0.1}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'compressor.threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'compressor.threshold' : null)}
                  />
                </div>

                {/* Ratio */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.compressor.ratio || 4}
                    min={1}
                    max={20}
                    step={0.1}
                    label="RATIO"
                    unit=":1"
                    size="small"
                    onChange={(value) => handleKnobChange('compressor', 'ratio', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'compressor.ratio'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'compressor.ratio' : null)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="text-[8px] text-yellow-200">Compressor v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stereo Widener */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                 <div className="flex items-center space-x-2">
                   <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                     <Waves className="w-3 h-3 text-yellow-900" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">STEREO WIDENER</h3>
                     <p className="text-[9px] text-yellow-200">Width Control</p>
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
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-sm">Stereo Widener</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.stereoWidener?.enabled || false}
                  onChange={(e) => onToggleEffect('stereoWidener', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.stereoWidener?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.stereoWidener.width || 0}
                  min={-100}
                  max={100}
                  step={1}
                  label="WIDTH"
                  unit="%"
                  size="medium"
                  onChange={(value) => handleKnobChange('stereoWidener', 'width', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'stereoWidener.width'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'stereoWidener.width' : null)}
                />
              </div>
            )}
          </div>

          {/* Footer - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="text-[8px] text-yellow-200">Stereo Widener v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loudness */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                 <div className="flex items-center space-x-2">
                   <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                     <Volume2 className="w-3 h-3 text-yellow-900" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">LOUDNESS</h3>
                     <p className="text-[9px] text-yellow-200">Volume Control</p>
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
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
              <h4 className="text-white font-semibold text-sm">Loudness</h4>
                {manualAdjustments.has('loudness') && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-xs">Modified</span>
                  </div>
                )}
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.loudness?.enabled || false}
                  onChange={(e) => onToggleEffect('loudness', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.loudness?.enabled && (
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.loudness.gain || 0}
                  min={-12}
                  max={12}
                  step={0.1}
                  label="GAIN"
                  unit="dB"
                  size="medium"
                  onChange={(value) => handleKnobChange('loudness', 'gain', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'loudness.gain'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'loudness.gain' : null)}
                />
              </div>
            )}
          </div>

          {/* Footer - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="text-[8px] text-yellow-200">Loudness v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Limiter */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          {/* Header - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
            <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                 <div className="flex items-center space-x-2">
                   <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                     <Gauge className="w-3 h-3 text-yellow-900" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">LIMITER</h3>
                     <p className="text-[9px] text-yellow-200">Peak Control</p>
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
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
              <h4 className="text-white font-semibold text-sm">Limiter</h4>
                {manualAdjustments.has('limiter') && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-xs">Modified</span>
                  </div>
                )}
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={audioEffects.limiter?.enabled || false}
                  onChange={(e) => onToggleEffect('limiter', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-xs">Enable</span>
              </label>
            </div>

            {audioEffects.limiter?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                {/* Threshold */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.limiter.threshold || -1}
                    min={-20}
                    max={0}
                    step={0.01}
                    label="THRESH"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('limiter', 'threshold', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'limiter.threshold'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'limiter.threshold' : null)}
                  />
                </div>

                {/* Outceiling */}
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.limiter.outceiling || -0.1}
                    min={-1}
                    max={0}
                    step={0.01}
                    label="CEILING"
                    unit="dB"
                    size="small"
                    onChange={(value) => handleKnobChange('limiter', 'outceiling', value)}
                    onKnobClick={handleKnobClick}
                    isEditing={editingKnob === 'limiter.outceiling'}
                    onEditingChange={(editing) => setEditingKnob(editing ? 'limiter.outceiling' : null)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer - Gold Style */}
          <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="text-[8px] text-yellow-200">Limiter v1.0</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
                 </div>

         {/* G-Multi-Band */}
         <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
           {/* Header - Gold Style */}
           <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                 <div className="flex items-center space-x-2">
                   <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                     <Layers className="w-3 h-3 text-yellow-900" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">G-MULTI-BAND</h3>
                     <p className="text-[9px] text-yellow-200">Frequency Split</p>
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
             {/* Enable/Disable Toggle */}
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2">
                 <h4 className="text-white font-semibold text-sm">G-Multi-Band</h4>
                 {manualAdjustments.has('gMultiBand') && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                     <span className="text-yellow-400 text-xs">Modified</span>
                   </div>
                 )}
               </div>
               <label className="flex items-center">
                 <input
                   type="checkbox"
                   checked={audioEffects.gMultiBand?.enabled || false}
                   onChange={(e) => onToggleEffect('gMultiBand', e.target.checked)}
                   className="mr-2"
                 />
                 <span className="text-gray-300 text-xs">Enable</span>
               </label>
             </div>

                           {audioEffects.gMultiBand?.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Low Band */}
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand.low?.threshold || -20}
                      min={-60}
                      max={0}
                      step={0.1}
                      label="LOW THRESH"
                      unit="dB"
                      size="small"
                      onChange={(value) => handleKnobChange('gMultiBand', 'low', { 
                        ...audioEffects.gMultiBand.low, 
                        threshold: value 
                      })}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === 'gMultiBand.low.threshold'}
                      onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.low.threshold' : null)}
                    />
                  </div>
                  
                  {/* Low Ratio */}
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand.low?.ratio || 4}
                      min={1}
                      max={20}
                      step={0.1}
                      label="LOW RATIO"
                      unit=":1"
                      size="small"
                      onChange={(value) => handleKnobChange('gMultiBand', 'low', { 
                        ...audioEffects.gMultiBand.low, 
                        ratio: value 
                      })}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === 'gMultiBand.low.ratio'}
                      onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.low.ratio' : null)}
                    />
                  </div>
                  
                  {/* Mid Band */}
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand.mid?.threshold || -18}
                      min={-60}
                      max={0}
                      step={0.1}
                      label="MID THRESH"
                      unit="dB"
                      size="small"
                      onChange={(value) => handleKnobChange('gMultiBand', 'mid', { 
                        ...audioEffects.gMultiBand.mid, 
                        threshold: value 
                      })}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === 'gMultiBand.mid.threshold'}
                      onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.mid.threshold' : null)}
                    />
                  </div>
                  
                  {/* Mid Ratio */}
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand.mid?.ratio || 4}
                      min={1}
                      max={20}
                      step={0.1}
                      label="MID RATIO"
                      unit=":1"
                      size="small"
                      onChange={(value) => handleKnobChange('gMultiBand', 'mid', { 
                        ...audioEffects.gMultiBand.mid, 
                        ratio: value 
                      })}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === 'gMultiBand.mid.ratio'}
                      onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.mid.ratio' : null)}
                    />
                  </div>
                  
                  {/* High Band */}
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand.high?.threshold || -16}
                      min={-60}
                      max={0}
                      step={0.1}
                      label="HIGH THRESH"
                      unit="dB"
                      size="small"
                      onChange={(value) => handleKnobChange('gMultiBand', 'high', { 
                        ...audioEffects.gMultiBand.high, 
                        threshold: value 
                      })}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === 'gMultiBand.high.threshold'}
                      onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.high.threshold' : null)}
                    />
                  </div>
                  
                  {/* High Ratio */}
                  <div className="text-center">
                    <HardwareKnob
                      value={audioEffects.gMultiBand.high?.ratio || 4}
                      min={1}
                      max={20}
                      step={0.1}
                      label="HIGH RATIO"
                      unit=":1"
                      size="small"
                      onChange={(value) => handleKnobChange('gMultiBand', 'high', { 
                        ...audioEffects.gMultiBand.high, 
                        ratio: value 
                      })}
                      onKnobClick={handleKnobClick}
                      isEditing={editingKnob === 'gMultiBand.high.ratio'}
                      onEditingChange={(editing) => setEditingKnob(editing ? 'gMultiBand.high.ratio' : null)}
                    />
                  </div>
                </div>
              )}
           </div>

           {/* Footer - Gold Style */}
           <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
             <div className="flex justify-between items-center">
               <div className="flex space-x-1">
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
               </div>
               <div className="text-[8px] text-yellow-200">G-Multi-Band v1.0</div>
               <div className="flex space-x-1">
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
               </div>
             </div>
           </div>
         </div>

         {/* G-Digital Tape */}
         <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
           {/* Header - Gold Style */}
           <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 border-b border-yellow-600">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                 <div className="flex items-center space-x-2">
                   <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-1 rounded">
                     <Mic className="w-3 h-3 text-yellow-900" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">G-DIGITAL TAPE</h3>
                     <p className="text-[9px] text-yellow-200">Analog Warmth</p>
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
             {/* Enable/Disable Toggle */}
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2">
                 <h4 className="text-white font-semibold text-sm">G-Digital Tape</h4>
                 {manualAdjustments.has('gDigitalTape') && (
                   <div className="flex items-center space-x-1">
                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                     <span className="text-yellow-400 text-xs">Modified</span>
                   </div>
                 )}
               </div>
               <label className="flex items-center">
                 <input
                   type="checkbox"
                   checked={audioEffects.gDigitalTape?.enabled || false}
                   onChange={(e) => onToggleEffect('gDigitalTape', e.target.checked)}
                   className="mr-2"
                 />
                 <span className="text-gray-300 text-xs">Enable</span>
               </label>
             </div>

             {audioEffects.gDigitalTape?.enabled && (
               <div className="text-center">
                 <HardwareKnob
                   value={audioEffects.gDigitalTape.saturation || 0}
                   min={-50}
                   max={50}
                   step={1}
                   label="SAT"
                   unit="%"
                   size="medium"
                   onChange={(value) => handleKnobChange('gDigitalTape', 'saturation', value)}
                   onKnobClick={handleKnobClick}
                   isEditing={editingKnob === 'gDigitalTape.saturation'}
                   onEditingChange={(editing) => setEditingKnob(editing ? 'gDigitalTape.saturation' : null)}
                 />
               </div>
             )}
           </div>

           {/* Footer - Gold Style */}
           <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 p-2 border-t border-yellow-600">
             <div className="flex justify-between items-center">
               <div className="flex space-x-1">
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
               </div>
               <div className="text-[8px] text-yellow-200">G-Digital Tape v1.0</div>
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

export default BasicEffects;
