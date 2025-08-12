import React from 'react';

interface HardwareKnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onChange: (value: number) => void;
}

const HardwareKnob: React.FC<HardwareKnobProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  color = '#f59e0b',
  size = 'medium',
  onChange
}) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const innerSizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 270 - 135; // -135 to 135 degrees

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Knob Container */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center shadow-inner relative`}>
        {/* Knob Inner */}
        <div className={`${innerSizeClasses[size]} bg-gradient-to-br from-gray-600 to-gray-700 rounded-full border border-gray-500 relative`}>
          {/* Hidden Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="knob-input"
          />
          
          {/* Knob Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-1 h-3 rounded-full transform origin-bottom transition-transform duration-150"
              style={{ 
                backgroundColor: color,
                transform: `rotate(${rotation}deg)`
              }}
            />
          </div>
          
          {/* Knob Center Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        
        {/* Knob Notches */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-1 bg-gray-500 rounded-full transform origin-center"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-${size === 'large' ? '7' : size === 'medium' ? '5' : '4'}px)`
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        <div className="text-xs font-bold text-white">
          {value}{unit}
        </div>
      </div>
    </div>
  );
};

export default HardwareKnob;
