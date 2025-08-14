import React, { useState } from 'react';

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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header - Compact A.O.M. Style */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-1">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                <p className="text-[8px] text-gray-400">G-MASTERING COMPRESSOR</p>
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
          <h4 className="text-white font-semibold text-xs">G-Mastering Compressor</h4>
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
              {/* Threshold Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(threshold + 60) * 1.5}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{threshold.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">THRESH</div>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Ratio Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(ratio - 1) * 10}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{ratio.toFixed(1)}:1</div>
                <div className="text-gray-400 text-[8px]">RATIO</div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={ratio}
                  onChange={(e) => onRatioChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Makeup Gain Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(makeup + 20) * 2}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{makeup.toFixed(1)}dB</div>
                <div className="text-gray-400 text-[8px]">MAKEUP</div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.1"
                  value={makeup}
                  onChange={(e) => onMakeupChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>

            {/* Second Row of Knobs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Attack Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(attack / 100) * 300}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{attack}ms</div>
                <div className="text-gray-400 text-[8px]">ATTACK</div>
                <input
                  type="range"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={attack}
                  onChange={(e) => onAttackChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              {/* Release Knob */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 shadow-inner flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border border-gray-500 flex items-center justify-center">
                      <div className="w-0.5 h-4 bg-crys-gold rounded-full transform origin-bottom" 
                           style={{ transform: `rotate(${(release / 1000) * 300}deg)` }}></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-crys-gold rounded-full"></div>
                </div>
                <div className="text-crys-gold font-mono text-xs mb-0.5">{release}ms</div>
                <div className="text-gray-400 text-[8px]">RELEASE</div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="1"
                  value={release}
                  onChange={(e) => onReleaseChange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>

            {/* Monitoring & Bypass Buttons - Compact */}
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={() => setAutoGain(!autoGain)}
                className={`px-2 py-1.5 rounded text-[8px] font-medium transition-colors ${
                  autoGain
                    ? 'bg-crys-gold text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${autoGain ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                  <span>AUTO</span>
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

              {/* Output Level Meter */}
              <div className="text-center">
                <div className="w-6 h-16 bg-gray-800 rounded border border-gray-600 relative mb-1">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-b"
                       style={{ height: `${Math.max(0, Math.min(100, (outputLevel + 36) * 2.78))}%` }}></div>
                  <div className="absolute top-0 left-0 right-0 text-center">
                    <div className="text-crys-gold font-mono text-[8px]">{outputLevel.toFixed(1)}dB</div>
                  </div>
                </div>
                <div className="text-gray-400 text-[8px]">OUTPUT</div>
              </div>
            </div>

            {/* Bottom Control Buttons - Compact */}
            <div className="grid grid-cols-6 gap-1">
              <div className="text-center">
                <button
                  onClick={() => setKnee(knee === 'Hard' ? 'Soft' : 'Hard')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    knee === 'Soft' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {knee}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">KNEE</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setLookahead(lookahead === 'Off' ? 'Low' : lookahead === 'Low' ? 'High' : 'Off')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    lookahead === 'Off' ? 'bg-gray-700 text-gray-300' : 'bg-blue-600 text-white'
                  }`}
                >
                  {lookahead}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">LOOK</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStereoLink(stereoLink === 'Off' ? 'Low' : stereoLink === 'Low' ? 'High' : 'Off')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    stereoLink === 'Low' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {stereoLink}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">LINK</div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setSidechain(sidechain === 'Off' ? 'On' : 'Off')}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    sidechain === 'On' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {sidechain}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">SC</div>
              </div>

              <div className="text-center">
                <button className="w-full py-1 px-1 rounded text-[8px] font-medium bg-gray-700 text-gray-300">
                  AUTO
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">REL</div>
              </div>

              <div className="text-center">
                <button className="w-full py-1 px-1 rounded text-[8px] font-medium bg-gray-700 text-gray-300">
                  RMS
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">DET</div>
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
          <div className="text-[6px] text-gray-500">CRYS GARAGE G-MASTERING COMPRESSOR v1.0.0</div>
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
