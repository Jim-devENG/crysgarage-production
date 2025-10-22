import React from 'react';
import { Button } from './ui/button';

interface EffectButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

export const EffectButton: React.FC<EffectButtonProps> = ({
  label,
  isActive,
  onClick,
  color
}) => {
  const getColorClasses = () => {
    const colorMap: { [key: string]: { active: string; inactive: string } } = {
      'purple': {
        active: 'bg-purple-500 text-white border-purple-500 shadow-purple-500/25',
        inactive: 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50'
      },
      'blue': {
        active: 'bg-blue-500 text-white border-blue-500 shadow-blue-500/25',
        inactive: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50'
      },
      'green': {
        active: 'bg-green-500 text-white border-green-500 shadow-green-500/25',
        inactive: 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50'
      },
      'orange': {
        active: 'bg-orange-500 text-white border-orange-500 shadow-orange-500/25',
        inactive: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50'
      },
      'pink': {
        active: 'bg-pink-500 text-white border-pink-500 shadow-pink-500/25',
        inactive: 'border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/50'
      }
    };
    
    return colorMap[color] || colorMap['purple'];
  };

  const colors = getColorClasses();
  const classes = isActive ? colors.active : colors.inactive;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`w-full py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
        isActive ? 'shadow-lg' : ''
      } ${classes}`}
    >
      {label}
    </Button>
  );
};
