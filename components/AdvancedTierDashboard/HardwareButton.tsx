import React from 'react';

interface HardwareButtonProps {
  label: string;
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'white';
  type?: 'momentary' | 'toggle' | 'push';
  onClick: () => void;
  disabled?: boolean;
}

const HardwareButton: React.FC<HardwareButtonProps> = ({
  label,
  active = false,
  size = 'medium',
  color = 'white',
  type = 'momentary',
  onClick,
  disabled = false
}) => {
  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const colorClasses = {
    red: active ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white',
    green: active ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white',
    blue: active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white',
    white: active ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-white hover:text-gray-900'
  };

  const buttonStyle = type === 'push' ? 'rounded-full' : 'rounded-lg';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${buttonStyle}
        font-bold font-mono
        border-2 border-gray-600
        shadow-lg
        transition-all duration-150
        transform active:scale-95
        focus:outline-none focus:ring-2 focus:ring-crys-gold focus:ring-opacity-50
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${active ? 'shadow-inner' : 'shadow-lg hover:shadow-xl'}
      `}
    >
      {label}
    </button>
  );
};

export default HardwareButton;
