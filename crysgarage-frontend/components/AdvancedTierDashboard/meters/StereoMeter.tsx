import React from 'react';
import { Volume2 } from 'lucide-react';

interface StereoMeterProps {
  leftLevel: number;
  rightLevel: number;
  peak: number;
  rms: number;
  detailed?: boolean;
  showBalance?: boolean;
}

const StereoMeter: React.FC<StereoMeterProps> = ({ 
  leftLevel, 
  rightLevel, 
  peak, 
  rms, 
  detailed = false,
  showBalance = false
}) => {
  const leftPercentage = Math.max(0, Math.min(100, ((leftLevel + 60) * 1.67)));
  const rightPercentage = Math.max(0, Math.min(100, ((rightLevel + 60) * 1.67)));
  const peakPercentage = Math.max(0, Math.min(100, ((peak + 60) * 1.67)));
  const rmsPercentage = Math.max(0, Math.min(100, ((rms + 60) * 1.67)));

  const getColor = (val: number) => {
    if (val > -6) return 'from-red-500 to-red-600';
    if (val > -12) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  if (showBalance) {
    const balance = leftLevel - rightLevel;
    const balancePercentage = Math.max(0, Math.min(100, ((balance + 20) / 40) * 100));
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-sm font-medium text-gray-300">Stereo Balance</span>
          <div className="text-xs text-gray-500">L/R Difference</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg h-24 relative overflow-hidden">
          <div 
            className="bg-gradient-to-t from-blue-500 to-cyan-400 absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out"
            style={{ height: `${balancePercentage}%` }}
          />
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className="text-lg font-bold text-white drop-shadow-lg">
              {balance.toFixed(1)} dB
            </span>
          </div>
          
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-60 transform -translate-x-1/2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
          <div className="text-center">
            <div className="text-blue-400">-20 dB</div>
            <div>Left</div>
          </div>
          <div className="text-center">
            <div className="text-white">0 dB</div>
            <div>Center</div>
          </div>
          <div className="text-center">
            <div className="text-cyan-400">+20 dB</div>
            <div>Right</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-sm font-medium text-gray-300 flex items-center justify-center">
          <Volume2 className="w-4 h-4 mr-2" />
          Stereo Levels
        </span>
        <div className="text-xs text-gray-500">Peak: {peak.toFixed(1)}dB | RMS: {rms.toFixed(1)}dB</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Left Channel */}
        <div className="space-y-2">
          <div className="text-center text-xs text-gray-400">Left</div>
          <div className="bg-gray-800 rounded-lg h-24 relative overflow-hidden">
            <div 
              className={`bg-gradient-to-t ${getColor(leftLevel)} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
              style={{ height: `${leftPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {leftLevel.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Channel */}
        <div className="space-y-2">
          <div className="text-center text-xs text-gray-400">Right</div>
          <div className="bg-gray-800 rounded-lg h-24 relative overflow-hidden">
            <div 
              className={`bg-gradient-to-t ${getColor(rightLevel)} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
              style={{ height: `${rightPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {rightLevel.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {detailed && (
        <div className="grid grid-cols-2 gap-4">
          {/* Peak Meter */}
          <div className="space-y-2">
            <div className="text-center text-xs text-gray-400">Peak</div>
            <div className="bg-gray-800 rounded-lg h-16 relative overflow-hidden">
              <div 
                className={`bg-gradient-to-t ${getColor(peak)} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
                style={{ height: `${peakPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-end justify-center pb-1">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {peak.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* RMS Meter */}
          <div className="space-y-2">
            <div className="text-center text-xs text-gray-400">RMS</div>
            <div className="bg-gray-800 rounded-lg h-16 relative overflow-hidden">
              <div 
                className={`bg-gradient-to-t ${getColor(rms)} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
                style={{ height: `${rmsPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-end justify-center pb-1">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {rms.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StereoMeter;
