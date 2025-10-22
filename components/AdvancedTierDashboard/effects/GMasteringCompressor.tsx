import React, { useState } from 'react';
import { Zap, Settings, Target, Gauge } from 'lucide-react';
import HardwareKnob from '../HardwareKnob';

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
  onManualInit?: () => void;
  // New props for control buttons
  onKneeChange?: (knee: 'Hard' | 'Soft') => void;
  onLookaheadChange?: (lookahead: 'Off' | 'Low' | 'High') => void;
  onStereoLinkChange?: (stereoLink: 'Off' | 'Low' | 'High') => void;
  onSidechainChange?: (sidechain: 'Off' | 'On') => void;
  onAutoReleaseChange?: (autoRelease: boolean) => void;
  onRMSDetectionChange?: (rmsDetection: boolean) => void;
  // Current settings from audio effects
  knee?: 'Hard' | 'Soft';
  lookahead?: 'Off' | 'Low' | 'High';
  stereoLink?: 'Off' | 'Low' | 'High';
  sidechain?: 'Off' | 'On';
  autoRelease?: boolean;
  rmsDetection?: boolean;
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
  onToggle,
  onManualInit,
  onKneeChange,
  onLookaheadChange,
  onStereoLinkChange,
  onSidechainChange,
  onAutoReleaseChange,
  onRMSDetectionChange,
  knee: externalKnee = 'Soft',
  lookahead: externalLookahead = 'Off',
  stereoLink: externalStereoLink = 'Low',
  sidechain: externalSidechain = 'Off',
  autoRelease: externalAutoRelease = false,
  rmsDetection: externalRMSDetection = false
}) => {
  const [bypass, setBypass] = useState(false);
  
  // Use external state if provided, otherwise use local state
  const [localKnee, setLocalKnee] = useState<'Hard' | 'Soft'>(externalKnee);
  const [localLookahead, setLocalLookahead] = useState<'Off' | 'Low' | 'High'>(externalLookahead);
  const [localStereoLink, setLocalStereoLink] = useState<'Off' | 'Low' | 'High'>(externalStereoLink);
  const [localSidechain, setLocalSidechain] = useState<'Off' | 'On'>(externalSidechain);
  const [localAutoRelease, setLocalAutoRelease] = useState<boolean>(externalAutoRelease);
  const [localRMSDetection, setLocalRMSDetection] = useState<boolean>(externalRMSDetection);
  
  const [editingKnob, setEditingKnob] = useState<string | null>(null);

  // Use external state if available, otherwise use local state
  const knee = externalKnee || localKnee;
  const lookahead = externalLookahead || localLookahead;
  const stereoLink = externalStereoLink || localStereoLink;
  const sidechain = externalSidechain || localSidechain;
  const autoRelease = externalAutoRelease !== undefined ? externalAutoRelease : localAutoRelease;
  const rmsDetection = externalRMSDetection !== undefined ? externalRMSDetection : localRMSDetection;

  const handleKnobChange = (setting: string, value: number) => {
    console.log(`G-Mastering Compressor knob changed: ${setting} = ${value}`);
    switch (setting) {
      case 'threshold':
        onThresholdChange(value);
        break;
      case 'ratio':
        onRatioChange(value);
        break;
      case 'attack':
        onAttackChange(value);
        break;
      case 'release':
        onReleaseChange(value);
        break;
      case 'makeup':
        onMakeupChange(value);
        break;
    }
    onManualInit?.();
  };

  const handleKnobClick = () => {
    onManualInit?.();
  };

  const handleKneeChange = () => {
    const newKnee = knee === 'Hard' ? 'Soft' : 'Hard';
    if (onKneeChange) {
      onKneeChange(newKnee);
    } else {
      setLocalKnee(newKnee);
    }
    onManualInit?.();
  };

  const handleLookaheadChange = () => {
    const newLookahead = lookahead === 'Off' ? 'Low' : lookahead === 'Low' ? 'High' : 'Off';
    if (onLookaheadChange) {
      onLookaheadChange(newLookahead);
    } else {
      setLocalLookahead(newLookahead);
    }
    onManualInit?.();
  };

  const handleStereoLinkChange = () => {
    const newStereoLink = stereoLink === 'Off' ? 'Low' : stereoLink === 'Low' ? 'High' : 'Off';
    if (onStereoLinkChange) {
      onStereoLinkChange(newStereoLink);
    } else {
      setLocalStereoLink(newStereoLink);
    }
    onManualInit?.();
  };

  const handleSidechainChange = () => {
    const newSidechain = sidechain === 'Off' ? 'On' : 'Off';
    if (onSidechainChange) {
      onSidechainChange(newSidechain);
    } else {
      setLocalSidechain(newSidechain);
    }
    onManualInit?.();
  };

  const handleAutoReleaseChange = () => {
    const newAutoRelease = !autoRelease;
    if (onAutoReleaseChange) {
      onAutoReleaseChange(newAutoRelease);
    } else {
      setLocalAutoRelease(newAutoRelease);
    }
    onManualInit?.();
  };

  const handleRMSDetectionChange = () => {
    const newRMSDetection = !rmsDetection;
    if (onRMSDetectionChange) {
      onRMSDetectionChange(newRMSDetection);
    } else {
      setLocalRMSDetection(newRMSDetection);
    }
    onManualInit?.();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header - Compact CRYS GARAGE Style */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <div className="flex items-center space-x-1">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                <Zap className="w-2.5 h-2.5 text-gray-900" />
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
            {/* Main Control Knobs - Enhanced with HardwareKnob */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Threshold Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={threshold}
                  min={-60}
                  max={0}
                  step={0.1}
                  label="THRESH"
                  unit="dB"
                  size="small"
                  onChange={(value) => handleKnobChange('threshold', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'threshold'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'threshold' : null)}
                />
              </div>

              {/* Ratio Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={ratio}
                  min={1}
                  max={20}
                  step={0.1}
                  label="RATIO"
                  unit=":1"
                  size="small"
                  onChange={(value) => handleKnobChange('ratio', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'ratio'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'ratio' : null)}
                />
              </div>

              {/* Makeup Gain Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={makeup}
                  min={-20}
                  max={20}
                  step={0.1}
                  label="MAKEUP"
                  unit="dB"
                  size="small"
                  onChange={(value) => handleKnobChange('makeup', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'makeup'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'makeup' : null)}
                />
              </div>
            </div>

            {/* Second Row of Knobs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Attack Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={attack}
                  min={0.1}
                  max={100}
                  step={0.1}
                  label="ATTACK"
                  unit="ms"
                  size="small"
                  onChange={(value) => handleKnobChange('attack', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'attack'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'attack' : null)}
                />
              </div>

              {/* Release Knob */}
              <div className="text-center">
                <HardwareKnob
                  value={release}
                  min={10}
                  max={1000}
                  step={1}
                  label="RELEASE"
                  unit="ms"
                  size="small"
                  onChange={(value) => handleKnobChange('release', value)}
                  onKnobClick={handleKnobClick}
                  isEditing={editingKnob === 'release'}
                  onEditingChange={(editing) => setEditingKnob(editing ? 'release' : null)}
                />
              </div>
            </div>

            {/* Monitoring & Bypass Buttons - Compact */}
            <div className="flex justify-center space-x-3 mb-4">
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

            {/* Bottom Control Buttons - Enhanced with Audio Processing */}
            <div className="grid grid-cols-6 gap-1">
              <div className="text-center">
                <button
                  onClick={handleKneeChange}
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
                  onClick={handleLookaheadChange}
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
                  onClick={handleStereoLinkChange}
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
                  onClick={handleSidechainChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    sidechain === 'On' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {sidechain}
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">SC</div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleAutoReleaseChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    autoRelease ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  AUTO
                </button>
                <div className="text-[6px] text-gray-500 mt-0.5">REL</div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleRMSDetectionChange}
                  className={`w-full py-1 px-1 rounded text-[8px] font-medium transition-colors ${
                    rmsDetection ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
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
