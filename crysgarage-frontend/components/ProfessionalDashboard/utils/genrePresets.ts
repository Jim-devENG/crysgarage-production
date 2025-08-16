import { GenrePreset } from '../types';

export const GENRE_PRESETS: Record<string, GenrePreset> = {
  // RED - High Energy, Bass Heavy (Loud & Aggressive)
  afrobeats: {
    gain: 3.2,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.0, high: 0.5 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  trap: {
    gain: 3.8,
    compression: { threshold: -14, ratio: 6, attack: 0.001, release: 0.08 },
    eq: { low: 3.5, mid: 1.2, high: 0.6 },
    truePeak: -0.1,
    targetLufs: -7.2
  },
  drill: {
    gain: 3.5,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.8, high: 0.7 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  dubstep: {
    gain: 4.2,
    compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
    eq: { low: 4.0, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  
  // BLUE - Smooth, Melodic (Gentle & Warm)
  gospel: {
    gain: 2.8,
    compression: { threshold: -22, ratio: 2.5, attack: 0.01, release: 0.15 },
    eq: { low: 1.5, mid: 2.0, high: 1.0 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  'lofi-hiphop': {
    gain: 2.2,
    compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.3 },
    eq: { low: 0.8, mid: 1.5, high: 1.2 },
    truePeak: -0.4,
    targetLufs: -9.0
  },
  
  // ORANGE - Energetic, Dynamic (Punchy & Clear)
  'crysgarage': {
    gain: 3.4,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 3.2, mid: 2.2, high: 1.5 },
    truePeak: -0.15,
    targetLufs: -7.8
  },
  house: {
    gain: 3.2,
    compression: { threshold: -17, ratio: 4.5, attack: 0.002, release: 0.15 },
    eq: { low: 2.5, mid: 1.8, high: 1.0 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  techno: {
    gain: 3.8,
    compression: { threshold: -15, ratio: 5.5, attack: 0.001, release: 0.08 },
    eq: { low: 3.2, mid: 1.6, high: 0.9 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  
  // GREEN - Natural, Organic (Balanced & Warm)
  highlife: {
    gain: 2.9,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 2.2, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -8.2
  },
  instrumentals: {
    gain: 2.6,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  beats: {
    gain: 3.0,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.2 },
    eq: { low: 2.2, mid: 1.8, high: 1.0 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  
  // PURPLE - Creative, Artistic (Dynamic & Expressive)
  amapiano: {
    gain: 3.0,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
    eq: { low: 2.2, mid: 1.8, high: 1.5 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  trance: {
    gain: 3.2,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.5, high: 1.8 },
    truePeak: -0.15,
    targetLufs: -7.8
  },
  'drum-bass': {
    gain: 4.0,
    compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
    eq: { low: 3.8, mid: 1.4, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  
  // YELLOW - Bright, Clear (Crisp & Present)
  reggae: {
    gain: 2.8,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.3 },
    eq: { low: 2.5, mid: 1.2, high: 0.6 },
    truePeak: -0.25,
    targetLufs: -8.2
  },
  'voice-over': {
    gain: 2.4,
    compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
    eq: { low: 0.8, mid: 2.8, high: 2.2 },
    truePeak: -0.4,
    targetLufs: -9.2
  },
  journalist: {
    gain: 2.2,
    compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.5 },
    eq: { low: 0.6, mid: 3.0, high: 2.5 },
    truePeak: -0.45,
    targetLufs: -9.5
  },
  
  // PINK - Warm, Emotional (Smooth & Intimate)
  soul: {
    gain: 2.6,
    compression: { threshold: -23, ratio: 2.2, attack: 0.015, release: 0.2 },
    eq: { low: 1.2, mid: 2.5, high: 1.8 },
    truePeak: -0.35,
    targetLufs: -8.8
  },
  'content-creator': {
    gain: 2.9,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  pop: {
    gain: 2.8,
    compression: { threshold: -20, ratio: 3, attack: 0.003, release: 0.25 },
    eq: { low: 1.5, mid: 1.0, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -8.0
  },
  
  // INDIGO - Sophisticated, Complex (Refined & Detailed)
  jazz: {
    gain: 2.4,
    compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
    eq: { low: 1.0, mid: 1.8, high: 2.0 },
    truePeak: -0.4,
    targetLufs: -9.0
  }
};
