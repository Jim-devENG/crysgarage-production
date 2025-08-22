import React, { useState } from 'react';
import FrequencyMeter from './meters/FrequencyMeter';
import AutoAdjustmentPanel from './AutoAdjustmentPanel';

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftLevel: number;
  rightLevel: number;
  frequencyData: number[];
}

interface MeterSettings {
  lufsTarget: number;
  peakTarget: number;
  rmsTarget: number;
  correlationTarget: number;
}

interface AutoAdjust {
  lufs: boolean;
  peak: boolean;
  rms: boolean;
  correlation: boolean;
}

interface RealTimeMetersProps {
  meterData: MeterData;
  meterSettings: MeterSettings;
  autoAdjust: AutoAdjust;
  audioEffects?: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onManualInit: () => void;
}

const RealTimeMeters: React.FC<RealTimeMetersProps> = ({
  meterData,
  meterSettings,
  autoAdjust,
  audioEffects,
  onUpdateEffectSettings,
  onManualInit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'detailed'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Detailed
        </button>
      </div>

      {/* Frequency Spectrum */}
      <FrequencyMeter
        frequencyData={meterData.frequencyData}
        title="Frequency Spectrum"
        detailed={activeTab === 'detailed'}
        compact={false}
      />

      {/* Auto-Adjustment Panel */}
      <AutoAdjustmentPanel
        meterData={meterData}
        meterSettings={meterSettings}
        autoAdjust={autoAdjust}
        onUpdateEffectSettings={onUpdateEffectSettings}
      />
    </div>
  );
};

export default RealTimeMeters;
