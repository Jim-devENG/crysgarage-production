import React from 'react';

interface LUFSMeterProps {
  value: number;
  target: number;
  label: string;
  detailed?: boolean;
}

const LUFSMeter: React.FC<LUFSMeterProps> = ({ 
  value, 
  target, 
  label, 
  detailed = false 
}) => {
  const percentage = Math.max(0, Math.min(100, ((value + 30) / 20) * 100));
  const targetPercentage = Math.max(0, Math.min(100, ((target + 30) / 20) * 100));
  
  const getColor = (val: number) => {
    if (val > -10) return 'from-red-500 to-red-600';
    if (val > -16) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="text-xs text-gray-500">Target: {target} LUFS</div>
      </div>
      
      <div className="bg-gray-800 rounded-lg h-32 relative overflow-hidden">
        <div 
          className={`bg-gradient-to-t ${getColor(value)} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
          style={{ height: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-lg font-bold text-white drop-shadow-lg">
            {Math.round(value)} LUFS
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
            <div className="text-green-400">-30 LUFS</div>
            <div>Quiet</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400">-16 LUFS</div>
            <div>Target</div>
          </div>
          <div className="text-center">
            <div className="text-red-400">-10 LUFS</div>
            <div>Loud</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LUFSMeter;
