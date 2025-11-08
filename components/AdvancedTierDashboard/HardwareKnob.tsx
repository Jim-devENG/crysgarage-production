import React, { useState, useRef, useEffect } from 'react';

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
  onKnobClick?: () => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
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
  onChange,
  onKnobClick,
  isEditing = false,
  onEditingChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const knobRef = useRef<HTMLDivElement>(null);

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

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(Number(value.toFixed(1)).toString());
  }, [value]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onKnobClick?.();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !knobRef.current) return;

    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    
    // Convert angle to value (135° = max, -135° = min)
    let normalizedAngle = angle;
    if (normalizedAngle > 180) {
      normalizedAngle = normalizedAngle - 360;
    }
    
    const normalizedValue = (normalizedAngle + 135) / 270; // 0 to 1
    const newValue = min + (max - min) * Math.max(0, Math.min(1, normalizedValue));
    
    // Apply step and round to prevent floating point errors
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    const roundedValue = Number(clampedValue.toFixed(1));
    
    onChange(roundedValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value, min, max, step]);

  const handleEditSubmit = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      const steppedValue = Math.round(numValue / step) * step;
      const roundedValue = Number(steppedValue.toFixed(1));
      onChange(roundedValue);
    } else {
      setEditValue(Number(value.toFixed(1)).toString());
    }
    onEditingChange?.(false);
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(Number(value.toFixed(1)).toString());
      onEditingChange?.(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Knob Container */}
      <div 
        ref={knobRef}
        className={`${sizeClasses[size]} bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center shadow-inner relative cursor-pointer transition-all ${
          isDragging ? 'scale-105 shadow-lg' : 'hover:scale-105'
        }`}
        onMouseDown={handleMouseDown}
        onClick={() => {
          console.log('=== KNOB CLICKED ===');
          console.log('Knob label:', label);
          onKnobClick?.();
        }}
      >
        {/* Knob Inner */}
        <div className={`${innerSizeClasses[size]} bg-gradient-to-br from-gray-600 to-gray-700 rounded-full border border-gray-500 relative`}>
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
      
      {/* Label and Value */}
      <div className="text-center">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        {isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={handleEditKeyPress}
            onBlur={handleEditSubmit}
            className="w-16 text-xs font-bold text-white bg-gray-800 border border-crys-gold rounded px-1 text-center"
            autoFocus
          />
        ) : (
          <div 
            className="text-xs font-bold text-white cursor-pointer hover:text-crys-gold transition-colors"
            onDoubleClick={() => onEditingChange?.(true)}
          >
            {Number(value.toFixed(1))}{unit}
          </div>
        )}
      </div>
    </div>
  );
};

export default HardwareKnob;
