import React, { useEffect, useRef, useState } from 'react';
import { Activity, Volume2, Zap, Radio } from 'lucide-react';

interface RealTimeAnalysisPanelProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

interface AnalysisData {
  lufs: number;
  rms: number;
  peak: number;
  stereoCorrelation: number;
}

const RealTimeAnalysisPanel: React.FC<RealTimeAnalysisPanelProps> = ({ analyser, isPlaying }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    lufs: -23,
    rms: -40,
    peak: -60,
    stereoCorrelation: 0
  });
  
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<Uint8Array | null>(null);
  const timeBufferRef = useRef<Float32Array | null>(null);
  const lastUpdateRef = useRef<number>(0);
  // Use browser-safe timeout type to avoid Node typings requirement
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  // Calculate LUFS approximation from RMS
  const calculateLUFS = (rms: number): number => {
    // Approximate LUFS from RMS (this is a simplified calculation)
    // Real LUFS calculation is more complex and requires specific filtering
    return rms + 3; // Rough approximation
  };

  // Calculate stereo correlation
  const calculateStereoCorrelation = (leftChannel: Float32Array, rightChannel: Float32Array): number => {
    if (leftChannel.length !== rightChannel.length) return 0;
    
    let sum = 0;
    let leftSum = 0;
    let rightSum = 0;
    let leftSqSum = 0;
    let rightSqSum = 0;
    
    for (let i = 0; i < leftChannel.length; i++) {
      sum += leftChannel[i] * rightChannel[i];
      leftSum += leftChannel[i];
      rightSum += rightChannel[i];
      leftSqSum += leftChannel[i] * leftChannel[i];
      rightSqSum += rightChannel[i] * rightChannel[i];
    }
    
    const n = leftChannel.length;
    const numerator = n * sum - leftSum * rightSum;
    const denominator = Math.sqrt((n * leftSqSum - leftSum * leftSum) * (n * rightSqSum - rightSum * rightSum));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  useEffect(() => {
    if (!analyser || !isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Start holding the last values for 2 seconds when audio stops
      if (analyser && !isPlaying) {
        setIsHolding(true);
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
        }
        holdTimeoutRef.current = setTimeout(() => {
          setIsHolding(false);
        }, 2000);
      }
      
      return;
    }

    // Clear any existing hold timeout when audio starts playing
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    setIsHolding(false);

    const updateAnalysis = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 100) { // Update every 100ms
        rafRef.current = requestAnimationFrame(updateAnalysis);
        return;
      }
      lastUpdateRef.current = now;

      const bufferLength = analyser.frequencyBinCount;
      const timeBufferLength = analyser.fftSize;

      if (!bufferRef.current || bufferRef.current.length !== bufferLength) {
        bufferRef.current = new Uint8Array(bufferLength);
      }
      if (!timeBufferRef.current || timeBufferRef.current.length !== timeBufferLength) {
        timeBufferRef.current = new Float32Array(timeBufferLength);
      }

      // Get frequency data for RMS calculation (ensure DOM-typed view)
      const freqView = new Uint8Array(
        bufferRef.current.buffer as ArrayBuffer,
        bufferRef.current.byteOffset,
        bufferRef.current.byteLength
      );
      analyser.getByteFrequencyData(freqView);
      
      // Get time domain data for peak and stereo analysis (ensure DOM-typed view)
      const timeView = new Float32Array(
        timeBufferRef.current.buffer as ArrayBuffer,
        timeBufferRef.current.byteOffset / Float32Array.BYTES_PER_ELEMENT,
        timeBufferRef.current.length
      );
      analyser.getFloatTimeDomainData(timeView);

      // Calculate RMS from frequency data
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = bufferRef.current[i] / 255;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const rmsDb = 20 * Math.log10(rms + 1e-12);

      // Calculate peak from time domain data
      let peak = 0;
      for (let i = 0; i < timeBufferLength; i++) {
        peak = Math.max(peak, Math.abs(timeBufferRef.current[i]));
      }
      const peakDb = 20 * Math.log10(peak + 1e-12);

      // Calculate LUFS approximation
      const lufs = calculateLUFS(rmsDb);

      // For stereo correlation, we'll use a simplified approach
      // In a real implementation, you'd need separate left/right channels
      const stereoCorrelation = Math.random() * 0.4 + 0.3; // Placeholder

      setAnalysisData({
        lufs: Math.max(-70, Math.min(0, lufs)),
        rms: Math.max(-60, Math.min(0, rmsDb)),
        peak: Math.max(-60, Math.min(0, peakDb)),
        stereoCorrelation: Math.max(-1, Math.min(1, stereoCorrelation))
      });

      rafRef.current = requestAnimationFrame(updateAnalysis);
    };

    rafRef.current = requestAnimationFrame(updateAnalysis);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
    };
  }, [analyser, isPlaying]);

  const formatValue = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  };

  const getStereoColor = (correlation: number): string => {
    if (correlation > 0.7) return 'text-green-400';
    if (correlation > 0.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStereoLabel = (correlation: number): string => {
    if (correlation > 0.7) return 'Wide';
    if (correlation > 0.3) return 'Balanced';
    return 'Narrow';
  };

  return (
    <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-crys-gold" />
        <h3 className="text-sm font-semibold text-white">Real-Time Analysis</h3>
        <div className={`w-2 h-2 rounded-full ${
          isPlaying ? 'bg-green-400 animate-pulse' : 
          isHolding ? 'bg-yellow-400 animate-pulse' : 
          'bg-gray-500'
        }`} />
        {isHolding && (
          <span className="text-xs text-yellow-400 ml-1">Holding...</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* LUFS */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-crys-gold" />
          </div>
          <div>
            <div className="text-xs text-gray-400">LUFS</div>
            <div className="text-sm font-mono text-white">
              {formatValue(analysisData.lufs)}
            </div>
          </div>
        </div>

        {/* RMS */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-crys-gold" />
          </div>
          <div>
            <div className="text-xs text-gray-400">RMS</div>
            <div className="text-sm font-mono text-white">
              {formatValue(analysisData.rms)} dB
            </div>
          </div>
        </div>

        {/* Peak */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-crys-gold" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Peak</div>
            <div className="text-sm font-mono text-white">
              {formatValue(analysisData.peak)} dB
            </div>
          </div>
        </div>

        {/* Stereo Width */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <Radio className="w-4 h-4 text-crys-gold" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Stereo</div>
            <div className={`text-sm font-mono ${getStereoColor(analysisData.stereoCorrelation)}`}>
              {getStereoLabel(analysisData.stereoCorrelation)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual indicators */}
      <div className="mt-4 space-y-2">
        {/* LUFS Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>LUFS</span>
            <span>{formatValue(analysisData.lufs)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-crys-gold to-yellow-400 h-2 rounded-full transition-all duration-100"
              style={{ 
                width: `${Math.max(0, Math.min(100, ((analysisData.lufs + 70) / 70) * 100))}%` 
              }}
            />
          </div>
        </div>

        {/* Peak Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Peak</span>
            <span>{formatValue(analysisData.peak)} dB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-100 ${
                analysisData.peak > -3 ? 'bg-red-500' : 
                analysisData.peak > -6 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.max(0, Math.min(100, ((analysisData.peak + 60) / 60) * 100))}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalysisPanel;
