// LUFS Measurement Types - ITU-R BS.1770-4/5 & EBU R128 compliant

export interface LufsFrame {
  time: number; // seconds
  momentary: { value: number | null; state: "ok" | "insufficient_signal" };
  shortTerm: { value: number | null; state: "ok" | "insufficient_signal" };
  integrated: { value: number | null; state: "ok" | "insufficient_signal" };
  truePeakDbtp: number | null;
  crestFactorDb?: number | null; // optional: dBTP - shortTermRMS_dBFS
  gainToTargetDb?: number | null; // if integrated ok: (targetLufs - integrated.value)
}

export interface LufsOptions {
  targetLufs?: number; // default -14 for streaming
  updateIntervalMs?: number; // default 100
  oversampleFactor?: number; // default 4 for true peak
}

export interface LufsMeasurement {
  momentary: number | null;
  shortTerm: number | null;
  integrated: number | null;
  truePeak: number | null;
  crestFactor: number | null;
  gainToTarget: number | null;
  state: {
    momentary: "ok" | "insufficient_signal";
    shortTerm: "ok" | "insufficient_signal";
    integrated: "ok" | "insufficient_signal";
  };
}

// Constants from ITU-R BS.1770-4
export const LUFS_CONSTANTS = {
  ABSOLUTE_GATE: -70, // LUFS
  RELATIVE_GATE_OFFSET: -10, // LU
  MOMENTARY_WINDOW: 0.4, // seconds
  SHORT_TERM_WINDOW: 3.0, // seconds
  BLOCK_SIZE: 0.1, // seconds for integrated gating
  UI_DECAY_TIME: 0.5, // seconds
  DEFAULT_TARGET: -14, // LUFS for streaming
  DEFAULT_UPDATE_INTERVAL: 100, // ms
  DEFAULT_OVERSAMPLE_FACTOR: 4 // for true peak
} as const;

// Target LUFS values for different platforms
export const TARGET_LUFS = {
  STREAMING: -14, // Spotify, Apple Music, etc.
  BROADCAST: -23, // EBU R128
  YOUTUBE: -14, // YouTube Music
  PODCAST: -16, // Podcast platforms
  CUSTOM: -14 // User-defined
} as const;
