import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, Settings, Target, Gauge, Activity, Radio, Zap, Volume2, Waves } from 'lucide-react';

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftLevel: number;
  rightLevel: number;
  frequencyData: number[];
  goniometerData: number[];
}

interface RealTimeMetersProps {
  meterData: MeterData;
}

const RealTimeMeters: React.FC<RealTimeMetersProps> = ({ meterData }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'stereo'>('overview');
  const [meterSettings, setMeterSettings] = useState({
    lufsTarget: -14,
    peakTarget: -1,
    rmsTarget: -12,
    correlationTarget: 0.8,
    refreshRate: 60,
    smoothing: 0.1
  });

  const frequencyCanvasRef = useRef<HTMLCanvasElement>(null);
  const goniometerCanvasRef = useRef<HTMLCanvasElement>(null);

  const updateMeterSetting = (key: string, value: number) => {
    setMeterSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Enhanced Frequency Spectrum Visualization
  useEffect(() => {
    const canvas = frequencyCanvasRef.current;
    if (!canvas || !meterData.frequencyData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1f2937');
    bgGradient.addColorStop(1, '#111827');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical grid lines (logarithmic frequency scale)
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    frequencies.forEach(freq => {
      const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    // Draw frequency spectrum with improved visualization
    const barWidth = width / meterData.frequencyData.length;
    
    meterData.frequencyData.forEach((value, index) => {
      const normalizedValue = value / 255;
      const barHeight = normalizedValue * height * 0.8; // Leave some space at top
      const x = index * barWidth;
      const y = height - barHeight;

      // Create dynamic gradient based on frequency
      const gradient = ctx.createLinearGradient(x, y, x, height);
      if (index < meterData.frequencyData.length * 0.3) {
        // Low frequencies - blue to cyan
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#06b6d4');
      } else if (index < meterData.frequencyData.length * 0.7) {
        // Mid frequencies - green to yellow
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#f59e0b');
      } else {
        // High frequencies - orange to red
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ef4444');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);

      // Add subtle glow effect
      ctx.shadowColor = gradient.addColorStop ? '#ffffff' : '#000000';
      ctx.shadowBlur = 2;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      ctx.shadowBlur = 0;
    });

    // Draw frequency labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    
    frequencies.forEach(freq => {
      const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
      ctx.fillText(`${freq}Hz`, x, height - 5);
    });

    // Draw amplitude labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      const db = -60 + (i * 6);
      ctx.fillText(`${db}dB`, width - 5, y + 3);
    }
  }, [meterData.frequencyData]);

  // Fixed Goniometer Visualization
  useEffect(() => {
    const canvas = goniometerCanvasRef.current;
    if (!canvas || !meterData.goniometerData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    bgGradient.addColorStop(0, '#1f2937');
    bgGradient.addColorStop(1, '#111827');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw circular grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Draw concentric circles
    for (let i = 1; i <= 4; i++) {
      const circleRadius = (radius / 4) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw cross lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Draw diagonal lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.707, centerY - radius * 0.707);
    ctx.lineTo(centerX + radius * 0.707, centerY + radius * 0.707);
    ctx.moveTo(centerX + radius * 0.707, centerY - radius * 0.707);
    ctx.lineTo(centerX - radius * 0.707, centerY + radius * 0.707);
    ctx.stroke();

    // Draw goniometer data points
    if (meterData.goniometerData.length > 0) {
      // Calculate stereo correlation from time domain data
      const dataLength = meterData.goniometerData.length;
      const leftChannel = meterData.goniometerData.slice(0, dataLength / 2);
      const rightChannel = meterData.goniometerData.slice(dataLength / 2);
      
      // Create goniometer visualization
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      
      // Draw correlation line
      const correlation = meterData.correlation;
      const angle = Math.acos(Math.max(-1, Math.min(1, correlation))) * (correlation < 0 ? -1 : 1);
      const endX = centerX + Math.cos(angle) * radius * 0.8;
      const endY = centerY - Math.sin(angle) * radius * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw stereo field points
      ctx.fillStyle = '#3b82f6';
      ctx.globalAlpha = 0.6;
      
      for (let i = 0; i < Math.min(leftChannel.length, 100); i += 2) {
        const left = (leftChannel[i] - 128) / 128;
        const right = (rightChannel[i] - 128) / 128;
        
        if (Math.abs(left) > 0.01 || Math.abs(right) > 0.01) {
          const x = centerX + (left + right) * radius * 0.5;
          const y = centerY - (left - right) * radius * 0.5;
          
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw center point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('L', centerX - radius - 15, centerY);
    ctx.fillText('R', centerX + radius + 15, centerY);
    ctx.fillText('C', centerX, centerY - radius - 15);
    ctx.fillText('S', centerX, centerY + radius + 15);
  }, [meterData.goniometerData, meterData.correlation]);

  // Enhanced meter component
  const MeterBar = ({ 
    value, 
    target, 
    label, 
    unit = 'dB', 
    colorGradient = 'from-green-500 via-yellow-500 to-red-500',
    maxValue = 0,
    minValue = -60 
  }) => {
    const percentage = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));
    const targetPercentage = Math.max(0, Math.min(100, ((target - minValue) / (maxValue - minValue)) * 100));
    
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="text-center mb-3">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <div className="text-xs text-gray-500">Target: {target}{unit}</div>
        </div>
        <div className="bg-gray-800 rounded-lg h-32 relative overflow-hidden">
          <div 
            className={`bg-gradient-to-t ${colorGradient} absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out`}
            style={{ height: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className="text-lg font-bold text-white drop-shadow-lg">
              {value.toFixed(1)}{unit}
            </span>
          </div>
          {/* Target line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-white border-dashed opacity-60"
            style={{ bottom: `${targetPercentage}%` }}
          />
          {/* Peak hold indicator */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white opacity-80"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-2 rounded-lg">
            <BarChart3 className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Real-Time Analysis</h3>
            <p className="text-sm text-gray-400">Live audio monitoring & visualization</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Tab Navigation */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'overview' 
                  ? 'bg-crys-gold text-gray-900 shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'detailed' 
                  ? 'bg-crys-gold text-gray-900 shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Spectrum</span>
            </button>
            <button
              onClick={() => setActiveTab('stereo')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'stereo' 
                  ? 'bg-crys-gold text-gray-900 shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Stereo Field</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
          >
            <Settings className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
          <h4 className="text-lg font-semibold text-crys-gold mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Analysis Settings
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 font-medium">LUFS Target</label>
              <input
                type="range"
                min="-30"
                max="-10"
                step="0.1"
                value={meterSettings.lufsTarget}
                onChange={(e) => updateMeterSetting('lufsTarget', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{meterSettings.lufsTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-medium">Peak Target</label>
              <input
                type="range"
                min="-3"
                max="0"
                step="0.1"
                value={meterSettings.peakTarget}
                onChange={(e) => updateMeterSetting('peakTarget', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{meterSettings.peakTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-medium">RMS Target</label>
              <input
                type="range"
                min="-20"
                max="-8"
                step="0.1"
                value={meterSettings.rmsTarget}
                onChange={(e) => updateMeterSetting('rmsTarget', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{meterSettings.rmsTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-medium">Correlation Target</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={meterSettings.correlationTarget}
                onChange={(e) => updateMeterSetting('correlationTarget', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{meterSettings.correlationTarget}</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-medium">Refresh Rate</label>
              <input
                type="range"
                min="30"
                max="120"
                step="1"
                value={meterSettings.refreshRate}
                onChange={(e) => updateMeterSetting('refreshRate', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{meterSettings.refreshRate} Hz</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-medium">Smoothing</label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={meterSettings.smoothing}
                onChange={(e) => updateMeterSetting('smoothing', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-400">{meterSettings.smoothing}</span>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab - Main Meters */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Primary Meters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MeterBar 
              value={meterData.lufs} 
              target={meterSettings.lufsTarget} 
              label="LUFS" 
              unit="dB"
              colorGradient="from-red-500 via-yellow-500 to-green-500"
              maxValue={-10}
              minValue={-30}
            />
            <MeterBar 
              value={meterData.peak} 
              target={meterSettings.peakTarget} 
              label="Peak" 
              unit="dB"
              colorGradient="from-green-500 via-yellow-500 to-red-500"
              maxValue={0}
              minValue={-60}
            />
            <MeterBar 
              value={meterData.correlation} 
              target={meterSettings.correlationTarget} 
              label="Correlation" 
              unit=""
              colorGradient="from-red-500 via-yellow-500 to-green-500"
              maxValue={1}
              minValue={-1}
            />
            <MeterBar 
              value={meterData.rms} 
              target={meterSettings.rmsTarget} 
              label="RMS" 
              unit="dB"
              colorGradient="from-green-500 via-yellow-500 to-red-500"
              maxValue={-8}
              minValue={-20}
            />
          </div>

          {/* Stereo Meters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="text-center mb-3">
                <span className="text-sm font-medium text-gray-300 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Left Channel
                </span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 bg-gray-800 rounded-lg h-24 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-cyan-400 absolute bottom-0 left-0 right-0 transition-all duration-150"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.leftLevel + 60) * 1.67))}%` }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-sm font-bold text-white">{meterData.leftLevel.toFixed(1)}dB</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg h-24 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-t from-green-500 to-emerald-400 absolute bottom-0 left-0 right-0 transition-all duration-150"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.leftLevel + 60) * 1.67))}%` }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-sm font-bold text-white">{meterData.leftLevel.toFixed(1)}dB</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2 text-gray-400">
                <span>Peak</span>
                <span>RMS</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="text-center mb-3">
                <span className="text-sm font-medium text-gray-300 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Right Channel
                </span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 bg-gray-800 rounded-lg h-24 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-cyan-400 absolute bottom-0 left-0 right-0 transition-all duration-150"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.rightLevel + 60) * 1.67))}%` }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-sm font-bold text-white">{meterData.rightLevel.toFixed(1)}dB</span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg h-24 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-t from-green-500 to-emerald-400 absolute bottom-0 left-0 right-0 transition-all duration-150"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.rightLevel + 60) * 1.67))}%` }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-sm font-bold text-white">{meterData.rightLevel.toFixed(1)}dB</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2 text-gray-400">
                <span>Peak</span>
                <span>RMS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Tab - Frequency Spectrum */}
      {activeTab === 'detailed' && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-crys-gold flex items-center justify-center">
              <Waves className="w-5 h-5 mr-2" />
              Frequency Spectrum Analysis
            </h4>
            <p className="text-sm text-gray-400 mt-1">Real-time frequency domain visualization</p>
          </div>
          <div className="relative">
            <canvas
              ref={frequencyCanvasRef}
              width={800}
              height={300}
              className="w-full h-64 bg-gray-800 rounded-lg border border-gray-600"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded px-2 py-1">
              <span className="text-xs text-gray-300">Live Spectrum</span>
            </div>
          </div>
        </div>
      )}

      {/* Stereo Tab - Goniometer */}
      {activeTab === 'stereo' && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-crys-gold flex items-center justify-center">
              <Radio className="w-5 h-5 mr-2" />
              Stereo Field Analysis
            </h4>
            <p className="text-sm text-gray-400 mt-1">Real-time stereo correlation and field visualization</p>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={goniometerCanvasRef}
                width={400}
                height={400}
                className="w-80 h-80 bg-gray-800 rounded-lg border border-gray-600"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded px-2 py-1">
                <span className="text-xs text-gray-300">Correlation: {meterData.correlation.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-400">
              <div>
                <span className="font-medium">L:</span> Left Channel
              </div>
              <div>
                <span className="font-medium">R:</span> Right Channel
              </div>
              <div>
                <span className="font-medium">C:</span> Center
              </div>
              <div>
                <span className="font-medium">S:</span> Side
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default RealTimeMeters;
