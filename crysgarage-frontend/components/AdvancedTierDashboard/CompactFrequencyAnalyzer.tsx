import React, { useEffect, useRef } from 'react';

interface CompactFrequencyAnalyzerProps {
  meterData: {
    lufs: number;
    peak: number;
    rms: number;
    correlation: number;
    leftLevel: number;
    rightLevel: number;
    frequencyData: number[];
    goniometerData: number[];
  };
  isAnalyzing?: boolean;
}

const CompactFrequencyAnalyzer: React.FC<CompactFrequencyAnalyzerProps> = ({
  meterData,
  isAnalyzing = false
}) => {
  // DAW Algorithm Implementation for Frequency Analysis:
  // 1. Frequency data is normalized from 0-255 range to linear amplitude (0-1)
  // 2. Convert to dB using standard formula: dB = 20 * log10(amplitude)
  // 3. Display range is 0 dB (top) to -55 dB (bottom) for professional metering
  // 4. This matches industry-standard DAW frequency analyzers
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Frequency bands for octave analysis
  const frequencyBands = [16, 31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  
  // dB scale from 0 to -55 (matching professional meters)
  const dbScale = [0, -10, -20, -30, -40, -50];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for compact display
    canvas.width = 300;
    canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw frequency analyzer
    drawFrequencyAnalyzer(ctx, canvas.width, canvas.height);
  }, [meterData]);

  const drawFrequencyAnalyzer = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

         // Draw grid lines
     ctx.strokeStyle = '#404040';
     ctx.lineWidth = 0.5;

    // Horizontal grid lines (dB scale from 0 to -55)
    const dbRange = 55; // 0 to -55 = 55dB range
    
    dbScale.forEach(db => {
      const y = (Math.abs(db) / dbRange) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Vertical grid lines (frequency bands)
    const bandWidth = width / frequencyBands.length;
    frequencyBands.forEach((freq, index) => {
      const x = index * bandWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

         // Calculate and draw frequency response using DAW algorithm
     if (meterData.frequencyData && meterData.frequencyData.length > 0) {
       ctx.strokeStyle = '#00ff41';
       ctx.lineWidth = 0.8;
       ctx.beginPath();

      const bandWidth = width / frequencyBands.length;
      
      // Process frequency data using DAW algorithm
      meterData.frequencyData.slice(0, frequencyBands.length).forEach((value, index) => {
        const x = index * bandWidth + bandWidth / 2;
        
        // DAW Algorithm: Convert frequency data to dB scale
        // Normalize the frequency data (0-255) to linear amplitude (0-1)
        const normalizedAmplitude = value / 255;
        
        // Convert to dB using DAW standard: dB = 20 * log10(amplitude)
        // Clamp to prevent -Infinity when amplitude is 0
        const amplitude = Math.max(normalizedAmplitude, 0.000001);
        const db = 20 * Math.log10(amplitude);
        
        // Map dB to display range (0 to -55)
        // Clamp dB to our display range
        const clampedDb = Math.max(-55, Math.min(0, db));
        
        // Convert dB to y position (0 dB at top, -55 dB at bottom)
        const y = (Math.abs(clampedDb) / dbRange) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

         // Draw labels
     ctx.fillStyle = '#888888';
     ctx.font = '8px monospace';
     ctx.textAlign = 'right';

    // dB labels on left (0 to -55)
    dbScale.forEach(db => {
      const y = (Math.abs(db) / dbRange) * height;
      ctx.fillText(db.toString(), 25, y + 3);
    });

         // Frequency labels on bottom (simplified for compact view)
     ctx.textAlign = 'center';
     [125, 1000, 8000].forEach((freq, index) => {
       const positions = [width * 0.2, width * 0.5, width * 0.8];
       const label = freq >= 1000 ? `${freq / 1000}k` : freq.toString();
       ctx.fillText(label, positions[index], height - 3);
     });
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.7) return 'text-green-400';
    if (correlation > 0.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLevelColor = (level: number) => {
    if (level > -6) return 'text-red-400';
    if (level > -12) return 'text-yellow-400';
    if (level > -20) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-white text-sm font-semibold">Frequency Spectrum</div>
        <div className="text-gray-400 text-xs">0 to -55 dB</div>
      </div>

      {/* Main Frequency Analyzer */}
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          className="w-full bg-gray-800 rounded border border-gray-600"
        />
      </div>

      {/* Compact Meter Readings */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* LUFS */}
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400 mb-1">LUFS</div>
          <div className="text-white font-bold">{meterData.lufs.toFixed(1)} dB</div>
        </div>

        {/* Peak */}
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400 mb-1">Peak</div>
          <div className={`font-bold ${getLevelColor(meterData.peak)}`}>
            {meterData.peak.toFixed(1)} dB
          </div>
        </div>

        {/* RMS */}
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400 mb-1">RMS</div>
          <div className={`font-bold ${getLevelColor(meterData.rms)}`}>
            {meterData.rms.toFixed(1)} dB
          </div>
        </div>

        {/* Correlation */}
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400 mb-1">Correlation</div>
          <div className={`font-bold ${getCorrelationColor(meterData.correlation)}`}>
            {meterData.correlation.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactFrequencyAnalyzer;
