import React from 'react';

interface HardwareSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  onChange: (value: number) => void;
}

const HardwareSlider: React.FC<HardwareSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  orientation = 'vertical',
  size = 'medium',
  color = '#f59e0b',
  onChange
}) => {
  const sizeClasses = {
    small: orientation === 'vertical' ? 'h-20' : 'w-20',
    medium: orientation === 'vertical' ? 'h-32' : 'w-32',
    large: orientation === 'vertical' ? 'h-40' : 'w-40'
  };

  const sliderWidth = {
    small: 'w-2',
    medium: 'w-3',
    large: 'w-4'
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const isVertical = orientation === 'vertical';

  return (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center space-y-2 ${isVertical ? '' : 'space-y-0 space-x-2'}`}>
      {/* Slider Container */}
      <div 
        className={`relative ${isVertical ? 'h-full' : 'w-full'} flex items-center justify-center`}
        onClick={() => {
          console.log('=== SLIDER CLICKED ===');
          console.log('Slider label:', label);
          // This will help ensure audio context is resumed
        }}
      >
        {/* Slider Track */}
        <div className={`${sliderWidth[size]} ${sizeClasses[size]} bg-gradient-to-b from-gray-800 to-gray-700 rounded-full border border-gray-600 shadow-inner relative`}>
          {/* Slider Fill */}
          <div 
            className={`absolute ${isVertical ? 'bottom-0 left-0 right-0' : 'left-0 top-0 bottom-0'} rounded-full transition-all duration-150`}
            style={{
              backgroundColor: color,
              [isVertical ? 'height' : 'width']: `${percentage}%`
            }}
          />
          
          {/* Slider Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              console.log('=== SLIDER CHANGE EVENT ===');
              console.log('Slider label:', label);
              console.log('Old value:', value);
              console.log('New value:', parseFloat(e.target.value));
              onChange(parseFloat(e.target.value));
            }}
            className={`hardware-slider ${isVertical ? 'slider-vertical' : 'slider-horizontal'}`}
            style={{
              background: `linear-gradient(${isVertical ? 'to top' : 'to right'}, 
                ${color} 0%, 
                ${color} ${percentage}%, 
                #374151 ${percentage}%, 
                #374151 100%)`
            }}
          />
        </div>
        
        {/* Value Display */}
        <div className={`absolute ${isVertical ? 'left-full ml-2' : 'top-full mt-2'} bg-black rounded px-2 py-1 border border-gray-600`}>
          <div className="text-xs font-bold text-white">
            {value}{unit}
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
      </div>
    </div>
  );
};

export default HardwareSlider;
