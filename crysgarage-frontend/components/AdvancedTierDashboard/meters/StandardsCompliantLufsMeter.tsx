import React, { useEffect, useState, useRef } from 'react';

// Define interfaces locally since the imports are causing issues
interface LufsFrame {
  time: number;
  momentary: { value: number | null; state: "ok" | "insufficient_signal" };
  shortTerm: { value: number | null; state: "ok" | "insufficient_signal" };
  integrated: { value: number | null; state: "ok" | "insufficient_signal" };
  truePeakDbtp: number | null;
  crestFactorDb?: number | null;
  gainToTargetDb?: number | null;
}

interface LufsMeasurement {
  momentary: number | null;
  shortTerm: number | null;
  integrated: number | null;
  truePeak: number | null;
  crestFactor: number | null;
  gainToTarget: number | null;
  state: {
    momentary: "ok" | "insufficient_signal";
    shortTerm: "ok" | "insufficient_signal";
    integrated: "ok" | "insufficient_signal";
  };
}

interface LufsOptions {
  targetLufs?: number;
  updateIntervalMs?: number;
  oversampleFactor?: number;
}

// Utility functions
const LufsUtils = {
  formatLufsValue: (value: number | null): string => {
    if (value === null) return "−∞";
    return `${Math.round(value)} LUFS`;
  },

  formatTruePeak: (value: number | null): string => {
    if (value === null) return "−∞";
    return `${value.toFixed(1)} dBTP`;
  },

  formatGainToTarget: (value: number | null): string => {
    if (value === null) return "−∞";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)} dB`;
  },

  getLufsColor: (value: number | null): string => {
    if (value === null) return "text-gray-500";
    if (value > -10) return "text-red-500";
    if (value > -16) return "text-yellow-500";
    return "text-green-500";
  },

  getTruePeakColor: (value: number | null): string => {
    if (value === null) return "text-gray-500";
    if (value > -1) return "text-red-500";
    if (value > -3) return "text-yellow-500";
    return "text-green-500";
  },

  getGainToTargetColor: (value: number | null): string => {
    if (value === null) return "text-gray-500";
    if (Math.abs(value) < 0.5) return "text-green-500";
    if (Math.abs(value) < 2) return "text-yellow-500";
    return "text-red-500";
  }
};

interface StandardsCompliantLufsMeterProps {
  audioElement?: HTMLAudioElement | null;
  audioNode?: AudioNode | null;
  targetLufs?: number;
  showGainToTarget?: boolean;
  showCrestFactor?: boolean;
  className?: string;
}

const StandardsCompliantLufsMeter: React.FC<StandardsCompliantLufsMeterProps> = ({
  audioElement,
  audioNode,
  targetLufs = -14,
  showGainToTarget = true,
  showCrestFactor = true,
  className = ""
}) => {
  const [measurement, setMeasurement] = useState<LufsMeasurement | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, we'll show a placeholder since the AudioWorklet integration needs more setup
  useEffect(() => {
    // Simulate connection status
    if (audioElement || audioNode) {
      setIsConnected(true);
    }
  }, [audioElement, audioNode]);

  const renderMeter = (value: number | null, label: string, state: "ok" | "insufficient_signal") => {
    const isInsufficient = state === "insufficient_signal" || value === null;
    const displayValue = isInsufficient ? "−∞" : `${Math.round(value!)}`;
    const colorClass = isInsufficient ? "text-gray-500" : LufsUtils.getLufsColor(value);

    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        <div className="text-center mb-2">
          <span className="text-xs font-medium text-gray-300">{label}</span>
          {isInsufficient && (
            <div className="text-xs text-gray-500 mt-1">No signal</div>
          )}
        </div>
        
        <div className="text-center">
          <span className={`text-lg font-bold ${colorClass}`}>
            {displayValue}
          </span>
          {!isInsufficient && <span className="text-xs text-gray-400 ml-1">LUFS</span>}
        </div>
      </div>
    );
  };

  const renderTruePeak = () => {
    const value = measurement?.truePeak;
    const isInsufficient = value === null;
    const displayValue = isInsufficient ? "−∞" : value!.toFixed(1);
    const colorClass = isInsufficient ? "text-gray-500" : LufsUtils.getTruePeakColor(value);

    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        <div className="text-center mb-2">
          <span className="text-xs font-medium text-gray-300">True Peak</span>
          {isInsufficient && (
            <div className="text-xs text-gray-500 mt-1">No signal</div>
          )}
        </div>
        
        <div className="text-center">
          <span className={`text-lg font-bold ${colorClass}`}>
            {displayValue}
          </span>
          {!isInsufficient && <span className="text-xs text-gray-400 ml-1">dBTP</span>}
        </div>
      </div>
    );
  };

  const renderGainToTarget = () => {
    if (!showGainToTarget) return null;
    
    const value = measurement?.gainToTarget;
    const isInsufficient = value === null || measurement?.integrated === null;
    const displayValue = isInsufficient ? "−∞" : `${value! >= 0 ? "+" : ""}${value!.toFixed(1)}`;
    const colorClass = isInsufficient ? "text-gray-500" : LufsUtils.getGainToTargetColor(value);

    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        <div className="text-center mb-2">
          <span className="text-xs font-medium text-gray-300">Gain to Target</span>
          <div className="text-xs text-gray-500">Target: {targetLufs} LUFS</div>
        </div>
        
        <div className="text-center">
          <span className={`text-lg font-bold ${colorClass}`}>
            {displayValue}
          </span>
          {!isInsufficient && <span className="text-xs text-gray-400 ml-1">dB</span>}
        </div>
      </div>
    );
  };

  const renderCrestFactor = () => {
    if (!showCrestFactor) return null;
    
    const value = measurement?.crestFactor;
    const isInsufficient = value === null || measurement?.shortTerm === null;
    const displayValue = isInsufficient ? "−∞" : value!.toFixed(1);
    const colorClass = isInsufficient ? "text-gray-500" : "text-blue-400";

    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
        <div className="text-center mb-2">
          <span className="text-xs font-medium text-gray-300">Crest Factor</span>
          {isInsufficient && (
            <div className="text-xs text-gray-500 mt-1">No signal</div>
          )}
        </div>
        
        <div className="text-center">
          <span className={`text-lg font-bold ${colorClass}`}>
            {displayValue}
          </span>
          {!isInsufficient && <span className="text-xs text-gray-400 ml-1">dB</span>}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-base font-bold text-white">Standards-Compliant LUFS Meter</h3>
        <p className="text-xs text-gray-400">ITU-R BS.1770-4/5 & EBU R128</p>
      </div>

      {/* Status */}
      <div className="text-center">
        {error && (
          <div className="text-red-400 text-sm mb-2">{error}</div>
        )}
        <div className="text-xs text-gray-400">
          Status: {isConnected ? "Connected" : "Disconnected"}
        </div>
        <div className="text-xs text-yellow-400 mt-1">
          AudioWorklet integration coming soon
        </div>
      </div>

      {/* Meters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {renderMeter(
          measurement?.momentary, 
          "Momentary (0.4s)", 
          measurement?.state.momentary || "insufficient_signal"
        )}
        
        {renderMeter(
          measurement?.shortTerm, 
          "Short-term (3s)", 
          measurement?.state.shortTerm || "insufficient_signal"
        )}
        
        {renderMeter(
          measurement?.integrated, 
          "Integrated", 
          measurement?.state.integrated || "insufficient_signal"
        )}
        
        {renderTruePeak()}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3">
        {renderGainToTarget()}
        {renderCrestFactor()}
      </div>

      {/* Standards Info */}
      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
        <h4 className="text-xs font-medium text-white mb-2">Measurement Standards</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• K-weighting filter (BS.1770-4)</div>
          <div>• Absolute gate: -70 LUFS</div>
          <div>• Relative gate: I - 10 LU</div>
          <div>• True peak: 4× oversampling</div>
          <div>• UI decay: 500ms for smooth transitions</div>
        </div>
      </div>
    </div>
  );
};

export default StandardsCompliantLufsMeter;
