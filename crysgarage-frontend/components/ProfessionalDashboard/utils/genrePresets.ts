import { GenrePreset } from '../types';

export const GENRE_PRESETS: Record<string, GenrePreset> = {
  // West African Genres
  afrobeats: {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.0, high: 0.5 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  'alté': {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3.5, attack: 0.003, release: 0.25 },
    eq: { low: 1.8, mid: 1.2, high: 1.5 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  'hip-life': {
    gain: 1.9,
    compression: { threshold: -17, ratio: 4.2, attack: 0.002, release: 0.18 },
    eq: { low: 2.2, mid: 1.1, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  azonto: {
    gain: 2.0,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 2.5, mid: 1.0, high: 0.7 },
    truePeak: -0.1,
    targetLufs: -7.2
  },
  'naija pop': {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.8, attack: 0.002, release: 0.2 },
    eq: { low: 1.9, mid: 1.0, high: 1.2 },
    truePeak: -0.15,
    targetLufs: -7.8
  },
  'bongo flava': {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.1, high: 0.9 },
    truePeak: -0.1,
    targetLufs: -7.5
  },

  // South African Genres
  amapiano: {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
    eq: { low: 2.2, mid: 1.8, high: 1.5 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  kwaito: {
    gain: 1.9,
    compression: { threshold: -17, ratio: 4.2, attack: 0.002, release: 0.16 },
    eq: { low: 2.3, mid: 1.2, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  gqom: {
    gain: 2.1,
    compression: { threshold: -15, ratio: 5, attack: 0.001, release: 0.12 },
    eq: { low: 3.0, mid: 1.0, high: 0.6 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  'shangaan electro': {
    gain: 2.2,
    compression: { threshold: -14, ratio: 5.5, attack: 0.001, release: 0.1 },
    eq: { low: 3.2, mid: 0.8, high: 0.7 },
    truePeak: -0.05,
    targetLufs: -6.8
  },
  kwela: {
    gain: 1.4,
    compression: { threshold: -22, ratio: 2.8, attack: 0.008, release: 0.3 },
    eq: { low: 1.5, mid: 2.2, high: 1.8 },
    truePeak: -0.3,
    targetLufs: -8.5
  },

  // Central/East African Genres
  kuduro: {
    gain: 2.0,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 2.8, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.2
  },
  ndombolo: {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.2, mid: 1.1, high: 0.9 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  gengetone: {
    gain: 2.0,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 2.5, mid: 1.2, high: 0.7 },
    truePeak: -0.1,
    targetLufs: -7.2
  },
  shrap: {
    gain: 2.1,
    compression: { threshold: -15, ratio: 5, attack: 0.001, release: 0.12 },
    eq: { low: 2.8, mid: 1.0, high: 0.6 },
    truePeak: -0.1,
    targetLufs: -7.0
  },
  singeli: {
    gain: 2.3,
    compression: { threshold: -13, ratio: 6, attack: 0.001, release: 0.08 },
    eq: { low: 3.5, mid: 0.8, high: 0.5 },
    truePeak: -0.05,
    targetLufs: -6.5
  },
  'urban benga': {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.8, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.3, high: 1.0 },
    truePeak: -0.15,
    targetLufs: -7.8
  },
  'new benga': {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.1, mid: 1.2, high: 1.1 },
    truePeak: -0.15,
    targetLufs: -7.5
  },

  // North African Genres
  'raï n\'b': {
    gain: 1.5,
    compression: { threshold: -21, ratio: 3.2, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 1.5, high: 1.8 },
    truePeak: -0.25,
    targetLufs: -8.2
  },
  'raï-hop': {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.2, mid: 1.1, high: 0.9 },
    truePeak: -0.15,
    targetLufs: -7.5
  },
  'gnawa fusion': {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3.5, attack: 0.003, release: 0.25 },
    eq: { low: 1.9, mid: 1.4, high: 1.6 },
    truePeak: -0.2,
    targetLufs: -8.0
  },

  // Fusion Genres
  afrotrap: {
    gain: 2.0,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 2.8, mid: 1.0, high: 0.7 },
    truePeak: -0.1,
    targetLufs: -7.2
  },
  'afro-gospel': {
    gain: 1.4,
    compression: { threshold: -22, ratio: 2.8, attack: 0.008, release: 0.3 },
    eq: { low: 1.6, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5
  },
  'urban gospel': {
    gain: 1.5,
    compression: { threshold: -21, ratio: 3.2, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 1.8, high: 1.6 },
    truePeak: -0.25,
    targetLufs: -8.2
  }
};