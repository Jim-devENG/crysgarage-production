// Shared genre presets and design helpers reused from Professional tier

export const GENRE_PRESETS: Record<string, any> = {
  afrobeats: {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.0, high: 0.5 },
    truePeak: -0.1,
    targetLufs: -7.0,
    gDigitalTape: { saturation: 15, enabled: true },
    gMultiBand: { 
      thresholds: [-20, -18, -16], 
      ratios: [3, 4, 5], 
      enabled: true 
    }
  },
  trap: {
    gain: 2.2,
    compression: { threshold: -14, ratio: 6, attack: 0.001, release: 0.08 },
    eq: { low: 3.5, mid: 1.2, high: 0.6 },
    truePeak: -0.1,
    targetLufs: -7.2,
    gDigitalTape: { saturation: 25, enabled: true },
    gMultiBand: { 
      thresholds: [-18, -16, -14], 
      ratios: [4, 6, 8], 
      enabled: true 
    }
  },
  drill: {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.8, high: 0.7 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  dubstep: {
    gain: 2.5,
    compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
    eq: { low: 4.0, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  gospel: {
    gain: 1.4,
    compression: { threshold: -22, ratio: 2.5, attack: 0.01, release: 0.15 },
    eq: { low: 1.5, mid: 2.0, high: 1.0 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  'r-b': {
    gain: 1.3,
    compression: { threshold: -24, ratio: 2.2, attack: 0.015, release: 0.2 },
    eq: { low: 1.2, mid: 2.5, high: 1.8 },
    truePeak: -0.35,
    targetLufs: -8.8
  },
  'lofi-hiphop': {
    gain: 1.1,
    compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.3 },
    eq: { low: 0.8, mid: 1.5, high: 1.2 },
    truePeak: -0.4,
    targetLufs: -9.0
  },
  'hip-hop': {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.5, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -7.8,
    gDigitalTape: { saturation: 20, enabled: true },
    gMultiBand: { 
      thresholds: [-20, -18, -16], 
      ratios: [3, 5, 7], 
      enabled: true 
    }
  },
  house: {
    gain: 1.9,
    compression: { threshold: -17, ratio: 4.5, attack: 0.002, release: 0.15 },
    eq: { low: 2.5, mid: 1.8, high: 1.0 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  techno: {
    gain: 2.1,
    compression: { threshold: -15, ratio: 5.5, attack: 0.001, release: 0.08 },
    eq: { low: 3.2, mid: 1.6, high: 0.9 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  highlife: {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 2.2, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -8.2
  },
  instrumentals: {
    gain: 1.4,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  beats: {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.2 },
    eq: { low: 2.2, mid: 1.8, high: 1.0 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  amapiano: {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
    eq: { low: 2.2, mid: 1.8, high: 1.5 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  trance: {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.5, high: 1.8 },
    truePeak: -0.15,
    targetLufs: -7.8
  },
  'drum-bass': {
    gain: 2.3,
    compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
    eq: { low: 3.8, mid: 1.4, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  reggae: {
    gain: 1.5,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.3 },
    eq: { low: 2.5, mid: 1.2, high: 0.6 },
    truePeak: -0.25,
    targetLufs: -8.2
  },
  'voice-over': {
    gain: 1.2,
    compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
    eq: { low: 0.8, mid: 2.8, high: 2.2 },
    truePeak: -0.4,
    targetLufs: -9.2
  },
  journalist: {
    gain: 1.1,
    compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.5 },
    eq: { low: 0.6, mid: 3.0, high: 2.5 },
    truePeak: -0.45,
    targetLufs: -9.5
  },
  soul: {
    gain: 1.3,
    compression: { threshold: -23, ratio: 2.2, attack: 0.015, release: 0.2 },
    eq: { low: 1.2, mid: 2.5, high: 1.8 },
    truePeak: -0.35,
    targetLufs: -8.8
  },
  'content-creator': {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  pop: {
    gain: 1.5,
    compression: { threshold: -20, ratio: 3, attack: 0.003, release: 0.25 },
    eq: { low: 1.5, mid: 1.0, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -8.0
  },
  jazz: {
    gain: 1.2,
    compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
    eq: { low: 1.0, mid: 1.8, high: 2.0 },
    truePeak: -0.4,
    targetLufs: -9.0
  },
  'crysgarage': {
    gain: 2.1,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 3.2, mid: 2.2, high: 1.5 },
    truePeak: -0.15,
    targetLufs: -7.8
  }
};

export const getGenreGradient = (genreId: string) => {
  const colorMap: Record<string, string> = {
    afrobeats: 'from-red-500 to-red-700',
    trap: 'from-red-400 to-red-600',
    drill: 'from-red-600 to-red-800',
    dubstep: 'from-red-300 to-red-500',
    gospel: 'from-blue-500 to-blue-700',
    'r-b': 'from-blue-400 to-blue-600',
    'lofi-hiphop': 'from-blue-600 to-blue-800',
    'hip-hop': 'from-orange-500 to-orange-700',
    house: 'from-orange-400 to-orange-600',
    techno: 'from-orange-600 to-orange-800',
    highlife: 'from-green-500 to-green-700',
    instrumentals: 'from-green-400 to-green-600',
    beats: 'from-green-600 to-green-800',
    amapiano: 'from-purple-500 to-purple-700',
    trance: 'from-purple-400 to-purple-600',
    'drum-bass': 'from-purple-600 to-purple-800',
    reggae: 'from-yellow-500 to-yellow-700',
    'voice-over': 'from-yellow-400 to-yellow-600',
    journalist: 'from-yellow-600 to-yellow-800',
    soul: 'from-pink-500 to-pink-700',
    'content-creator': 'from-pink-400 to-pink-600',
    pop: 'from-pink-600 to-pink-800',
    jazz: 'from-indigo-500 to-indigo-700',
    'crysgarage': 'from-orange-500 to-orange-700'
  };
  return colorMap[genreId] || 'from-gray-500 to-gray-600';
};

// Helper to convert preset multipliers to dB values for 3-band EQ
export const multiplierToDb = (multiplier: number): number => {
  if (multiplier <= 0) return 0;
  return Math.round(20 * Math.log10(multiplier) * 10) / 10; // one decimal
};


