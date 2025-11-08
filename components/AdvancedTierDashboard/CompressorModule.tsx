import React from 'react';
import HardwareKnob from './HardwareKnob';
import HardwareSlider from './HardwareSlider';
import LEDDisplay from './LEDDisplay';
import HardwareButton from './HardwareButton';

interface CompressorModuleProps {
  settings: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeup?: number;
  };
  onUpdate: (settings: any) => void;
  title: string;
  isActive: boolean;
  onToggle: () => void;
}

const CompressorModule: React.FC<CompressorModuleProps> = ({
  settings,
  onUpdate,
  title,
  isActive,
  onToggle
}) => {
  const updateSetting = (field: string, value: number) => {
    onUpdate({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 shadow-inner">
      {/* Module Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h4 className="text-sm font-bold text-white">{title}</h4>
        </div>
        <HardwareButton
          label={isActive ? "ON" : "OFF"}
          active={isActive}
          color={isActive ? "green" : "red"}
          size="small"
          onClick={onToggle}
        />
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Threshold */}
        <div className="text-center">
          <HardwareKnob
            value={settings.threshold}
            min={-60}
            max={0}
            step={0.1}
            label="THRESH"
            unit="dB"
            color="#ef4444"
            size="small"
            onChange={(value) => updateSetting('threshold', value)}
          />
        </div>

        {/* Ratio */}
        <div className="text-center">
          <HardwareKnob
            value={settings.ratio}
            min={1}
            max={20}
            step={0.1}
            label="RATIO"
            color="#3b82f6"
            size="small"
            onChange={(value) => updateSetting('ratio', value)}
          />
        </div>

        {/* Attack */}
        <div className="text-center">
          <HardwareKnob
            value={settings.attack}
            min={0.001}
            max={100}
            step={0.001}
            label="ATTACK"
            unit="ms"
            color="#f59e0b"
            size="small"
            onChange={(value) => updateSetting('attack', value)}
          />
        </div>

        {/* Release */}
        <div className="text-center">
          <HardwareKnob
            value={settings.release}
            min={1}
            max={1000}
            step={1}
            label="RELEASE"
            unit="ms"
            color="#10b981"
            size="small"
            onChange={(value) => updateSetting('release', value)}
          />
        </div>
      </div>

      {/* Makeup Gain (if available) */}
      {settings.makeup !== undefined && (
        <div className="mt-4 text-center">
          <HardwareKnob
            value={settings.makeup}
            min={0}
            max={24}
            step={0.1}
            label="MAKEUP"
            unit="dB"
            color="#8b5cf6"
            size="small"
            onChange={(value) => updateSetting('makeup', value)}
          />
        </div>
      )}

      {/* Compression Meter */}
      <div className="mt-4">
        <div className="bg-black rounded p-2 border border-gray-600">
          <div className="text-center mb-1">
            <span className="text-xs text-gray-400">GR</span>
          </div>
          <div className="h-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded relative overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 bg-gray-800 transition-all duration-150"
              style={{ 
                left: `${Math.abs(settings.threshold) / 60 * 100}%`,
                width: '2px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressorModule;
