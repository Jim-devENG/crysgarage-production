import React, { useState } from 'react';
import StudioRack from './StudioRack';
import EQBand from './EQBand';
import CompressorModule from './CompressorModule';
import HardwareButton from './HardwareButton';
import LEDDisplay from './LEDDisplay';
import HardwareKnob from './HardwareKnob';
import HardwareSlider from './HardwareSlider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Settings,
  Power,
  Zap,
  Filter,
  Maximize2,
  Target,
  Gauge,
  Music,
  Radio
} from 'lucide-react';

interface StudioDashboardProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onTogglePremiumEffect: (effectType: string, enabled: boolean) => void;
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
  meterData: any;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  currentTime: number;
  duration: number;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
}

const StudioDashboard: React.FC<StudioDashboardProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onTogglePremiumEffect,
  selectedGenre,
  onGenreSelect,
  meterData,
  isPlaying,
  onPlay,
  onPause,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  onSeek
}) => {
  const [activeRack, setActiveRack] = useState<'main' | 'effects' | 'monitoring' | 'genres'>('main');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Studio Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-3 rounded-lg">
                <Music className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CRYS GARAGE STUDIO</h1>
                <p className="text-gray-400">Professional Audio Mastering Suite</p>
              </div>
            </div>
            
            {/* Power Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-mono text-sm">POWER ON</span>
              </div>
              <HardwareButton
                label="STANDBY"
                color="yellow"
                size="small"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rack Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 bg-gray-800 rounded-lg p-2 border border-gray-600">
          <HardwareButton
            label="MAIN"
            active={activeRack === 'main'}
            color="blue"
            size="small"
            onClick={() => setActiveRack('main')}
          />
          <HardwareButton
            label="EFFECTS"
            active={activeRack === 'effects'}
            color="green"
            size="small"
            onClick={() => setActiveRack('effects')}
          />
                     <HardwareButton
             label="MONITOR"
             active={activeRack === 'monitoring'}
             color="red"
             size="small"
             onClick={() => setActiveRack('monitoring')}
           />
           <HardwareButton
             label="GENRES"
             active={activeRack === 'genres'}
             color="blue"
             size="small"
             onClick={() => setActiveRack('genres')}
           />
        </div>
      </div>

      {/* Main Rack */}
      {activeRack === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transport Controls */}
          <StudioRack title="TRANSPORT" subtitle="Playback Control">
            <div className="space-y-4">
              {/* Transport Buttons */}
              <div className="flex justify-center space-x-2">
                <HardwareButton
                  label="⏮"
                  color="white"
                  size="medium"
                  onClick={() => onSeek(Math.max(0, currentTime - 10))}
                />
                <HardwareButton
                  label={isPlaying ? "⏸" : "▶"}
                  color={isPlaying ? "yellow" : "green"}
                  size="large"
                  onClick={isPlaying ? onPause : onPlay}
                />
                <HardwareButton
                  label="⏭"
                  color="white"
                  size="medium"
                  onClick={() => onSeek(Math.min(duration, currentTime + 10))}
                />
              </div>

              {/* Time Display */}
              <div className="grid grid-cols-2 gap-4">
                <LEDDisplay
                  value={Math.floor(currentTime / 60)} 
                  label="MIN" 
                  color="blue"
                />
                <LEDDisplay
                  value={Math.floor(currentTime % 60)} 
                  label="SEC" 
                  color="blue"
                />
              </div>

              {/* Volume Control */}
              <div className="text-center">
                <HardwareKnob
                  value={volume}
                  min={0}
                  max={1}
                  step={0.01}
                  label="VOLUME"
                  color="#f59e0b"
                  size="large"
                  onChange={onVolumeChange}
                />
              </div>
            </div>
          </StudioRack>

          {/* Master Controls */}
          <StudioRack title="MASTER" subtitle="Output Control">
            <div className="space-y-4">
              {/* Master Fader */}
              <div className="text-center">
                <HardwareSlider
                  value={audioEffects.loudness.volume}
                  min={0}
                  max={2}
                  step={0.01}
                  label="MASTER"
                  unit="dB"
                  orientation="vertical"
                  size="large"
                  color="#f59e0b"
                  onChange={(value) => onUpdateEffectSettings('loudness', { volume: value })}
                />
              </div>

              {/* Stereo Width */}
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.stereoWidener.width}
                  min={0}
                  max={100}
                  step={1}
                  label="WIDTH"
                  unit="%"
                  color="#8b5cf6"
                  size="medium"
                  onChange={(value) => onUpdateEffectSettings('stereoWidener', { width: value })}
                />
              </div>
            </div>
          </StudioRack>

          {/* Monitoring */}
          <StudioRack title="MONITORING" subtitle="Level Meters">
            <div className="space-y-4">
              {/* LUFS Meter */}
              <div className="text-center">
                <LEDDisplay
                  value={meterData.lufs.toFixed(1)}
                  label="LUFS"
                  unit="dB"
                  color="green"
                  size="medium"
                />
              </div>

              {/* Peak Meter */}
              <div className="text-center">
                <LEDDisplay
                  value={meterData.peak.toFixed(1)}
                  label="PEAK"
                  unit="dB"
                  color="red"
                  size="medium"
                />
              </div>

              {/* Correlation */}
              <div className="text-center">
                <LEDDisplay
                  value={meterData.correlation.toFixed(2)}
                  label="CORR"
                  color="blue"
                  size="medium"
                />
              </div>
            </div>
          </StudioRack>
        </div>
      )}

      {/* Effects Rack */}
      {activeRack === 'effects' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Paid and Free Audio Effects</h2>
            <p className="text-gray-400">Professional studio-grade processing tools</p>
          </div>

          {/* Free Effects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 3-Band EQ */}
            <StudioRack title="3-BAND EQ" subtitle="Basic Equalization">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.low}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="LOW"
                    unit="dB"
                    color="#3b82f6"
                    size="medium"
                    onChange={(value) => onUpdateEffectSettings('eq', { ...audioEffects.eq, low: value })}
                  />
                </div>
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.mid}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="MID"
                    unit="dB"
                    color="#f59e0b"
                    size="medium"
                    onChange={(value) => onUpdateEffectSettings('eq', { ...audioEffects.eq, mid: value })}
                  />
                </div>
                <div className="text-center">
                  <HardwareKnob
                    value={audioEffects.eq.high}
                    min={-12}
                    max={12}
                    step={0.1}
                    label="HIGH"
                    unit="dB"
                    color="#ef4444"
                    size="medium"
                    onChange={(value) => onUpdateEffectSettings('eq', { ...audioEffects.eq, high: value })}
                  />
                </div>
              </div>
            </StudioRack>

            {/* Compressor */}
            <StudioRack title="COMPRESSOR" subtitle="Dynamic Control">
              <CompressorModule
                settings={audioEffects.compressor}
                onUpdate={(settings) => onUpdateEffectSettings('compressor', settings)}
                title="COMP"
                isActive={audioEffects.compressor.threshold < 0}
                onToggle={() => onUpdateEffectSettings('compressor', { 
                  ...audioEffects.compressor, 
                  threshold: audioEffects.compressor.threshold < 0 ? 0 : -20 
                })}
              />
            </StudioRack>

            {/* Stereo Widener */}
            <StudioRack title="STEREO WIDENER" subtitle="Image Enhancement">
              <div className="text-center">
                <HardwareKnob
                  value={audioEffects.stereoWidener.width}
                  min={0}
                  max={100}
                  step={1}
                  label="WIDTH"
                  unit="%"
                  color="#8b5cf6"
                  size="large"
                  onChange={(value) => onUpdateEffectSettings('stereoWidener', { width: value })}
                />
              </div>
            </StudioRack>

            {/* Loudness */}
            <StudioRack title="LOUDNESS" subtitle="Volume Control">
              <div className="text-center">
                <HardwareSlider
                  value={audioEffects.loudness.volume}
                  min={0}
                  max={2}
                  step={0.01}
                  label="VOLUME"
                  unit="dB"
                  orientation="vertical"
                  size="large"
                  color="#f59e0b"
                  onChange={(value) => onUpdateEffectSettings('loudness', { volume: value })}
                />
              </div>
            </StudioRack>

            {/* Limiter */}
            <StudioRack title="LIMITER" subtitle="Peak Control">
              <CompressorModule
                settings={audioEffects.limiter}
                onUpdate={(settings) => onUpdateEffectSettings('limiter', settings)}
                title="LIMIT"
                isActive={audioEffects.limiter.threshold < 0}
                onToggle={() => onUpdateEffectSettings('limiter', { 
                  ...audioEffects.limiter, 
                  threshold: audioEffects.limiter.threshold < 0 ? 0 : -1 
                })}
              />
            </StudioRack>
          </div>

          {/* Premium Effects - $5 Each */}
          <div className="mt-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-crys-gold mb-2">Premium Effects - $5 Each</h3>
              <p className="text-gray-400">Professional-grade mastering tools</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* G-Mastering Compressor */}
              <StudioRack title="G-MASTERING COMP" subtitle="Professional Compression">
                <CompressorModule
                  settings={audioEffects.gMasteringCompressor || { threshold: -18, ratio: 3, attack: 5, release: 150, makeup: 0 }}
                  onUpdate={(settings) => onUpdateEffectSettings('gMasteringCompressor', settings)}
                  title="G-COMP"
                  isActive={!!audioEffects.gMasteringCompressor}
                  onToggle={() => onTogglePremiumEffect('gMasteringCompressor', !audioEffects.gMasteringCompressor)}
                />
              </StudioRack>

              {/* G-Precision EQ */}
              <StudioRack title="G-PRECISION EQ" subtitle="8-Band Parametric">
                {audioEffects.gPrecisionEQ ? (
                  <div className="grid grid-cols-4 gap-2">
                    {audioEffects.gPrecisionEQ.bands.map((band: any, index: number) => (
                      <EQBand
                        key={index}
                        band={band}
                        index={index}
                        onUpdate={(updatedBand) => {
                          const newBands = [...audioEffects.gPrecisionEQ.bands];
                          newBands[index] = updatedBand;
                          onUpdateEffectSettings('gPrecisionEQ', { bands: newBands });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HardwareButton
                      label="ENABLE $5"
                      color="green"
                      size="medium"
                      onClick={() => onTogglePremiumEffect('gPrecisionEQ', true)}
                    />
                  </div>
                )}
              </StudioRack>

              {/* G-Digital Tape Machine */}
              <StudioRack title="G-DIGITAL TAPE" subtitle="Analog Warmth">
                {audioEffects.gDigitalTape ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <HardwareKnob
                        value={audioEffects.gDigitalTape.saturation}
                        min={0}
                        max={100}
                        step={1}
                        label="SATURATION"
                        unit="%"
                        color="#f59e0b"
                        size="medium"
                        onChange={(value) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, saturation: value })}
                      />
                    </div>
                    <div className="text-center">
                      <HardwareKnob
                        value={audioEffects.gDigitalTape.warmth}
                        min={0}
                        max={100}
                        step={1}
                        label="WARMTH"
                        unit="%"
                        color="#ef4444"
                        size="medium"
                        onChange={(value) => onUpdateEffectSettings('gDigitalTape', { ...audioEffects.gDigitalTape, warmth: value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HardwareButton
                      label="ENABLE $5"
                      color="green"
                      size="medium"
                      onClick={() => onTogglePremiumEffect('gDigitalTape', true)}
                    />
                  </div>
                )}
              </StudioRack>

              {/* G-Limiter */}
              <StudioRack title="G-LIMITER" subtitle="Professional Limiting">
                {audioEffects.gLimiter ? (
                  <CompressorModule
                    settings={audioEffects.gLimiter}
                    onUpdate={(settings) => onUpdateEffectSettings('gLimiter', settings)}
                    title="G-LIMIT"
                    isActive={true}
                    onToggle={() => {}}
                  />
                ) : (
                  <div className="text-center py-8">
                    <HardwareButton
                      label="ENABLE $5"
                      color="green"
                      size="medium"
                      onClick={() => onTogglePremiumEffect('gLimiter', true)}
                    />
                  </div>
                )}
              </StudioRack>

              {/* G-Multi-Band */}
              <StudioRack title="G-MULTI-BAND" subtitle="Multi-Band Processing">
                {audioEffects.gMultiBand ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <HardwareKnob
                        value={audioEffects.gMultiBand.low.threshold}
                        min={-60}
                        max={0}
                        step={0.1}
                        label="LOW THRESH"
                        unit="dB"
                        color="#3b82f6"
                        size="small"
                        onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                          ...audioEffects.gMultiBand, 
                          low: { ...audioEffects.gMultiBand.low, threshold: value } 
                        })}
                      />
                    </div>
                    <div className="text-center">
                      <HardwareKnob
                        value={audioEffects.gMultiBand.mid.threshold}
                        min={-60}
                        max={0}
                        step={0.1}
                        label="MID THRESH"
                        unit="dB"
                        color="#f59e0b"
                        size="small"
                        onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                          ...audioEffects.gMultiBand, 
                          mid: { ...audioEffects.gMultiBand.mid, threshold: value } 
                        })}
                      />
                    </div>
                    <div className="text-center">
                      <HardwareKnob
                        value={audioEffects.gMultiBand.high.threshold}
                        min={-60}
                        max={0}
                        step={0.1}
                        label="HIGH THRESH"
                        unit="dB"
                        color="#ef4444"
                        size="small"
                        onChange={(value) => onUpdateEffectSettings('gMultiBand', { 
                          ...audioEffects.gMultiBand, 
                          high: { ...audioEffects.gMultiBand.high, threshold: value } 
                        })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HardwareButton
                      label="ENABLE $5"
                      color="green"
                      size="medium"
                      onClick={() => onTogglePremiumEffect('gMultiBand', true)}
                    />
                  </div>
                )}
              </StudioRack>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Rack */}
      {activeRack === 'monitoring' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Real-Time Meter Analysis</h2>
            <p className="text-gray-400">Live monitoring and analysis tools</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* LUFS Meter */}
            <StudioRack title="LUFS METER" subtitle="Loudness Units">
              <div className="text-center">
                <LEDDisplay
                  value={meterData.lufs.toFixed(1)}
                  label="LUFS"
                  unit="dB"
                  color="green"
                  size="large"
                />
                <div className="mt-4">
                  <div className="h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 bg-gray-800 transition-all duration-150"
                      style={{ 
                        left: `${Math.max(0, Math.min(100, (meterData.lufs + 60) / 60 * 100))}%`,
                        width: '2px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </StudioRack>

            {/* Peak Meter */}
            <StudioRack title="PEAK METER" subtitle="Peak Level">
              <div className="text-center">
                <LEDDisplay
                  value={meterData.peak.toFixed(1)}
                  label="PEAK"
                  unit="dB"
                  color="red"
                  size="large"
                />
                <div className="mt-4">
                  <div className="h-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 bg-gray-800 transition-all duration-150"
                      style={{ 
                        left: `${Math.max(0, Math.min(100, (meterData.peak + 60) / 60 * 100))}%`,
                        width: '2px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </StudioRack>

            {/* RMS Meter */}
            <StudioRack title="RMS METER" subtitle="Root Mean Square">
              <div className="text-center">
                <LEDDisplay
                  value={meterData.rms.toFixed(1)}
                  label="RMS"
                  unit="dB"
                  color="blue"
                  size="large"
                />
                <div className="mt-4">
                  <div className="h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 bg-gray-800 transition-all duration-150"
                      style={{ 
                        left: `${Math.max(0, Math.min(100, (meterData.rms + 60) / 60 * 100))}%`,
                        width: '2px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </StudioRack>

            {/* Correlation Meter */}
            <StudioRack title="CORRELATION" subtitle="Phase Correlation">
              <div className="text-center">
                <LEDDisplay
                  value={meterData.correlation.toFixed(2)}
                  label="CORR"
                  color="yellow"
                  size="large"
                />
                <div className="mt-4">
                  <div className="h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 bg-gray-800 transition-all duration-150"
                      style={{ 
                        left: `${Math.max(0, Math.min(100, (meterData.correlation + 1) / 2 * 100))}%`,
                        width: '2px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </StudioRack>

            {/* Left Channel Meter */}
            <StudioRack title="LEFT CHANNEL" subtitle="Left RMS & Peak">
              <div className="space-y-4">
                <div className="text-center">
                  <LEDDisplay
                    value={meterData.leftLevel.toFixed(1)}
                    label="LEFT RMS"
                    unit="dB"
                    color="blue"
                    size="medium"
                  />
                </div>
                <div className="text-center">
                  <HardwareSlider
                    value={Math.abs(meterData.leftLevel)}
                    min={0}
                    max={60}
                    step={0.1}
                    label="LEFT"
                    unit="dB"
                    orientation="vertical"
                    size="medium"
                    color="#3b82f6"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </StudioRack>

            {/* Right Channel Meter */}
            <StudioRack title="RIGHT CHANNEL" subtitle="Right RMS & Peak">
              <div className="space-y-4">
                <div className="text-center">
                  <LEDDisplay
                    value={meterData.rightLevel.toFixed(1)}
                    label="RIGHT RMS"
                    unit="dB"
                    color="blue"
                    size="medium"
                  />
                </div>
                <div className="text-center">
                  <HardwareSlider
                    value={Math.abs(meterData.rightLevel)}
                    min={0}
                    max={60}
                    step={0.1}
                    label="RIGHT"
                    unit="dB"
                    orientation="vertical"
                    size="medium"
                    color="#ef4444"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </StudioRack>
          </div>

          {/* Frequency Meter */}
          <StudioRack title="FREQUENCY METER" subtitle="Real-Time Spectrum">
            <div className="h-32 bg-black rounded border border-gray-600 relative overflow-hidden">
              <canvas 
                id="frequencyCanvas"
                className="w-full h-full"
                style={{ background: 'linear-gradient(to top, #1f2937, #111827)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                <span>20Hz</span>
                <span>200Hz</span>
                <span>2kHz</span>
                <span>20kHz</span>
              </div>
            </div>
          </StudioRack>

          {/* Goniometer */}
          <StudioRack title="GONIOMETER" subtitle="Stereo Field Analysis">
            <div className="text-center">
              <div className="w-48 h-48 bg-black rounded-full border-2 border-gray-600 mx-auto relative">
                {/* Goniometer grid */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Grid lines */}
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#374151" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#374151" strokeWidth="0.5" />
                  
                  {/* Circles */}
                  <circle cx="50" cy="50" r="25" fill="none" stroke="#374151" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="0.5" />
                  
                  {/* Labels */}
                  <text x="50" y="5" textAnchor="middle" fill="#6b7280" fontSize="3">L</text>
                  <text x="95" y="50" textAnchor="middle" fill="#6b7280" fontSize="3">R</text>
                  <text x="50" y="95" textAnchor="middle" fill="#6b7280" fontSize="3">C</text>
                  <text x="5" y="50" textAnchor="middle" fill="#6b7280" fontSize="3">S</text>
                  
                  {/* Real-time correlation line */}
                  <line 
                    x1="50" 
                    y1="50" 
                    x2={50 + (meterData.correlation * 40)} 
                    y2={50 - (meterData.correlation * 40)} 
                    stroke="#f59e0b" 
                    strokeWidth="1" 
                  />
                </svg>
              </div>
              <div className="mt-4">
                <LEDDisplay
                  value={meterData.correlation.toFixed(2)}
                  label="STEREO CORRELATION"
                  color="yellow"
                  size="medium"
                />
              </div>
            </div>
                     </StudioRack>
         </div>
       )}

       {/* Genres Rack */}
       {activeRack === 'genres' && (
         <div className="space-y-6">
           {/* Section Header */}
           <div className="text-center mb-6">
             <h2 className="text-2xl font-bold text-white mb-2">Genre Presets & Advanced Features</h2>
             <p className="text-gray-400">Professional genre-specific mastering presets</p>
           </div>

           {/* Genre Selection */}
           <StudioRack title="GENRE PRESETS" subtitle="Select Your Genre">
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {[
                 { id: 'hip-hop', name: 'Hip-Hop', color: '#ef4444' },
                 { id: 'pop', name: 'Pop', color: '#3b82f6' },
                 { id: 'rock', name: 'Rock', color: '#f59e0b' },
                 { id: 'electronic', name: 'Electronic', color: '#8b5cf6' },
                 { id: 'jazz', name: 'Jazz', color: '#10b981' },
                 { id: 'classical', name: 'Classical', color: '#6366f1' },
                 { id: 'country', name: 'Country', color: '#f97316' },
                 { id: 'r&b', name: 'R&B', color: '#ec4899' },
                 { id: 'trap', name: 'Trap', color: '#06b6d4' },
                 { id: 'drill', name: 'Drill', color: '#84cc16' },
                 { id: 'lo-fi', name: 'Lo-Fi Hip-Hop', color: '#a855f7' },
                 { id: 'house', name: 'House', color: '#f43f5e' },
                 { id: 'techno', name: 'Techno', color: '#0ea5e9' },
                 { id: 'instrumentals', name: 'Instrumentals', color: '#22c55e' },
                 { id: 'beats', name: 'Beats', color: '#eab308' },
                 { id: 'trance', name: 'Trance', color: '#8b5cf6' },
                 { id: 'drum-bass', name: 'Drum & Bass', color: '#06b6d4' },
                 { id: 'voice-over', name: 'Voice Over', color: '#f97316' },
                 { id: 'journalist', name: 'Journalist', color: '#64748b' },
                 { id: 'content-creator', name: 'Content Creator', color: '#a855f7' }
               ].map((genre) => (
                 <div
                   key={genre.id}
                   className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                     selectedGenre === genre.id
                       ? 'border-crys-gold bg-gradient-to-r from-crys-gold/20 to-yellow-500/20'
                       : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                   }`}
                   onClick={() => onGenreSelect(genre.id)}
                 >
                   <div className="text-center">
                     <div 
                       className="w-8 h-8 rounded-full mx-auto mb-2"
                       style={{ backgroundColor: genre.color }}
                     />
                     <div className="text-sm font-semibold text-white">{genre.name}</div>
                   </div>
                 </div>
               ))}
             </div>
           </StudioRack>

           {/* Advanced Features */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* G-Surround */}
             <StudioRack title="G-SURROUND" subtitle="Surround Sound Processing">
               <div className="text-center space-y-4">
                 <div className="text-lg font-semibold text-crys-gold mb-4">Surround Sound Enhancement</div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="text-center">
                     <HardwareKnob
                       value={audioEffects.gSurround?.width || 0}
                       min={0}
                       max={100}
                       step={1}
                       label="WIDTH"
                       unit="%"
                       color="#8b5cf6"
                       size="medium"
                       onChange={(value) => onUpdateEffectSettings('gSurround', { width: value })}
                     />
                   </div>
                   <div className="text-center">
                     <HardwareKnob
                       value={audioEffects.gSurround?.depth || 0}
                       min={0}
                       max={100}
                       step={1}
                       label="DEPTH"
                       unit="%"
                       color="#f59e0b"
                       size="medium"
                       onChange={(value) => onUpdateEffectSettings('gSurround', { depth: value })}
                     />
                   </div>
                 </div>
                 <HardwareButton
                   label={audioEffects.gSurround ? "DISABLE" : "ENABLE"}
                   color={audioEffects.gSurround ? "red" : "green"}
                   size="medium"
                   onClick={() => onTogglePremiumEffect('gSurround', !audioEffects.gSurround)}
                 />
               </div>
             </StudioRack>

             {/* G-Tuner */}
             <StudioRack title="G-TUNER" subtitle="444Hz Reference Tone">
               <div className="text-center space-y-4">
                 <div className="text-lg font-semibold text-crys-gold mb-4">444Hz Reference</div>
                 <LEDDisplay
                   value="444"
                   label="Hz"
                   unit=""
                   color="green"
                   size="large"
                 />
                 <div className="mt-4">
                   <HardwareButton
                     label={audioEffects.gTuner ? "DISABLE" : "ENABLE"}
                     color={audioEffects.gTuner ? "red" : "green"}
                     size="medium"
                     onClick={() => onTogglePremiumEffect('gTuner', !audioEffects.gTuner)}
                   />
                 </div>
                 <div className="text-xs text-gray-400 mt-2">
                   Each toggle costs $1
                 </div>
               </div>
             </StudioRack>

             {/* Solfagio Frequency Tuning */}
             <StudioRack title="SOLFAGIO" subtitle="Frequency Tuning">
               <div className="text-center space-y-4">
                 <div className="text-lg font-semibold text-crys-gold mb-4">Solfagio Frequencies</div>
                 <div className="grid grid-cols-2 gap-4">
                   {[
                     { note: 'C', freq: 528, color: '#3b82f6' },
                     { note: 'D', freq: 639, color: '#f59e0b' },
                     { note: 'E', freq: 741, color: '#ef4444' },
                     { note: 'F', freq: 852, color: '#10b981' },
                     { note: 'G', freq: 963, color: '#8b5cf6' },
                     { note: 'A', freq: 111, color: '#f97316' }
                   ].map((tone) => (
                     <div key={tone.note} className="text-center">
                       <div className="text-sm font-semibold text-white mb-1">{tone.note}</div>
                       <div className="text-xs text-gray-400">{tone.freq}Hz</div>
                     </div>
                   ))}
                 </div>
                 <HardwareButton
                   label={audioEffects.solfagio ? "DISABLE" : "ENABLE"}
                   color={audioEffects.solfagio ? "red" : "green"}
                   size="medium"
                   onClick={() => onTogglePremiumEffect('solfagio', !audioEffects.solfagio)}
                 />
               </div>
             </StudioRack>
           </div>
         </div>
       )}
     </div>
   );
 };

export default StudioDashboard;
