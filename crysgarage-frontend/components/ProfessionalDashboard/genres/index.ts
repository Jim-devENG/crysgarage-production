// Professional Tier Genres - Combined African + Advanced Genres (47 total: 24 African + 23 Advanced)
import { AFRICAN_GENRES, getAfricanGenreGradient } from './africanGenres';
import { ADVANCED_GENRES, getAdvancedGenreGradient } from './advancedGenres';

// Combine all genres for Professional tier
export const ALL_PROFESSIONAL_GENRES = {
  ...AFRICAN_GENRES,
  ...ADVANCED_GENRES
};

// Get all genre names in order
export const PROFESSIONAL_GENRE_NAMES = [
  // African Genres (24)
  'Afrobeats', 'Alté', 'Hip-life', 'Azonto', 'Naija Pop', 'Bongo Flava',
  'Amapiano', 'Kwaito', 'Gqom', 'Shangaan Electro', 'Kuduro', 'Ndombolo',
  'Gengetone', 'Shrap', 'Singeli', 'Urban Benga', 'Raï N\'B', 'Raï-hop',
  'Gnawa Fusion', 'Afrotrap', 'Afro-Gospel', 'Urban Gospel', 'Kwela', 'New Benga',
  
  // Advanced Genres (23 - Amapiano removed as it's already in African genres)
  'Trap', 'Drill', 'Dubstep', 'Gospel', 'R&B', 'Lofi Hip-Hop',
  'Hip-Hop', 'House', 'Techno', 'Highlife', 'Instrumentals', 'Beats',
  'Trance', 'Drum & Bass', 'Reggae', 'Voice Over', 'Journalist',
  'Soul', 'Content Creator', 'Pop', 'Jazz', 'CrysGarage'
];

// Get genre gradient color
export const getGenreGradient = (genreId: string): string => {
  // Check if it's an African genre first
  if (AFRICAN_GENRES[genreId as keyof typeof AFRICAN_GENRES]) {
    return getAfricanGenreGradient(genreId);
  }
  
  // Otherwise it's an Advanced genre
  return getAdvancedGenreGradient(genreId);
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
  return PROFESSIONAL_GENRE_NAMES.map((name, index) => {
    const genre = ALL_PROFESSIONAL_GENRES[name as keyof typeof ALL_PROFESSIONAL_GENRES];
    return {
      id: name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      name,
      color: genre?.color || 'bg-gray-500',
      description: genre?.description || 'Professional mastering preset',
      gradient: getGenreGradient(name)
    };
  });
};

// Export individual genre collections for specific use cases
export { AFRICAN_GENRES, ADVANCED_GENRES };
export { getAfricanGenreGradient, getAdvancedGenreGradient };
