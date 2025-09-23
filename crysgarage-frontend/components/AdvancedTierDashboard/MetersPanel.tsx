import React from 'react';

interface MeterProps {
  label: string;
  value: number; // in dB / LUFS
  min: number;
  max: number;
  unit?: string;
}

const VerticalMeter: React.FC<MeterProps> = ({ label, value, min, max, unit = '' }) => {
  const clamped = Math.max(min, Math.min(max, value));
  const span = max - min;
  const pct = ((clamped - min) / span) * 100; // 0..100

  return (
    <div className="bg-audio-panel-bg border border-crys-gold/20 rounded-none p-3 h-full flex flex-col items-center">
      <div className="text-xs text-white font-semibold mb-2">{label}</div>
      <div className="relative h-48 w-4 bg-gray-800 rounded">
        <div className="absolute bottom-0 left-0 right-0 bg-crys-gold rounded" style={{ height: `${pct}%` }} />
      </div>
      <div className="text-[10px] text-crys-gold font-semibold mt-2">{value.toFixed(1)}{unit}</div>
      <div className="w-12 flex justify-between text-[9px] text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

interface MetersPanelProps {
  lufs: number;
  rmsDb: number;
  peakDb: number;
}

const MetersPanel: React.FC<MetersPanelProps> = ({ lufs, rmsDb, peakDb }) => {
  return (
    <div className="grid grid-cols-3 gap-0 h-full">
      <VerticalMeter label="LUFS" value={lufs} min={-70} max={0} unit=" LUFS" />
      <VerticalMeter label="RMS" value={rmsDb} min={-70} max={0} unit=" dB" />
      <VerticalMeter label="Peak" value={peakDb} min={-70} max={0} unit=" dB" />
    </div>
  );
};

export default MetersPanel;


