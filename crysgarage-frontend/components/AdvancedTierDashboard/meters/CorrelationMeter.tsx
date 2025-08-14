import React from 'react';

interface CorrelationMeterProps {
  value: number;
  target: number;
  detailed?: boolean;
}

const CorrelationMeter: React.FC<CorrelationMeterProps> = ({ 
  value, 
  target, 
  detailed = false 
}) => {
  const percentage = Math.max(0, Math.min(100, ((value + 1) / 2) * 100));
  const targetPercentage = Math.max(0, Math.min(100, ((target + 1) / 2) * 100));
  
  const getColor = (val: number) => {
    if (val < 0.3) return 'from-red-500 to-red-600';
    if (val < 0.7) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-sm font-medium text-gray-300">Stereo Correlation</span>
        <div className="text-xs text-gray-500">Target: {target.toFixed(2)}</div>
      </div>
      
      <div className="bg-gray-800 rounded-lg h-24 relative overflow-hidden">
        <div 
          className={`bg-gradient-to-t ${getColor(value)} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
          style={{ height: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-lg font-bold text-white drop-shadow-lg">
            {value.toFixed(2)}
          </span>
        </div>
        
        {/* Target line */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-white border-dashed opacity-60"
          style={{ bottom: `${targetPercentage}%` }}
        />
        
        {/* Peak hold indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white opacity-80"
          style={{ left: `${percentage}%` }}
        />
      </div>

      {detailed && (
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
          <div className="text-center">
            <div className="text-red-400">-1.0</div>
            <div>Out of Phase</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400">0.0</div>
            <div>Center</div>
          </div>
          <div className="text-center">
            <div className="text-green-400">+1.0</div>
            <div>In Phase</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrelationMeter;
