// Advanced Tier Genres - 24 genres with detailed mastering presets
export const ADVANCED_GENRES = {
  "Trap": {
    gain: 2.2,
    compression: { threshold: -14, ratio: 6, attack: 0.001, release: 0.08 },
    eq: { low: 3.5, mid: 1.2, high: 0.6 },
    truePeak: -0.1,
    targetLufs: -7.2,
    description: "Modern trap music",
    color: "bg-red-400"
  },
  "Drill": {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.8, high: 0.7 },
    truePeak: -0.15,
    targetLufs: -7.5,
    description: "UK drill style",
    color: "bg-red-600"
  },
  "Dubstep": {
    gain: 2.5,
    compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
    eq: { low: 4.0, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.0,
    description: "Heavy bass electronic",
    color: "bg-red-300"
  },
  "Gospel": {
    gain: 1.4,
    compression: { threshold: -22, ratio: 2.5, attack: 0.01, release: 0.15 },
    eq: { low: 1.5, mid: 2.0, high: 1.0 },
    truePeak: -0.3,
    targetLufs: -8.5,
    description: "Traditional gospel music",
    color: "bg-blue-500"
  },
  "R&B": {
    gain: 1.3,
    compression: { threshold: -24, ratio: 2.2, attack: 0.015, release: 0.2 },
    eq: { low: 1.2, mid: 2.5, high: 1.8 },
    truePeak: -0.35,
    targetLufs: -8.8,
    description: "Rhythm and blues",
    color: "bg-blue-400"
  },
  "Lofi Hip-Hop": {
    gain: 1.1,
    compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.3 },
    eq: { low: 0.8, mid: 1.5, high: 1.2 },
    truePeak: -0.4,
    targetLufs: -9.0,
    description: "Chill hip-hop beats",
    color: "bg-blue-600"
  },
  "Hip-Hop": {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.5, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -7.8,
    description: "Classic hip-hop",
    color: "bg-orange-500"
  },
  "House": {
    gain: 1.9,
    compression: { threshold: -17, ratio: 4.5, attack: 0.002, release: 0.15 },
    eq: { low: 2.5, mid: 1.8, high: 1.0 },
    truePeak: -0.2,
    targetLufs: -8.0,
    description: "Electronic house music",
    color: "bg-orange-400"
  },
  "Techno": {
    gain: 2.1,
    compression: { threshold: -15, ratio: 5.5, attack: 0.001, release: 0.08 },
    eq: { low: 3.2, mid: 1.6, high: 0.9 },
    truePeak: -0.15,
    targetLufs: -7.5,
    description: "Electronic techno",
    color: "bg-orange-600"
  },
  "Highlife": {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 2.2, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -8.2,
    description: "Ghanaian highlife",
    color: "bg-green-500"
  },
  "Instrumentals": {
    gain: 1.4,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5,
    description: "Instrumental music",
    color: "bg-green-400"
  },
  "Beats": {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.2 },
    eq: { low: 2.2, mid: 1.8, high: 1.0 },
    truePeak: -0.2,
    targetLufs: -8.0,
    description: "Beat production",
    color: "bg-green-600"
  },
  "Trance": {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.5, high: 1.8 },
    truePeak: -0.15,
    targetLufs: -7.8,
    description: "Electronic trance",
    color: "bg-purple-400"
  },
  "Drum & Bass": {
    gain: 2.3,
    compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
    eq: { low: 3.8, mid: 1.4, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -7.0,
    description: "Fast electronic beats",
    color: "bg-purple-600"
  },
  "Reggae": {
    gain: 1.5,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.3 },
    eq: { low: 2.5, mid: 1.2, high: 0.6 },
    truePeak: -0.25,
    targetLufs: -8.2,
    description: "Jamaican reggae",
    color: "bg-yellow-500"
  },
  "Voice Over": {
    gain: 1.2,
    compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
    eq: { low: 0.8, mid: 2.8, high: 2.2 },
    truePeak: -0.4,
    targetLufs: -9.2,
    description: "Voice recording",
    color: "bg-yellow-400"
  },
  "Journalist": {
    gain: 1.1,
    compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.5 },
    eq: { low: 0.6, mid: 3.0, high: 2.5 },
    truePeak: -0.45,
    targetLufs: -9.5,
    description: "Journalism audio",
    color: "bg-yellow-600"
  },
  "Soul": {
    gain: 1.3,
    compression: { threshold: -23, ratio: 2.2, attack: 0.015, release: 0.2 },
    eq: { low: 1.2, mid: 2.5, high: 1.8 },
    truePeak: -0.35,
    targetLufs: -8.8,
    description: "Soul music",
    color: "bg-pink-500"
  },
  "Content Creator": {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -8.5,
    description: "Content creation audio",
    color: "bg-pink-400"
  },
  "Pop": {
    gain: 1.5,
    compression: { threshold: -20, ratio: 3, attack: 0.003, release: 0.25 },
    eq: { low: 1.5, mid: 1.0, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -8.0,
    description: "Popular music",
    color: "bg-pink-600"
  },
  "Jazz": {
    gain: 1.2,
    compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
    eq: { low: 1.0, mid: 1.8, high: 2.0 },
    truePeak: -0.4,
    targetLufs: -9.0,
    description: "Jazz music",
    color: "bg-indigo-500"
  },
  "CrysGarage": {
    gain: 2.1,
    compression: { threshold: -16, ratio: 4.5, attack: 0.001, release: 0.15 },
    eq: { low: 3.2, mid: 2.2, high: 1.5 },
    truePeak: -0.15,
    targetLufs: -7.8,
    description: "CrysGarage signature sound",
    color: "bg-orange-500"
  }
};

export const getAdvancedGenreGradient = (genreId: string): string => {
  const colorMap: Record<string, string> = {
    "Trap": 'from-red-400 to-red-600',
    "Drill": 'from-red-600 to-red-800',
    "Dubstep": 'from-red-300 to-red-500',
    "Gospel": 'from-blue-500 to-blue-700',
    "R&B": 'from-blue-400 to-blue-600',
    "Lofi Hip-Hop": 'from-blue-600 to-blue-800',
    "Hip-Hop": 'from-orange-500 to-orange-700',
    "House": 'from-orange-400 to-orange-600',
    "Techno": 'from-orange-600 to-orange-800',
    "Highlife": 'from-green-500 to-green-700',
    "Instrumentals": 'from-green-400 to-green-600',
    "Beats": 'from-green-600 to-green-800',
    "Trance": 'from-purple-400 to-purple-600',
    "Drum & Bass": 'from-purple-600 to-purple-800',
    "Reggae": 'from-yellow-500 to-yellow-700',
    "Voice Over": 'from-yellow-400 to-yellow-600',
    "Journalist": 'from-yellow-600 to-yellow-800',
    "Soul": 'from-pink-500 to-pink-700',
    "Content Creator": 'from-pink-400 to-pink-600',
    "Pop": 'from-pink-600 to-pink-800',
    "Jazz": 'from-indigo-500 to-indigo-700',
    "CrysGarage": 'from-orange-500 to-orange-700'
  };
  return colorMap[genreId] || 'from-gray-500 to-gray-600';
};
