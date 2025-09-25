// Professional Tier Genres - Combined African + Advanced Genres (47 total: 24 African + 23 Advanced)
import { ADVANCED_GENRES, getAdvancedGenreGradient } from './advancedGenres';
import { GENRE_PRESETS as UTILS_PRESETS } from '../utils/genrePresets';

// Combine all genres for Professional tier
// Merge Advanced genres with additional presets from utils
// Normalize util preset keys to display names (Title Case)
const toTitleCase = (s: string) => s.replace(/(^|\s|[_-])(\w)/g, (_m, sep, ch) => (sep === '_' || sep === '-' ? ' ' : sep) + ch.toUpperCase()).trim();

type AnyPreset = {
  gain: number;
  compression: { threshold: number; ratio: number; attack: number; release: number };
  eq: { low: number; mid: number; high: number } | any;
  truePeak: number;
  targetLufs: number;
  description?: string;
  color?: string;
};

const UTIL_GENRES_NORMALIZED: Record<string, AnyPreset> = Object.keys(UTILS_PRESETS).reduce((acc, key) => {
  const display = toTitleCase(key);
  const preset = (UTILS_PRESETS as any)[key];
  acc[display] = {
    ...preset,
    description: preset.description || 'Professional mastering preset',
    color: preset.color || 'bg-gray-500',
  };
  return acc;
}, {} as Record<string, AnyPreset>);

export const ALL_PROFESSIONAL_GENRES = {
  ...ADVANCED_GENRES,
  ...Object.fromEntries(Object.entries(UTIL_GENRES_NORMALIZED).filter(([name]) => !(name in ADVANCED_GENRES)))
};

// Use the exact Advanced tier genres and order
export const PROFESSIONAL_GENRE_NAMES = [
  ...Object.keys(ADVANCED_GENRES),
  ...Object.keys(UTIL_GENRES_NORMALIZED).filter((name) => !(name in ADVANCED_GENRES))
];

// Get genre gradient color
export const getGenreGradient = (genreId: string): string => {
  const grad = getAdvancedGenreGradient(genreId);
  // If not in advanced, fallback gradient based on hash
  if (grad && !grad.includes('gray')) return grad;
  const colors = [
    'from-red-500 to-red-700',
    'from-orange-500 to-orange-700',
    'from-yellow-500 to-yellow-700',
    'from-green-500 to-green-700',
    'from-blue-500 to-blue-700',
    'from-indigo-500 to-indigo-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700'
  ];
  let h = 0;
  for (let i = 0; i < genreId.length; i++) h = (h * 31 + genreId.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
};

// Get genre description
export const getGenreDescription = (genreName: string): string => {
  const genre = ALL_PROFESSIONAL_GENRES[genreName as keyof typeof ALL_PROFESSIONAL_GENRES];
  return genre?.description || 'Professional mastering preset';
};

// Get genre preset
export const getGenrePreset = (genreName: string) => {
  return ALL_PROFESSIONAL_GENRES[genreName as keyof typeof ALL_PROFESSIONAL_GENRES];
};

// Get all genres as array for UI
export const getAllGenresForUI = () => {
  const sevenColors = [
    'bg-red-600',
    'bg-orange-600',
    'bg-yellow-500',
    'bg-green-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-purple-600'
  ];
  const pickColor = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return sevenColors[h % sevenColors.length];
  };
  return PROFESSIONAL_GENRE_NAMES.map((name) => {
    const genre = ALL_PROFESSIONAL_GENRES[name as keyof typeof ALL_PROFESSIONAL_GENRES] as AnyPreset | undefined;
    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return {
      id,
      name,
      // Force 7-color palette for UI consistency
      color: pickColor(id),
      description: (genre as any)?.description || 'Professional mastering preset',
      gradient: getGenreGradient(name)
    } as any;
  });
};

// Export individual genre collections for specific use cases
export { ADVANCED_GENRES };
export { getAdvancedGenreGradient };
