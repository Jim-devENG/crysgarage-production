import React, { useState } from 'react';
import FrequencyMeter from './meters/FrequencyMeter';
import CompactFrequencyAnalyzer from './CompactFrequencyAnalyzer';
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
  return (
    <div className="space-y-4">
      {/* Professional Frequency Spectrum Analyzer */}
      <CompactFrequencyAnalyzer 
        meterData={{
          lufs: meterData.lufs,
          peak: meterData.peak,
          rms: meterData.rms,
          correlation: meterData.correlation,
          leftLevel: meterData.leftLevel,
          rightLevel: meterData.rightLevel,
          frequencyData: meterData.frequencyData,
          goniometerData: []
        }}
        isAnalyzing={false}
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
