import React, { useState } from 'react';
import { Gauge, Volume2, Settings, Zap } from 'lucide-react';

interface AdvancedLimiterProps {
  limitLevel: number;
  inputGain: number;
  outputGain: number;
  reduction: number;
  outputPeak: number;
  onLimitLevelChange: (value: number) => void;
  onInputGainChange: (value: number) => void;
  onOutputGainChange: (value: number) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const AdvancedLimiter: React.FC<AdvancedLimiterProps> = ({
  limitLevel,
  inputGain,
  outputGain,
  reduction,
  outputPeak,
  onLimitLevelChange,
  onInputGainChange,
  onOutputGainChange,
  enabled,
  onToggle
}) => {
  const [unityGainMonitoring, setUnityGainMonitoring] = useState(false);
  const [bypass, setBypass] = useState(false);
  const [channelMode, setChannelMode] = useState<'L/R' | 'M/S'>('L/R');
  const [shape, setShape] = useState<'Linear' | 'Soft'>('Linear');
  const [oversampling, setOversampling] = useState<'x1' | 'x2' | 'x4'>('x1');
  const [latency, setLatency] = useState<'Normal' | 'Low'>('Normal');
  const [overshoot, setOvershoot] = useState<'Clip' | 'Soft'>('Clip');

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header - Compact A.O.M. Style */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-1">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                <Gauge className="w-2.5 h-2.5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">A.O.M. MUSICIANS' ALLY</h3>
                <p className="text-[8px] text-gray-400">A.O.M. INVISIBLE LIMITER</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="p-3">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold text-xs">Advanced Limiter</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="mr-1"
            />
            <span className="text-gray-300 text-[10px]">Enable</span>
          </label>
        </div>

        {enabled && (
          <>
            {/* Main Control Knobs - Compact Layout */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Limit Level Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(limitLevel + 20) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{limitLevel.toFixed(2)}dB</div>
                <div className="text-gray-400 text-[8px]">LIMIT</div>
                <input
                  type="range"
                  min="-20"
                  max="0"
                  step="0.01"
                  value={limitLevel}
                  onChange={(e) => onLimitLevelChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Input Gain Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(inputGain + 20) * 2}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{inputGain.toFixed(2)}dB</div>
                <div className="text-gray-400 text-[8px]">INPUT</div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.01"
                  value={inputGain}
                  onChange={(e) => onInputGainChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Output Gain Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(outputGain + 20) * 2}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{outputGain.toFixed(2)}dB</div>
                <div className="text-gray-400 text-[8px]">OUTPUT</div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.01"
                  value={outputGain}
                  onChange={(e) => onOutputGainChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>

            {/* Monitoring & Bypass Buttons - Compact */}
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={() => setUnityGainMonitoring(!unityGainMonitoring)}
                className={`px-2 py-1.5 rounded text-[8px] font-medium transition-colors ${
                  unityGainMonitoring
                    ? 'bg-crys-gold text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${unityGainMonitoring ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>UNITY</span>
                </div>
              </button>
              
              <button
                onClick={() => setBypass(!bypass)}
                className={`px-2 py-1.5 rounded text-[8px] font-medium transition-colors ${
                  bypass
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${bypass ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>BYPASS</span>
                </div>
              </button>
            </div>

            {/* Meters - Compact */}
            <div className="flex justify-center space-x-4 mb-4">
              {/* Reduction Meter */}
              <div className="text-center">
                <div className="w-6 h-16 bg-gray-800 rounded border border-gray-600 relative mb-1">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (reduction + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-[8px]">{reduction.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-[8px]">REDUCTION</div>
              </div>

              {/* Output Peak Meter */}
              <div className="text-center">
                <div className="w-6 h-16 bg-gray-800 rounded border border-gray-600 relative mb-1">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (outputPeak + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-[8px]">{outputPeak.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-[8px]">PEAK</div>
              </div>
            </div>

            {/* Bottom Control Buttons - Compact */}
            <div className="grid grid-cols-5 gap-1">
              <div className="text-center">
                <button
                  onClick={() => setChannelMode(channelMode === 'L/R' ? 'M/S' : 'L/R')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    channelMode === 'L/R' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {channelMode}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">CH</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShape(shape === 'Linear' ? 'Soft' : 'Linear')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    shape === 'Linear' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {shape}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">SHAPE</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setOversampling(oversampling === 'x1' ? 'x2' : oversampling === 'x2' ? 'x4' : 'x1')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    oversampling === 'x1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {oversampling}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">OS</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setLatency(latency === 'Normal' ? 'Low' : 'Normal')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    latency === 'Normal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {latency}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">LAT</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setOvershoot(overshoot === 'Clip' ? 'Soft' : 'Clip')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    overshoot === 'Clip' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {overshoot}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">OS</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Compact */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
          <div className="text-[6px] text-gray-500">A.O.M. Invisible Limiter v1.15.6</div>
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedLimiter;
