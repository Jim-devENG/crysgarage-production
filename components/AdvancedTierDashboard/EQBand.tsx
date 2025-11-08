import React from 'react';
import HardwareKnob from './HardwareKnob';
import HardwareSlider from './HardwareSlider';
import LEDDisplay from './LEDDisplay';

interface EQBandProps {
  band: {
    frequency: number;
    gain: number;
    q: number;
    type: 'peaking' | 'lowshelf' | 'highshelf';
  };
  index: number;
  onUpdate: (band: any) => void;
}

const EQBand: React.FC<EQBandProps> = ({ band, index, onUpdate }) => {
  const updateBand = (field: string, value: any) => {
    onUpdate({
      ...band,
      [field]: value
    });
  };

  const getFrequencyLabel = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)}k`;
    }
    return freq.toString();
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 shadow-inner">
      {/* Band Header */}
      <div className="text-center mb-4">
        <div className="text-xs text-gray-400 font-medium">BAND {index + 1}</div>
        <LEDDisplay 
          value={getFrequencyLabel(band.frequency)} 
          label="FREQ" 
          color="green" 
          size="small"
        />
      </div>

      {/* Gain Slider */}
      <div className="mb-4">
        <HardwareSlider
          value={band.gain}
          min={-12}
          max={12}
          step={0.1}
          label="GAIN"
          unit="dB"
          orientation="vertical"
          size="medium"
          color={band.gain > 0 ? '#10b981' : '#ef4444'}
          onChange={(value) => updateBand('gain', value)}
        />
      </div>

      {/* Frequency Knob */}
      <div className="mb-4">
        <HardwareKnob
          value={band.frequency}
          min={20}
          max={20000}
          step={1}
          label="FREQ"
          unit="Hz"
          color="#3b82f6"
          size="medium"
          onChange={(value) => updateBand('frequency', value)}
        />
      </div>

      {/* Q Knob */}
      <div className="mb-4">
        <HardwareKnob
          value={band.q}
          min={0.1}
          max={10}
          step={0.1}
          label="Q"
          color="#f59e0b"
          size="small"
          onChange={(value) => updateBand('q', value)}
        />
      </div>

      {/* Filter Type Selector */}
      <div className="text-center">
        <select
          value={band.type}
          onChange={(e) => updateBand('type', e.target.value)}
          className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:border-crys-gold focus:outline-none font-mono"
        >
          <option value="peaking">PEAK</option>
          <option value="lowshelf">LOW</option>
          <option value="highshelf">HIGH</option>
        </select>
      </div>
    </div>
  );
};

export default EQBand;
