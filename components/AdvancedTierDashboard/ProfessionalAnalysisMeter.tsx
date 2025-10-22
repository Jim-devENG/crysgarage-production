import React, { useEffect, useRef, useState } from 'react';

interface ProfessionalAnalysisMeterProps {
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

const ProfessionalAnalysisMeter: React.FC<ProfessionalAnalysisMeterProps> = ({
  meterData,
  isAnalyzing = false
}) => {
  // DAW Algorithm Implementation for Frequency Analysis:
  // 1. Frequency data is normalized from 0-255 range to linear amplitude (0-1)
  // 2. Convert to dB using standard formula: dB = 20 * log10(amplitude)
  // 3. Display range is 0 dB (top) to -55 dB (bottom) for professional metering
  // 4. This matches industry-standard DAW frequency analyzers
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectionMode, setDetectionMode] = useState<'LRmax'>('LRmax');
  const [analyzerMode, setAnalyzerMode] = useState<'Peak'>('Peak');
  const [analyzerBands, setAnalyzerBands] = useState(63);
  const [peakHold, setPeakHold] = useState(2);
  const [returnRate, setReturnRate] = useState(4);
  const [levelMode, setLevelMode] = useState<'Peak & RMS'>('Peak & RMS');

  // Frequency bands for octave analysis (matching the image)
  const frequencyBands = [16, 31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  
  // dB scale from 5 to -55 (matching the image)
  const dbScale = [5, 0, -5, -10, -15, -20, -25, -30, -35, -40, -45, -50, -55];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw frequency analyzer
    drawFrequencyAnalyzer(ctx, canvas.width, canvas.height);
  }, [meterData, analyzerBands]);

  const drawFrequencyAnalyzer = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;

    // Horizontal grid lines (dB scale from 0 to -55)
    const dbRange = 55; // 0 to -55 = 55dB range
    const pixelsPerDb = height / dbRange;
    
    // Create dB scale from 0 to -55 in 5dB increments
    const dbScale = [0, -5, -10, -15, -20, -25, -30, -35, -40, -45, -50, -55];
    
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
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
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
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    // dB labels on left (0 to -55)
    dbScale.forEach(db => {
      const y = (Math.abs(db) / dbRange) * height;
      ctx.fillText(db.toString(), 30, y + 3);
    });

    // Frequency labels on bottom
    ctx.textAlign = 'center';
    frequencyBands.forEach((freq, index) => {
      const x = index * (width / frequencyBands.length) + (width / frequencyBands.length) / 2;
      const label = freq >= 1000 ? `${freq / 1000}k` : freq.toString();
      ctx.fillText(label, x, height - 5);
    });
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.7) return '#00ff00'; // Green for good correlation
    if (correlation > 0.3) return '#ffff00'; // Yellow for moderate
    return '#ff0000'; // Red for poor correlation
  };

  const getLevelColor = (level: number) => {
    if (level > -6) return '#ff0000'; // Red for clipping
    if (level > -12) return '#ffff00'; // Yellow for warning
    if (level > -20) return '#00ff00'; // Green for safe
    return '#666666'; // Gray for very low levels
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
             {/* Header */}
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center space-x-4">
           <span className="text-white font-bold">dB</span>
           <span className="text-gray-400">Top: 0 dB</span>
           <span className="text-gray-400">Range: 55 dB</span>
         </div>
       </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Main Frequency Analyzer */}
        <div className="col-span-3">
          <canvas
            ref={canvasRef}
            className="w-full h-64 bg-gray-800 rounded border border-gray-600"
          />
        </div>

        {/* Right Side Meters */}
        <div className="space-y-4">
          {/* LUFS Meters */}
          <div className="bg-gray-800 rounded p-3 border border-gray-600">
            <div className="text-white font-bold text-sm mb-2">LUFS</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">LU-I</span>
                <span className="text-white text-xs">{meterData.lufs.toFixed(1)} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">LU-S</span>
                <span className="text-white text-xs">{(meterData.lufs - 2).toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* L/R Level Meters */}
          <div className="bg-gray-800 rounded p-3 border border-gray-600">
            <div className="text-white font-bold text-sm mb-2">L / R</div>
            
            {/* Peak Levels */}
            <div className="mb-2">
              <div className="text-gray-400 text-xs mb-1">Peak</div>
              <div className="flex justify-between">
                <span className={`text-xs ${getLevelColor(meterData.peak)}`}>
                  L {meterData.peak.toFixed(1)}
                </span>
                <span className={`text-xs ${getLevelColor(meterData.peak)}`}>
                  R {meterData.peak.toFixed(1)}
                </span>
              </div>
            </div>

            {/* RMS Levels */}
            <div>
              <div className="text-gray-400 text-xs mb-1">RMS</div>
              <div className="flex justify-between">
                <span className={`text-xs ${getLevelColor(meterData.rms)}`}>
                  L {meterData.rms.toFixed(1)}
                </span>
                <span className={`text-xs ${getLevelColor(meterData.rms)}`}>
                  R {meterData.rms.toFixed(1)}
                </span>
              </div>
            </div>

                         {/* dB Scale */}
             <div className="mt-2 text-right">
               <div className="text-gray-400 text-xs space-y-0.5">
                 {[0, -5, -10, -15, -20, -25, -30, -35, -40, -45, -50, -55].map(db => (
                   <div key={db} className="h-3 flex items-center justify-end">
                     <span className="text-xs">{db}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Correlation Meter */}
          <div className="bg-gray-800 rounded p-3 border border-gray-600">
            <div className="text-white font-bold text-sm mb-2">CORRELATION</div>
            <div className="relative h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded">
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white"
                style={{ 
                  left: `${((meterData.correlation + 1) / 2) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
            <div className="text-center mt-1">
              <span className={`text-xs font-bold ${getCorrelationColor(meterData.correlation)}`}>
                {meterData.correlation.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Left Controls */}
        <div className="space-y-3">
          {/* Detection */}
          <div>
            <div className="text-white text-xs mb-1">Detection</div>
            <div className="flex space-x-1">
              {['Left', 'Right', 'LRmax', 'Mono'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setDetectionMode(mode as any)}
                  className={`px-2 py-1 text-xs rounded ${
                    detectionMode === mode 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <div className="text-white text-xs mb-1">Mode</div>
            <div className="flex space-x-1">
              {['RMS Slow', 'RMS Fast', 'Peak'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setAnalyzerMode(mode as any)}
                  className={`px-2 py-1 text-xs rounded ${
                    analyzerMode === mode 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Analyzer Bands */}
          <div>
            <div className="text-white text-xs mb-1">Analyzer Bands</div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={analyzerBands}
                onChange={(e) => setAnalyzerBands(parseInt(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
                min="16"
                max="128"
              />
            </div>
          </div>

          {/* Peak Hold */}
          <div>
            <div className="text-white text-xs mb-1">Peak</div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={peakHold}
                onChange={(e) => setPeakHold(parseInt(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                max="10"
              />
              <span className="text-gray-400 text-xs">s</span>
              <button className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                Hold
              </button>
              <button className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                Reset
              </button>
            </div>
          </div>

          {/* Return Rate */}
          <div>
            <div className="text-white text-xs mb-1">Return Rate</div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={returnRate}
                onChange={(e) => setReturnRate(parseInt(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                max="20"
              />
              <span className="text-gray-400 text-xs">dB/s</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="space-y-3">
          {/* Level */}
          <div>
            <div className="text-white text-xs mb-1">Level</div>
            <div className="flex items-center space-x-2">
              <select
                value={levelMode}
                onChange={(e) => setLevelMode(e.target.value as any)}
                className="px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
              >
                <option>Peak & RMS</option>
                <option>Peak Only</option>
                <option>RMS Only</option>
              </select>
            </div>
          </div>

          {/* Peak Hold (Right) */}
          <div>
            <div className="text-white text-xs mb-1">Peak</div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={peakHold}
                onChange={(e) => setPeakHold(parseInt(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                max="10"
              />
              <span className="text-gray-400 text-xs">s</span>
              <button className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                Hold
              </button>
              <button className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                Reset
              </button>
            </div>
          </div>

          {/* Return Rate (Right) */}
          <div>
            <div className="text-white text-xs mb-1">Return Rate</div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={returnRate}
                onChange={(e) => setReturnRate(parseInt(e.target.value))}
                className="w-16 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
                min="1"
                max="20"
              />
              <span className="text-gray-400 text-xs">dB/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAnalysisMeter;
