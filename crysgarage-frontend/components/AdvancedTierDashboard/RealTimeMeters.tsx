import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, Settings, Target, Gauge, Activity, Radio } from 'lucide-react';

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftPeak: number;
  rightPeak: number;
  leftRms: number;
  rightRms: number;
  frequencyData: number[];
  goniometerData: { left: number; right: number }[];
}

interface RealTimeMetersProps {
  meterData: MeterData;
}

const RealTimeMeters: React.FC<RealTimeMetersProps> = ({ meterData }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'meters' | 'frequency' | 'goniometer'>('meters');
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

  // Frequency Spectrum Visualization
  useEffect(() => {
    const canvas = frequencyCanvasRef.current;
    if (!canvas || !meterData.frequencyData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw frequency spectrum
    const barWidth = width / meterData.frequencyData.length;
    
    meterData.frequencyData.forEach((value, index) => {
      const barHeight = (value / 255) * height;
      const x = index * barWidth;
      const y = height - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, '#10b981'); // Green
      gradient.addColorStop(0.5, '#f59e0b'); // Yellow
      gradient.addColorStop(1, '#ef4444'); // Red

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw frequency labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    frequencies.forEach(freq => {
      const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
      ctx.fillText(`${freq}Hz`, x, height - 5);
    });
  }, [meterData.frequencyData]);

  // Goniometer Visualization
  useEffect(() => {
    const canvas = goniometerCanvasRef.current;
    if (!canvas || !meterData.goniometerData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, height - 20);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(20, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();
    
    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width - 20, 20);
    ctx.lineTo(20, height - 20);
    ctx.stroke();

    // Draw goniometer data
    if (meterData.goniometerData.length > 0) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      meterData.goniometerData.forEach((point, index) => {
        const x = centerX + (point.left - point.right) * radius;
        const y = centerY - (point.left + point.right) * radius / 2;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }

    // Draw center point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();
  }, [meterData.goniometerData]);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-crys-gold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Real-Time Analysis
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('meters')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === 'meters' ? 'bg-crys-gold text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Gauge className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === 'frequency' ? 'bg-crys-gold text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('goniometer')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === 'goniometer' ? 'bg-crys-gold text-gray-900' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meter Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h4 className="text-lg font-semibold text-crys-gold mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Meter Settings
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">LUFS Target</label>
              <input
                type="range"
                min="-30"
                max="-10"
                step="0.1"
                value={meterSettings.lufsTarget}
                onChange={(e) => updateMeterSetting('lufsTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.lufsTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Peak Target</label>
              <input
                type="range"
                min="-3"
                max="0"
                step="0.1"
                value={meterSettings.peakTarget}
                onChange={(e) => updateMeterSetting('peakTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.peakTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">RMS Target</label>
              <input
                type="range"
                min="-20"
                max="-8"
                step="0.1"
                value={meterSettings.rmsTarget}
                onChange={(e) => updateMeterSetting('rmsTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.rmsTarget} dB</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Correlation Target</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={meterSettings.correlationTarget}
                onChange={(e) => updateMeterSetting('correlationTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.correlationTarget}</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Refresh Rate (Hz)</label>
              <input
                type="range"
                min="30"
                max="120"
                step="1"
                value={meterSettings.refreshRate}
                onChange={(e) => updateMeterSetting('refreshRate', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.refreshRate} Hz</span>
            </div>
            <div>
              <label className="text-sm text-gray-400">Smoothing</label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={meterSettings.smoothing}
                onChange={(e) => updateMeterSetting('smoothing', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{meterSettings.smoothing}</span>
            </div>
          </div>
        </div>
      )}

      {/* Meters Tab */}
      {activeTab === 'meters' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* LUFS Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-gray-400">LUFS</span>
                <div className="text-xs text-gray-500">Target: {meterSettings.lufsTarget}dB</div>
              </div>
              <div className="bg-gray-800 rounded h-32 relative">
                <div 
                  className="bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                  style={{ height: `${Math.max(0, Math.min(100, (meterData.lufs + 60) * 1.67))}%` }}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-lg font-bold">{meterData.lufs.toFixed(1)}</span>
                </div>
                {/* Target line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-white border-dashed"
                  style={{ bottom: `${Math.max(0, Math.min(100, (meterSettings.lufsTarget + 60) * 1.67))}%` }}
                />
              </div>
            </div>

            {/* Peak Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-gray-400">Peak</span>
                <div className="text-xs text-gray-500">Target: {meterSettings.peakTarget}dB</div>
              </div>
              <div className="bg-gray-800 rounded h-32 relative">
                <div 
                  className="bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                  style={{ height: `${Math.max(0, Math.min(100, (meterData.peak + 60) * 1.67))}%` }}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-lg font-bold">{meterData.peak.toFixed(1)}</span>
                </div>
                {/* Target line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-white border-dashed"
                  style={{ bottom: `${Math.max(0, Math.min(100, (meterSettings.peakTarget + 60) * 1.67))}%` }}
                />
              </div>
            </div>

            {/* Correlation Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-gray-400">Correlation</span>
                <div className="text-xs text-gray-500">Target: {meterSettings.correlationTarget}</div>
              </div>
              <div className="bg-gray-800 rounded h-32 relative">
                <div 
                  className="bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                  style={{ height: `${meterData.correlation * 100}%` }}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-lg font-bold">{meterData.correlation.toFixed(2)}</span>
                </div>
                {/* Target line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-white border-dashed"
                  style={{ bottom: `${meterSettings.correlationTarget * 100}%` }}
                />
              </div>
            </div>

            {/* RMS Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-gray-400">RMS</span>
                <div className="text-xs text-gray-500">Target: {meterSettings.rmsTarget}dB</div>
              </div>
              <div className="bg-gray-800 rounded h-32 relative">
                <div 
                  className="bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                  style={{ height: `${Math.max(0, Math.min(100, (meterData.rms + 60) * 1.67))}%` }}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-lg font-bold">{meterData.rms.toFixed(1)}</span>
                </div>
                {/* Target line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-white border-dashed"
                  style={{ bottom: `${Math.max(0, Math.min(100, (meterSettings.rmsTarget + 60) * 1.67))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Left/Right Meters */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-gray-400">Left Channel</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 bg-gray-800 rounded h-24 relative">
                  <div 
                    className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.leftPeak + 60) * 1.67))}%` }}
                  />
                </div>
                <div className="flex-1 bg-gray-800 rounded h-24 relative">
                  <div 
                    className="bg-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.leftRms + 60) * 1.67))}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Peak: {meterData.leftPeak.toFixed(1)}</span>
                <span>RMS: {meterData.leftRms.toFixed(1)}</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-center mb-2">
                <span className="text-sm text-gray-400">Right Channel</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 bg-gray-800 rounded h-24 relative">
                  <div 
                    className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.rightPeak + 60) * 1.67))}%` }}
                  />
                </div>
                <div className="flex-1 bg-gray-800 rounded h-24 relative">
                  <div 
                    className="bg-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                    style={{ height: `${Math.max(0, Math.min(100, (meterData.rightRms + 60) * 1.67))}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Peak: {meterData.rightPeak.toFixed(1)}</span>
                <span>RMS: {meterData.rightRms.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Frequency Spectrum Tab */}
      {activeTab === 'frequency' && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-4">
            <span className="text-lg font-semibold text-crys-gold">Frequency Spectrum</span>
          </div>
          <canvas
            ref={frequencyCanvasRef}
            width={800}
            height={300}
            className="w-full h-64 bg-gray-800 rounded"
          />
        </div>
      )}

      {/* Goniometer Tab */}
      {activeTab === 'goniometer' && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-center mb-4">
            <span className="text-lg font-semibold text-crys-gold">Goniometer (Stereo Field)</span>
          </div>
          <canvas
            ref={goniometerCanvasRef}
            width={400}
            height={400}
            className="w-full h-80 bg-gray-800 rounded mx-auto"
          />
          <div className="text-center mt-2 text-sm text-gray-400">
            Left/Right correlation visualization
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMeters;
