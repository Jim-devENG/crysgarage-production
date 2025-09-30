import React from 'react';
import { Genre } from '../types';

interface GenreGridProps {
  genres: Genre[];
  selectedGenre: Genre | null;
  onGenreSelect: (genre: Genre) => void;
  isProcessing: boolean;
  isRealTimeProcessing: boolean;
  isPlayingOriginal: boolean;
}

const GenreGrid: React.FC<GenreGridProps> = ({
  genres,
  selectedGenre,
  onGenreSelect,
  isProcessing,
  isRealTimeProcessing,
  isPlayingOriginal
}) => {
  // 7-Color System for Genres
  const getGenreGradient = (genreId: string) => {
    const colorMap: Record<string, string> = {
      // RED - High Energy, Bass Heavy
      afrobeats: 'from-red-500 to-red-700',
      trap: 'from-red-400 to-red-600',
      drill: 'from-red-600 to-red-800',
      dubstep: 'from-red-300 to-red-500',
      
      // BLUE - Smooth, Melodic
      gospel: 'from-blue-500 to-blue-700',
      'r-b': 'from-blue-400 to-blue-600',
      'lofi-hiphop': 'from-blue-600 to-blue-800',
      
      // ORANGE - Energetic, Dynamic
      'hip-hop': 'from-orange-500 to-orange-700',
      house: 'from-orange-400 to-orange-600',
      techno: 'from-orange-600 to-orange-800',
      
      // GREEN - Natural, Organic
      highlife: 'from-green-500 to-green-700',
      instrumentals: 'from-green-400 to-green-600',
      beats: 'from-green-600 to-green-800',
      
      // PURPLE - Creative, Artistic
      amapiano: 'from-purple-500 to-purple-700',
      trance: 'from-purple-400 to-purple-600',
      'drum-bass': 'from-purple-600 to-purple-800',
      
      // YELLOW - Bright, Clear
      reggae: 'from-yellow-500 to-yellow-700',
      'voice-over': 'from-yellow-400 to-yellow-600',
      journalist: 'from-yellow-600 to-yellow-800',
      
      // PINK - Warm, Emotional
      soul: 'from-pink-500 to-pink-700',
      'content-creator': 'from-pink-400 to-pink-600',
      pop: 'from-pink-600 to-pink-800',
      
      // INDIGO - Sophisticated, Complex
      jazz: 'from-indigo-500 to-indigo-700'
    };
    
    return colorMap[genreId] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
      {genres.map((genre) => {
        const isSelected = selectedGenre?.id === genre.id;
        
        return (
          <button
            key={genre.id}
            onClick={() => onGenreSelect(genre)}
            disabled={isProcessing}
            className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-center hover:scale-105 bg-gradient-to-br ${getGenreGradient(genre.id)} ${
              isSelected
                ? 'border-crys-gold shadow-lg shadow-crys-gold/30 scale-105'
                : 'border-white/20 hover:border-white/40 hover:scale-110'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative`}
          >
            {isProcessing && isSelected && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-crys-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {isRealTimeProcessing && isSelected && isPlayingOriginal && (
              <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
            <h3 className="font-semibold text-sm mb-1 text-white drop-shadow-sm">{genre.name}</h3>
            <p className="text-xs text-white/80 leading-tight drop-shadow-sm">{genre.description}</p>
            {isRealTimeProcessing && isSelected && isPlayingOriginal && (
              <p className="text-xs text-green-400 mt-1">Live</p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GenreGrid;
