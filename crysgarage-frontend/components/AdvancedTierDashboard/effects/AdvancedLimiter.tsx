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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-1.5">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1 rounded">
                <Gauge className="w-3 h-3 text-gray-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CRYS GARAGE STUDIO</h3>
                <p className="text-[10px] text-gray-400">ADVANCED INVISIBLE LIMITER</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-sm">Advanced Limiter</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-300 text-xs">Enable</span>
          </label>
        </div>

        {enabled && (
          <>
            {/* Main Control Knobs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Limit Level Knob */}
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-6 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(limitLevel + 20) * 3}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{limitLevel.toFixed(2)}dB</div>
                <div className="text-gray-400 text-xs">LIMIT LEVEL</div>
                <input
                  type="range"
                  min="-20"
                  max="0"
                  step="0.01"
                  value={limitLevel}
                  onChange={(e) => onLimitLevelChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              {/* Input Gain Knob */}
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-6 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(inputGain + 20) * 2}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{inputGain.toFixed(2)}dB</div>
                <div className="text-gray-400 text-xs">INPUT GAIN</div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.01"
                  value={inputGain}
                  onChange={(e) => onInputGainChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              {/* Output Gain Knob */}
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-6 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(outputGain + 20) * 2}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{outputGain.toFixed(2)}dB</div>
                <div className="text-gray-400 text-xs">OUTPUT GAIN</div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.01"
                  value={outputGain}
                  onChange={(e) => onOutputGainChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            {/* Monitoring & Bypass Buttons */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setUnityGainMonitoring(!unityGainMonitoring)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  unityGainMonitoring
                    ? 'bg-crys-gold text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${unityGainMonitoring ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>UNITY GAIN</span>
                </div>
              </button>
              
              <button
                onClick={() => setBypass(!bypass)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  bypass
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${bypass ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>BYPASS</span>
                </div>
              </button>
            </div>

            {/* Meters */}
            <div className="flex justify-center space-x-6 mb-6">
              {/* Reduction Meter */}
              <div className="text-center">
                <div className="w-8 h-24 bg-gray-800 rounded border border-gray-600 relative mb-2">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (reduction + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-xs">{reduction.toFixed(2)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">REDUCTION</div>
                <div className="text-[8px] text-gray-500 mt-1">0 -12 -18 -24 -30 -36</div>
              </div>

              {/* Output Peak Meter */}
              <div className="text-center">
                <div className="w-8 h-24 bg-gray-800 rounded border border-gray-600 relative mb-2">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (outputPeak + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-xs">{outputPeak.toFixed(2)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">OUTPUT PEAK</div>
                <div className="text-[8px] text-gray-500 mt-1">0 -12 -18 -24 -30 -36</div>
              </div>
            </div>

            {/* Bottom Control Buttons */}
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center">
                <button
                  onClick={() => setChannelMode(channelMode === 'L/R' ? 'M/S' : 'L/R')}
                  className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                    channelMode === 'L/R' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {channelMode}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">CH MODE</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShape(shape === 'Linear' ? 'Soft' : 'Linear')}
                  className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                    shape === 'Linear' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {shape}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">SHAPE</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setOversampling(oversampling === 'x1' ? 'x2' : oversampling === 'x2' ? 'x4' : 'x1')}
                  className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                    oversampling === 'x1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {oversampling} 44.1kHz
                </button>
                <div className="text-[8px] text-gray-500 mt-1">OVER SAMPLING</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setLatency(latency === 'Normal' ? 'Low' : 'Normal')}
                  className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                    latency === 'Normal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {latency}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">LATENCY</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setOvershoot(overshoot === 'Clip' ? 'Soft' : 'Clip')}
                  className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                    overshoot === 'Clip' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {overshoot}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">OVERSHOOT</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-2 border-t border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
          <div className="text-[8px] text-gray-500">CRYS GARAGE ADVANCED LIMITER v1.0.0</div>
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
