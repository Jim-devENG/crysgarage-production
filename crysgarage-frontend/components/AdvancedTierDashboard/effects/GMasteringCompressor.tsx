import React, { useState } from 'react';
import { Zap, Settings, Target, Gauge } from 'lucide-react';

interface GMasteringCompressorProps {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  makeup: number;
  reduction: number;
  outputLevel: number;
  onThresholdChange: (value: number) => void;
  onRatioChange: (value: number) => void;
  onAttackChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  onMakeupChange: (value: number) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const GMasteringCompressor: React.FC<GMasteringCompressorProps> = ({
  threshold,
  ratio,
  attack,
  release,
  makeup,
  reduction,
  outputLevel,
  onThresholdChange,
  onRatioChange,
  onAttackChange,
  onReleaseChange,
  onMakeupChange,
  enabled,
  onToggle
}) => {
  const [bypass, setBypass] = useState(false);
  const [autoGain, setAutoGain] = useState(false);
  const [knee, setKnee] = useState<'Hard' | 'Soft'>('Soft');
  const [lookahead, setLookahead] = useState<'Off' | 'Low' | 'High'>('Off');
  const [stereoLink, setStereoLink] = useState<'Off' | 'Low' | 'High'>('Low');
  const [sidechain, setSidechain] = useState<'Off' | 'On'>('Off');

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
      {/* Header - A.O.M. Style */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-1.5">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1 rounded">
                <Zap className="w-3 h-3 text-gray-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CRYS GARAGE STUDIO</h3>
                <p className="text-[10px] text-gray-400">G-MASTERING COMPRESSOR</p>
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

      {/* Main Content - A.O.M. Style Layout */}
      <div className="p-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-sm">G-Mastering Compressor</h4>
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
            {/* Main Control Knobs - A.O.M. Style Layout */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Threshold Knob - A.O.M. Style */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-8 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(threshold + 60) * 1.5}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{threshold.toFixed(1)}dB</div>
                <div className="text-gray-400 text-xs">THRESHOLD</div>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              {/* Ratio Knob - A.O.M. Style */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-8 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(ratio - 1) * 10}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{ratio.toFixed(1)}:1</div>
                <div className="text-gray-400 text-xs">RATIO</div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={ratio}
                  onChange={(e) => onRatioChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              {/* Makeup Gain Knob - A.O.M. Style */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-8 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(makeup + 20) * 2}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{makeup.toFixed(1)}dB</div>
                <div className="text-gray-400 text-xs">MAKEUP GAIN</div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.1"
                  value={makeup}
                  onChange={(e) => onMakeupChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            {/* Second Row of Knobs */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Attack Knob - A.O.M. Style */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-8 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(attack / 100) * 300}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{attack}ms</div>
                <div className="text-gray-400 text-xs">ATTACK</div>
                <input
                  type="range"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={attack}
                  onChange={(e) => onAttackChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              {/* Release Knob - A.O.M. Style */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-1 h-8 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(release / 1000) * 300}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-sm mb-1">{release}ms</div>
                <div className="text-gray-400 text-xs">RELEASE</div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="1"
                  value={release}
                  onChange={(e) => onReleaseChange(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            {/* Monitoring & Bypass Buttons - A.O.M. Style */}
            <div className="flex justify-center space-x-6 mb-6">
              <button
                onClick={() => setAutoGain(!autoGain)}
                className={`px-4 py-3 rounded-md text-xs font-medium transition-colors ${
                  autoGain
                    ? 'bg-crys-gold text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${autoGain ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>AUTO GAIN</span>
                </div>
              </button>
              
              <button
                onClick={() => setBypass(!bypass)}
                className={`px-4 py-3 rounded-md text-xs font-medium transition-colors ${
                  bypass
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${bypass ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>BYPASS</span>
                </div>
              </button>
            </div>

            {/* Meters - A.O.M. Style */}
            <div className="flex justify-center space-x-8 mb-6">
              {/* Reduction Meter - A.O.M. Style */}
              <div className="text-center">
                <div className="w-10 h-28 bg-gray-800 rounded border border-gray-600 relative mb-2">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (reduction + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-xs">{reduction.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">REDUCTION</div>
                <div className="text-[8px] text-gray-500 mt-1">0 -12 -18 -24 -30 -36</div>
              </div>

              {/* Output Level Meter - A.O.M. Style */}
              <div className="text-center">
                <div className="w-10 h-28 bg-gray-800 rounded border border-gray-600 relative mb-2">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (outputLevel + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-xs">{outputLevel.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">OUTPUT LEVEL</div>
                <div className="text-[8px] text-gray-500 mt-1">0 -12 -18 -24 -30 -36</div>
              </div>
            </div>

            {/* Bottom Control Buttons - A.O.M. Style */}
            <div className="grid grid-cols-6 gap-3">
              <div className="text-center">
                <button
                  onClick={() => setKnee(knee === 'Hard' ? 'Soft' : 'Hard')}
                  className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                    knee === 'Soft' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {knee}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">KNEE</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setLookahead(lookahead === 'Off' ? 'Low' : lookahead === 'Low' ? 'High' : 'Off')}
                  className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                    lookahead === 'Off' ? 'bg-gray-700 text-gray-300' : 'bg-blue-600 text-white'
                  }`}
                >
                  {lookahead}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">LOOKAHEAD</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStereoLink(stereoLink === 'Off' ? 'Low' : stereoLink === 'Low' ? 'High' : 'Off')}
                  className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                    stereoLink === 'Low' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {stereoLink}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">STEREO LINK</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setSidechain(sidechain === 'Off' ? 'On' : 'Off')}
                  className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                    sidechain === 'On' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {sidechain}
                </button>
                <div className="text-[8px] text-gray-500 mt-1">SIDECHAIN</div>
              </div>

              <div className="text-center">
                <button className="w-full py-2 px-3 rounded text-xs font-medium bg-gray-700 text-gray-300">
                  AUTO
                </button>
                <div className="text-[8px] text-gray-500 mt-1">RELEASE</div>
              </div>

              <div className="text-center">
                <button className="w-full py-2 px-3 rounded text-xs font-medium bg-gray-700 text-gray-300">
                  RMS
                </button>
                <div className="text-[8px] text-gray-500 mt-1">DETECTION</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - A.O.M. Style */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-2 border-t border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
          <div className="text-[8px] text-gray-500">CRYS GARAGE G-MASTERING COMPRESSOR v1.0.0</div>
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

export default GMasteringCompressor;
