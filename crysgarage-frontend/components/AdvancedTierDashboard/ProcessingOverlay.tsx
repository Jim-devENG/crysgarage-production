import React from 'react';
import { CheckCircle2, Loader2, Music, Zap, Waves, Gauge, Activity } from 'lucide-react';

interface ProcessingOverlayProps {
  visible: boolean;
  currentStepIndex: number;
  steps: string[];
  subtitle?: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ visible, currentStepIndex, steps, subtitle }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl mx-4 rounded-2xl border border-crys-gold/30 bg-gradient-to-b from-[#1a1a1e] to-[#0e0e11] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-crys-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-crys-gold/20 border border-crys-gold/40">
              <Music className="w-5 h-5 text-crys-gold" />
            </div>
            <div>
              <div className="text-white font-semibold text-lg">Mastering in Progress</div>
              <div className="text-xs text-crys-light-grey">{subtitle || 'Applying genre chain on the server'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-crys-gold">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Processing…</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Animated hero */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-2 border-crys-gold/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-crys-gold/60 animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full bg-crys-gold/15 flex items-center justify-center">
                <Waves className="w-8 h-8 text-crys-gold" />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isDone = idx < currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                    isDone
                      ? 'border-green-500/40 bg-green-500/10'
                      : isActive
                        ? 'border-crys-gold/50 bg-crys-gold/10'
                        : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center ${
                    isDone ? 'bg-green-500/20' : isActive ? 'bg-crys-gold/20' : 'bg-gray-800'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-crys-gold animate-spin" />
                    ) : (
                      <Activity className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{step}</div>
                    <div className="text-[11px] text-gray-400">
                      {isActive ? 'Running…' : isDone ? 'Completed' : 'Queued'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-crys-gold" />
              Optimized chain: Compression • Stereo • Limiting • Normalization
            </div>
            <div className="opacity-75">Do not close this window</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;



