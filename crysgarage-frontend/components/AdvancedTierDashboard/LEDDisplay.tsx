import React from 'react';

interface LEDDisplayProps {
  value: string | number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'white';
  type?: 'digital' | 'analog';
  unit?: string;
}

const LEDDisplay: React.FC<LEDDisplayProps> = ({
  value,
  label,
  size = 'medium',
  color = 'green',
  type = 'digital',
  unit = ''
}) => {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg'
  };

  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    white: 'text-white'
  };

  const displaySize = {
    small: 'px-2 py-1',
    medium: 'px-3 py-2',
    large: 'px-4 py-3'
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {label && (
        <div className="text-xs text-gray-400 font-medium">{label}</div>
      )}
      
      {/* LED Display */}
      <div className={`bg-black rounded border border-gray-600 ${displaySize[size]} shadow-inner`}>
        <div className={`font-mono font-bold ${sizeClasses[size]} ${colorClasses[color]} text-center`}>
          {type === 'digital' ? (
            <span className="tracking-wider">{value}{unit}</span>
          ) : (
            <div className="flex items-center justify-center space-x-1">
              {String(value).split('').map((char, index) => (
                <span key={index} className="w-2 h-4 bg-current rounded-sm opacity-80"></span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LEDDisplay;
