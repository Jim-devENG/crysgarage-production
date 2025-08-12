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
  const [activeRack, setActiveRack] = useState<'main' | 'effects' | 'monitoring'>('main');

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

          {/* G-Precision EQ */}
          {audioEffects.gPrecisionEQ && (
            <StudioRack title="G-PRECISION EQ" subtitle="8-Band Parametric">
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
            </StudioRack>
          )}

          {/* G-Mastering Compressor */}
          {audioEffects.gMasteringCompressor && (
            <StudioRack title="G-MASTERING COMP" subtitle="Professional Compression">
              <CompressorModule
                settings={audioEffects.gMasteringCompressor}
                onUpdate={(settings) => onUpdateEffectSettings('gMasteringCompressor', settings)}
                title="G-COMP"
                isActive={true}
                onToggle={() => {}}
              />
            </StudioRack>
          )}
        </div>
      )}

      {/* Monitoring Rack */}
      {activeRack === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Meters */}
          <StudioRack title="REAL-TIME METERS" subtitle="Live Analysis">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <LEDDisplay
                  value={meterData.lufs.toFixed(1)}
                  label="LUFS"
                  unit="dB"
                  color="green"
                  size="large"
                />
              </div>
              <div className="text-center">
                <LEDDisplay
                  value={meterData.peak.toFixed(1)}
                  label="PEAK"
                  unit="dB"
                  color="red"
                  size="large"
                />
              </div>
              <div className="text-center">
                <LEDDisplay
                  value={meterData.rms.toFixed(1)}
                  label="RMS"
                  unit="dB"
                  color="blue"
                  size="large"
                />
              </div>
              <div className="text-center">
                <LEDDisplay
                  value={meterData.correlation.toFixed(2)}
                  label="CORR"
                  color="yellow"
                  size="large"
                />
              </div>
            </div>
          </StudioRack>

          {/* Stereo Field */}
          <StudioRack title="STEREO FIELD" subtitle="Phase Analysis">
            <div className="text-center">
              <div className="w-32 h-32 bg-black rounded-full border-2 border-gray-600 mx-auto relative">
                {/* Simplified goniometer display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xs text-gray-400">STEREO</div>
                </div>
              </div>
              <div className="mt-2">
                <LEDDisplay
                  value={meterData.correlation.toFixed(2)}
                  label="CORRELATION"
                  color="blue"
                  size="medium"
                />
              </div>
            </div>
          </StudioRack>
        </div>
      )}
    </div>
  );
};

export default StudioDashboard;
