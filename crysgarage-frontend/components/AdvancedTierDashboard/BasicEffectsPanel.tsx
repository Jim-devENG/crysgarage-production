import React, { useMemo } from 'react';

type EqBand = { frequency: number; gain: number; q: number; type: 'lowshelf' | 'peaking' | 'highshelf' };

export interface BasicEffectsState {
  eq: { bands: EqBand[]; enabled: boolean };
  compressor: { threshold: number; ratio: number; attack: number; release: number; enabled: boolean };
  stereoWidener: { width: number; enabled: boolean };
  loudness: { gain: number; enabled: boolean };
  limiter: { threshold: number; ceiling: number; enabled: boolean };
}

interface BasicEffectsPanelProps {
  effects: BasicEffectsState;
  onChange: (next: Partial<BasicEffectsState>) => void;
  onApply?: (next: Partial<BasicEffectsState>) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const VerticalSlider: React.FC<{ value: number; min: number; max: number; step?: number; onChange: (v: number) => void; height?: number; unit?: string }>
  = ({ value, min, max, step = 0.5, onChange, height = 220, unit = '' }) => (
  <div className="flex flex-col items-center justify-center" style={{ height }}>
    <div className="text-[10px] text-crys-gold font-semibold mb-1">{value}{unit}</div>
    <div className="flex items-center justify-center" style={{ height: height - 24 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="appearance-none accent-crys-gold"
        style={{
          writingMode: 'bt-lr' as any,
          WebkitAppearance: 'slider-vertical',
          width: 8,
          height: height - 40,
          background: 'transparent'
        }}
      />
    </div>
    <div className="w-12 flex justify-between text-[9px] text-gray-500 mt-1">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const Section: React.FC<{ index: number; title: string; children: React.ReactNode }>= ({ index, title, children }) => (
  <div className="bg-audio-panel-bg border border-crys-gold/20 rounded-none p-3 md:p-4 h-full min-h-[240px]">
    <div className="flex items-center mb-3 text-sm font-semibold text-white">{title}</div>
    {children}
  </div>
);

export const BasicEffectsPanel: React.FC<BasicEffectsPanelProps> = ({ effects, onChange, onApply }) => {
  const [lo, mid, hi] = useMemo(() => {
    const b = effects.eq.bands;
    return [b[0]?.gain ?? 0, b[3]?.gain ?? 0, b[6]?.gain ?? 0];
  }, [effects.eq.bands]);

  const handleEq = (band: 'lo' | 'mid' | 'hi', gain: number) => {
    const newBands = [...effects.eq.bands];
    if (band === 'lo') newBands[0] = { ...newBands[0], gain: clamp(gain, -12, 12) };
    if (band === 'mid') newBands[3] = { ...newBands[3], gain: clamp(gain, -12, 12) };
    if (band === 'hi') newBands[6] = { ...newBands[6], gain: clamp(gain, -12, 12) };
    const next = { eq: { ...effects.eq, bands: newBands } } as Partial<BasicEffectsState>;
    onChange(next);
    onApply?.(next);
  };

  const handleComp = (key: 'threshold'|'ratio'|'attack'|'release', value: number) => {
    const next = { compressor: { ...effects.compressor, [key]: value } } as Partial<BasicEffectsState>;
    onChange(next);
    onApply?.(next);
  };

  const handleWidth = (value: number) => {
    const next = { stereoWidener: { ...effects.stereoWidener, width: value } } as Partial<BasicEffectsState>;
    onChange(next);
    onApply?.(next);
  };

  const handleLoudness = (value: number) => {
    const next = { loudness: { ...effects.loudness, gain: value } } as Partial<BasicEffectsState>;
    onChange(next);
    onApply?.(next);
  };

  const handleLimiter = (value: number) => {
    const next = { limiter: { ...effects.limiter, ceiling: value } } as Partial<BasicEffectsState>;
    onChange(next);
    onApply?.(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-2 justify-items-stretch">
        <Section index={1} title="Equalization">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">Lo</div>
              <VerticalSlider value={lo} min={-12} max={12} unit=" dB" onChange={(v)=>handleEq('lo', v)} />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">Mid</div>
              <VerticalSlider value={mid} min={-12} max={12} unit=" dB" onChange={(v)=>handleEq('mid', v)} />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">Hi</div>
              <VerticalSlider value={hi} min={-12} max={12} unit=" dB" onChange={(v)=>handleEq('hi', v)} />
            </div>
          </div>
        </Section>

        <Section index={2} title="Compressor">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Threshold</div>
            <VerticalSlider value={effects.compressor.threshold} min={-40} max={0} step={1} unit=" dB" onChange={(v)=>handleComp('threshold', v)} />
          </div>
        </Section>

        <Section index={3} title="Stereo Width">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Width</div>
            <VerticalSlider value={effects.stereoWidener.width} min={0} max={200} step={1} unit=" %" onChange={handleWidth} />
          </div>
        </Section>

        <Section index={4} title="Volume">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Output Gain</div>
            <VerticalSlider value={effects.loudness.gain} min={-12} max={12} unit=" dB" onChange={handleLoudness} />
          </div>
        </Section>

        <Section index={5} title="Brickwall Limiter">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Ceiling</div>
            <VerticalSlider value={effects.limiter.ceiling} min={-3} max={-0.1} step={0.1} unit=" dBFS" onChange={handleLimiter} />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default BasicEffectsPanel;


