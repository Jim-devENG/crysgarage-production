import { GenrePreset } from '../types';

export const GENRE_PRESETS: Record<string, GenrePreset> = {
  // West African Genres
  afrobeats: {
    gain: 2.0,
    compression: { threshold: -18, ratio: 2, attack: 0.003, release: 0.2 },
    eq: { low: 2.0, mid: -0.5, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -9.0
  },
  'alté': {
    gain: 1.8,
    compression: { threshold: -20, ratio: 2.5, attack: 0.005, release: 0.25 },
    eq: { low: 0.5, mid: -1.0, high: 3.0 },
    truePeak: -0.2,
    targetLufs: -11.0
  },
  'hip-life': {
    gain: 2.1,
    compression: { threshold: -16, ratio: 3, attack: 0.002, release: 0.15 },
    eq: { low: 2.5, mid: 1.0, high: 1.5 },
    truePeak: -0.1,
    targetLufs: -9.0
  },
  azonto: {
    gain: 2.2,
    compression: { threshold: -15, ratio: 3.5, attack: 0.001, release: 0.12 },
    eq: { low: 2.0, mid: 0.5, high: 2.0 },
    truePeak: -0.05,
    targetLufs: -8.0
  },
  'naija pop': {
    gain: 1.9,
    compression: { threshold: -17, ratio: 2.8, attack: 0.002, release: 0.18 },
    eq: { low: 1.8, mid: 1.0, high: 1.8 },
    truePeak: -0.15,
    targetLufs: -8.5
  },
  'bongo flava': {
    gain: 1.8,
    compression: { threshold: -19, ratio: 2.5, attack: 0.003, release: 0.2 },
    eq: { low: 2.0, mid: 0.8, high: 1.5 },
    truePeak: -0.15,
    targetLufs: -9.0
  },

  // South African Genres
  amapiano: {
    gain: 2.0,
    compression: { threshold: -17, ratio: 2.8, attack: 0.002, release: 0.2 },
    eq: { low: 2.5, mid: -0.8, high: 1.2 },
    truePeak: -0.1,
    targetLufs: -8.0
  },
  kwaito: {
    gain: 1.9,
    compression: { threshold: -18, ratio: 3.2, attack: 0.002, release: 0.16 },
    eq: { low: 2.2, mid: 0.5, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -9.0
  },
  gqom: {
    gain: 2.3,
    compression: { threshold: -14, ratio: 4.5, attack: 0.001, release: 0.08 },
    eq: { low: 3.0, mid: -1.5, high: 1.0 },
    truePeak: -0.05,
    targetLufs: -7.5
  },
  'shangaan electro': {
    gain: 2.4,
    compression: { threshold: -13, ratio: 5.0, attack: 0.001, release: 0.06 },
    eq: { low: 1.5, mid: 0.2, high: 2.5 },
    truePeak: -0.05,
    targetLufs: -7.0
  },
  kwela: {
    gain: 1.4,
    compression: { threshold: -22, ratio: 2.2, attack: 0.008, release: 0.3 },
    eq: { low: 1.0, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -10.0
  },

  // Central/East African Genres
  kuduro: {
    gain: 2.2,
    compression: { threshold: -15, ratio: 4.0, attack: 0.001, release: 0.12 },
    eq: { low: 2.8, mid: 0.5, high: 1.8 },
    truePeak: -0.05,
    targetLufs: -7.5
  },
  ndombolo: {
    gain: 1.8,
    compression: { threshold: -19, ratio: 2.8, attack: 0.003, release: 0.2 },
    eq: { low: 2.0, mid: 1.5, high: 1.2 },
    truePeak: -0.15,
    targetLufs: -9.0
  },
  gengetone: {
    gain: 2.1,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 2.5, mid: 1.0, high: 1.8 },
    truePeak: -0.1,
    targetLufs: -8.0
  },
  shrap: {
    gain: 2.3,
    compression: { threshold: -14, ratio: 5.5, attack: 0.001, release: 0.08 },
    eq: { low: 3.0, mid: 0.2, high: 2.2 },
    truePeak: -0.05,
    targetLufs: -7.5
  },
  singeli: {
    gain: 2.4,
    compression: { threshold: -13, ratio: 6.0, attack: 0.001, release: 0.06 },
    eq: { low: 2.8, mid: -0.5, high: 1.5 },
    truePeak: -0.05,
    targetLufs: -7.0
  },
  'urban benga': {
    gain: 1.7,
    compression: { threshold: -20, ratio: 2.5, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 1.8, high: 1.2 },
    truePeak: -0.2,
    targetLufs: -9.0
  },
  'new benga': {
    gain: 1.8,
    compression: { threshold: -19, ratio: 2.8, attack: 0.003, release: 0.2 },
    eq: { low: 2.0, mid: 1.5, high: 1.5 },
    truePeak: -0.15,
    targetLufs: -9.0
  },

  // North African Genres
  'raï n\'b': {
    gain: 1.6,
    compression: { threshold: -21, ratio: 2.2, attack: 0.008, release: 0.3 },
    eq: { low: 1.5, mid: 1.2, high: 2.0 },
    truePeak: -0.25,
    targetLufs: -9.5
  },
  'raï-hop': {
    gain: 1.9,
    compression: { threshold: -17, ratio: 3.5, attack: 0.002, release: 0.18 },
    eq: { low: 2.2, mid: 1.5, high: 1.8 },
    truePeak: -0.15,
    targetLufs: -8.5
  },
  'gnawa fusion': {
    gain: 1.7,
    compression: { threshold: -20, ratio: 2.8, attack: 0.005, release: 0.25 },
    eq: { low: 2.0, mid: 0.8, high: 1.8 },
    truePeak: -0.2,
    targetLufs: -9.0
  },

  // Fusion Genres
  afrotrap: {
    gain: 2.3,
    compression: { threshold: -14, ratio: 5.0, attack: 0.001, release: 0.08 },
    eq: { low: 3.0, mid: 0.5, high: 2.0 },
    truePeak: -0.05,
    targetLufs: -7.5
  },
  'afro-gospel': {
    gain: 1.5,
    compression: { threshold: -22, ratio: 2.0, attack: 0.01, release: 0.3 },
    eq: { low: 1.8, mid: 1.0, high: 1.8 },
    truePeak: -0.3,
    targetLufs: -9.5
  },
  'urban gospel': {
    gain: 1.7,
    compression: { threshold: -20, ratio: 2.5, attack: 0.005, release: 0.25 },
    eq: { low: 1.5, mid: 1.8, high: 2.0 },
    truePeak: -0.2,
    targetLufs: -9.0
  }
};