export type Preset = {
  eq_curve: {
    low_shelf: { freq: number; gain: number };
    low_mid?: { freq: number; gain: number };
    mid: { freq: number; gain: number };
    high_mid?: { freq: number; gain: number };
    high_shelf: { freq: number; gain: number };
  };
  compression: { ratio: number; threshold: number; attack: number; release: number };
  target_lufs: number;
};

// Curated, audible presets for live preview (used if backend presets are missing/flat)
export const GENRE_PRESETS: Record<string, Preset> = {
  // International
  "Hip Hop": { eq_curve: { low_shelf: { freq: 60, gain: 3.0 }, low_mid: { freq: 300, gain: -2.0 }, mid: { freq: 1000, gain: -1.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 9000, gain: 1.0 } }, compression: { ratio: 3.0, threshold: -16.0, attack: 0.003, release: 0.2 }, target_lufs: -10 },
  "Classical": { eq_curve: { low_shelf: { freq: 100, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_shelf: { freq: 10000, gain: 2.5 }, low_mid: { freq: 300, gain: 0.0 }, high_mid: { freq: 3500, gain: 2.0 } }, compression: { ratio: 1.5, threshold: -20.0, attack: 0.03, release: 0.4 }, target_lufs: -16 },
  "Pop": { eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 9000, gain: 2.0 } }, compression: { ratio: 2.2, threshold: -17.0, attack: 0.01, release: 0.25 }, target_lufs: -12 },
  "Dubstep": { eq_curve: { low_shelf: { freq: 50, gain: 4.0 }, low_mid: { freq: 150, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.8 }, high_shelf: { freq: 8000, gain: 0.8 } }, compression: { ratio: 3.2, threshold: -14.0, attack: 0.001, release: 0.1 }, target_lufs: -8 },
  "Trap": { eq_curve: { low_shelf: { freq: 60, gain: 3.5 }, low_mid: { freq: 200, gain: 1.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.6 }, high_shelf: { freq: 8000, gain: 0.6 } }, compression: { ratio: 2.6, threshold: -16.0, attack: 0.002, release: 0.15 }, target_lufs: -10 },
  "Jazz": { eq_curve: { low_shelf: { freq: 90, gain: 1.0 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 3500, gain: 1.0 }, high_shelf: { freq: 10000, gain: 2.0 } }, compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 }, target_lufs: -14 },
  "Techno": { eq_curve: { low_shelf: { freq: 50, gain: 3.0 }, low_mid: { freq: 150, gain: 1.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.9 }, high_shelf: { freq: 8000, gain: 0.9 } }, compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 }, target_lufs: -8 },
  "R&B": { eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 0.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.8 } }, compression: { ratio: 2.4, threshold: -17.0, attack: 0.003, release: 0.2 }, target_lufs: -12 },
  // Afro
  "Afrobeats": { eq_curve: { low_shelf: { freq: 90, gain: 3.0 }, low_mid: { freq: 300, gain: 1.0 }, mid: { freq: 1200, gain: 1.0 }, high_mid: { freq: 4000, gain: 2.0 }, high_shelf: { freq: 10000, gain: 2.0 } }, compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 }, target_lufs: -10 },
  "Naija Pop": { eq_curve: { low_shelf: { freq: 80, gain: 1.8 }, low_mid: { freq: 300, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.8 } }, compression: { ratio: 2.2, threshold: -17.0, attack: 0.003, release: 0.2 }, target_lufs: -12 },
  "Hip-life": { eq_curve: { low_shelf: { freq: 70, gain: 2.5 }, low_mid: { freq: 300, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } }, compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 }, target_lufs: -10 },
  "Amapiano": { eq_curve: { low_shelf: { freq: 50, gain: 2.5 }, low_mid: { freq: 300, gain: -0.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.2 } }, compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 }, target_lufs: -10 }
};

export const normalizeKey = (name: string) => (name || '').trim().toLowerCase();

