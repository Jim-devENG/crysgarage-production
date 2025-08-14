import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, Settings, Target, Gauge, Activity, Radio, Zap, Volume2, Waves } from 'lucide-react';
import FrequencyMeter from './meters/FrequencyMeter';
import Goniometer from './meters/Goniometer';
import CorrelationMeter from './meters/CorrelationMeter';
import LUFSMeter from './meters/LUFSMeter';
import StereoMeter from './meters/StereoMeter';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'stereo'>('overview');
  const [meterSettings, setMeterSettings] = useState({
    lufsTarget: -14,
    peakTarget: -1,
    rmsTarget: -12,
    correlationTarget: 0.8,
    refreshRate: 60,
    smoothing: 0.1
  });

  const updateMeterSetting = (key: string, value: number) => {
    setMeterSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-2 rounded-lg">
            <Gauge className="w-5 h-5 text-gray-900" />
          </div>
          <h3 className="text-xl font-bold text-white">Real-Time Meters</h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'detailed'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Detailed
          </button>
          <button
            onClick={() => setActiveTab('stereo')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stereo'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Stereo
          </button>
        </div>
      </div>

      {/* Meter Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LUFS Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <LUFSMeter 
                value={meterData.lufs} 
                target={meterSettings.lufsTarget}
                label="LUFS"
              />
            </div>

            {/* Stereo Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <StereoMeter 
                leftLevel={meterData.leftLevel}
                rightLevel={meterData.rightLevel}
                peak={meterData.peak}
                rms={meterData.rms}
              />
            </div>

            {/* Correlation Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <CorrelationMeter 
                value={meterData.correlation}
                target={meterSettings.correlationTarget}
              />
            </div>

            {/* Frequency Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <FrequencyMeter 
                frequencyData={meterData.frequencyData}
                title="Frequency Spectrum"
              />
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {/* Detailed LUFS Analysis */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">LUFS Analysis</h4>
              <LUFSMeter 
                value={meterData.lufs} 
                target={meterSettings.lufsTarget}
                detailed={true}
                label="Integrated LUFS"
              />
            </div>

            {/* Detailed Stereo Analysis */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Analysis</h4>
              <StereoMeter 
                leftLevel={meterData.leftLevel}
                rightLevel={meterData.rightLevel}
                peak={meterData.peak}
                rms={meterData.rms}
                detailed={true}
              />
            </div>

            {/* Detailed Frequency Analysis */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Frequency Analysis</h4>
              <FrequencyMeter 
                frequencyData={meterData.frequencyData}
                title="Detailed Spectrum"
                detailed={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'stereo' && (
          <div className="space-y-6">
            {/* Goniometer */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Field (Goniometer)</h4>
              <Goniometer 
                goniometerData={meterData.goniometerData}
              />
            </div>

            {/* Correlation Meter */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Correlation</h4>
              <CorrelationMeter 
                value={meterData.correlation}
                target={meterSettings.correlationTarget}
                detailed={true}
              />
            </div>

            {/* Stereo Balance */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Stereo Balance</h4>
              <StereoMeter 
                leftLevel={meterData.leftLevel}
                rightLevel={meterData.rightLevel}
                peak={meterData.peak}
                rms={meterData.rms}
                showBalance={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Meter Settings
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">LUFS Target</label>
            <input
              type="range"
              min="-30"
              max="-5"
              step="0.1"
              value={meterSettings.lufsTarget}
              onChange={(e) => updateMeterSetting('lufsTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.lufsTarget} dB</span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Peak Target</label>
            <input
              type="range"
              min="-10"
              max="0"
              step="0.1"
              value={meterSettings.peakTarget}
              onChange={(e) => updateMeterSetting('peakTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.peakTarget} dB</span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">RMS Target</label>
            <input
              type="range"
              min="-20"
              max="-5"
              step="0.1"
              value={meterSettings.rmsTarget}
              onChange={(e) => updateMeterSetting('rmsTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.rmsTarget} dB</span>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Correlation Target</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={meterSettings.correlationTarget}
              onChange={(e) => updateMeterSetting('correlationTarget', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-white">{meterSettings.correlationTarget}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMeters;
