// African Urban Genres - 24 genres with detailed mastering presets
export const AFRICAN_GENRES = {
  // West African Genres
  "Afrobeats": {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.0, high: 0.5 },
    truePeak: -0.1,
    targetLufs: -7.0,
    description: "West African pop blend",
    color: "bg-red-600"
  },
  "Alté": {
    gain: 1.5,
    compression: { threshold: -20, ratio: 2.5, attack: 0.01, release: 0.3 },
    eq: { low: 1.0, mid: 1.5, high: 2.0 },
    truePeak: -0.2,
    targetLufs: -11.0,
    description: "Nigerian alternative fusion",
    color: "bg-orange-600"
  },
  "Hip-life": {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 2.5, mid: 1.8, high: 1.0 },
    truePeak: -0.15,
    targetLufs: -9.0,
    description: "Ghanaian hip-hop fusion",
    color: "bg-red-600"
  },
  "Azonto": {
    gain: 2.2,
    compression: { threshold: -14, ratio: 6, attack: 0.001, release: 0.08 },
    eq: { low: 3.0, mid: 1.5, high: 1.5 },
    truePeak: -0.1,
    targetLufs: -8.0,
    description: "Ghanaian dance style",
    color: "bg-orange-600"
  },
  "Naija Pop": {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.0, high: 1.2 },
    truePeak: -0.15,
    targetLufs: -8.5,
    description: "Nigerian pop music",
    color: "bg-yellow-500"
  },
  "Bongo Flava": {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
    eq: { low: 2.2, mid: 1.8, high: 1.5 },
    truePeak: -0.2,
    targetLufs: -9.0,
    description: "Tanzanian pop fusion",
    color: "bg-yellow-500"
  },

  // South African Genres
  "Amapiano": {
    gain: 1.7,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
    eq: { low: 2.2, mid: 1.8, high: 1.5 },
    truePeak: -0.2,
    targetLufs: -8.0,
    description: "South African house style",
    color: "bg-green-600"
  },
  "Kwaito": {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.5, mid: 1.5, high: 1.0 },
    truePeak: -0.15,
    targetLufs: -9.0,
    description: "South African house music",
    color: "bg-green-600"
  },
  "Gqom": {
    gain: 2.5,
    compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
    eq: { low: 4.0, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.5,
    description: "South African electronic",
    color: "bg-blue-600"
  },
  "Shangaan Electro": {
    gain: 2.3,
    compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
    eq: { low: 3.8, mid: 1.4, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -7.0,
    description: "South African electro",
    color: "bg-blue-600"
  },
  "Kwela": {
    gain: 1.4,
    compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -10.0,
    description: "South African pennywhistle music",
    color: "bg-indigo-600"
  },

  // Central/East African Genres
  "Kuduro": {
    gain: 2.5,
    compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
    eq: { low: 4.0, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.5,
    description: "Angolan electronic dance",
    color: "bg-indigo-600"
  },
  "Ndombolo": {
    gain: 1.8,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 2.0, mid: 1.5, high: 1.0 },
    truePeak: -0.15,
    targetLufs: -9.0,
    description: "Congolese dance music",
    color: "bg-purple-600"
  },
  "Gengetone": {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.5, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -8.0,
    description: "Kenyan hip-hop style",
    color: "bg-purple-600"
  },
  "Shrap": {
    gain: 2.3,
    compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
    eq: { low: 3.8, mid: 1.4, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -7.5,
    description: "Kenyan trap style",
    color: "bg-purple-600"
  },
  "Singeli": {
    gain: 2.5,
    compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
    eq: { low: 4.0, mid: 1.0, high: 0.8 },
    truePeak: -0.1,
    targetLufs: -7.0,
    description: "Tanzanian fast electronic",
    color: "bg-purple-600"
  },
  "Urban Benga": {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 2.2, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -9.0,
    description: "Modern Kenyan benga",
    color: "bg-purple-600"
  },
  "New Benga": {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 2.2, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -9.0,
    description: "Contemporary benga style",
    color: "bg-purple-600"
  },

  // North African Genres
  "Raï N'B": {
    gain: 1.3,
    compression: { threshold: -24, ratio: 2.2, attack: 0.015, release: 0.2 },
    eq: { low: 1.2, mid: 2.5, high: 1.8 },
    truePeak: -0.35,
    targetLufs: -9.5,
    description: "Algerian R&B fusion",
    color: "bg-purple-600"
  },
  "Raï-hop": {
    gain: 2.0,
    compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
    eq: { low: 3.0, mid: 1.5, high: 0.8 },
    truePeak: -0.15,
    targetLufs: -8.5,
    description: "Algerian hip-hop fusion",
    color: "bg-purple-600"
  },
  "Gnawa Fusion": {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.8, mid: 2.2, high: 1.2 },
    truePeak: -0.25,
    targetLufs: -9.0,
    description: "Moroccan traditional fusion",
    color: "bg-purple-600"
  },

  // Fusion Genres
  "Afrotrap": {
    gain: 2.3,
    compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
    eq: { low: 3.8, mid: 1.4, high: 1.0 },
    truePeak: -0.1,
    targetLufs: -7.5,
    description: "African trap fusion",
    color: "bg-purple-600"
  },
  "Afro-Gospel": {
    gain: 1.4,
    compression: { threshold: -22, ratio: 2.5, attack: 0.01, release: 0.15 },
    eq: { low: 1.5, mid: 2.0, high: 1.0 },
    truePeak: -0.3,
    targetLufs: -9.5,
    description: "African gospel fusion",
    color: "bg-purple-600"
  },
  "Urban Gospel": {
    gain: 1.6,
    compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
    eq: { low: 1.5, mid: 2.0, high: 1.5 },
    truePeak: -0.3,
    targetLufs: -9.0,
    description: "Modern African gospel",
    color: "bg-purple-600"
  }
};

export const getAfricanGenreGradient = (genreId: string): string => {
  const colorMap: Record<string, string> = {
    // West African genres - Warm, vibrant colors
    "Afrobeats": 'from-red-600 to-red-800',
    "Alté": 'from-orange-600 to-orange-800',
    "Hip-life": 'from-red-600 to-red-800',
    "Azonto": 'from-orange-600 to-orange-800',
    "Naija Pop": 'from-yellow-500 to-yellow-700',
    "Bongo Flava": 'from-yellow-500 to-yellow-700',
    
    // South African genres - Cool, energetic colors
    "Amapiano": 'from-green-600 to-green-800',
    "Kwaito": 'from-green-600 to-green-800',
    "Gqom": 'from-blue-600 to-blue-800',
    "Shangaan Electro": 'from-blue-600 to-blue-800',
    "Kwela": 'from-indigo-600 to-indigo-800',
    
    // Central/East African genres - Rich, deep colors
    "Kuduro": 'from-indigo-600 to-indigo-800',
    "Ndombolo": 'from-purple-600 to-purple-800',
    "Gengetone": 'from-purple-600 to-purple-800',
    "Shrap": 'from-purple-600 to-purple-800',
    "Singeli": 'from-purple-600 to-purple-800',
    "Urban Benga": 'from-purple-600 to-purple-800',
    "New Benga": 'from-purple-600 to-purple-800',
    
    // North African genres - Mystical colors
    "Raï N'B": 'from-purple-600 to-purple-800',
    "Raï-hop": 'from-purple-600 to-purple-800',
    "Gnawa Fusion": 'from-purple-600 to-purple-800',
    
    // Fusion genres - Dynamic colors
    "Afrotrap": 'from-purple-600 to-purple-800',
    "Afro-Gospel": 'from-purple-600 to-purple-800',
    "Urban Gospel": 'from-purple-600 to-purple-800'
  };
  return colorMap[genreId] || 'from-gray-600 to-gray-800';
};
